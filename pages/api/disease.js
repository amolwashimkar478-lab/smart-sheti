export default async function handler(req, res) {
  // फक्त POST रिक्वेस्ट स्वीकारणे
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

    // १. हवामान तपासणे (Weather API)
    let weatherAlert = "";
    let isRaining = false;
    
    if (city) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await weatherRes.json();
        if (weatherData.weather) {
          isRaining = weatherData.weather[0].main.toLowerCase().includes("rain");
          if (isRaining) {
            weatherAlert = "सध्या तुमच्या भागात पाऊस सुरू आहे, त्यामुळे तातडीने फवारणी करणे टाळावे.";
          }
        }
      } catch (e) {
        console.error("Weather API Error");
      }
    }

    // २. Groq API ला रिक्वेस्ट पाठवणे (Vision Model)
    // टीप: 'llama-3.2-11b-vision-preview' हे सध्याचे सर्वात लेटेस्ट नाव आहे.
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", 
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `तू एक तज्ञ भारतीय शेती डॉक्टर आहेस. या फोटोतील पिकाचा रोग ओळखा आणि त्यावर प्रभावी उपाय मराठीत सांगा. ${weatherAlert}` 
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
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    // AI कडून आलेल्या उत्तराची तपासणी
    if (data.error) {
      return res.status(200).json({ reply: "AI एरर: " + data.error.message });
    }

    const aiReply = data.choices?.[0]?.message?.content || "क्षमस्व, या फोटोवरून रोगाची माहिती मिळू शकली नाही.";

    // ३. फायनल रिस्पॉन्स पाठवणे
    res.status(200).json({
      reply: aiReply,
      weatherAlert: isRaining
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(200).json({ reply: "सर्व्हर एरर: " + error.message });
  }
}

