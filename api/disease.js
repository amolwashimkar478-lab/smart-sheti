import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = { api:{ bodyParser:false } };

export default async function handler(req,res){
  const form = formidable();

  form.parse(req, async (err, fields, files)=>{
    try{
      const img = fs.readFileSync(files.image.filepath,{encoding:"base64"});

      // 🌧️ Weather API (example: Pune)
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Pune&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );
      const weather = await weatherRes.json();
      const rain = weather.weather[0].main.includes("Rain");

      // 🌿 Gemini
      const prompt = `
      तू शेती तज्ञ आहेस.
      फोटोवरून रोग ओळख.
      शेतकऱ्याला मराठी किंवा हिंदी मध्ये उत्तर दे.
      ${rain ? "सध्या पाऊस आहे हे लक्षात ठेव." : ""}
      `;

      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            contents:[{
              parts:[
                {text:prompt},
                {inlineData:{mimeType:"image/jpeg",data:img}}
              ]
            }]
          })
        }
      );

      const gData = await gRes.json();
      const reply = gData.candidates[0].content.parts[0].text;

      res.json({
        reply,
        rain,
        lang: reply.match(/[अ-ह]/) ? "mr-IN" : "hi-IN"
      });

    }catch(e){
      res.status(500).json({error:"Server Error"});
    }
  });
}
