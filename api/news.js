export default async function handler(req, res) {
  try {
    const district = req.query.district || "Maharashtra";

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      district + " शेती"
    )}&language=mr&sortBy=publishedAt&pageSize=10&apiKey=${
      process.env.NEWS_API_KEY
    }`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({ error: "News API error" });
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
    res.status(500).json({ error: "Server error" });
  }
}
