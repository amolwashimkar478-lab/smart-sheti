export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { image } = req.body;
  const PLANTIX_KEY = "2b10fMyNQ5CSq0lXszHZl6MhO"; 

  try {
    // फोटो डेटा शुद्ध करणे (Header काढणे)
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
      const reply = `पिकाचे नाव: ${d.provisional_name}\nरोग: ${d.name}\nविश्वासार्हता: ${Math.round(d.probability * 100)}%\n\nसूचना: अधिक माहितीसाठी कृषी तज्ञांचा सल्ला घ्या.`;
      res.status(200).json({ reply });
    } else {
      res.status(200).json({ reply: "प्लांटिक्सला या फोटोत रोग ओळखता आला नाही. कृपया स्पष्ट फोटो काढा." });
    }
  } catch (error) {
    res.status(200).json({ reply: "प्लांटिक्स सर्व्हरशी संपर्क होऊ शकला नाही." });
  }
}
