export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, city } = req.body; 
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    // १. हवामान अंदाज (Weather API)
    const weatherCity = city || "Pune";
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const weather = await weatherRes.json();
    const isRaining = weather.weather && weather.weather[0].main.includes("Rain");

    // २. Groq API कॉल (Llama 3.2 Vision मॉडेल)
    const promptText = `तू शेती तज्ञ आहेस. या फोटोवरून पिकाचा रोग ओळख आणि शेतकऱ्याला मराठीत सविस्तर उत्तर दे. ${isRaining ? "सध्या तुमच्या भागात पाऊस सुरू आहे, हे लक्षात घेऊन फवारणीचे उपाय सांग." : ""}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-instruct", // फोटोसाठी सर्वोत्तम सपोर्टेड मॉडेल
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}` // Gemini ला फक्त base64 लागतो, Groq ला पूर्ण URL फॉरमॅट लागतो
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: "Groq AI त्रुटी", details: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "AI ला फोटो ओळखता आला नाही.";

    res.status(200).json({
      reply,
      weather: weather.weather ? weather.weather[0].description : "माहिती नाही",
      rain: isRaining
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error", message: error.message });
  }
}
