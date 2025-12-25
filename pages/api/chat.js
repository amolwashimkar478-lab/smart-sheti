export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body; 
  const apiKey = process.env.GROQ_API_KEY;

  try {
    let content = [{ type: "text", text: prompt || "याबद्दल माहिती द्या." }];
    
    // जर फोटो असेल तर तो जोडा
    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image }
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // हे फोटो ओळखणारे मॉडEL आहे
        messages: [{ role: "user", content: content }]
      })
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "क्षमस्व, उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "एरर: " + err.message });
  }
}
