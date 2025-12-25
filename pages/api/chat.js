export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    return res.status(200).json({ reply: "त्रुटी: Vercel मध्ये HF_TOKEN सापडला नाही." });
  }

  try {
    // Qwen हे मॉडेल सध्या सर्वात जास्त कार्यरत आणि शक्तिशाली आहे
    const modelUrl = "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-72B-Instruct";

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt || "नमस्कार",
        parameters: { max_new_tokens: 500 }
      })
    });

    const result = await response.json();

    // जर मॉडेल लोड होत असेल
    if (response.status === 503 || (result.error && result.error.includes("loading"))) {
      return res.status(200).json({ reply: "AI मॉडेल सुरू होत आहे, कृपया १० सेकंद थांबा आणि पुन्हा प्रयत्न करा." });
    }

    if (result.error) {
      return res.status(200).json({ reply: "AI एरर: " + result.error });
    }

    // उत्तर दाखवणे
    let reply = Array.isArray(result) ? result[0]?.generated_text : (result.generated_text || "उत्तर मिळाले नाही.");
    
    // जर उत्तरात युजरचा प्रश्न परत येत असेल तर तो काढून टाकूया
    if (reply.includes(prompt)) {
      reply = reply.replace(prompt, "").trim();
    }

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}

