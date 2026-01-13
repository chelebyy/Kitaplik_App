# Track Spec: Okuma İstatistikleri ve Görselleştirme

## 1. Overview

Kullanıcıların okuma alışkanlıklarını anlamalarını sağlayacak görsel bir istatistik paneli oluşturulması. Bu özellik, kullanıcıların ne kadar kitap okuduklarını, hangi türlere odaklandıklarını ve zaman içindeki okuma hızlarını görmelerini sağlar.

## 2. Requirements

- **Yıllık Hedef Takibi:** Kullanıcının belirlediği yıllık kitap hedefine göre ilerleme durumu.
- **Tür Dağılımı:** Kitaplıktaki kitapların kategorilerine göre dağılımını gösteren pasta grafiği.
- **Aylık Okuma Grafiği:** Son 6 ayda bitirilen kitap sayısını gösteren sütun grafiği.
- **Okuma Hızı İstatistikleri:** Ortalama kitap bitirme süresi ve günlük ortalama sayfa sayısı.
- **En Çok Okunan Yazarlar:** En çok kitabı bulunan yazarların listesi.

## 3. Technical Design

- **Veri Kaynağı:** `BooksContext` üzerinden sağlanan yerel kitap verileri.
- **Görselleştirme Kütüphanesi:** `react-native-svg` ve `react-native-chart-kit` (veya benzeri hafif bir çözüm).
- **Performans:** Büyük kitaplıklar için verinin arka planda (memoized) hesaplanması.
- **UI:** Tailwind CSS (NativeWind) ile modern ve temiz bir dashboard tasarımı.

## 4. Verification Plan

- İstatistik hesaplamaları için birim testler.
- Farklı kitaplık boyutlarında (0, 10, 100+ kitap) UI testleri.
- Tema (Koyu/Açık) uyumluluğu kontrolü.
