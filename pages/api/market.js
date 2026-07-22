export default async function handler(req, res) {
  try {
    const apiKey = process.env.AGMARKNET_API_KEY || "579b464db66ec23bdd000001cdd3946328c54e3f380813adb6325b6d";
    const url = `https://api.data.gov.in/resource/9ef7425e-0584-42fa-a25a-079999747a0a?api-key=${apiKey}&format=json&offset=0&limit=30&filters[state]=Maharashtra`;

    let records = [];

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.records && data.records.length > 0) {
        records = data.records.map((item) => ({
          market: item.market || item.district || "बाजार समिती",
          commodity: item.commodity || "पीक",
          min_price: item.min_price || "N/A",
          max_price: item.max_price || "N/A",
          modal_price: item.modal_price || "N/A"
        }));
      }
    } catch (apiErr) {
      console.log("Agmarknet Fetch Failed, using default rates");
    }

    // जर Agmarknet कडून रिकामी लिस्ट आली किंवा त्रुटी आली, तर फॉलबॅक लिस्ट दाखवणे:
    if (records.length === 0) {
      records = [
        { market: "लासलगाव (नाशिक)", commodity: "कांदा (Onion)", min_price: "1300", max_price: "2450", modal_price: "1900" },
        { market: "जालना", commodity: "कापूस (Cotton)", min_price: "6850", max_price: "7600", modal_price: "7250" },
        { market: "सोलापूर", commodity: "सोयाबीन (Soyabean)", min_price: "4150", max_price: "4700", modal_price: "4450" },
        { market: "पिंपरी (पुणे)", commodity: "टोमॅटो (Tomato)", min_price: "900", max_price: "1700", modal_price: "1300" },
        { market: "अकोला", commodity: "हरभरा (Gram)", min_price: "5100", max_price: "5800", modal_price: "5450" },
        { market: "नागपूर", commodity: "संतरा (Orange)", min_price: "2500", max_price: "4500", modal_price: "3500" }
      ];
    }

    return res.status(200).json({ success: true, records: records });

  } catch (error) {
    return res.status(200).json({
      success: true,
      records: [
        { market: "लासलगाव", commodity: "कांदा", min_price: "1300", max_price: "2450", modal_price: "1900" },
        { market: "जालना", commodity: "कापूस", min_price: "6850", max_price: "7600", modal_price: "7250" },
        { market: "सोलापूर", commodity: "सोयाबीन", min_price: "4150", max_price: "4700", modal_price: "4450" }
      ]
    });
  }
}

