// ... आधीचा कोड ...
    const response = await fetch(
      // इथे नाव बदलले आहे: NEXT_PUBLIC_GEMINI_API_KEY
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "हा पिकाचा फोटो आहे. रोग ओळखा आणि मराठीत उपाय सांगा." },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: cleanBase64 // मघाशी सांगितल्याप्रमाणे क्लीन बेस६४ वापरा
                }
              }
            ]
          }]
        })
      }
    );
// ... पुढचा कोड ...

