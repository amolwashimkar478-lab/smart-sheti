export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // आपण आता Google ला हवा असलेला अचूक फॉरमॅट वापरत आहोत
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();
    
    // जर तरीही मॉडेल सापडले नाही तर हे 'Backup' मॉडेल वापरेल
    if (data.error && data.error.message.includes("not found")) {
        const fallbackRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );
        const fallbackData = await fallbackRes.json();
        const fallbackReply = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: fallbackReply || "क्षमस्व, गुगलकडून प्रतिसाद मिळत नाहीये." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + err.message });
  }
}
