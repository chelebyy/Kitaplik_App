# Kitaplik App - Arama Sistemi Iyilestirme Plani

## Plan ID: PLAN-2025-01-11-001

**Durum:** Planlaniyor | **Oncelik:** Orta | **Tahmini Sure:** 5-6 saat | **Karmasiklik:** Orta

---

## YONETICI OZET (Executive Summary)

**Ama:** Arama sistemini 3 ana eksende iyilestirmek: Hiz (Cache), Guvenilirlik (Retry), Gozlemlenebilirlik (Metrics).

**Oneri:**

- Cache Layer: Ayni aramalar icin API cagrisindan kacirarak ~%60 hiz artisi
- Retry Logic: Network sorunlarinda otomatik kurtarma ile ~%95 basari orani
- Metrics Logging: Firebase Analytics ile veriye dayali kararlar

**Yatirim:** 5-6 saat gelistirme + test
**Beklenen ROI:** 3 ayda 100+ arama/yeniden arama tasarrufu = ~500 API cagrisi azaltimi

**Karar:** IMPLEMENTASYON ICIN ONAYLANDI (opsiyonel, acil degil)

---

## I - PROBLEM TANIMI

### Mevcut Durum

| Alan               | Mevcut Durum       | Sorun                                                |
| ------------------ | ------------------ | ---------------------------------------------------- |
| Arama Hizi         | 500ms-3s           | Ayni kitap tekrar araninda her seferinde API cagrisi |
| Basari Orani       | ~%85               | Network sorunlarinda manuel yeniden deneme gerekli   |
| Gozlemlenebilirlik | Sadece Crashlytics | Arama patternleri, cache hit rate gibi metrikler yok |

### Neden Bu Iyilestirmeler?

| Iyilestirme | Acil Neden | Kullanici Etkisi                   |
| ----------- | ---------- | ---------------------------------- |
| Cache Layer | Orta       | Ayni kitapta aninda sonuc          |
| Retry Logic | Dusuk      | Gecici hatalarda otomatik kurtarma |
| Metrics     | Dusuk      | Veriye dayali optimizasyon         |

---

## II - MALIYET-FAYDA ANALIZI (Cost-Benefit)

### Gelistirme Maliyetleri

| Bilesen         | Tahmini Saat | Saatlik Maliyet (t) | Toplam Maliyet    |
| --------------- | ------------ | ------------------- | ----------------- |
| Cache Layer     | 2-3          | 500                 | 1.000 - 1.500     |
| Retry Logic     | 1            | 500                 | 500               |
| Metrics/Logging | 2            | 500                 | 1.000             |
| Testing & QA    | 1            | 500                 | 500               |
| **TOPLAM**      | **5-6**      | -                   | **3.000 - 3.500** |

### Beklenen Faydalar (ROI)

| Metrik         | Mevcut | Hedef  | Deger                     |
| -------------- | ------ | ------ | ------------------------- |
| Cache Hit Rate | %0     | %60    | ~500 API call/ay azaltimi |
| Arama Hizi     | 1.5s   | <500ms | 3x hizlanma (cache hit)   |
| Manuel Retry   | %15    | %0     | Otomatik kurtarma         |

### ROI Hesaplama

```
Aylik ortalama arama: 200 (kullanici basina)
Aktif kullanici: ~50
Aylik toplam arama: 10.000

Cache hit %60 -> 6.000 azaltilmis API call
API call maliyeti: ~0.01 TL (quota yedekleme)
Aylik tasarruf: 60 TL
Yillik tasarruf: 720 TL

ROI = (720 - 3.500) / 3.500 * 100 = ilk yil negatif
        = (720 * 2 - 3.500) / 3.500 * 100 = -59% (2. yil)
        = (720 * 5 - 3.500) / 3.500 * 100 = +3% (5. yil)

NOT: Maliyet faydadan fazla, ancak:
- Kullanici deneyimi iyilestirmesi fiyatlandirilamaz
- Rate limit riski azalir
- Gelistirici deneyimi artar (metrics ile debugging)
```

---

## III - TEKNIK DETAYLAR

## 1. CACHE LAYER

### Architecture

```
SearchEngine.ts
       |
       v
BookCacheService.check()
       |
       +-- HIT --> Return cached data (log event: cache_hit)
       |
       +-- MISS --> GoogleBooksService.search()
                         |
                         v
                    BookCacheService.set()
                         |
                         v
                    Return data
```

### Interface

