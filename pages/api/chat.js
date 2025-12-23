export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { prompt } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    
    // जर API कडून एरर आला तर तो समजण्यासाठी
    if (!data.candidates) {
       return res.status(500).json({ error: "Gemini Error", details: data });
    }

    res.status(200).json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
