export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { image } = req.body;
  const groqKey = process.env.GROQ_API_KEY;

  if (!image) {
    return res.status(200).json({ reply: "फोटो मिळाला नाही." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "या पिकाच्या फोटोमधील रोग ओळखा. रोगाचे नाव, लक्षणे आणि त्यावर प्रभावी घरगुती किंवा रासायनिक उपाय मराठीत सविस्तर सांगा." 
              },
              {
                type: "image_url",
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("Groq Error:", data);
      res.status(200).json({ reply: "क्षमस्व, एआयला फोटो ओळखता आला नाही. कृपया दुसरा फोटो काढून पहा." });
    }

  } catch (err) {
    res.status(200).json({ reply: "तांत्रिक अडचण: " + err.message });
  }
}
