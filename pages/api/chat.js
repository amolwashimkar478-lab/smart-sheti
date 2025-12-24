export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // आपण क्रमाने ही मॉडेल्स ट्राय करणार आहोत
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro"
  ];

  for (const modelName of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();

      // जर हा प्रयत्न यशस्वी झाला, तर उत्तर पाठवा
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }
      
      // जर हा मॉडेल नसेल तर पुढच्या मॉडेलवर जा (Loop continue)
      console.log(`Model ${modelName} failed, trying next...`);
      
    } catch (err) {
      continue;
    }
  }

  // जर काहीच चालले नाही तर हा मेसेज दाखवा
  res.status(500).json({ 
    reply: "Google कडून सध्या प्रतिसाद मिळत नाहीये. कृपया Google AI Studio मध्ये जाऊन एक नवीन 'API Key' तयार करा आणि Vercel मध्ये अपडेट करा." 
  });
}
