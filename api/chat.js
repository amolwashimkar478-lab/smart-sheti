
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt, language } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are a helpful agriculture assistant. Answer in ${language}. Question: ${prompt}` }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0].content) {
      const aiReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiReply });
    } else {
      res.status(500).json({ error: "Gemini कडून उत्तर मिळाले नाही", details: data });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
