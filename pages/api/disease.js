export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // १. डेटा नीट मिळतोय का ते तपासा
    const { image } = req.body;

    if (!image || image.length < 100) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळालेला नाही किंवा तो खूप लहान आहे. कृपया पुन्हा फोटो काढा." });
    }

    const PLANTIX_KEY = "2b10fMyNQ5CSq0lXszHZl6MhO"; 

    // २. फोटोचा डेटा 'Pure Base64' मध्ये रुपांतरित करणे (हे महत्त्वाचे आहे)
    const pureBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;

    // ३. Plantix API कॉल
    const response = await fetch("https://api.plantix.net/v2/image_analysis", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PLANTIX_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "image": pureBase64 })
    });

    const data = await response.json();

    // ४. आलेले उत्तर तपासून शेतकऱ्याला पाठवणे
    if (data.predictions && data.predictions.length > 0) {
      const d = data.predictions[0];
      // हा रिझल्ट वापरकर्त्याला दिसेल
      res.status(200).json({ 
        reply: `🌿 पिकाचे नाव: ${d.provisional_name}\n🔍 रोग: ${d.name}\n✅ खात्री: ${Math.round(d.probability * 100)}%` 
      });
    } else {
      res.status(200).json({ reply: "क्षमस्व, प्लांटिक्सला या फोटोमध्ये कोणताही रोग आढळला नाही. कृपया पिकाचा जवळून आणि स्पष्ट फोटो काढा." });
    }
  } catch (error) {
    res.status(200).json({ reply: "तांत्रिक अडचण: सर्व्हरशी संपर्क होऊ शकला नाही. (Error: " + error.message + ")" });
  }
}
