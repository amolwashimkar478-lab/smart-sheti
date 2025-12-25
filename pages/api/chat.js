export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body; // सध्या फक्त टेक्स्ट घेऊया
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // तुमच्या स्क्रीनशॉटमध्ये दिसणारे मॉडेल नाव इथे वापरले आहे
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: prompt || "Hi" }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: "Groq एरर: " + data.error.message });
    }

    const reply = data.choices[0]?.message?.content || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
