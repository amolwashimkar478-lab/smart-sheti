export default async function handler(req, res) {
  try {
    // Vercel मधील Environment Variable किंवा default key
    const apiKey = process.env.AGMARKNET_API_KEY || "579b464db66ec23bdd000001cdd3946328c54e3f380813adb6325b6d";
    
    // महाराष्ट्रातील ताज्या बाजारभावांची नोंद मिळवण्यासाठी API हिट
    const url = `https://api.data.gov.in/resource/9ef7425e-0584-42fa-a25a-079999747a0a?api-key=${apiKey}&format=json&limit=50&filters[state]=Maharashtra`;

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();

    if (data && data.records && data.records.length > 0) {
      // फक्त आणि फक्त Agmarknet वरून आलेला रिअल-टाईम लाईव्ह डेटाच फॉरमॅट करणे
      const liveRecords = data.records.map((item) => ({
        market: item.market || item.district || "बाजार समिती",
        commodity: item.commodity || "पीक",
        min_price: item.min_price || item.modal_price || "0",
        max_price: item.max_price || item.modal_price || "0",
        modal_price: item.modal_price || "0",
        arrival_date: item.arrival_date || ""
      }));

      return res.status(200).json({
        success: true,
        records: liveRecords
      });
    } else {
      // डेटा रिकामा असल्यास थेट empty देणे (कुठलाही डमी डेटा नाही)
      return res.status(200).json({
        success: false,
        message: "सध्या सर्व्हरवर आजचे लाईव्ह भाव उपलब्ध नाहीत. कृपया थोड्या वेळाने प्रयत्न करा.",
        records: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "सर्व्हरशी संपर्क होऊ शकला नाही: " + error.message,
      records: []
    });
  }
}
