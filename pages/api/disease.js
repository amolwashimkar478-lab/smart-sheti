export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || image.length < 500) {  
      return res.status(200).json({ reply: "❌ फोटोचा डेटा सर्व्हरपर्यंत पोहोचला नाही. कृपया पुन्हा फोटो अपलोड करा." });  
    }  

    const apiKey = process.env.GROQ_API_KEY;  
    if (!apiKey) {  
      return res.status(200).json({ reply: "❌ Vercel वर GROQ_API_KEY सापडली नाही." });  
    }  

    const defaultPrompt = "तुमच्यासमोर पिकाचा फोटो दिला आहे. कृपया फोटो तपासून त्यातील पिकाचे नाव, आलेला रोग/कीड, त्याची लक्षणे आणि त्यावर वापरायची योग्य औषधे व प्रतिबंधात्मक उपाय सोप्या मराठी भाषेत सविस्तर सांगा.";

    // Groq API Call (Vision Model)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: prompt || defaultPrompt 
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: `data:image/jpeg;base64,${image}` 
                } 
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    if (data.error) {
      console.error("Groq Error:", data.error);
      return res.status(200).json({ reply: `❌ Groq API त्रुटी: ${data.error.message}` });
    }

    return res.status(200).json({ reply: "फोटोवरून ओळखता आले नाही. कृपया दुसरा स्पष्ट फोटो टाका." });

  } catch (error) {
    return res.status(200).json({ reply: "सर्व्हर त्रुटी: " + error.message });
  }
}

