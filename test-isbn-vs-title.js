/**
 * ISBN vs Kitap Adı Karşılaştırma Testi
 * Hangisi daha iyi sonuç veriyor?
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
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

function parseTurkishPrice(priceText) {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const price = parseFloat(normalized);
  if (isNaN(price) || price < 1 || price > 10000) return null;
  return price;
}

function parseDRPrices(html) {
  const prices = [];
  const priceRegex = /<span[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*,\d{2})\s*TL[\s]*<\/span>/gi;
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    const context = html.substring(Math.max(0, match.index - 50), match.index);
    if (!context.includes('campaign-price-old')) {
      const price = parseTurkishPrice(match[1]);
      if (price !== null) prices.push(price);
    }
  }
  return [...new Set(prices)].sort((a, b) => a - b);
}

function parseKitapyurduPrices(html) {
  const prices = [];
  
  // Yöntem 1: TL span
  let regex = /class="TL"><\/span>\s*(\d+,\d{2})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) prices.push(price);
  }

  // Yöntem 2: price-new
  regex = /price-new[^>]*>[\s\S]*?(\d{2,3},\d{2})/g;
  while ((match = regex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && !prices.includes(price)) prices.push(price);
  }

  // Yöntem 3: Genel fiyat formatı
  if (prices.length === 0) {
    regex = /(\d{2,3},\d{2})/g;
    const allMatches = html.match(regex) || [];
    allMatches.forEach(m => {
      const price = parseTurkishPrice(m);
      if (price !== null && price >= 10 && price <= 500 && !prices.includes(price)) {
        prices.push(price);
      }
    });
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

async function testSearch(label, drUrl, kyUrl) {
  console.log(`\n📚 ${label}`);
  console.log('─'.repeat(50));

  // D&R
  try {
    const dr = await fetchUrl(drUrl);
    const drPrices = parseDRPrices(dr.html);
    const drMin = drPrices.length > 0 ? Math.min(...drPrices) : null;
    const drCount = drPrices.length;
    console.log(`   D&R: ${drMin ? drMin + ' TL' : '❌ Bulunamadı'} (${drCount} sonuç)`);
  } catch (e) {
    console.log(`   D&R: ❌ Hata - ${e.message}`);
  }

  // Kitapyurdu
  try {
    const ky = await fetchUrl(kyUrl);
    const kyPrices = parseKitapyurduPrices(ky.html);
    const kyMin = kyPrices.length > 0 ? Math.min(...kyPrices) : null;
    const kyCount = kyPrices.length;
    console.log(`   Kitapyurdu: ${kyMin ? kyMin + ' TL' : '❌ Bulunamadı'} (${kyCount} sonuç)`);
  } catch (e) {
    console.log(`   Kitapyurdu: ❌ Hata - ${e.message}`);
  }
}

async function runTests() {
  console.log('═'.repeat(60));
  console.log('🔬 ISBN vs KİTAP ADI KARŞILAŞTIRMA TESTİ');
  console.log('═'.repeat(60));

  // Test 1: Harry Potter ve Felsefe Taşı
  const isbn1 = '9789750802942';
  const title1 = 'Harry Potter Felsefe Taşı';

  await testSearch(
    `ISBN ile arama: ${isbn1}`,
    `https://www.dr.com.tr/search?q=${isbn1}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${isbn1}`
  );

  await testSearch(
    `Kitap Adı ile arama: "${title1}"`,
    `https://www.dr.com.tr/search?q=${encodeURIComponent(title1)}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(title1)}`
  );

  // Test 2: Suç ve Ceza
  const isbn2 = '9789750719387';
  const title2 = 'Suç ve Ceza Dostoyevski';

  await testSearch(
    `ISBN ile arama: ${isbn2}`,
    `https://www.dr.com.tr/search?q=${isbn2}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${isbn2}`
  );

  await testSearch(
    `Kitap Adı ile arama: "${title2}"`,
    `https://www.dr.com.tr/search?q=${encodeURIComponent(title2)}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(title2)}`
  );

  // Test 3: 1984 George Orwell
  const isbn3 = '9789750738609';
  const title3 = '1984 George Orwell';

  await testSearch(
    `ISBN ile arama: ${isbn3}`,
    `https://www.dr.com.tr/search?q=${isbn3}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${isbn3}`
  );

  await testSearch(
    `Kitap Adı ile arama: "${title3}"`,
    `https://www.dr.com.tr/search?q=${encodeURIComponent(title3)}`,
    `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(title3)}`
  );

  console.log('\n' + '═'.repeat(60));
  console.log('📊 SONUÇ ANALİZİ');
  console.log('═'.repeat(60));
  console.log(`
  ISBN Avantajları:
  ✅ Kesin sonuç (aynı baskı)
  ✅ Daha az sonuç = daha hızlı
  
  Kitap Adı Avantajları:
  ✅ Daha fazla sonuç = daha fazla seçenek
  ✅ ISBN olmayan kitaplarda çalışır
  
  ÖNERİ: ISBN varsa önce ISBN ile ara,
         sonuç yoksa kitap adı ile ara.
  `);
}

runTests().catch(console.error);
