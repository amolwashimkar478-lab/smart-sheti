export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  try {
    // Cloudflare चे अधिकृत व्हिजन मॉडेल
    const model = "@cf/meta/llama-3.2-11b-vision-instruct";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    let inputData = {
      prompt: prompt || "याबद्दल माहिती द्या.",
      max_tokens: 512
    };

    // फोटो असल्यास तो 'image' फॉरमॅटमध्ये पाठवा
    if (image) {
      inputData.image = image.split(",")[1]; // Base64 डेटा
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputData)
    });

    const data = await response.json();
    const reply = data.result?.response || "उत्तर मिळाले नाही.";

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(200).json({ reply: "Cloudflare एरर: " + err.message });
  }
}

