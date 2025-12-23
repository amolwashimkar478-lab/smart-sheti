export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Vercel मध्ये API Key सापडली नाही!" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: "Gemini कडून एरर आला: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini ने उत्तर दिले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(500).json({ error: "सर्व्हर एरर: " + err.message });
  }
}

