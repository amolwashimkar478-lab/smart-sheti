export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, prompt } = req.body;

    // १. फोटो डेटा तपासणे
    if (!image || image.length < 500) {  
      return res.status(200).json({ reply: "❌ फोटोचा डेटा सर्व्हरपर्यंत पोहोचला नाही. कृपया पुन्हा फोटो अपलोड करा." });  
    }  

    const apiKey = process.env.GEMINI_API_KEY;  
    if (!apiKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर GEMINI_API_KEY सेट केलेला नाही." });  
    }  

    // २. प्रॉम्टला अधिक मजबूत बनवणे (फोटो स्पष्ट वाचण्यासाठी)
    const strictPrompt = `तुम्ही एक उच्च दर्जाचे कृषी AI आहात. 
दिलेल्या फोटोचे बारकाईने निरीक्षण करा आणि खालील मुद्द्यांनुसार उत्तर द्या:

१. पिकाचे/फळाचे नाव: (चित्रामधील वनस्पती किंवा फळ ओळखा, उदा. सफरचंद, भुईमूग, टोमॅटो इत्यादी)
२. आढळलेला रोग/कीड/अडचण: 
३. लक्षणे:
४. फवारणी व उपाय (मराठीत):

युजरचा मूळ प्रश्न: ${prompt || "पिकाची माहिती द्या"}`;

    // ३. Gemini REST API Call (सुरक्षित आणि अचूक फॉरमॅट)
    const response = await fetch(  
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,  
      {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
          contents: [  
            {  
              role: "user",  
              parts: [  
                { text: strictPrompt },  
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

    // ४. जर Gemini ने उत्तर दिले असेल तर:
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {  
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });  
    } 
    
    // ५. जर API कडून थेट काही एरर आला असेल तर तो दाखवणे:
    if (data.error) {
      console.error("Gemini API Error Detail:", data.error);
      return res.status(200).json({ reply: `❌ API त्रुटी: ${data.error.message} (Code: ${data.error.code})` });
    }

    console.error("Gemini Unknown Response:", JSON.stringify(data));
    return res.status(200).json({ reply: "फोटोवरून अचूक ओळखता आले नाही. कृपया चित्रावर पुरेसा प्रकाश असलेला स्पष्ट फोटो टाका." });

  } catch (error) {
    console.error("Server Catch Error:", error);
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}
