const https = require("https");

https.get(
  "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=Harry%20Potter",
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      console.log("HTML length:", d.length);
      console.log("TL span:", d.includes('class="TL"'));
      console.log("price-new:", d.includes("price-new"));

      // Fiyat pattern'leri
      const prices = d.match(/\d{2,3},\d{2}/g);
      console.log("Fiyatlar:", prices ? prices.slice(0, 10) : "YOK");

      // Örnek fiyat satırı
      const sample = d.match(/price[^>]*>[^<]*\d+,\d{2}/gi);
      console.log("Fiyat satırları:", sample ? sample.slice(0, 3) : "YOK");
    });
  },
);
