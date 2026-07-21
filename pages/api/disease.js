export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || image.length < 100) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळाला नाही. कृपया स्पष्ट फोटो काढा." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: "त्रुटी: GEMINI_API_KEY व्हर्सेलवर सेट केलेला नाही." });
    }

    // Base64 मधील फोटो डेटा शुद्ध करणे
    const pureBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;

    // Direct Gemini REST API Call (कोणत्याही npm पॅकेजची गरज नाही)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt || "या पिकाच्या फोटोमधील रोग/कीड ओळखा आणि त्यावर वापरायची औषधे व उपाय मराठीत सांगा." },
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
      const text = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: text });
    } else {
      console.error("Gemini Response Error:", data);
      return res.status(200).json({ reply: "क्षमस्व, फोटोवरून अचूक रोग ओळखता आला नाही. कृपया दुसरा स्पष्ट फोटो टाका." });
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(200).json({ reply: "तांत्रिक अडचण आली आहे: " + error.message });
  }
}

