import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res){
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files)=>{
    if(err || !files.image){
      return res.status(400).json({ reply:"फोटो अपलोड करा" });
    }

    const imageBase64 = fs.readFileSync(files.image.filepath, {encoding:"base64"});

    const prompt = `
तू एक शेती रोग तज्ञ आहेस.
फोटो पाहून:
1) रोग ओळख
2) उपाय सांग
3) मराठी किंवा हिंदी मध्ये उत्तर दे
`;

    try{
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            contents:[{
              parts:[
                {text: prompt},
                {inlineData:{mimeType:"image/jpeg", data:imageBase64}}
              ]
            }]
          })
        }
      );

      const json = await response.json();
      const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "रोग माहिती मिळाली नाही";

      res.status(200).json({
        reply,
        weatherAlert: reply.includes("पाऊस") || reply.includes("बारिश")
      });

    } catch(e){
      console.error(e);
      res.status(500).json({ reply:"सर्व्हरशी संपर्क झाला नाही" });
    }
  });
}
