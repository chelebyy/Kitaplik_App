/**
 * BookPriceScraperService Test (Node.js)
 * Çalıştır: node test-price-service.js
 */

const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
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

function parseTurkishPrice(priceText) {
  if (!priceText) return null;
  
  const cleaned = priceText.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  const normalized = cleaned
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(normalized);
  
  if (isNaN(price) || price < 1 || price > 10000) {
    return null;
  }
  
  return price;
}

function parseDRPrices(html) {
  const prices = [];
  
  // İndirimli fiyat (campaign-price-old OLMAYAN span'lar)
  const priceRegex = /<span[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*,\d{2})\s*TL[\s]*<\/span>/gi;
  
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    // campaign-price-old içermiyorsa (eski fiyat değilse)
    const context = html.substring(Math.max(0, match.index - 50), match.index);
    if (!context.includes('campaign-price-old')) {
      const price = parseTurkishPrice(match[1]);
      if (price !== null) {
        prices.push(price);
      }
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

function parseKitapyurduPrices(html) {
  const prices = [];
  
  // Yöntem 1: TL span sonrası
  let regex = /class="TL"><\/span>\s*(\d+,\d{2})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) prices.push(price);
  }

  // Yöntem 2: price-new div içindeki fiyat
  regex = /price-new[^>]*>[\s\S]*?(\d{2,3},\d{2})/g;
  while ((match = regex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && !prices.includes(price)) prices.push(price);
  }

  // Yöntem 3: Genel Türk Lirası formatı (son çare)
  if (prices.length === 0) {
    regex = /(\d{2,3},\d{2})/g;
    const allMatches = html.match(regex) || [];
    // Sadece mantıklı fiyat aralığındakileri al (10-500 TL arası kitap fiyatları)
    allMatches.forEach(m => {
      const price = parseTurkishPrice(m);
      if (price !== null && price >= 10 && price <= 500 && !prices.includes(price)) {
        prices.push(price);
      }
    });
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

function parseBKMPrices(html) {
  const prices = [];
  
  const priceRegex = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:TL|₺)/gi;
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) {
      prices.push(price);
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

async function testPriceComparison() {
  const query = 'Harry Potter';
  
  console.log('========================================');
  console.log('💰 FİYAT KARŞILAŞTIRMA TESTİ');
  console.log(`📚 Kitap: "${query}"`);
  console.log('========================================\n');

  const results = [];

  // D&R
  console.log('📡 D&R sorgulanıyor...');
  try {
    const html = await fetchUrl(`https://www.dr.com.tr/search?q=${encodeURIComponent(query)}`);
    const prices = parseDRPrices(html);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    results.push({ store: 'D&R', price: minPrice, allPrices: prices.slice(0, 5) });
    console.log(`   ✅ En düşük: ${minPrice ? minPrice + ' TL' : 'Bulunamadı'}`);
    console.log(`   📊 Tüm fiyatlar: ${prices.slice(0, 5).join(', ')} TL`);
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
    results.push({ store: 'D&R', price: null, error: e.message });
  }

  // Kitapyurdu
  console.log('\n📡 Kitapyurdu sorgulanıyor...');
  try {
    const html = await fetchUrl(`https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(query)}`);
    console.log(`   📄 HTML uzunluğu: ${html.length}`);
    console.log(`   🔍 TL span var mı: ${html.includes('class="TL"')}`);
    
    // Debug: Direkt regex test
    const testMatch = html.match(/class="TL"><\/span>\s*(\d+,\d{2})/g);
    console.log(`   🧪 Regex match: ${testMatch ? testMatch.slice(0,3) : 'YOK'}`);
    
    const prices = parseKitapyurduPrices(html);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    results.push({ store: 'Kitapyurdu', price: minPrice, allPrices: prices.slice(0, 5) });
    console.log(`   ✅ En düşük: ${minPrice ? minPrice + ' TL' : 'Bulunamadı'}`);
    console.log(`   📊 Tüm fiyatlar: ${prices.slice(0, 5).join(', ')} TL`);
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
    results.push({ store: 'Kitapyurdu', price: null, error: e.message });
  }

  // BKM Kitap
  console.log('\n📡 BKM Kitap sorgulanıyor...');
  try {
    const html = await fetchUrl(`https://www.bkmkitap.com/arama?q=${encodeURIComponent(query)}`);
    const prices = parseBKMPrices(html);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    results.push({ store: 'BKM Kitap', price: minPrice, allPrices: prices.slice(0, 5) });
    console.log(`   ✅ En düşük: ${minPrice ? minPrice + ' TL' : 'Bulunamadı'}`);
    console.log(`   📊 Tüm fiyatlar: ${prices.slice(0, 5).join(', ')} TL`);
  } catch (e) {
    console.log(`   ❌ Hata: ${e.message}`);
    results.push({ store: 'BKM Kitap', price: null, error: e.message });
  }

  // Sonuç özeti
  console.log('\n========================================');
  console.log('📊 SONUÇ ÖZETİ');
  console.log('========================================');
  
  const validResults = results.filter(r => r.price !== null);
  
  if (validResults.length > 0) {
    validResults.sort((a, b) => a.price - b.price);
    
    console.log('\nFiyat Sıralaması:');
    validResults.forEach((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      console.log(`${medal} ${r.store}: ${r.price} TL`);
    });
    
    const cheapest = validResults[0];
    console.log(`\n🏆 EN UCUZ: ${cheapest.store} - ${cheapest.price} TL`);
  } else {
    console.log('\n❌ Hiçbir mağazadan fiyat alınamadı.');
  }

  console.log('\n========================================');
}

testPriceComparison().catch(console.error);
