export default async function handler(req, res) {
  // १. API Key आहे की नाही ते तपासा
  if (!process.env.NEWS_API_KEY) {
    return res.status(500).json({ error: "API Key missing in environment" });
  }

  try {
    const district = req.query.district || "Maharashtra";

    // newsapi ऐवजी gnews.io किंवा तत्सम API वापरल्यास 'mr' भाषा चांगली चालते
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      district + " शेती agriculture"
    )}&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    // २. API कडून येणाऱ्या एरर मेसेजचे सविस्तर वर्णन
    if (data.status !== "ok") {
      return res.status(500).json({ 
        error: "News API error", 
        message: data.message || "Unknown error" 
      });
    }

    res.status(200).json({
      district,
      articles: data.articles.map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source.name,
        time: a.publishedAt
      }))
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
