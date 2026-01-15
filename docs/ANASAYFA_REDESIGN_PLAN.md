# Ana Sayfa Redesign - Implementasyon Planı

**Tarih:** 2026-01-13  
**Durum:** Onay Bekliyor

---

## 🎯 Hedef

Ana sayfayı kitap listesinden **Dashboard**'a dönüştürmek ve durum filtrelerini **Kitaplarım** sayfasına taşımak.

---

## Final Dashboard Yapısı

```
┌─────────────────────────────────────┐
│  📊 İSTATİSTİK KARTLARI             │
│  ┌────────┬────────┬────────┐      │
│  │  145   │   3    │   12   │      │
│  │ Toplam │Okuyor  │Okundu  │      │
│  └────────┴────────┴────────┘      │
│  ┌────────┐                        │
│  │   8    │                        │
│  │Okunacak│                        │
│  └────────┘                        │
├─────────────────────────────────────┤
│  📖 ŞU AN OKUYORUM                  │
│  ┌─────────────────────────────────┐│
│  │  [Kapak]  Kitap Adı             ││
│  │           Yazar                 ││
│  │           [Devam Et →]          ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  📚 OKUMA RAFIM                     │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ →       │
│  │📗│ │📕│ │📘│ │📙│ │📓│         │
│  └──┘ └──┘ └──┘ └──┘ └──┘         │
│  ════════════════════════          │
├─────────────────────────────────────┤
│        [ ➕ Kitap Ekle ]            │
└─────────────────────────────────────┘
```

---

## Değişiklik Özeti

| Sayfa          | Kaldırılacak                                  | Eklenecek                                         |
| -------------- | --------------------------------------------- | ------------------------------------------------- |
| **Ana Sayfa**  | FlashList, arama, filtre butonları (işlevsel) | Dashboard layout, BookShelf, CurrentlyReadingCard |
| **Kitaplarım** | -                                             | Durum sekmeleri (Tümü/Okundu/Okunuyor/Okunacak)   |

---

## Yeni Bileşenler

### 1. `CurrentlyReadingCard.tsx`

- Şu an okunan kitabı gösteren büyük kart
- Kapak + kitap adı + yazar + "Devam Et" butonu
- Boş durum: "Henüz bir kitap okumuyorsun"

### 2. `BookShelf.tsx`

- Okunan kitapların yatay rafı
- Kitap kapakları yan yana
- Scroll edilebilir

---

## Mevcut Dosyalar

| Dosya                  | Mevcut Satır | Değişiklik                      |
| ---------------------- | ------------ | ------------------------------- |
| `app/(tabs)/index.tsx` | 403          | Önemli ölçüde yeniden yazılacak |
| `app/(tabs)/books.tsx` | 310          | Durum filtresi eklenecek        |

---

## Korunacak Özellikler

- ✅ Top bar (logo, kullanıcı adı, tema butonu, AI öneri butonu)
- ✅ İstatistik kartları (sadece görüntüleme, tıklama kaldırılacak)
- ✅ FAB butonu (Kitap Ekle)
- ✅ Recommendation Modal
- ✅ Profile Modal
- ✅ Dark/Light mode

---

## İmplementasyon Sırası

| #   | Görev                             | Süre  |
| --- | --------------------------------- | ----- |
| 1   | `books.tsx` - Durum filtresi ekle | 30 dk |
| 2   | `CurrentlyReadingCard` oluştur    | 20 dk |
| 3   | `BookShelf` oluştur               | 30 dk |
| 4   | `index.tsx` - Dashboard dönüşümü  | 45 dk |
| 5   | Manuel test                       | 15 dk |

**Toplam:** ~2.5 saat

---

## Riskler

| Risk                             | Önlem                              |
| -------------------------------- | ---------------------------------- |
| İstatistik kartları tıklanabilir | Sadece görüntüleme, tıklama kaldır |
| Animasyon performansı            | Basit CSS ile başla                |
| i18n eksik key'ler               | Locale dosyalarını güncelle        |

---

> **Bu plan onaylandıktan sonra implementasyona geçilecektir.**
