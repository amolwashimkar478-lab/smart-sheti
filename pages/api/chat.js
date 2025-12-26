export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return res.status(200).json({ reply: "त्रुटी: Groq API Key सापडली नाही." });
  }

  try {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    let content = [{ type: "text", text: prompt || "याबद्दल मराठीत माहिती द्या." }];

    // जर फोटो असेल तर व्हिजन मॉडेल वापरूया
    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image }
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // नवीन सपोर्टेड मॉडेल खालीलप्रमाणे आहे
        model: image ? "llama-3.2-11b-vision-instruct" : "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: content }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: "AI एरर: " + data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
