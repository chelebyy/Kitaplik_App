/**
 * Güvenli kriptografik işlemler için yardımcı fonksiyonlar.
 * Math.random() yerine expo-crypto kullanarak güvenli rastgele sayı üretimi sağlar.
 *
 * OWASP A04: Cryptographic Failures - Zayıf kriptografi önleme
 * Pseudo-random number generator (PRNG) saldırılarına karşı korunma.
 */

import * as Crypto from "expo-crypto";

/**
 * Güvenli rastgele tamsayı üretir.
 * Math.random() yerine kullanılmalı - tahmin edilemezlik sağlar.
 *
 * @param max - Üretilecek maksimum değer (dahil değil)
 * @returns 0 ile max-1 arası güvenli rastgele tamsayı
 *
 * @example
 * // Güvensiz (SonarQube uyarısı):
 * const index = Math.floor(Math.random() * array.length);
 *
 * // Güvenli:
 * const index = getSecureRandomInt(array.length);
 */
export async function getSecureRandomInt(max: number): Promise<number> {
  if (max <= 0) {
    throw new Error("max değeri pozitif olmalı");
  }
  if (max === 1) {
    return 0;
  }

  // expo-crypto ile güvenli rastgele baytlar üret
  const randomBytes = await Crypto.getRandomBytesAsync(4);

  // 4 baytı 32-bit unsigned integer'a çevir
  const randomValue =
    (randomBytes[0] << 24) |
    (randomBytes[1] << 16) |
    (randomBytes[2] << 8) |
    randomBytes[3];

  // Modulo işlemi ile istenen aralığa sınırla
  return randomValue % max;
}

/**
 * React Native'de expo-crypto her zaman mevcut olduğu için
 * senkron versiyona gerek yoktur. Tüm kullanımlar async getSecureRandomInt()
 * fonksiyonunu kullanmalıdır.
 */
