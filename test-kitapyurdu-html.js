const https = require("https");
const fs = require("fs");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    };

    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function analyze() {
  console.log("📡 Kitapyurdu HTML analizi...\n");

  const html = await fetchUrl(
    "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=Harry%20Potter",
  );

  // Fiyat içeren satırları bul
  console.log("=== FİYAT İÇEREN SATIRLAR ===\n");

  // Farklı pattern'ler dene
  const patterns = [
    /price[^>]*>([^<]*\d+[^<]*)</gi,
    /fiyat[^>]*>([^<]*\d+[^<]*)</gi,
    /(\d+,\d{2})\s*(?:TL|₺)/gi,
    /data-price="([^"]+)"/gi,
    /"price":\s*"?(\d+[.,]?\d*)"/gi,
  ];

  patterns.forEach((regex, i) => {
    const matches = html.match(regex);
    if (matches && matches.length > 0) {
      console.log(`Pattern ${i + 1}: ${matches.slice(0, 5).join(" | ")}`);
    }
  });

  // HTML'in bir kısmını kaydet
  fs.writeFileSync("kitapyurdu_sample.html", html.substring(0, 100000));
  console.log('\n✅ HTML "kitapyurdu_sample.html" dosyasına kaydedildi.');

  // BKM için de aynısını yap
  console.log("\n📡 BKM Kitap HTML analizi...\n");

  const bkmHtml = await fetchUrl(
    "https://www.bkmkitap.com/arama?q=Harry%20Potter",
  );

  patterns.forEach((regex, i) => {
    const matches = bkmHtml.match(regex);
    if (matches && matches.length > 0) {
      console.log(`Pattern ${i + 1}: ${matches.slice(0, 5).join(" | ")}`);
    }
  });

  fs.writeFileSync("bkm_sample.html", bkmHtml.substring(0, 100000));
  console.log('\n✅ HTML "bkm_sample.html" dosyasına kaydedildi.');
}

analyze().catch(console.error);
