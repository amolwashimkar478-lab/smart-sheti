export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (!groqKey) return res.status(200).json({ reply: "त्रुटी: Groq API Key सेट केलेली नाही." });

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
          { 
            role: "system", 
            content: "तू एक प्रगत भारतीय शेती तज्ञ आहेस. वापरकर्ता ज्या भाषेत प्रश्न विचारेल (मराठी, हिंदी किंवा इंग्रजी), त्याच भाषेत अतिशय सोप्या भाषेत उत्तर दे." 
          },
          { role: "user", content: prompt || "Hello" }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "API Error: " + (data.error?.message || "Something went wrong") });
    }
  } catch (err) {
    res.status(200).json({ reply: "Server Error: " + err.message });
  }
}
