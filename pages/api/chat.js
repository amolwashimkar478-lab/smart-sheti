export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "Vercel मध्ये Groq API Key सापडली नाही!" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // हे अतिशय वेगवान मॉडेल आहे
        messages: [
          { role: "system", content: "तुम्ही एक मदतनीस आहात." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: "Groq Error: " + data.error.message });
    }

    const reply = data.choices[0]?.message?.content || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Connection Error: " + err.message });
  }
}
