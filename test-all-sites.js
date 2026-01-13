/**
 * Tüm Kitap Sitelerini Test Et
 */

const https = require("https");
const http = require("http");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    };

    const req = protocol.get(url, options, (res) => {
      // Redirect takibi
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        return resolve({
          status: res.statusCode,
          redirect: res.headers.location,
          html: "",
        });
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, html: data }));
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function parseTurkishPrice(priceText) {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const price = parseFloat(normalized);
  if (isNaN(price) || price < 1 || price > 10000) return null;
  return price;
}

function findPrices(html) {
  const prices = [];

  // Genel TL fiyat pattern'i
  const regex = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:TL|₺)?/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && price >= 10 && price <= 1000) {
      prices.push(price);
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

const sites = [
  {
    name: "D&R",
    url: "https://www.dr.com.tr/search?q=Harry%20Potter",
    note: "",
  },
  {
    name: "Kitapyurdu",
    url: "https://www.kitapyurdu.com/index.php?route=product/search&filter_name=Harry%20Potter",
    note: "",
  },
  {
    name: "BKM Kitap",
    url: "https://www.bkmkitap.com/arama?q=Harry%20Potter",
    note: "",
  },
  {
    name: "İdefix",
    url: "https://www.idefix.com/search/?q=Harry%20Potter",
    note: "",
  },
  {
    name: "Amazon TR",
    url: "https://www.amazon.com.tr/s?k=Harry%20Potter%20kitap",
    note: "",
  },
  {
    name: "Hepsiburada",
    url: "https://www.hepsiburada.com/ara?q=Harry%20Potter%20kitap",
    note: "",
  },
  {
    name: "Trendyol",
    url: "https://www.trendyol.com/sr?q=harry%20potter%20kitap",
    note: "",
  },
  {
    name: "N11",
    url: "https://www.n11.com/arama?q=harry+potter+kitap",
    note: "",
  },
  {
    name: "Cimri",
    url: "https://www.cimri.com/arama?q=Harry%20Potter",
    note: "Fiyat karşılaştırma sitesi",
  },
  {
    name: "Akakçe",
    url: "https://www.akakce.com/arama/?q=Harry%20Potter",
    note: "Fiyat karşılaştırma sitesi",
  },
];

async function testAllSites() {
  console.log("═".repeat(70));
  console.log("🔬 TÜM KİTAP SİTELERİ FİYAT ÇEKME TESTİ");
  console.log("═".repeat(70));
  console.log("");

  const results = [];

  for (const site of sites) {
    process.stdout.write(`📡 ${site.name.padEnd(15)} `);

    try {
      const response = await fetchUrl(site.url);

      // Cloudflare kontrolü
      const isCloudflare =
        response.html.includes("Just a moment") ||
        response.html.includes("cf-browser") ||
        response.html.includes("Cloudflare");

      // Redirect kontrolü
      if (response.redirect) {
        console.log(`⚠️  Redirect → ${response.redirect.substring(0, 40)}...`);
        results.push({ name: site.name, status: "REDIRECT", prices: 0 });
        continue;
      }

      if (isCloudflare) {
        console.log(`🛡️  Cloudflare koruması (${response.status})`);
        results.push({ name: site.name, status: "CLOUDFLARE", prices: 0 });
        continue;
      }

      if (response.status !== 200) {
        console.log(`❌ HTTP ${response.status}`);
        results.push({
          name: site.name,
          status: `HTTP ${response.status}`,
          prices: 0,
        });
        continue;
      }

      // Fiyat ara
      const prices = findPrices(response.html);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

      if (prices.length > 0) {
        console.log(
          `✅ ${prices.length} fiyat bulundu, en düşük: ${minPrice} TL`,
        );
        results.push({
          name: site.name,
          status: "OK",
          prices: prices.length,
          min: minPrice,
        });
      } else {
        // JS ile mi yükleniyor kontrol
        const hasJSLoading =
          response.html.includes("__NEXT_DATA__") ||
          response.html.includes("window.__INITIAL_STATE__") ||
          response.html.length < 50000;

        if (hasJSLoading) {
          console.log(
            `⚠️  JavaScript ile yükleniyor (HTML: ${response.html.length} byte)`,
          );
          results.push({ name: site.name, status: "JS_REQUIRED", prices: 0 });
        } else {
          console.log(
            `❓ Fiyat bulunamadı (HTML: ${response.html.length} byte)`,
          );
          results.push({ name: site.name, status: "NO_PRICE", prices: 0 });
        }
      }
    } catch (e) {
      console.log(`❌ Hata: ${e.message}`);
      results.push({
        name: site.name,
        status: "ERROR",
        prices: 0,
        error: e.message,
      });
    }
  }

  // Özet tablo
  console.log("\n" + "═".repeat(70));
  console.log("📊 ÖZET TABLO");
  console.log("═".repeat(70));
  console.log("");
  console.log("| Site           | Durum          | Fiyat Çekilebilir? |");
  console.log("|----------------|----------------|-------------------|");

  results.forEach((r) => {
    let canFetch = "❌ Hayır";
    if (r.status === "OK") canFetch = "✅ Evet";
    else if (r.status === "JS_REQUIRED") canFetch = "⚠️ WebView gerekli";
    else if (r.status === "CLOUDFLARE") canFetch = "🛡️ Engelli";

    console.log(
      `| ${r.name.padEnd(14)} | ${r.status.padEnd(14)} | ${canFetch.padEnd(17)} |`,
    );
  });

  console.log("\n" + "═".repeat(70));
  console.log("💡 ÖNERİ");
  console.log("═".repeat(70));

  const working = results.filter((r) => r.status === "OK");
  console.log(
    `\n✅ Çalışan siteler: ${working.map((r) => r.name).join(", ") || "Yok"}`,
  );
  console.log(
    `📊 Toplam: ${working.length}/${results.length} site kullanılabilir`,
  );
}

testAllSites().catch(console.error);
