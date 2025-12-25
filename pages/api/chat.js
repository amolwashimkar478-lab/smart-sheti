export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const hfToken = process.env.HF_TOKEN;

  try {
    // आपण Llama 3.2 Vision मॉडेल वापरत आहोत जे फोटो ओळखू शकते
    const modelUrl = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct";

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

    const result = await response.json();
    
    // हगिंग फेस कधीकधी रिस्पॉन्स वेगवेगळ्या फॉरमॅटमध्ये देतं
    const reply = Array.isArray(result) ? result[0]?.generated_text : (result.generated_text || "उत्तर मिळाले नाही.");
    
    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Hugging Face एरर: " + err.message });
  }
}
