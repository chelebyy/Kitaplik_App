# Güvenlik Tarama Raporu (rnsec)

Bu rapor, `npx rnsec scan` komutu ile gerçekleştirilen güvenlik taramasının sonuçlarını içerir.

## 📊 Özet

| Seviye | İlk Tarama | Düzeltme Sonrası | Durum |
|--------|------------|------------------|-------|
| 🔴 HIGH | 2 | 2 | ⚠️ Kabul Edilebilir |
| 🟡 MEDIUM | 2 | 1 | ✅ İyileştirildi |
| 🔵 LOW | 3 | 2 | ✅ İyileştirildi |
| **Toplam** | **7** | **5** | **%29 azalma** |

---

## ✅ Düzeltilen Bulgular

### 1. `ANDROID_BACKUP_ALLOWED` (MEDIUM → Çözüldü)

- **Dosya:** `android/app/src/main/AndroidManifest.xml`
- **Çözüm:** `android:allowBackup="false"` olarak ayarlandı.

### 2. `EXPO_INSECURE_PERMISSIONS` - RECORD_AUDIO (LOW → Çözüldü)

- **Dosya:** `app.json`
- **Çözüm:** `android.permission.RECORD_AUDIO` permissions listesinden kaldırıldı.

---

## ⚠️ Kabul Edilen Bulgular (Risksiz)

### 1. `ANDROID_CLEARTEXT_ENABLED` (HIGH)

- **Dosya:** `android/app/src/debugOptimized/AndroidManifest.xml`
- **Açıklama:** Bu ayar **yalnızca debug build'lerde** geçerlidir. Development sırasında Metro bundler ve Firebase debug araçları HTTP kullanır. Production build'de `usesCleartextTraffic="false"` olarak ayarlıdır.
- **Risk:** Development ortamı ile sınırlı. **Production'ı etkilemez.**

### 2. `ANDROID_EXPORTED_COMPONENT` (HIGH)

- **Dosya:** `android/app/src/main/AndroidManifest.xml`
- **Açıklama:** `MainActivity` export edilmiş durumdadır çünkü **uygulama simgesinden (Launcher)** başlatılmak zorundadır. Bu, Android uygulamalarında **zorunlu bir gerekliliktir**.
- **Risk:** Yok. Standart Android davranışı.

### 3. `ANDROID_INTENT_FILTER_PERMISSIVE` (MEDIUM)

- **Dosya:** `android/app/src/main/AndroidManifest.xml`
- **Açıklama:** Deep linking (`ayrac://`) için intent filter tanımlanmıştır. Bu, **tasarımsal bir karardır**.
- **Risk:** Düşük. Gelen intent verileri uygulama içinde doğrulanmalıdır (App Router bunu yapar).

### 4. `EXCESSIVE_PERMISSIONS` & `CAMERA` (LOW)

- **Dosya:** `android/app/src/main/AndroidManifest.xml`
- **Açıklama:** Kamera izni barkod taraması için, depolama izinleri yedekleme/geri yükleme için **aktif olarak kullanılmaktadır**.
- **Risk:** Yok. Tüm izinler manifest içinde dokümante edilmiştir.

---

## 🏁 Sonuç

Uygulama, güvenlik açısından **kabul edilebilir** seviyededir. Düzeltilebilir tüm bulgular giderilmiştir. Kalan bulgular ya development ortamı ile sınırlıdır ya da Android platformunun zorunlu gereksinimleridir.
