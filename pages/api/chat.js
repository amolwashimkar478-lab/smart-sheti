export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    return res.status(200).json({ reply: "त्रुटी: Vercel मध्ये HF_TOKEN सेट केलेला नाही." });
  }

  try {
    // Pixtral हे मॉडेल फोटो आणि टेक्स्ट दोन्ही उत्तम रित्या हाताळते
    const modelUrl = "https://api-inference.huggingface.co/models/mistralai/Pixtral-12B-2409";

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: image ? `![image](${image})\n${prompt || "या फोटोबद्दल सांगा."}` : prompt,
        parameters: { max_new_tokens: 500, return_full_text: false }
      })
    });

    const result = await response.json();

    // जर मॉडेल लोड होत असेल (५०३ एरर)
    if (response.status === 503) {
      return res.status(200).json({ reply: "AI मॉडेल सध्या लोड होत आहे, कृपया १० सेकंदानंतर पुन्हा प्रयत्न करा." });
    }

    // उत्तर फॉरमॅट करणे
    let reply = "";
    if (Array.isArray(result)) {
      reply = result[0]?.generated_text || result[0]?.summary_text;
    } else {
      reply = result.generated_text || result.error || "उत्तर तयार करता आले नाही.";
    }

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Hugging Face कनेक्शन एरर: " + err.message });
  }
}
