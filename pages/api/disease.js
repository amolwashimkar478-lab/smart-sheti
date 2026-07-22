export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image } = req.body;

    // १. फोटो डेटा तपासणे
    if (!image || image.length < 500) {  
      return res.status(200).json({ reply: "❌ फोटोचा डेटा सर्व्हरपर्यंत पोहोचला नाही. कृपया पुन्हा फोटो अपलोड करा." });  
    }  

    // २. PlantNet API Key तपासणे
    const apiKey = process.env.PLANTNET_KEY;  
    if (!apiKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर PLANTNET_KEY सेट केलेली नाही." });  
    }  

    // ३. Base64 फोटोचा FormData तयार करणे
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('images', blob, 'plant.jpg');

    // 🚀 PlantNet API Call (पिकाचे नाव ओळखण्यासाठी)
    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    // ४. जर पीक ओळखले गेले तर निकाल दाखवणे
    if (data.results && data.results.length > 0) {
      const bestMatch = data.results[0];
      const plantName = bestMatch.species.scientificNameWithoutAuthor;
      const commonName = bestMatch.species.commonNames?.[0] || plantName;
      const score = Math.round(bestMatch.score * 100);

      let replyText = `🌿 **पिकाचे/वनस्पतीचे नाव:** ${commonName} (${plantName})\n`;
      replyText += `🎯 **अचूकता (Match Score):** ${score}%\n\n`;
      replyText += `💡 **सल्ला:** हे पीक/झाड यशस्वीरित्या ओळखले गेले आहे. जर पानांवर डाग किंवा कीड दिसत असेल, तर पानांचा जवळून स्पष्ट फोटो काढून पुन्हा प्रयत्न करा.`;

      return res.status(200).json({ reply: replyText });
    }

    if (data.error) {
      return res.status(200).json({ reply: `❌ PlantNet API त्रुटी: ${data.error.message || 'काहीतरी अडचण आली'}` });
    }

    return res.status(200).json({ reply: "❌ फोटोवरून पीक ओळखता आले नाही. कृपया पिकाच्या पानाचा किंवा फळाचा स्पष्ट फोटो टाका." });

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}
