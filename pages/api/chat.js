export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { image, prompt } = req.body; // prompt (चॅट मेसेज) सुद्धा घ्या
  const groqKey = process.env.GROQ_API_KEY;

  try {
    let userContent = [];

    // १. मजकूर (Text) मेसेज तयार करणे
    userContent.push({ 
      type: "text", 
      text: prompt || "या फोटोमध्ये कोणते पीक आहे आणि त्यावर कोणता रोग दिसतोय? उपाय मराठीत सांगा." 
    });

    // २. जर फोटो असेल तरच तो मेसेजमध्ये जोडा
    if (image && image.length > 100) {
      userContent.push({
        type: "image_url",
        image_url: { url: image } // इथे पूर्ण इमेज डेटा जातो
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [{ role: "user", content: userContent }],
        temperature: 0.5
      })
    });

    const data = await response.json();
    
    // ३. उत्तर तपासणे
    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      // जर Groq कडून काही एरर आला (उदा. कोटा संपला असेल)
      console.log("Groq Error:", data);
      res.status(200).json({ reply: "एआय सध्या व्यस्त आहे. कृपया फोटो स्पष्ट असल्याची खात्री करा आणि पुन्हा प्रयत्न करा." });
    }

  } catch (err) {
    res.status(200).json({ reply: "तांत्रिक अडचण: इंटरनेट किंवा सर्व्हरमध्ये समस्या आहे." });
  }
}
