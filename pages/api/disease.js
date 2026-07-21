export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, prompt } = req.body;

    // फोटो आलाच नाही तर अंदाजे उत्तर देऊ न देणे
    if (!image || image.length < 500) {
      return res.status(200).json({ reply: "❌ फोटोचा डेटा बॅकएंडला मिळाला नाही. कृपया पुन्हा फोटो अपलोड करा." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: "❌ Vercel वर GEMINI_API_KEY सापडला नाही." });
    }

    // Gemini REST API Call
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
                { text: prompt || "फोटोतील फळ किंवा पीक ओळखून रोगाची माहिती द्या." },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: image
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
      console.error("Gemini Error:", JSON.stringify(data));
      return res.status(200).json({ reply: "फोटोवरून ओळखता आले नाही. कृपया दुसरा फोटो ट्राय करा." });
    }

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}
