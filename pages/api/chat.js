export default async function handler(req, res) {
  const { prompt, image } = req.body;

  try {
    // जर फोटो असेल तर फक्त PlantNet वापरा
    if (image) {
      const plantnetKey = process.env.PLANTNET_KEY; 
      const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${plantnetKey}`;

      let formData = new FormData();
      const responseImg = await fetch(image);
      const blob = await responseImg.blob();
      formData.append("images", blob);

      const plantRes = await fetch(url, { method: "POST", body: formData });
      const data = await plantRes.json();

      if (data.results && data.results.length > 0) {
        const plantName = data.results[0].species.commonNames[0] || "पीक ओळखता आले नाही";
        return res.status(200).json({ reply: `हे पीक ${plantName} असू शकते.` });
      } else {
        return res.status(200).json({ reply: "फोटो ओळखता आला नाही, कृपया स्पष्ट फोटो काढा." });
      }
    }

    // जर फक्त मजकूर असेल तर Groq वापरा (मॉडेल बदलले आहे)
    const groqKey = process.env.GROQ_API_KEY;
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // हे नाव कधीच चुकत नाही
        messages: [{ role: "user", content: prompt || "नमस्कार" }]
      })
    });

    const groqData = await groqRes.json();
    res.status(200).json({ reply: groqData.choices[0].message.content });

  } catch (err) {
    res.status(200).json({ reply: "कनेक्शन एरर: " + err.message });
  }
}
