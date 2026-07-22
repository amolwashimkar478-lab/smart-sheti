export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image } = req.body;

    if (!image || image.length < 500) {  
      return res.status(200).json({ reply: "❌ फोटोचा डेटा सर्व्हरपर्यंत पोहोचला नाही. कृपया पुन्हा फोटो अपलोड करा." });  
    }  

    const plantnetKey = process.env.PLANTNET_KEY;  
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!plantnetKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर PLANTNET_KEY सेट केलेली नाही." });  
    }  

    // १. PlantNet द्वारे पीक ओळखणे
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('images', blob, 'plant.jpg');

    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${plantnetKey}`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(200).json({ reply: "❌ फोटोवरून पीक ओळखता आले नाही. कृपया पानाचा स्पष्ट फोटो टाका." });
    }

    const bestMatch = data.results[0];
    const plantName = bestMatch.species.commonNames?.[0] || bestMatch.species.scientificNameWithoutAuthor;
    const score = Math.round(bestMatch.score * 100);

    // २. Gemini API द्वारे रोगाचे उपाय मिळवणे (जर GEMINI_API_KEY असेल तर)
    let diseaseInfo = "";
    if (geminiKey) {
      try {
        const geminiPrompt = `पिकाचे नाव: ${plantName}. या पिकावर पडणारे मुख्य रोग/कीड, त्यांची लक्षणे, त्यावर वापरायची औषधे आणि प्रतिबंधात्मक उपाय सोप्या मराठी भाषेत सविस्तर सांगा.`;
        
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }]
            })
          }
        );
        const geminiData = await geminiRes.json();
        diseaseInfo = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (e) {
        console.error("Gemini info error", e);
      }
    }

    // ३. उत्तर तयार करणे
    let replyText = `🌿 **ओळखलेले पीक:** ${plantName}\n`;
    replyText += `🎯 **अचूकता:** ${score}%\n\n`;
    
    if (diseaseInfo) {
      replyText += `📋 **रोग व औषध माहिती (मराठीत):**\n${diseaseInfo}`;
    } else {
      replyText += `💡 **सल्ला:** हे ${plantName} चे झाड/पीक आहे. पानांवर रोगाचे डाग असल्यास कृषी सेवा केंद्रातून योग्य बुरशीनाशकाचा सल्ला घ्या.`;
    }

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}

