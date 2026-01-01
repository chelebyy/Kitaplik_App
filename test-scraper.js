/**
 * Hızlı Scraper Testi (Node.js)
 * Çalıştır: node test-scraper.js
 */

const https = require("https");
const http = require("http");

const testSites = [
  {
    name: "Cimri",
    url: "https://www.cimri.com/arama?q=Harry%20Potter",
  },
  {
    name: "Akakçe",
    url: "https://www.akakce.com/arama/?q=Harry%20Potter",
  },
  {
    name: "Kitapyurdu",
    url: "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=Harry%20Potter",
  },
  {
    name: "D&R",
    url: "https://www.dr.com.tr/search?q=Harry%20Potter",
  },
  {
    name: "BKM Kitap",
    url: "https://www.bkmkitap.com/arama?q=Harry%20Potter",
  },
  {
    name: "İdefix",
    url: "https://www.idefix.com/search/?q=Harry%20Potter",
  },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    };

    const req = protocol.get(url, options, (res) => {
      let data = "";

      // Redirect takibi
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        console.log(`  ↪ Redirect: ${res.headers.location}`);
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () =>
        resolve({ status: res.statusCode, html: data, headers: res.headers }),
      );
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function runTests() {
  console.log("========================================");
  console.log("🧪 SCRAPER FİZİBİLİTE TESTİ");
  console.log("========================================\n");

  for (const site of testSites) {
    console.log(`📡 ${site.name} test ediliyor...`);
    console.log(`   URL: ${site.url}`);

    try {
      const result = await fetchUrl(site.url);

      console.log(`   ✅ Status: ${result.status}`);
      console.log(
        `   📄 HTML Boyutu: ${result.html.length.toLocaleString()} karakter`,
      );

      // Fiyat arama
      const priceMatch = result.html.match(
        /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺)/g,
      );
      if (priceMatch && priceMatch.length > 0) {
        console.log(
          `   💰 Bulunan Fiyatlar: ${priceMatch.slice(0, 5).join(", ")}${priceMatch.length > 5 ? "..." : ""}`,
        );
      } else {
        console.log(`   ⚠️ Fiyat bulunamadı (regex ile)`);
      }

      // Cloudflare kontrolü
      if (
        result.html.includes("cf-browser-verification") ||
        result.html.includes("cloudflare")
      ) {
        console.log(`   🛡️ UYARI: Cloudflare koruması algılandı!`);
      }

      // JavaScript gereksinimi kontrolü
      if (
        result.html.includes("enable JavaScript") ||
        result.html.includes("JavaScript required")
      ) {
        console.log(`   ⚠️ UYARI: JavaScript gerekli olabilir!`);
      }

      // İlk 300 karakter örnek
      console.log(
        `   📝 Örnek HTML: ${result.html.substring(0, 200).replace(/\s+/g, " ")}...`,
      );
    } catch (error) {
      console.log(`   ❌ HATA: ${error.message}`);
    }

    console.log("");
  }

  console.log("========================================");
  console.log("Test tamamlandı!");
  console.log("========================================");
}

runTests();
