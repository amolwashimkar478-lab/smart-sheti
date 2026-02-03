export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;

  try {
    // १. जर फोटो असेल तर (PlantNet + Groq)
    if (image) {
      const plantnetKey = process.env.PLANTNET_KEY; 
      const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${plantnetKey}`;

      // Base64 डेटाला सुरक्षितपणे फाईलमध्ये रूपांतरित करणे
      const base64Image = image.split(",")[1]; // 'data:image/...' हा भाग काढून टाकला
      const buffer = Buffer.from(base64Image, 'base64');
      const blob = new Blob([buffer], { type: 'image/jpeg' });

      let formData = new FormData();
      formData.append("images", blob);

      const plantRes = await fetch(url, { method: "POST", body: formData });
      const plantData = await plantRes.json();

      if (plantData.results && plantData.results.length > 0) {
        const plantName = plantData.results[0].species.commonNames[0] || plantData.results[0].species.scientificNameWithoutAuthor;
        
        // पिकाचे नाव कळले, आता Groq ला त्याबद्दल माहिती विचारूया
        const groqKey = process.env.GROQ_API_KEY;
        const infoRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `हे पीक ${plantName} आहे. या पिकावर कोणते मुख्य रोग पडू शकतात आणि त्यावर १-२ साधे उपाय मराठीत सांगा.` }]
          })
        });
        const infoData = await infoRes.json();
        const aiInfo = infoData.choices[0].message.content;

        return res.status(200).json({ reply: `🌱 पीक: ${plantName}\n\n📝 माहिती: ${aiInfo}` });
      } else {
        return res.status(200).json({ reply: "क्षमस्व, फोटोवरून पीक ओळखता आले नाही. कृपया स्पष्ट फोटो काढा." });
      }
    }

    // २. जर फक्त चॅट असेल (Groq)
    const groqKey = process.env.GROQ_API_KEY;
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt || "नमस्कार" }]
      })
    });

    const groqData = await groqRes.json();
    res.status(200).json({ reply: groqData.choices[0].message.content });

  } catch (err) {
    // एरर मेसेज अधिक स्पष्ट केला आहे
    res.status(200).json({ reply: "क्षमस्व, तांत्रिक अडचण आली आहे. कृपया इंटरनेट तपासा." });
  }
}
