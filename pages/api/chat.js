export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // आपण आता 'gemini-1.5-flash-latest' वापरत आहोत जे नवीन Keys वर नक्की चालते
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
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
      return res.status(200).json({ reply: "Google Error: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Connection Error: " + err.message });
  }
}
