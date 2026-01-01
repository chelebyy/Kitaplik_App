/**
 * Güvenli hata işleme yardımcı fonksiyonları.
 * Stack trace'leri ve hassas bilgileri production'da gizler.
 */

/**
 * Hata nesnesinden güvenli mesaj çıkarır.
 * Stack trace'leri ve hassas bilgileri gizler.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Bilinmeyen bir hata oluştu";
}

/**
 * Hata kodunu çıkarır (varsa).
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

/**
 * Production-safe hata loglama.
 * Development modunda tam hata, production'da sadece mesaj loglanır.
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    // Development: Tam hata bilgisi (debug için)
    console.error(`[${context}]`, error);
  } else {
    // Production: Sadece güvenli bilgiler
    const message = getErrorMessage(error);
    const code = getErrorCode(error);
    // S4624: İç içe template literal yerine prefix hesaplaması kullanıldı
    const codePrefix = code ? `(${code}) ` : "";
    console.error(`[${context}] ${codePrefix}${message}`);
  }
}
