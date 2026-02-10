export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image } = req.body;
    const PLANTIX_KEY = "2b10fMyNQ5CSq0lXszHZl6MhO"; // तुमची की

    if (!image || image.length < 100) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळाला नाही. कृपया स्पष्ट फोटो काढा." });
    }

    // Base64 डेटा शुद्ध करणे
    const pureBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;

    const response = await fetch("https://api.plantix.net/v2/image_analysis", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PLANTIX_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "image": pureBase64 })
    });

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      const d = data.predictions[0];
      // मराठीत उत्तर तयार करणे
      res.status(200).json({ 
        reply: `🌿 **पिकाचे नाव:** ${d.provisional_name}\n🔍 **रोग:** ${d.name}\n✅ **नक्कीपणा:** ${Math.round(d.probability * 100)}%\n\n**सूचना:** कृपया औषध फवारणी करण्यापूर्वी स्थानिक कृषी तज्ञांचा सल्ला घ्या.` 
      });
    } else {
      res.status(200).json({ reply: "क्षमस्व, फोटोत रोग ओळखता आला नाही. कृपया पिकाच्या पानाचा स्पष्ट फोटो काढा." });
    }
  } catch (error) {
    res.status(200).json({ reply: "तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने प्रयत्न करा." });
  }
}
