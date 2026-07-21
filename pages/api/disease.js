import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel Environment Variable किंवा थेट API Key
const apiKey = process.env.GEMINI_API_KEY || "तुमचा_GEMINI_API_KEY_इथे_टाका"; 
const genAI = new GoogleGenerativeAI(apiKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || image.length < 100) {
      return res.status(200).json({ reply: "त्रुटी: फोटो मिळाला नाही. कृपया स्पष्ट फोटो काढा." });
    }

    // Base64 डेटा शुद्ध करणे
    const pureBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;

    // Gemini 1.5 Flash मॉडेल वापरणे
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
      inlineData: {
        data: pureBase64,
        mimeType: "image/jpeg"
      }
    };

    const userPrompt = prompt || "या पिकाच्या फोटोमधील रोग/कीड ओळखा आणि त्यावर वापरायची औषधे व उपाय मराठीत सांगा.";

    // Gemini API ला पाठवणे
    const result = await model.generateContent([userPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(200).json({ 
      reply: "तांत्रिक अडचण आली आहे. फोटो प्रक्रिया होऊ शकली नाही: " + error.message 
    });
  }
}

