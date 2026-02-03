export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt, image } = req.body;

  try {
    // १. जर फोटो असेल तर आधी PlantNet कडे पाठवा
    if (image) {
      const plantnetKey = process.env.PLANTNET_KEY; 
      const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${plantnetKey}`;

      // Base64 इमेजला फाईलमध्ये (Blob) रूपांतरित करणे (जेणेकरून URL एरर येणार नाही)
      const base64Data = image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      let formData = new FormData();
      formData.append("images", blob);

      const plantRes = await fetch(url, { method: "POST", body: formData });
      const plantData = await plantRes.json();

      if (plantData.results && plantData.results.length > 0) {
        const plantName = plantData.results[0].species.commonNames[0] || plantData.results[0].species.scientificNameWithoutAuthor;
        
        // पिकाचे नाव कळले, आता Groq ला त्याबद्दल माहिती विचारा
        const groqKey = process.env.GROQ_API_KEY;
        const infoRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `हे पीक ${plantName} आहे. या पिकावर कोणते रोग पडू शकतात आणि त्यावर काय साधे उपाय आहेत? ३-४ ओळीत मराठीत सांगा.` }]
          })
        });
        const infoData = await infoRes.json();
        const aiInfo = infoData.choices[0].message.content;

        return res.status(200).json({ reply: `पीक: ${plantName}\n\nमाहिती: ${aiInfo}` });
      } else {
        return res.status(200).json({ reply: "क्षमस्व, फोटो स्पष्ट नसल्यामुळे ओळखता आला नाही. कृपया पिकाचा स्पष्ट फोटो काढा." });
      }
    }

    // २. जर फक्त चॅट असेल (मजकूर) तर Groq वापरणे
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
    res.status(200).json({ reply: "तांत्रिक अडचण: " + err.message });
  }
}
