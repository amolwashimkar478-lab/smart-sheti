export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { image, city, prompt } = req.body; 
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    // १. हवामान अंदाज (Weather API)
    let weatherInfo = "माहिती उपलब्ध नाही";
    let isRaining = false;
    
    if (city) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        const weather = await weatherRes.json();
        if (weather.weather) {
          weatherInfo = weather.weather[0].description;
          isRaining = weather.weather[0].main.includes("Rain");
        }
      } catch (e) { console.error("Weather Error"); }
    }

    // २. Groq API कॉल - फोटो आणि चॅट दोन्हीसाठी
    const systemPrompt = `तू शेती तज्ञ आहेस. ${isRaining ? "सध्या पाऊस सुरू आहे, हे लक्षात घेऊन उपाय सांग." : ""} उत्तरे मराठीत दे.`;
    const userPrompt = prompt || "या फोटोवरून पिकाचा रोग ओळखा आणि उपाय सांगा.";

    let content = [{ type: "text", text: userPrompt }];

    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image.includes("base64") ? image : `data:image/jpeg;base64,${image}` }
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: image ? "llama-3.2-11b-vision-instruct" : "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: "AI एरर: " + data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "उत्तर मिळाले नाही.";

    res.status(200).json({
      reply: reply,
      weather: weatherInfo,
      rain: isRaining
    });

  } catch (error) {
    res.status(200).json({ reply: "सर्व्हर एरर: " + error.message });
  }
        }
      
