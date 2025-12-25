export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    return res.status(200).json({ reply: "त्रुटी: Vercel मध्ये HF_TOKEN सेट केलेला नाही." });
  }

  try {
    // हे मॉडेल राउटरवर अधिक स्थिर (Stable) आहे
    const modelId = "meta-llama/Llama-3.2-11B-Vision-Instruct";
    const modelUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: image ? `![image](${image})\n${prompt || "या फोटोबद्दल माहिती द्या."}` : prompt,
        parameters: { max_new_tokens: 500 }
      })
    });

    // जर रिस्पॉन्स JSON नसेल तर टेक्स्ट म्हणून वाचूया
    const textData = await response.text();
    
    let result;
    try {
      result = JSON.parse(textData);
    } catch (e) {
      return res.status(200).json({ reply: "सर्व्हर एरर: " + textData.substring(0, 50) });
    }

    if (response.status === 503 || result.error?.includes("loading")) {
      return res.status(200).json({ reply: "AI मॉडेल तयार होत आहे (Loading), कृपया १० सेकंदात पुन्हा मेसेज पाठवा." });
    }

    if (result.error) {
      return res.status(200).json({ reply: "AI एरर: " + result.error });
    }

    let reply = Array.isArray(result) ? result[0]?.generated_text : (result.generated_text || "उत्तर मिळाले नाही.");
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
