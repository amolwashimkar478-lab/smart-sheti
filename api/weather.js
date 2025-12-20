export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Lat/Lon missing" });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key missing" });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
}
