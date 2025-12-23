import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { district } = req.query;

    if (!district) {
      return res.status(400).json({ error: "कृपया जिल्हा निवडा" });
    }

    const API_KEY = "00d47c00261f47be850253577e6ee131";
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(district + " कृषि")} 
                 &language=mr&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      return res.status(500).json({ error: "बातम्या मिळाल्या नाहीत" });
    }

    // फक्त आवश्यक fields पाठवतो
    const articles = data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt,
      source: a.source.name
    }));

    res.status(200).json({ articles });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "सर्व्हर एरर" });
  }
}
