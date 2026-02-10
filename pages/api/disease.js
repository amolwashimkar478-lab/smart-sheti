export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { image } = req.body;
  const PLANTIX_KEY = "2b10fMyNQ5CSq0lXszHZl6MhO"; 

  try {
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
      // प्लांटिक्सचे रिझल्ट्स सर्व भाषांसाठी सोप्या फॉरमॅटमध्ये
      res.status(200).json({ 
        reply: `Crop: ${d.provisional_name}\nDisease: ${d.name}\nConfidence: ${Math.round(d.probability * 100)}%` 
      });
    } else {
      res.status(200).json({ reply: "Could not detect any disease. Please try a clearer photo." });
    }
  } catch (error) {
    res.status(200).json({ reply: "Plantix Error: " + error.message });
  }
}
