export default async function handler(req, res) {
  const { district } = req.query;
  
  // Vercel Settings मध्ये MARKET_API_KEY या नावाने तुमची Key सेव्ह करा
  const API_KEY = process.env.MARKET_API_KEY; 
  const RESOURCE_ID = "9ef273fd-5341-47bc-8812-4a4604d7d130";

  if (!API_KEY) {
    return res.status(500).json({ success: false, message: "API Key Not Found in Environment" });
  }

  try {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[state]=Maharashtra&filters[district]=${district}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.records && data.records.length > 0) {
      const rates = data.records.map(record => ({
        commodity: record.commodity,
        min: record.min_price,
        max: record.max_price,
        mandi: record.market
      }));
      res.status(200).json({ success: true, rates });
    } else {
      res.status(200).json({ success: false, rates: [] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
