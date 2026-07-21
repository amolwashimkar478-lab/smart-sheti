export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, prompt } = req.body;

    // १. फोटो डेटा चेक करणे
    if (!image || image.length < 500) {  
      return res.status(200).json({ reply: "❌ फोटोचा डेटा सर्व्हरपर्यंत पोहोचला नाही. कृपया पुन्हा फोटो अपलोड करा." });  
    }  

    const apiKey = process.env.GEMINI_API_KEY;  
    if (!apiKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर GEMINI_API_KEY व्हॅल्यु सापडली नाही." });  
    }  

    // २. Gemini REST API Call (सक्त सूचनांसह)
    const response = await fetch(  
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,  
      {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
          systemInstruction: {
            parts: [{ text: "तुम्ही एक कृषी तज्ज्ञ AI आहात. तुम्हाला दिलेल्या फोटोचे बारकाईने निरीक्षण करा. चित्रात दिसणारे फळ, झाड, किंवा पीक (उदा. सफरचंद, टोमॅटो, तूर इत्यादी) अचूक ओळखा. काल्पनिक किंवा चुकीची माहिती अजिबात देऊ नका." }]
          },
          contents: [  
            {  
              role: "user",  
              parts: [  
                { text: prompt || "फोटोतील फळ/पीक ओळखून आलेला रोग, लक्षणे व उपाय मराठीत सांगा." },  
                {  
                  inlineData: {  
                    mimeType: "image/jpeg",  
                    data: image  
                  }  
                }  
              ]  
            }  
          ]  
        })  
      }  
    );  

    const data = await response.json();  

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {  
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });  
    } else {  
      console.error("Gemini Error:", JSON.stringify(data));  
      return res.status(200).json({ reply: "फोटोवरून अचूक निदान करता आले नाही. कृपया स्पष्ट फोटो टाका." });  
    }

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}
