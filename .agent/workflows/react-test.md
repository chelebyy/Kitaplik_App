---
description: React Native Unit & Interaction Testing (Jest + Testing Library)
---

# React Native Test Generator

Bu workflow, React Native bileşenleri için **Jest** ve **@testing-library/react-native** kullanarak test yazar.

## Standartlar

- **Kütüphaneler**: 'jest', '@testing-library/react-native'.
- **Mocking**: 'expo-router' (useRouter, useLocalSearchParams), '@react-native-async-storage/async-storage'.
- **Query**: 'getByText', 'getByTestId' (accessibilityLabel tercih et).

## Adımlar

1.  **Hedef Analizi**:
    - Test edilecek bileşeni (.tsx) ve props yapısını anla.
    - Kullanılan hookları ve servisleri listele.

2.  **Test Dosyası Oluştur**:
    - '**tests**' klasörü altına veya 'component.test.tsx' olarak oluştur.
    - Gerekli mockları en tepeye tanımla.

3.  **Test Senaryoları**:
    - **Render**: Bileşen hatasız render oluyor mu?
    - **Props**: Farklı props'larla doğru çıktı veriyor mu?
    - **Interaction**: Buton tıklamaları (fireEvent.press) çalışıyor mu?
    - **Input**: Metin girişi (fireEvent.changeText) state'i güncelliyor mu?

4.  **Doğrulama**:
    - 'expect(element).toBeTruthy()' vb. kontrolleri ekle.
