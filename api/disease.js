import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false } // file upload साठी जरूरी
};

export default async function handler(req, res){
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if(err) return res.status(500).json({ reply: "File parsing error", weatherAlert: false });

    if(!files.image) return res.status(400).json({ reply: "No image uploaded", weatherAlert: false });

    try {
      // 📸 Read image as base64
      const imageBase64 = fs.readFileSync(files.image.filepath, {encoding:"base64"});

      // 📝 Prompt for Gemini
      const prompt = `
        तू शेती रोग तज्ञ आहेस.
        फोटो पाहून:
        1) रोग ओळख
        2) उपाय सांग
        3) उत्तर मराठी किंवा हिंदी मध्ये द्या
      `;

      // 🔗 Gemini Vision API call
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
              ]
            }]
          })
        }
      );

      const json = await response.json();

      // ✅ Gemini response text
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || "रोग ओळखण्यात अडचण आली";

      // 🌧 Rain / पावसाचा alert flag
      const weatherAlert = reply.includes("पाऊस") || reply.includes("बारिश");

      res.status(200).json({ reply, weatherAlert });

    } catch(e){
      console.error("Gemini API error:", e);
      res.status(500).json({ reply: "API error: " + e.message, weatherAlert: false });
    }
  });
}
