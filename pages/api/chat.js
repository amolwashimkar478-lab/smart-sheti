export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    return res.status(200).json({ reply: "त्रुटी: HF_TOKEN सेट केलेला नाही." });
  }

  try {
    // नवीन Router URL खालीलप्रमाणे आहे
    const modelUrl = "https://router.huggingface.co/hf-inference/models/mistralai/Pixtral-12B-2409";

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: image ? `![image](${image})\n${prompt || "या फोटोबद्दल सांगा."}` : prompt,
        parameters: { max_new_tokens: 500 }
      })
    });

    const result = await response.json();

    // मॉडेल लोड होत असेल तर (Wait message)
    if (response.status === 503) {
      return res.status(200).json({ reply: "AI मॉडेल तयार होत आहे, १० सेकंदात पुन्हा प्रयत्न करा." });
    }

    let reply = "";
    if (Array.isArray(result)) {
      reply = result[0]?.generated_text || "उत्तर मिळाले नाही.";
    } else {
      reply = result.generated_text || result.error || "काहीतरी चूक झाली आहे.";
    }

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Router कनेक्शन एरर: " + err.message });
  }
}
