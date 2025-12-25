export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "त्रुटी: Vercel मध्ये API Key सेट केलेली नाही." });
  }

  try {
    let content = [];
    
    if (prompt) {
      content.push({ type: "text", text: prompt });
    } else if (image) {
      content.push({ type: "text", text: "या फोटोबद्दल माहिती द्या." });
    }

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
        // आपण आता '90b' व्हर्जन वापरत आहोत जे अधिक खात्रीशीर आहे
        model: "llama-3.2-90b-vision-preview",
        messages: [{ role: "user", content: content }],
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      // जर अजूनही मॉडेलचा प्रॉब्लेम असेल, तर हे नाव वापरून पहा: "llama-3.2-11b-vision-preview"
      return res.status(200).json({ reply: "Groq एरर: " + data.error.message + " (Model: " + data.error.type + ")" });
    }

    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
