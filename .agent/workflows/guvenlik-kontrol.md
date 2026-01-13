---
description: React Native Security Audit (OWASP MASVS based)
---

# React Native Security Scan

Bu workflow, mobil uygulamanın güvenliğini tehdit eden yaygın hataları tarar. **OWASP Mobile Application Security Verification Standard (MASVS)** temel alınmıştır.

## Tarama Kriterleri

1.  **Hassas Veri Saklama**:
    - 'AsyncStorage' içinde hassas veri (token, password) aranıyor mu? -> **SecureStore** kullanılmalı.
    - Kod içinde Hardcoded API Key veya Secret var mı? -> **.env** kullanılmalı.

2.  **Ağ Güvenliği**:
    - 'http://' (güvensiz) istekler var mı? -> 'https://' olmalı.
    - SSL Pinning uygulanmış mı? (Kritik uygulamalar için).

3.  **Debug & Log**:
    - 'console.log', 'console.error' canlıda kalmış mı? -> Production build'de temizlenmeli veya 'babel-plugin-transform-remove-console' kullanılmalı.

4.  **Girdi Güvenliği**:
    - Kullanıcı girdileri doğrudan render ediliyor mu? (XSS riski düşük olsa da manipülasyon açığı).

5.  **Android/iOS Manifest**:
    - Gereksiz izinler (Permissions) istenmiş mi? (Kamera, Konum vb.)
    - 'android:allowBackup="true"' açık mı? (Hassas ise kapatılmalı).

## Çıktı Formatı

- **[YÜKSEK]**: Acil düzeltilmesi gereken açıklar (Token saklama, Hardcoded key).
- **[ORTA]**: İyileştirilmesi gerekenler (HTTP kullanımı, Console log).
- **[DÜŞÜK]**: Best practice uyarıları.