```typescript
interface BookCacheService {
  get(key: string): CachedBookData | null;
  set(key: string, data: BookData, ttl: number): Promise<void>;
  invalidate(pattern?: string): Promise<void>;
  clear(): Promise<void>;
}

interface CachedBookData {
  data: BookData;
  timestamp: number;
  ttl: number;
}
```

### Dosyalar

| Dosya                                       | Tur     | Aciklama                    |
| ------------------------------------------- | ------- | --------------------------- |
| services/BookCacheService.ts                | Yeni    | Cache management (LRU, TTL) |
| services/**tests**/BookCacheService.test.ts | Yeni    | Unit tests                  |
| services/SearchEngine.ts                    | Duzenle | Cache entegrasyonu          |

### Cache Stratejisi

| Arama Tipi           | TTL     | Neden                     |
| -------------------- | ------- | ------------------------- |
| ISBN (exact)         | 24 saat | Kitap verisi degismez     |
| Metin (title)        | 1 saat  | Yeni kitaplar eklenebilir |
| OpenLibrary fallback | 6 saat  | Daha az guvenilir         |

### Storage Limitleri

```
Max cache size: 5MB
Max item count: 500
Eviction policy: LRU (Least Recently Used)
```

---

## 2. RETRY LOGIC

### Retry Strategy

| Error Type       | Retry Count | Backoff Strategy                |
| ---------------- | ----------- | ------------------------------- |
| Network timeout  | 3           | 500ms -> 1s -> 2s (exponential) |
| 5xx Server error | 2           | 1s -> 2s (fixed)                |
| 429 Rate limit   | 3           | 2s -> 4s -> 8s (exponential)    |
| 4xx Client error | 0           | No retry (user error)           |

### Interface

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

async function retryWrapper<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
): Promise<T>;
```

### Dosyalar

| Dosya                                | Tur     | Aciklama              |
| ------------------------------------ | ------- | --------------------- |
| utils/retryWrapper.ts                | Yeni    | Generic retry utility |
| utils/**tests**/retryWrapper.test.ts | Yeni    | Unit tests            |
| services/GoogleBooksService.ts       | Duzenle | Retry entegrasyonu    |
| services/OpenLibraryService.ts       | Duzenle | Retry entegrasyonu    |

---

## 3. METRICS & LOGGING

### Firebase Eventleri

| Event Name      | Params                             | Purpose              |
| --------------- | ---------------------------------- | -------------------- |
| book_search     | query, source, result_count        | Arama patternleri    |
| cache_hit       | cache_key, ttl_ms                  | Cache effectiveness  |
| cache_miss      | cache_key                          | Cache optimization   |
| api_error       | api_name, error_code, retry_count  | Error monitoring     |
| search_duration | duration_ms, source, cache_hit     | Performance tracking |
| retry_attempt   | api_name, attempt_num, max_retries | Retry effectiveness  |

### Interface

```typescript
interface AnalyticsService {
  logSearch(query: string, source: string, resultCount: number): void;
  logCacheHit(key: string, ttl: number): void;
  logCacheMiss(key: string): void;
  logApiError(api: string, error: Error, retryCount: number): void;
  logSearchDuration(ms: number, source: string, fromCache: boolean): void;
}
```

### Dosyalar

| Dosya                                       | Tur  | Aciklama                   |
| ------------------------------------------- | ---- | -------------------------- |
| services/AnalyticsService.ts                | Yeni | Firebase Analytics wrapper |
| services/**tests**/AnalyticsService.test.ts | Yeni | Unit tests (mocked)        |

---

## IV - RISK ANALIZI

### Riskler ve Mitigasyonlar

| Risk            | Olasilik | Etki   | Mitigasyon                        |
| --------------- | -------- | ------ | --------------------------------- |
| Storage dolmasi | Orta     | Orta   | LRU policy + 5MB limit            |
| Cache staleness | Dusuk    | Dusuk  | TTL + invalidate on demand        |
| Retry storm     | Dusuk    | Yuksek | Max 3 retry + exponential backoff |
| Analytics cost  | Dusuk    | Dusuk  | Sadece aggregate data             |
| Test coverage   | Orta     | Orta   | Her servis icin unit test         |

### Rollback Plani

| Senaryo         | Rollback Sureci                                |
| --------------- | ---------------------------------------------- |
| Cache bug       | AsyncStorage'dan `cache:` prefixli keyleri sil |
| Retry sorun     | retryWrapper'i bypass et (maxRetries: 0)       |
| Analytics sorun | AnalyticsService'i no-op yap                   |

---

## V - HEDEF METRIKLER

### Success Criteria

| Kriter                | Mevcut | Hedef           | Olcum Yontemi           |
| --------------------- | ------ | --------------- | ----------------------- |
| Cache Hit Rate        | %0     | >%60            | Firebase Analytics      |
| API Basari Orani      | ~%85   | >%95            | Crashlytics             |
| Ortalama Arama Suresi | 1.5s   | <500ms (cached) | Performance monitoring  |
| Storage Kullanimi     | 0MB    | <5MB            | AsyncStorage inspection |

### Monitoring Plan

```
Haftalık:
- Cache hit rate grafiği
- API error oranları
- Ortalama arama süresi

