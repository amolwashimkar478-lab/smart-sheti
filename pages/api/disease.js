export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, city } = req.body; 
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    // १. हवामान अंदाज (Weather)
    let isRaining = false;
    if (city) {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      const weather = await weatherRes.json();
      isRaining = weather.weather?.[0]?.main.toLowerCase().includes("rain");
    }

    // २. Groq API - फोटोसाठी 'preview' मॉडेल वापरणे
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // हेच नाव वापरा
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `तू शेती तज्ञ आहेस. या फोटोतील रोग ओळखून मराठीत उपाय सांग. ${isRaining ? "पाऊस लक्षात घेऊन उपाय सांगा." : ""}` },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply });

  } catch (error) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + error.message });
  }
}
