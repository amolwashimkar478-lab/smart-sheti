export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { image } = req.body;
  const groqKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview", // हे मॉडेल खूप वेगाने फोटो ओळखते
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "या फोटोमध्ये कोणते पीक आहे आणि त्यावर कोणता रोग दिसतोय? जर फोटो अस्पष्ट असेल तरीही तुम्हाला जे वाटते ते मराठीत सांगा आणि त्यावर उपाय सुचवा." 
              },
              {
                type: "image_url",
                image_url: { url: image } // इमेज इथे पाठवली जाते
              }
            ]
          }
        ],
        temperature: 0.5 // यामुळे AI जास्त अचूक उत्तर देईल
      })
    });

    const data = await response.json();
    
    // जर Groq कडून उत्तर आले तर ते दाखवा
    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "एआयला फोटो समजण्यात अडचण आली, कृपया थोड्या वेळाने प्रयत्न करा किंवा फोटो पुन्हा काढा." });
    }

  } catch (err) {
    res.status(200).json({ reply: "तांत्रिक अडचण: सर्व्हर ओव्हरलोड झाला आहे." });
  }
}
