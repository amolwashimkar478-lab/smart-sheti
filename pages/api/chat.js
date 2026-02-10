export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const groqKey = process.env.GROQ_API_KEY?.trim();

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
            content: "You are an expert Indian Agriculture Advisor. IMPORTANT: Always respond in the SAME LANGUAGE as the user's question. If the user asks in Marathi, answer in Marathi. If in Hindi, answer in Hindi. If in English, answer in English." 
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
      res.status(200).json({ reply: "Error: " + (data.error?.message || "Something went wrong") });
    }
  } catch (err) {
    res.status(200).json({ reply: "Server Error: " + err.message });
  }
}
