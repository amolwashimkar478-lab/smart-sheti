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

    const plantnetKey = process.env.PLANTNET_KEY?.trim();  
    const groqKey = process.env.GROQ_API_KEY?.trim();

    if (!plantnetKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर PLANTNET_KEY सेट केलेली नाही." });  
    }  

    // २. PlantNet API द्वारे फोटोवरून पिकाचे नाव शोधणे
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

    // ३. Groq API द्वारे त्या पिकावर येणारे रोग आणि औषधांची माहिती मराठीत मिळवणे
    let diseaseInfo = "";
    if (groqKey) {
      try {
        const groqPrompt = `पिकाचे नाव: ${plantName}. या पिकावर सहसा पडणारे मुख्य रोग, त्यांची लक्षणे, त्यावर वापरायची योग्य औषधे आणि प्रतिबंधात्मक उपाय सोप्या व स्पष्ट मराठी भाषेत सविस्तर सांगा.`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You are an expert Indian Agricultural Scientist. Always give detailed and helpful crop advice in Marathi language."
              },
              { role: "user", content: groqPrompt }
            ],
            temperature: 0.5
          })
        });

        const groqData = await groqRes.json();
        if (groqData.choices && groqData.choices[0]?.message?.content) {
          diseaseInfo = groqData.choices[0].message.content;
        }
      } catch (e) {
        console.error("Groq Error:", e);
      }
    }

    // ४. युझरला उत्तर पाठवणे
    let replyText = `🌿 **ओळखलेले पीक:** ${plantName}\n`;
    replyText += `🎯 **अचूकता (Match Score):** ${score}%\n\n`;
    
    if (diseaseInfo) {
      replyText += `📋 **रोग व उपाय माहिती (मराठीत):**\n${diseaseInfo}`;
    } else {
      replyText += `💡 **सल्ला:** हे ${plantName} चे झाड/पीक आहे. रोगाच्या अधिक माहितीसाठी कृषी केंद्राचा सल्ला घ्या.`;
    }

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}
