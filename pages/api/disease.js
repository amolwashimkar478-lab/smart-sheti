export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // फ्रंटएंडवरून image (base64) आणि city पाठवा
    const { image, city } = req.body; 

    // १. हवामान अंदाज (Weather API)
    const weatherCity = city || "Pune";
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const weather = await weatherRes.json();
    const isRaining = weather.weather && weather.weather[0].main.includes("Rain");

    // २. Gemini API कॉल (Updated to 1.5-flash)
    const prompt = `तू शेती तज्ञ आहेस. फोटोवरून रोग ओळख. शेतकऱ्याला मराठीत उत्तर दे. ${isRaining ? "सध्या पाऊस सुरू आहे, हे लक्षात घेऊन उपाय सांग." : ""}`;

    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: image } } // इथे बदल केला आहे
            ]
          }]
        })
      }
    );

    const gData = await gRes.json();
    
    if (!gData.candidates) {
      return res.status(500).json({ error: "AI रिस्पॉन्समध्ये त्रुटी", details: gData });
    }

    const reply = gData.candidates[0].content.parts[0].text;

    res.status(200).json({
      reply,
      weather: weather.weather[0].description,
      rain: isRaining
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error", message: error.message });
  }
}
