export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const groqKey = process.env.GROQ_API_KEY;

  try {
    if (!image) {
      return res.status(200).json({ reply: "कृपया पिकाचा फोटो पाठवा." });
    }

    // थेट Groq Vision ला फोटो पाठवणे
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // हे मॉडेल फोटोसाठी खात्रीशीर आहे
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "या पिकाचा फोटो पहा आणि यावर कोणता रोग आहे ते मराठीत सांगा." },
              {
                type: "image_url",
                image_url: { url: image } // Base64 फोटो थेट पाठवत आहोत
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      // जर काही तांत्रिक एरर आली तर ती इथे दिसेल
      res.status(200).json({ reply: "एआयला फोटो समजला नाही. कृपया पुन्हा प्रयत्न करा." });
    }

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
