export default async function handler(req, res) {
  try {
    // MSAMB (महाराष्ट्र राज्य कृषि पणन मंडळ) Live Sakal Market Rates Page
    const response = await fetch('https://www.msamb.com/Sakal.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } // १ तासासाठी कॅश
    });

    const htmlText = await response.text();

    // MSAMB वरील टेबलमधील डेटा शोधणे
    const records = [];
    const tableRegex = /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g;

    let match;
    while ((match = tableRegex.exec(htmlText)) !== null) {
      const arrival_date = match[1].trim();
      const commodity = match[2].trim();
      const market = match[3].trim();
      const min_price = match[7].trim();
      const max_price = match[8].trim();
      const modal_price = match[9].trim();

      if (market && commodity && modal_price && modal_price !== "---") {
        records.push({
          arrival_date,
          commodity,
          market,
          min_price,
          max_price,
          modal_price
        });
      }
    }

    if (records.length > 0) {
      return res.status(200).json({
        success: true,
        source: "MSAMB Live Maharashtra Govt",
        records: records.slice(0, 60) // प्रथम ६० ताज्या नोंदी
      });
    } else {
      // जर स्क्रॅपिंग काही कारणाने अडकले तर Agmarknet API कडे जाणे
      const fallbackUrl = `https://api.data.gov.in/resource/9ef7425e-0584-42fa-a25a-079999747a0a?api-key=579b464db66ec23bdd000001cdd3946328c54e3f380813adb6325b6d&format=json&limit=50&filters[state]=Maharashtra`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();

      if (fallbackData && fallbackData.records) {
        const agmarknetRecords = fallbackData.records.map((item) => ({
          arrival_date: item.arrival_date || "",
          market: item.market || item.district || "बाजार समिती",
          commodity: item.commodity || "पीक",
          min_price: item.min_price || item.modal_price || "0",
          max_price: item.max_price || item.modal_price || "0",
          modal_price: item.modal_price || "0"
        }));

        return res.status(200).json({
          success: true,
          source: "Agmarknet Live Fallback",
          records: agmarknetRecords
        });
      }

      return res.status(200).json({ success: false, records: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      records: []
    });
  }
}
