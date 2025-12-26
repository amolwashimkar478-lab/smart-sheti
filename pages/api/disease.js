import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, // तुमची Groq की
    baseURL: "https://api.groq.com/openai/v1", // Groq चा पत्ता
});

async function main() {
    const response = await client.chat.completions.create({
        // मॉडेलचे नाव बदला (हे सर्वात महत्त्वाचे आहे)
        model: "llama-3.3-70b-versatile", 
        messages: [
            { role: "user", content: "फास्ट लँग्वेज मॉडेल्सचे महत्त्व काय आहे?" }
        ],
    });

    console.log(response.choices[0].message.content);
}

main();
