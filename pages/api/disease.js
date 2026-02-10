export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, city } = req.body;
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (!groqApiKey) {
      return res.status(200).json({ reply: "त्रुटी: Groq API Key सेट केलेली नाही." });
    }

    if (!image) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळालेला नाही." });
    }

    // १. हवामान माहिती (Weather API)
    let isRaining = false;
    let weatherMessage = "";
    
    if (city) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherRes.json();
        if (weatherData.weather) {
          isRaining = weatherData.weather[0].main.toLowerCase().includes("rain");
          if (isRaining) {
            weatherMessage = "सूचना: सध्या तुमच्या भागात पाऊस सुरू आहे, त्यामुळे औषध फवारणी टाळा किंवा पावसाची उघडीप बघून करा.";
          }
        }
      } catch (e) {
        console.error("Weather Info Fetch Error");
      }
    }

    // २. Groq AI (Vision Model) कॉल
    // आपण ९० बिलियन पॅरामीटरचे शक्तिशाली मॉडेल वापरत आहोत जेणेकरून अचूकता वाढेल.
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-preview", 
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `तू एक तज्ञ भारतीय शेती डॉक्टर आहेस. फोटो पाहून पिकाचा रोग ओळखा. शेतकऱ्याला रोगाचे नाव, लक्षणे आणि त्यावर प्रभावी घरगुती किंवा रासायनिक उपाय मराठीत सांगा. ${weatherMessage}` 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.6
      })
    });

    const data = await response.json();

    if (data.error) {
      // जर ९०बी मॉडेल नसेल तर ११बी व्हर्जन वापरून पाहूया (Fallback)
      return res.status(200).json({ reply: "AI मॉडेल सध्या व्यस्त आहे किंवा उपलब्ध नाही. कृपया थोड्या वेळाने प्रयत्न करा. (Error: " + data.error.message + ")" });
    }

    const aiReply = data.choices?.[0]?.message?.content || "क्षमस्व, फोटो स्पष्ट नसल्यामुळे रोगाची माहिती देता आली नाही.";

    res.status(200).json({
      reply: aiReply,
      rain: isRaining
    });

  } catch (error) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + error.message });
  }
}
