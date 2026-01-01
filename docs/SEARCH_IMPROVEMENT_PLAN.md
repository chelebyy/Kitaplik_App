# Arama İyileştirmeleri ve Open Library Entegrasyon Planı

## 1. UI İyileştirmeleri (`app/add-book.tsx`)

### ✅ Arama Temizleme Sorunu

**Sorun:** Kitap/Yazar sekmesi değişince arama kutusu ve sonuçlar duruyor.
**Çözüm:** Toggle butonlarına tıklandığında state'i sıfırla.

```typescript
onPress={() => {
  setSearchType("book");
  setSearchQuery("");
  setSearchResults([]);
}}
```

### ✅ Arama Butonu Sadeleştirme

**Sorun:** "Google'da Ara" yazısı çok yer kaplıyor.
**Çözüm:** Buton metni kaldırılacak, sadece arama ikonu (büyüteç) kalacak.

## 2. Arama Motoru Geliştirmeleri (`services/GoogleBooksService.ts`)

### 📈 Daha Fazla Sonuç

**Sorun:** "Selman Kayabasi" gibi popüler yazarlarda bile az sonuç dönüyor.
**Çözüm:** API isteğine `&maxResults=40` parametresi eklenecek (Varsayılan 10).

### 🔄 Open Library Fallback (Yedek Arama)

**Sorun:** Google Books'ta bulunamayan kitaplar (Örn: "Ahmet Ümit" bazı eserleri) gelmiyor.
**Çözüm:** Google'dan sonuç boş dönerse Open Library API devreye girecek.

**Open Library API Stratejisi:**

- Endpoint: `https://openlibrary.org/search.json`
- Parametreler: `q={query}` veya yazar araması için `author={query}`
- Dönüşüm: Open Library formatı -> Uygulama formatı (`GoogleBookResult`)
- Kapak: `cover_i` varsa kapak URL'i oluşturulacak.

## 3. Test Senaryoları

1. **UI:** Sekme değiştirince input temizleniyor mu?
2. **UI:** Arama butonu sadece ikon mu?
3. **Data:** "Selman Kayabasi" aramasında 10'dan fazla sonuç geliyor mu?
4. **Fallback:** "Ahmet Ümit" veya Google'da olmayan bir kitap arandığında sonuç geliyor mu?
