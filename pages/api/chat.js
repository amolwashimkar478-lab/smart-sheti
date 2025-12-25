export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    let content = [{ type: "text", text: prompt || "याबद्दल माहिती द्या." }];

    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image } // Groq थेट Base64 स्वीकारते
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [{ role: "user", content: content }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Groq एरर: " + err.message });
  }
}

