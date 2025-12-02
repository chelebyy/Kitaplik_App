/**
 * HTML Yapısı Analizi
 * Her sitenin fiyat HTML yapısını detaylı inceler
 */

const https = require('https');
const fs = require('fs');

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

async function analyzeHTML() {
  const searchQuery = 'Harry Potter Felsefe Taşı';

  console.log('📡 D&R HTML analizi...\n');
  
  const drHtml = await fetchUrl(`https://www.dr.com.tr/search?q=${encodeURIComponent(searchQuery)}`);
  
  // Fiyat içeren tüm pattern'leri bul
  console.log('=== FIYAT PATTERN ANALİZİ ===\n');

  // Pattern 1: TL içeren satırlar
  const tlPatterns = drHtml.match(/.{0,100}\d+[.,]\d+.{0,20}TL.{0,50}/g);
  if (tlPatterns) {
    console.log('TL içeren satırlar (ilk 10):');
    tlPatterns.slice(0, 10).forEach((p, i) => {
      console.log(`${i + 1}. ${p.trim().substring(0, 120)}`);
    });
  }

  console.log('\n=== ÜRÜN KARTI ANALİZİ ===\n');

  // Ürün kartlarını bul (product-item, product-card vb.)
  const productCardMatch = drHtml.match(/<div[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi);
  if (productCardMatch) {
    console.log(`Ürün kartı bulundu: ${productCardMatch.length} adet`);
    console.log('\nİlk ürün kartı örneği:');
    console.log(productCardMatch[0].substring(0, 500));
  }

  console.log('\n=== SPAN PRICE ANALİZİ ===\n');

  // Fiyat span'larını bul
  const priceSpans = drHtml.match(/<span[^>]*>[\s]*[\d.,]+[\s]*(?:TL|₺)?[\s]*<\/span>/gi);
  if (priceSpans) {
    console.log('Fiyat span\'ları (ilk 15):');
    priceSpans.slice(0, 15).forEach((p, i) => {
      console.log(`${i + 1}. ${p}`);
    });
  }

  console.log('\n=== DATA ATTRIBUTE ANALİZİ ===\n');

  // data-price, data-amount vb.
  const dataAttrs = drHtml.match(/data-(?:price|amount|value)="[^"]+"/gi);
  if (dataAttrs) {
    console.log('Data attribute\'ları (ilk 10):');
    [...new Set(dataAttrs)].slice(0, 10).forEach((p, i) => {
      console.log(`${i + 1}. ${p}`);
    });
  }

  // HTML'i dosyaya kaydet (manuel inceleme için)
  fs.writeFileSync('dr_sample.html', drHtml.substring(0, 50000));
  console.log('\n✅ İlk 50KB HTML "dr_sample.html" dosyasına kaydedildi.');
}

analyzeHTML().catch(console.error);
