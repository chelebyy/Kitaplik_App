# Track Plan: Geliştirici İletişim Modülü

## Phase 1: Altyapı ve Metin Hazırlığı (Infrastructure & i18n)

- [x] Task: İletişim metinlerinin (etiketler, e-posta şablonu vb.) `i18n/locales/tr.json` ve `en.json` dosyalarına eklenmesi.
- [x] Task: E-posta gönderimi için kullanılacak `mailto` URL oluşturma mantığının (utils) hazırlanması.
- [x] Task: Conductor - User Manual Verification 'Phase 1 (1c8ea23): Altyapı ve Metin Hazırlığı' (Protocol in workflow.md)

## Phase 2: UI Entegrasyonu (UI Integration)

- [x] Task: Ayarlar (`app/(tabs)/settings.tsx`) ekranında yeni "Geri Bildirim" öğesi için testlerin yazılması (TDD - Red Phase). 509cc0b
- [x] Task: Ayarlar ekranına "Geri Bildirim" öğesinin eklenmesi ve testlerin geçirilmesi (TDD - Green Phase). 509cc0b
- [x] Task: E-posta tetikleme fonksiyonu (`Linking.openURL`) için birim testlerin yazılması ve doğrulanması. 509cc0b
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Entegrasyonu' (Protocol in workflow.md)

## Phase 3: Son Kontroller ve Doğrulama (Final Verification)

- [ ] Task: Farklı geri bildirim türlerinin (Hata, Öneri vb.) e-posta taslağında doğru göründüğünün manuel testi.
- [ ] Task: Kod kapsamının (coverage) kontrol edilmesi ve hedeflerin (>%80) doğrulanması.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Son Kontroller ve Doğrulama' (Protocol in workflow.md)
