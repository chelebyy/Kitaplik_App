/**
 * Fiyat Çekme Fizibilite Testi
 * Bu servis sadece test amaçlıdır.
 * Cimri ve Akakçe'den veri çekilip çekilemeyeceğini kontrol eder.
 */

export interface ScraperTestResult {
  site: string;
  success: boolean;
  htmlLength?: number;
  error?: string;
  sampleContent?: string;
  priceFound?: string;
  storeFound?: string;
}

export const ScraperTestService = {
  /**
   * Cimri.com'dan kitap fiyatı çekme testi
   */
  testCimri: async (searchQuery: string): Promise<ScraperTestResult> => {
    const url = `https://www.cimri.com/arama?q=${encodeURIComponent(searchQuery)}`;
    console.log('[ScraperTest] Cimri URL:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      console.log('[ScraperTest] Cimri Response Status:', response.status);

      if (!response.ok) {
        return {
          site: 'Cimri',
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const html = await response.text();
      console.log('[ScraperTest] Cimri HTML Length:', html.length);
      console.log('[ScraperTest] Cimri HTML Sample (first 500 chars):', html.substring(0, 500));

      // Basit fiyat regex testi
      const priceMatch = html.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺)/);
      const priceFound = priceMatch ? priceMatch[0] : undefined;

      return {
        site: 'Cimri',
        success: true,
        htmlLength: html.length,
        sampleContent: html.substring(0, 300),
        priceFound,
      };
    } catch (error: any) {
      console.error('[ScraperTest] Cimri Error:', error);
      return {
        site: 'Cimri',
        success: false,
        error: error.message || 'Bilinmeyen hata',
      };
    }
  },

  /**
   * Akakçe'den kitap fiyatı çekme testi
   */
  testAkakce: async (searchQuery: string): Promise<ScraperTestResult> => {
    const url = `https://www.akakce.com/arama/?q=${encodeURIComponent(searchQuery)}`;
    console.log('[ScraperTest] Akakçe URL:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      console.log('[ScraperTest] Akakçe Response Status:', response.status);

      if (!response.ok) {
        return {
          site: 'Akakçe',
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const html = await response.text();
      console.log('[ScraperTest] Akakçe HTML Length:', html.length);
      console.log('[ScraperTest] Akakçe HTML Sample (first 500 chars):', html.substring(0, 500));

      // Basit fiyat regex testi
      const priceMatch = html.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺)/);
      const priceFound = priceMatch ? priceMatch[0] : undefined;

      return {
        site: 'Akakçe',
        success: true,
        htmlLength: html.length,
        sampleContent: html.substring(0, 300),
        priceFound,
      };
    } catch (error: any) {
      console.error('[ScraperTest] Akakçe Error:', error);
      return {
        site: 'Akakçe',
        success: false,
        error: error.message || 'Bilinmeyen hata',
      };
    }
  },

  /**
   * Tüm testleri çalıştır
   */
  runAllTests: async (searchQuery: string = 'Harry Potter'): Promise<ScraperTestResult[]> => {
    console.log('[ScraperTest] ========== TEST BAŞLIYOR ==========');
    console.log('[ScraperTest] Arama terimi:', searchQuery);

    const results: ScraperTestResult[] = [];

    // Cimri testi
    const cimriResult = await ScraperTestService.testCimri(searchQuery);
    results.push(cimriResult);
    console.log('[ScraperTest] Cimri Sonuç:', cimriResult.success ? '✅ BAŞARILI' : '❌ BAŞARISIZ');

    // Akakçe testi
    const akakceResult = await ScraperTestService.testAkakce(searchQuery);
    results.push(akakceResult);
    console.log('[ScraperTest] Akakçe Sonuç:', akakceResult.success ? '✅ BAŞARILI' : '❌ BAŞARISIZ');

    console.log('[ScraperTest] ========== TEST BİTTİ ==========');
    console.log('[ScraperTest] Özet:', results.map(r => `${r.site}: ${r.success ? 'OK' : 'FAIL'}`).join(', '));

    return results;
  },
};
