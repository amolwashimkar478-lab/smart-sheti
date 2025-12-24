export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // आपण आता थेट 'gemini-1.5-flash' न वापरता फक्त 'gemini-pro' वापरून पाहूया
    // जे बहुतेक सर्व जुन्या-नवीन की ला सपोर्ट करते
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      // जर इथेही एरर आला, तर आपण 'v1' आणि 'gemini-1.5-flash' वापरू
      return res.status(200).json({ reply: "गूगल कडून अजूनही एरर येत आहे: " + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(500).json({ reply: "Server Error: " + err.message });
  }
}
