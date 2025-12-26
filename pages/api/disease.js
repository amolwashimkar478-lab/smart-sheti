export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, city, prompt } = req.body; 
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (!groqApiKey) return res.status(200).json({ reply: "त्रुटी: Groq API Key सेट केलेली नाही." });

    // १. हवामान अंदाज (Weather API)
    let weatherInfo = "माहिती उपलब्ध नाही";
    let isRaining = false;
    
    if (city) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        const weather = await weatherRes.json();
        if (weather.weather) {
          weatherInfo = weather.weather[0].description;
          isRaining = weather.weather[0].main.toLowerCase().includes("rain");
        }
      } catch (e) { console.error("Weather Error"); }
    }

    // २. Groq API कॉल
    const systemPrompt = `तू अनुभवी शेती तज्ञ आहेस. ${isRaining ? "तुमच्या भागात पाऊस सुरू आहे, हे लक्षात घेऊन फवारणी किंवा खतांचे उपाय सांगा." : ""} उत्तरे मराठीत द्या.`;
    const userPrompt = prompt || "या फोटोमधील पिकाचा रोग ओळखून उपाय सांगा.";

    let content = [{ type: "text", text: userPrompt }];

    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image}` } // Groq साठी पूर्ण फॉरमॅट
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: image ? "llama-3.2-11b-vision-instruct" : "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) return res.status(200).json({ reply: "AI एरर: " + data.error.message });

    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";

    res.status(200).json({
      reply: reply,
      weather: weatherInfo,
      rain: isRaining
    });

  } catch (error) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + error.message });
  }
}
