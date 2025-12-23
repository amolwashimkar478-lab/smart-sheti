import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res){
  const form = formidable();
  form.parse(req, async (err, fields, files)=>{
    const imageBase64 = fs.readFileSync(files.image.filepath, {encoding:"base64"});

    const prompt = `
    तू शेती रोग तज्ञ आहेस.
    फोटो पाहून:
    1) रोग ओळख
    2) उपाय सांग
    3) मराठी किंवा हिंदी मध्ये उत्तर दे
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key="+process.env.GEMINI_API_KEY,
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
    const reply = json.candidates[0].content.parts[0].text;

    res.json({
      reply,
      weatherAlert: reply.includes("पाऊस") || reply.includes("बारिश")
    });
  });
}
