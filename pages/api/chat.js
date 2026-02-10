export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  // process.env मधून की घेताना trim वापरणे उत्तम
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (!groqKey) return res.status(200).json({ reply: "Vercel मध्ये Groq Key टाकलेली नाही." });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: "तू एक अनुभवी भारतीय शेती तज्ञ आहेस. फक्त मराठीत उत्तरे दे." },
          { role: "user", content: prompt || "नमस्कार" }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      // Groq ने दिलेला खरा एरर इथे दिसेल
      res.status(200).json({ reply: "Groq एरर: " + (data.error?.message || "काहीतरी चुकले") });
    }
  } catch (err) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + err.message });
  }
}
