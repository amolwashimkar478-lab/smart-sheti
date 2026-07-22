export default async function handler(req, res) {
  try {
    const apiKey = "579b464db66ec23bdd000001cdd3946328c54e3f380813adb6325b6d";
    const url = `https://api.data.gov.in/resource/9ef7425e-0584-42fa-a25a-079999747a0a?api-key=${apiKey}&format=json&limit=50&filters[state]=Maharashtra`;

    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (data && data.records && data.records.length > 0) {
      return res.status(200).json({ success: true, records: data.records });
    } else {
      return res.status(200).json({ success: false, records: [] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
