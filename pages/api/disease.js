export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || image.length < 100) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळाला नाही." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Base64 मधील सर्व नको असलेला डेटा साफ करणे
    let pureBase64 = image;
    if (image.includes(",")) {
      pureBase64 = image.split(",")[1];
    }

    // Gemini API Request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  text: prompt || "फोटोत कोणते पीक/फळ दिसत आहे ते ओळखा आणि त्यावर आलेला रोग किंवा पडलेले छिद्र/कीड ओळखून मराठीत सविस्तर उपाय सांगा." 
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: pureBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      console.error("Gemini Error:", data);
      return res.status(200).json({ reply: "फोटो वाचता आला नाही, कृपया पुन्हा प्रयत्न करा." });
    }

  } catch (error) {
    return res.status(200).json({ reply: "तांत्रिक त्रुटी: " + error.message });
  }
}

