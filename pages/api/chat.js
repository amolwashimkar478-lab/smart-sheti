export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { prompt } = req.body; // चॅटमधून फक्त प्रश्न येईल
  const groqKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // चॅटसाठी हे मॉडेल अतिशय जलद आहे
        messages: [
          { role: "system", content: "तू एक भारतीय शेती तज्ञ आहेस. शेतकऱ्यांच्या प्रश्नांना मराठीत सोपी उत्तरे दे." },
          { role: "user", content: prompt || "नमस्कार" }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "क्षमस्व, मला सध्या उत्तर देता येत नाहीये." });
    }
  } catch (err) {
    res.status(200).json({ reply: "Groq सर्व्हरमध्ये तांत्रिक अडचण आहे." });
  }
}
