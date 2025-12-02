/**
 * Kitap Fiyat Scraper Servisi
 * Mağaza sitelerinden fiyat bilgisi çeker
 */

export interface ScrapedPrice {
  store: string;
  storeId: string;
  price: number | null;
  originalPrice?: number; // İndirimli ürünlerde orijinal fiyat
  currency: string;
  url: string;
  error?: string;
  loading?: boolean;
}

export interface PriceComparisonResult {
  query: string;
  timestamp: Date;
  prices: ScrapedPrice[];
  cheapest: ScrapedPrice | null;
}

const STORE_CONFIGS = {
  dr: {
    name: 'D&R',
    searchUrl: (q: string) => `https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`,
    logoColor: '#00529B',
  },
  kitapyurdu: {
    name: 'Kitapyurdu',
    searchUrl: (q: string) => `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(q)}`,
    logoColor: '#FF6600',
  },
  bkmkitap: {
    name: 'BKM Kitap',
    searchUrl: (q: string) => `https://www.bkmkitap.com/arama?q=${encodeURIComponent(q)}`,
    logoColor: '#ED1C24',
  },
};

/**
 * Türk Lirası formatındaki fiyatı parse eder
 * Örnekler: "149,75 TL", "1.250,00 TL", "748,75"
 */
function parseTurkishPrice(priceText: string): number | null {
  if (!priceText) return null;
  
  // Sadece sayı ve ayraçları al
  const cleaned = priceText
    .replace(/[^\d.,]/g, '') // Sadece rakam, nokta, virgül
    .trim();
  
  if (!cleaned) return null;

  // Türk formatı: 1.250,00 -> nokta binlik ayracı, virgül ondalık
  // Önce binlik ayracı (nokta) kaldır, sonra virgülü noktaya çevir
  const normalized = cleaned
    .replace(/\./g, '')  // Binlik ayracını kaldır
    .replace(',', '.');  // Ondalık virgülü noktaya çevir
  
  const price = parseFloat(normalized);
  
  // Mantıklı fiyat aralığı kontrolü (1 TL - 10.000 TL arası)
  if (isNaN(price) || price < 1 || price > 10000) {
    return null;
  }
  
  return price;
}

/**
 * D&R HTML'inden fiyatları parse eder
 */
function parseDRPrices(html: string): number[] {
  const prices: number[] = [];
  
  // Pattern: <span>149,75 TL</span> veya <span class="...">239,60 TL</span>
  const priceRegex = /<span[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL[\s]*<\/span>/gi;
  
  let match;
  while ((match = priceRegex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) {
      prices.push(price);
    }
  }

  // Alternatif pattern: campaign-price-old olmayan fiyatlar (indirimli fiyat)
  // İndirimli fiyatları önceliklendir
  const discountRegex = /<span[^>]*class="[^"]*(?<!campaign-price-old)[^"]*"[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL/gi;
  
  while ((match = discountRegex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && !prices.includes(price)) {
      prices.push(price);
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

/**
 * Kitapyurdu HTML'inden fiyatları parse eder
 */
function parseKitapyurduPrices(html: string): number[] {
  const prices: number[] = [];
  
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
    allMatches.forEach(m => {
      const price = parseTurkishPrice(m);
      if (price !== null && price >= 10 && price <= 500 && !prices.includes(price)) {
        prices.push(price);
      }
    });
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

/**
 * BKM Kitap HTML'inden fiyatları parse eder
 */
function parseBKMPrices(html: string): number[] {
  const prices: number[] = [];
  
  // BKM fiyat pattern'leri
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

/**
 * Tek bir mağazadan fiyat çeker
 */
async function scrapeStore(
  storeId: keyof typeof STORE_CONFIGS,
  query: string
): Promise<ScrapedPrice> {
  const config = STORE_CONFIGS[storeId];
  const url = config.searchUrl(query);

  try {
    console.log(`[Scraper] ${config.name} sorgulanıyor: ${query}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log(`[Scraper] ${config.name} HTML alındı: ${html.length} karakter`);

    let prices: number[] = [];
    
    switch (storeId) {
      case 'dr':
        prices = parseDRPrices(html);
        break;
      case 'kitapyurdu':
        prices = parseKitapyurduPrices(html);
        break;
      case 'bkmkitap':
        prices = parseBKMPrices(html);
        break;
    }

    console.log(`[Scraper] ${config.name} bulunan fiyatlar:`, prices.slice(0, 5));

    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

    return {
      store: config.name,
      storeId,
      price: lowestPrice,
      currency: 'TL',
      url,
    };
  } catch (error: any) {
    console.error(`[Scraper] ${config.name} hata:`, error.message);
    return {
      store: config.name,
      storeId,
      price: null,
      currency: 'TL',
      url,
      error: error.message,
    };
  }
}

/**
 * Tüm mağazalardan fiyat çeker ve karşılaştırır
 */
export async function compareBookPrices(
  bookTitle: string,
  author?: string
): Promise<PriceComparisonResult> {
  const query = author ? `${bookTitle} ${author}` : bookTitle;
  
  console.log(`[Scraper] ========== FİYAT KARŞILAŞTIRMA BAŞLIYOR ==========`);
  console.log(`[Scraper] Sorgu: "${query}"`);

  // Tüm mağazaları paralel olarak sorgula
  const storeIds = Object.keys(STORE_CONFIGS) as (keyof typeof STORE_CONFIGS)[];
  const pricePromises = storeIds.map(id => scrapeStore(id, query));
  
  const prices = await Promise.all(pricePromises);

  // En ucuz fiyatı bul
  const validPrices = prices.filter(p => p.price !== null);
  const cheapest = validPrices.length > 0
    ? validPrices.reduce((min, p) => (p.price! < min.price! ? p : min))
    : null;

  console.log(`[Scraper] ========== SONUÇLAR ==========`);
  prices.forEach(p => {
    console.log(`[Scraper] ${p.store}: ${p.price ? p.price + ' TL' : 'Fiyat bulunamadı'}`);
  });
  if (cheapest) {
    console.log(`[Scraper] 🏆 EN UCUZ: ${cheapest.store} - ${cheapest.price} TL`);
  }

  return {
    query,
    timestamp: new Date(),
    prices,
    cheapest,
  };
}

export const BookPriceScraperService = {
  compareBookPrices,
  scrapeStore,
  STORE_CONFIGS,
};
