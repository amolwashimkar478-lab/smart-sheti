import fetch from "node-fetch";

export default async function handler(req, res) {
  const district = req.query.district || "Pune"; // default district

  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) {
    return res.status(500).json({ error: "API Key not set" });
  }

  try {
    // NewsAPI: q=district+agriculture
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      district + " कृषि OR शेती"
    )}&language=mr&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({ error: data.message || "News fetch error" });
    }

    // required fields
    const articles = data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt
    }));

    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
