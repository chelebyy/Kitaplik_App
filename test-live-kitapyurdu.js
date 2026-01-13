const https = require("https");
const fs = require("fs");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
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

async function test() {
  console.log("Canlı Kitapyurdu testi...\n");

  const html = await fetchUrl(
    "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=Harry%20Potter%20Felsefe",
  );

  console.log("HTML length:", html.length);

  // TL span kontrolü
  const hasTLSpan = html.includes('<span class="TL">');
  console.log("TL span var mı:", hasTLSpan);

  // Fiyat pattern kontrolü
  const priceMatches = html.match(/\d{2,3},\d{2}/g);
  console.log(
    "Fiyat formatları:",
    priceMatches ? priceMatches.slice(0, 10) : "YOK",
  );

  // price-new kontrolü
  const hasPriceNew = html.includes("price-new");
  console.log("price-new var mı:", hasPriceNew);

  // Cloudflare kontrolü
  const isCloudflare =
    html.includes("Just a moment") || html.includes("cf-browser");
  console.log("Cloudflare engeli:", isCloudflare);

  // HTML örneği kaydet
  fs.writeFileSync("kitapyurdu_live.html", html);
  console.log("\nHTML kaydedildi: kitapyurdu_live.html");
}

test().catch(console.error);
