export default async function handler(req, res) {
  try {
    // Agmarknet (Data.gov.in) API Key
    const apiKey = process.env.AGMARKNET_API_KEY || "579b464db66ec23bdd000001cdd3946328c54e3f380813adb6325b6d";
    
    // महाराष्ट्रातील ताज्या ५० बाजारभावांची नोंद मिळवणे
    const url = `https://api.data.gov.in/resource/9ef7425e-0584-42fa-a25a-079999747a0a?api-key=${apiKey}&format=json&offset=0&limit=50&filters[state]=Maharashtra`;

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.records && data.records.length > 0) {
      // Agmarknet कडून आलेला डेटा योग्य फॉरमॅटमध्ये मॅप करणे
      const formattedRecords = data.records.map((item) => ({
        market: item.market || item.district || "बाजार समिती",
        commodity: item.commodity || "पिकाचे नाव",
        variety: item.variety || "सर्वसाधारण",
        min_price: item.min_price || "N/A",
        max_price: item.max_price || "N/A",
        modal_price: item.modal_price || "N/A",
        arrival_date: item.arrival_date || "आज"
      }));

      return res.status(200).json({ success: true, records: formattedRecords });
    } else {
      // API कडून काही प्रतिसाद न मिळाल्यास बॅकअप संदेश
      return res.status(200).json({
        success: false,
        message: "Agmarknet सर्व्हरवरून सध्या नवीन डेटा उपलब्ध झाला नाही."
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: "Agmarknet डेटा मिळवताना त्रुटी: " + error.message 
    });
  }
}
