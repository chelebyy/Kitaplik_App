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

// --- Sabitler ve Konfigürasyonlar ---

const PRICE_REGEXES = {
  TURKISH_PRICE: /[^\d.,]/g,
  THOUSAND_SEPARATOR: /\./g,
  DECIMAL_SEPARATOR: ',',
  DR_NORMAL: /<span[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL[\s]*<\/span>/gi,
  DR_DISCOUNT: /<span[^>]*class="[^"]*(?<!campaign-price-old)[^"]*"[^>]*>[\s]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL/gi,
  KY_CLASS_TL: /class="TL"><\/span>\s*(\d+,\d{2})/g,
  KY_PRICE_NEW: /price-new[^>]*>[\s\S]*?(\d{2,3},\d{2})/g,
  KY_GENERIC: /(\d{2,3},\d{2})/g,
  BKM_GENERAL: /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:TL|₺)/gi,
};

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'tr-TR,tr;q=0.9',
};

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

// --- Yardımcı Fonksiyonlar ---

/**
 * Türk Lirası formatındaki fiyatı (örn: "1.250,00") number tipine çevirir.
 */
function parseTurkishPrice(priceText: string): number | null {
  if (!priceText) return null;

  const cleaned = priceText
    .replace(PRICE_REGEXES.TURKISH_PRICE, '')
    .trim();

  if (!cleaned) return null;

  // 1.250,00 -> 1250.00
  const normalized = cleaned
    .replace(PRICE_REGEXES.THOUSAND_SEPARATOR, '')
    .replace(PRICE_REGEXES.DECIMAL_SEPARATOR, '.');

  const price = parseFloat(normalized);

  // Mantıksız fiyatları filtrele (1 TL - 10.000 TL arası)
  if (isNaN(price) || price < 1 || price > 10000) {
    return null;
  }

  return price;
}

/**
 * Regex ile HTML içinden fiyatları ayıklar
 */
function extractPricesWithRegex(html: string, regex: RegExp): number[] {
  const prices: number[] = [];
  let match;
  // Regex stateful olduğu için (global flag) döngüyle resetlenmeli veya yeni regex kullanılmalı
  // Ancak parametre olarak gelen regex'in 'g' flag'i olduğundan emin olmalıyız.
  // Güvenlik için local bir kopya veya reset yapılabilir ama burada basitçe döngü kuruyoruz.
  const localRegex = new RegExp(regex);

  while ((match = localRegex.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) {
      prices.push(price);
    }
  }
  return prices;
}

function parseDRPrices(html: string): number[] {
  const prices: number[] = [];

  // Standart fiyatlar
  let match;
  while ((match = PRICE_REGEXES.DR_NORMAL.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) prices.push(price);
  }

  // İndirimli fiyatlar
  while ((match = PRICE_REGEXES.DR_DISCOUNT.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && !prices.includes(price)) {
      prices.push(price);
    }
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

function parseKitapyurduPrices(html: string): number[] {
  const prices: number[] = [];
  let match;

  // Yöntem 1: Class TL
  while ((match = PRICE_REGEXES.KY_CLASS_TL.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) prices.push(price);
  }

  // Yöntem 2: price-new
  while ((match = PRICE_REGEXES.KY_PRICE_NEW.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null && !prices.includes(price)) prices.push(price);
  }

  // Yöntem 3: Fallback
  if (prices.length === 0) {
    const allMatches = html.match(PRICE_REGEXES.KY_GENERIC) || [];
    allMatches.forEach(m => {
      const price = parseTurkishPrice(m);
      if (price !== null && price >= 10 && price <= 500 && !prices.includes(price)) {
        prices.push(price);
      }
    });
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

function parseBKMPrices(html: string): number[] {
  const prices: number[] = [];
  let match;

  while ((match = PRICE_REGEXES.BKM_GENERAL.exec(html)) !== null) {
    const price = parseTurkishPrice(match[1]);
    if (price !== null) prices.push(price);
  }

  return [...new Set(prices)].sort((a, b) => a - b);
}

// --- Ana Servis Metodları ---

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

    const response = await fetch(url, { headers: REQUEST_HEADERS });

    if (!response.ok) {
      throw new Error(`HTTP Hata: ${response.status}`);
    }

    const html = await response.text();
    // console.log(`[Scraper] ${config.name} HTML alındı: ${html.length} karakter`);

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
      default:
        console.warn(`[Scraper] Tanımsız mağaza ID: ${storeId}`);
    }

    // console.log(`[Scraper] ${config.name} bulunan fiyatlar:`, prices.slice(0, 5));

    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

    return {
      store: config.name,
      storeId,
      price: lowestPrice,
      currency: 'TL',
      url,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Scraper] ${config.name} hata:`, errorMessage);

    return {
      store: config.name,
      storeId,
      price: null,
      currency: 'TL',
      url,
      error: errorMessage,
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

  // Paralel sorgu başlat
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
    console.log(`[Scraper] ${p.store}: ${p.price ? p.price + ' TL' : 'Fiyat bulunamadı'} ${p.error ? '(' + p.error + ')' : ''}`);
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
