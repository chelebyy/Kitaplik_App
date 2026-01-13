# 🚀 Gelecek Geliştirmeler ve Yol Haritası

Bu belge, Kitaplik App için planlanan ve daha sonra eklenecek özellikleri içerir.

## 1. Detaylı Okuma Analizi (Premium İstatistikler) 📊

**Amaç:** Kullanıcının okuma alışkanlıklarını derinlemesine analiz ederek motive etmek.
**Gelir Modeli:** Bu özellik **Premium Paket** dahilindedir (Tek seferlik satın alım veya abonelik).

**Özellikler:**

- **Tahmini Bitiş Süresi:** "Bu hızla gidersen bu yıl X kitap bitireceksin."
- **Verimlilik Saatleri:** "En verimli okuduğun saatler: Akşam 21:00-23:00"
- **Haftalık/Aylık Gelişim:** Okuma süresi ve sayfa sayısı karşılaştırmaları (Geçen aya göre %20 artış vb.).
- **Okuma Hızı:** Sayfa/Dakika analizi.

## 2. Kitap Asistanı (AI Chat - Mini) 🤖

**Amaç:** Kullanıcının kitaplarla ilgili sorularını anlık olarak yanıtlamak.
**Kredi Modeli:** Her soru = **2 Kredi**
**Teknoloji:** Gemini 2.0 Flash API (en ucuz + en hızlı)

**Teknik Detaylar:**

- Maliyet: ~₺0.01/soru (2 kredi karşılığı karlı)
- Geliştirme: 12-18 saat
- Backend: Firebase Cloud Functions gerekli (API key güvenliği)

**Kullanım Senaryoları:**

- "Suç ve Ceza'nın ana fikri nedir?"
- "Bu kitabı okumalı mıyım?"
- "Harry Potter'daki X karakteri kimdi?"
- Kitap özetleri ve karakter analizleri

## 3. Yüksek Çözünürlüklü Kapak Arama (HD) 🖼️

**Amaç:** Kullanıcıların kitaplıklarını daha estetik hale getirmesi.
**Kredi Modeli:** Her HD kapak arama ve indirme işlemi = **1 Kredi**.

**Özellikler:**

- Google Books dışındaki kaynaklardan veya görsel arama motorlarından yüksek kaliteli kapak bulma.
- Galeriye kaydetme veya doğrudan kitap kapağı olarak atama.

## 4. Kütüphane Dışa Aktarma (Export) 📤

**Amaç:** Veri yedeği almak veya listeyi paylaşmak.

**Formatlar:**

- **PDF:** Görselli, şık bir katalog.
- **Excel/CSV:** Detaylı veri listesi.

---

_Not: Bu özellikler uygulamanın kullanıcı tabanı arttıkça eklenecektir._

takip ettiğin yazarın bir kitabı çıktığında otomatik olarak bildirim al , satışa sunulduğunda bildirim al

---

## 📚 Teknik İyileştirmeler

### Paralel API Arama Sistemi (Faz 2)

**Durum:** Planlandı (Faz 1 tamamlandı)
**Detaylı Plan:** [docs/FUTURE_IMPLEMENTATION_PLAN.md](./docs/FUTURE_IMPLEMENTATION_PLAN.md)

Google Books ve Open Library API'lerini paralel çalıştırarak barkod tarama başarı oranını %90'a çıkarma.

- ✅ Faz 1: ISBN dönüştürme + Open Library fallback (Tamamlandı)
- ⏳ Faz 2: Paralel arama sistemi (Gelecek)
