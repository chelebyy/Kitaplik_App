/**
 * Detaylı Scraper Testi - Fiyat Parse Etme
 * Çalıştır: node test-scraper-detailed.js
 */

const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// D&R fiyat parse
function parseDRPrice(html) {
  const prices = [];
  
  // D&R fiyat formatı: "125,00 TL" veya data-price attribute
  // Ürün kartlarını bul
  const priceRegex = /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const matches = html.matchAll(priceRegex);
  
  for (const match of matches) {
    const priceText = match[1].trim();
    const numMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      prices.push(parseFloat(numMatch[1].replace(',', '.')));
    }
  }

  // Alternatif: data-price attribute
  const dataPriceRegex = /data-price="(\d+(?:\.\d+)?)"/gi;
  const dataMatches = html.matchAll(dataPriceRegex);
  for (const match of dataMatches) {
    prices.push(parseFloat(match[1]));
  }

  // Alternatif: prc-last sınıfı (D&R'ın güncel fiyat sınıfı)
  const prcLastRegex = /<span[^>]*class="[^"]*prc-last[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const prcMatches = html.matchAll(prcLastRegex);
  for (const match of prcMatches) {
    const priceText = match[1].trim();
    const numMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      prices.push(parseFloat(numMatch[1].replace(',', '.')));
    }
  }

  return [...new Set(prices)].filter(p => p > 0).sort((a, b) => a - b);
}

// Kitapyurdu fiyat parse
function parseKitapyurduPrice(html) {
  const prices = [];
  
  // Kitapyurdu: price__item sınıfı veya data-price
  const priceRegex = /<span[^>]*class="[^"]*price__item[^"]*"[^>]*>([^<]+)<\/span>/gi;
  const matches = html.matchAll(priceRegex);
  
  for (const match of matches) {
    const priceText = match[1].trim();
    const numMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      prices.push(parseFloat(numMatch[1].replace(',', '.')));
    }
  }

  // Alternatif regex
  const altRegex = /product-price[^>]*>[\s\S]*?(\d+(?:[.,]\d+)?)\s*(?:TL|₺)/gi;
  const altMatches = html.matchAll(altRegex);
  for (const match of altMatches) {
    prices.push(parseFloat(match[1].replace(',', '.')));
  }

  return [...new Set(prices)].filter(p => p > 0).sort((a, b) => a - b);
}

// BKM Kitap fiyat parse
function parseBKMPrice(html) {
  const prices = [];
  
  // BKM: product-price veya currentPrice
  const priceRegex = /<div[^>]*class="[^"]*currentPrice[^"]*"[^>]*>([^<]+)<\/div>/gi;
  const matches = html.matchAll(priceRegex);
  
  for (const match of matches) {
    const priceText = match[1].trim();
    const numMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      prices.push(parseFloat(numMatch[1].replace(',', '.')));
    }
  }

  // Alternatif: data-price
  const dataPriceRegex = /data-price="(\d+(?:[.,]\d+)?)"/gi;
  const dataMatches = html.matchAll(dataPriceRegex);
  for (const match of dataMatches) {
    prices.push(parseFloat(match[1].replace(',', '.')));
  }

  return [...new Set(prices)].filter(p => p > 0).sort((a, b) => a - b);
}

async function testParsers() {
  console.log('========================================');
  console.log('🔍 DETAYLI FİYAT PARSE TESTİ');
  console.log('========================================\n');

  const searchQuery = 'Harry Potter Felsefe Taşı';

  // D&R Test
  console.log('📡 D&R test ediliyor...');
  try {
    const drHtml = await fetchUrl(`https://www.dr.com.tr/search?q=${encodeURIComponent(searchQuery)}`);
    const drPrices = parseDRPrice(drHtml);
    console.log(`   ✅ Bulunan fiyatlar: ${drPrices.length > 0 ? drPrices.slice(0, 10).map(p => p + ' TL').join(', ') : 'YOK'}`);
    if (drPrices.length > 0) {
      console.log(`   💰 En ucuz: ${Math.min(...drPrices)} TL`);
    }
    
    // HTML'de fiyat içeren kısımları göster
    const samplePrices = drHtml.match(/.{0,50}(\d+[.,]\d+)\s*TL.{0,30}/g);
    if (samplePrices) {
      console.log(`   📝 Örnek fiyat içeren satırlar:`);
      samplePrices.slice(0, 3).forEach(s => console.log(`      "${s.trim()}"`));
    }
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
  }

  console.log('');

  // Kitapyurdu Test
  console.log('📡 Kitapyurdu test ediliyor...');
  try {
    const kyHtml = await fetchUrl(`https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(searchQuery)}`);
    const kyPrices = parseKitapyurduPrice(kyHtml);
    console.log(`   ✅ Bulunan fiyatlar: ${kyPrices.length > 0 ? kyPrices.slice(0, 10).map(p => p + ' TL').join(', ') : 'YOK'}`);
    if (kyPrices.length > 0) {
      console.log(`   💰 En ucuz: ${Math.min(...kyPrices)} TL`);
    }

    // HTML'de fiyat içeren kısımları göster
    const samplePrices = kyHtml.match(/.{0,50}(\d+[.,]\d+)\s*TL.{0,30}/g);
    if (samplePrices) {
      console.log(`   📝 Örnek fiyat içeren satırlar:`);
      samplePrices.slice(0, 3).forEach(s => console.log(`      "${s.trim()}"`));
    }
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
  }

  console.log('');

  // BKM Test
  console.log('📡 BKM Kitap test ediliyor...');
  try {
    const bkmHtml = await fetchUrl(`https://www.bkmkitap.com/arama?q=${encodeURIComponent(searchQuery)}`);
    const bkmPrices = parseBKMPrice(bkmHtml);
    console.log(`   ✅ Bulunan fiyatlar: ${bkmPrices.length > 0 ? bkmPrices.slice(0, 10).map(p => p + ' TL').join(', ') : 'YOK'}`);
    if (bkmPrices.length > 0) {
      console.log(`   💰 En ucuz: ${Math.min(...bkmPrices)} TL`);
    }

    // HTML'de fiyat içeren kısımları göster
    const samplePrices = bkmHtml.match(/.{0,50}(\d+[.,]\d+)\s*TL.{0,30}/g);
    if (samplePrices) {
      console.log(`   📝 Örnek fiyat içeren satırlar:`);
      samplePrices.slice(0, 3).forEach(s => console.log(`      "${s.trim()}"`));
    }
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
  }

  console.log('\n========================================');
  console.log('Test tamamlandı!');
  console.log('========================================');
}

testParsers();
