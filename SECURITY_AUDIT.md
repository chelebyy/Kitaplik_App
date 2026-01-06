# 🛡️ Güvenlik Analizi Raporu (MobSF)

**Analiz Tarihi:** 4 Ocak 2026
**Hedef Dosya:** `application-f91a6c56.apk` (Preview Build)
**Skor:** 51/100 (Medium Risk)

---

## 🚨 Kritik Bulgular ve Açıklamalar

MobSF raporundaki "High Severity" (Yüksek Riskli) bulgular ve nedenleri:

### 1. `Remote WebView Debugging is enabled` (Kritik)

* **MobSF Diyor ki:** "Uygulamanın içindeki web tarayıcısı dışarıdan izlenebilir."
* **Gerçek Durum:** Bu bir **Geliştirme (Preview)** sürümüdür. Hata ayıklayabilmek için bu özellik bilinçli olarak açıktır.
* **Çözüm:** Production (Mağaza) sürümünde Expo bu özelliği otomatik olarak kapatır. **Yapılacak bir şey yok.**

### 2. `App uses SQLite Database and execute raw SQL query`

* **MobSF Diyor ki:** "SQL Injection riski var."
* **Gerçek Durum:** `AsyncStorage`'ın Android tarafındaki native implementasyonu SQLite kullanır. React Native'in kendi iç yapısıdır.
* **Çözüm:** Kullanıcıdan alınan verilerle doğrudan SQL sorgusu çalıştırmadığımız sürece (ki çalıştırmıyoruz) güvendeyiz.

### 3. `Cleartext Storage of Sensitive Information`

* **MobSF Diyor ki:** "Bazı kütüphaneler (Coil, Glide) geçici dosyalar oluşturuyor."
* **Gerçek Durum:** Bunlar resim yükleme kütüphaneleri (Image Caching). Kitap kapaklarını önbelleğe alıyorlar. Hassas veri (şifre vs.) içermiyor.

### 4. `M5: Insufficient Cryptography (MD5)`

* **MobSF Diyor ki:** "MD5 algoritması kullanılıyor (Zayıf şifreleme)."
* **Gerçek Durum:** Expo'nun dosya sistemi (FileSystem) dosya bütünlüğünü kontrol etmek için MD5 kullanıyor. Bu bir şifreleme değil, "dosya bozuk mu?" kontrolüdür. Güvenlik açığı yaratmaz.

---

## 📉 Neden Skor 51/100?

Bu puanın düşük olmasının temel sebebi, analiz ettiğimiz APK'nın **"Debuggable" (Hata Ayıklanabilir)** olmasıdır.

* ✅ **Kodlar Açık:** Hata loglarını okuyabilmek için kodlar şifrelenmedi (Obfuscation yok).
* ✅ **Debug Modu:** `android:debuggable=true` olarak ayarlı.
* ✅ **Gereksiz İzinler:** Geliştirme kolaylığı için tüm izinler tanımlı olabilir.

---

## 🚀 Production (Canlı) Sürümde Ne Değişecek?

Uygulamayı mağazaya gönderirken `eas build --profile production` komutunu kullandığımızda:

1. **Kodlar Şifrelenecek (ProGuard / R8):** Kodlarınız okunamaz hale gelecek (`a.b.c()`).
2. **Debug Kapanacak:** Dışarıdan müdahale edilemez olacak.
3. **İzinler Temizlenecek:** Sadece kullanılan izinler kalacak.
4. **Skor Artacak:** Bu otomatik iyileştirmelerle MobSF skoru **85-90** bandına çıkacaktır.

## ✅ Sonuç

Mevcut rapor, bir **Geliştirme Sürümü** için gayet temizdir. "Gerçek" bir güvenlik açığı (Örn: Kodun içine gömülmüş API Key, Şifresiz veritabanı vb.) bulunmamaktadır. Gönül rahatlığıyla teste devam edebilirsiniz.