Aylık:
- En çok aranan kitaplar
- Cache miss pattern analizi
- Optimizasyon fırsatları
```

---

## VI - IMPLEMENTATION PLANI

### Phase 1: Cache Layer (2-3 saat)

```
[ ] BookCacheService.ts oluştur
[ ] TTL ve LRU logic implement et
[ ] SearchEngine.ts'a entegre et
[ ] Unit tests yaz
[ ] AsyncStorage limit test
```

### Phase 2: Retry Logic (1 saat)

```
[ ] retryWrapper.ts utility yaz
[ ] GoogleBooksService'e entegre et
[ ] OpenLibraryService'e entegre et
[ ] Unit tests yaz
[ ] Error scenarios test et
```

### Phase 3: Metrics/Logging (2 saat)

```
[ ] AnalyticsService.ts oluştur
[ ] Firebase eventlerini tanımla
[ ] SearchEngine'e log ekle
[ ] Cache service'e log ekle
[ ] Unit tests yaz (mocked)
```

### Phase 4: Testing & QA (1 saat)

```
[ ] End-to-end test senaryoları
[ ] Performance test (cache hit/miss)
[ ] Network error simulation
[ ] Storage limit test
[ ] Firebase Analytics dogrulama
```

---

## VII - BAGIMLILIKLAR

### External Dependencies

| Paket                                     | Surum (mevcut) | Surum (gerekli) | Action         |
| ----------------------------------------- | -------------- | --------------- | -------------- |
| @react-native-firebase/analytics          | ?              | ?               | Check existing |
| @react-native-async-storage/async-storage | ?              | ?               | No change      |

### Internal Dependencies

| Servis           | Bagimlilik         |
| ---------------- | ------------------ |
| BookCacheService | StorageService     |
| AnalyticsService | Firebase Analytics |
| retryWrapper     | fetchWithTimeout   |

---

## VIII - KABUL KRITERLERI (Acceptance Criteria)

### Functional

- [ ] ISBN aramasi 24 saat cache'lenir
- [ ] Metin aramasi 1 saat cache'lenir
- [ ] Network timeout'da otomatik retry (max 3)
- [ ] Tum aramalar Firebase'e loglanir

### Non-Functional

- [ ] Cache storage 5MB'i gecmez
- [ ] Retry toplam sure <10 saniye
- [ ] Analytics loglama arama suresini etkilemez (<5ms overhead)

---

## IX - SONRAKI ADIMLAR

1. Bu plani onaylat
2. Phase 1 ile basla (Cache Layer)
3. Her phase sonunda test calistir
4. Tum phases bitince E2E test
5. Production'a release et
6. 1 hafta sonra metrics kontrol et

---

## APPENDIX A: CODE SNIPPETS

### Cache Key Generation

```typescript
function generateCacheKey(query: string, source: string): string {
  const normalized = query.toLowerCase().trim();
  const hash = simpleHash(normalized);
  return `cache:${source}:${hash}`;
}
```

### Retry Backoff Calculation

```typescript
function calculateBackoff(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt); // Exponential backoff
}
```

---

## APPENDIX B: REFERENCE DOKUMANLAR

- CLAUDE.md - Proje yonergeleri
- AGENTS.md - Agent bilgileri
- services/SearchEngine.ts - Mevcut arama implementasyonu
- services/BookMergeService.ts - Veri birlestirme servisi
- Firebase Analytics Documentation

---

**Plan Olusturuldu:** 11 Ocak 2025
**Son Revizyon:** 11 Ocak 2025
**Durum:** Imzaya Hazir
**Onay:** [ ] Bekleniyor | [ ] Onaylandi | [ ] Reddedildi
