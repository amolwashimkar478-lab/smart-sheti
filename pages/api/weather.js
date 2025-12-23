export default async function handler(req, res) {
  const { lat, lon } = req.query;
  const API_KEY = process.env.WEATHER_API_KEY; // Vercel मधून की घेईल

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    
    const isRaining = data.weather[0].main === "Rain";

    res.status(200).json({ 
      isRaining, 
      temp: data.main.temp,
      description: data.weather[0].description 
    });
  } catch (err) {
    res.status(500).json({ error: "हवामान माहिती मिळू शकली नाही" });
  }
}
