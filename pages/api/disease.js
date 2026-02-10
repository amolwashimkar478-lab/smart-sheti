export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });

  const { image, prompt, city } = req.body; // prompt मध्ये चॅटचा मेसेज येईल
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

  try {
    // १. हवामान माहिती (नेहमीप्रमाणे)
    let weatherMessage = "";
    if (city && WEATHER_API_KEY) {
      try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();
        if (weatherData.weather && weatherData.weather[0].main.toLowerCase().includes("rain")) {
          weatherMessage = "\n(सूचना: तुमच्या भागात पाऊस सुरू आहे, फवारणी जपून करा.)";
        }
      } catch (e) { console.error("Weather error"); }
    }

    // २. Gemini API साठी साहित्य तयार करणे
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    let parts = [];
    
    // जर फोटो असेल तर तो जोडा
    if (image) {
      const pureBase64 = image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      parts.push({ inline_data: { mime_type: "image/jpeg", data: pureBase64 } });
      parts.push({ text: prompt || "या पिकाचा रोग ओळखून उपाय सांगा." });
    } else {
      // जर फक्त चॅट असेल तर
      parts.push({ text: prompt || "नमस्कार, मी तुम्हाला शेतीविषयक काय मदत करू शकतो?" });
    }

    // ३. Gemini ला विनंती पाठवणे
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      let finalReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: finalReply + weatherMessage });
    } else {
      res.status(400).json({ reply: "क्षमस्व, मला तुमचे म्हणणे समजले नाही." });
    }

  } catch (error) {
    res.status(500).json({ reply: "तांत्रिक अडचण आली आहे: " + error.message });
  }
}

