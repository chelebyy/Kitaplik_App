/**
 * Güvenli hata işleme yardımcı fonksiyonları.
 * Stack trace'leri ve hassas bilgileri production'da gizler.
 *
 * NOT: Bu dosya Crashlytics'e bağımlı DEĞİLDİR.
 * Crashlytics entegrasyonu için logErrorWithCrashlytics kullanın.
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
 * Production-safe hata loglama (Crashlytics OLMADAN).
 * Development modunda tam hata, production'da sadece mesaj loglanır.
 *
 * Bu fonksiyon BAĞIMSIZDIR - döngüsel bağımlılık yaratmaz.
 * Storage katmanı gibi alt seviye modüllerde kullanın.
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

/**
 * Crashlytics ile hata loglama (opsiyonel).
 *
 * KULLANIM: Application seviyesinde (Context, Service vb.)
 * KULLANMAMA: Storage katmanında, utils'de (döngü yaratır)
 *
 * @example
 * // ✅ DOĞRU - Context/Service seviyesinde
 * import { logErrorWithCrashlytics } from '@/utils/errorUtils';
 * logErrorWithCrashlytics('BooksContext.fetchBooks', error);
 *
 * @example
 * // ✅ DOĞRU - Storage/utils seviyesinde
 * import { logError } from '@/utils/errorUtils';
 * logError('MMKVAdapter.getItem', error);
 */
export async function logErrorWithCrashlytics(
  context: string,
  error: unknown,
): Promise<void> {
  // Önce basit log yap (bağımsız kısım)
  logError(context, error);

  // Production'da Crashlytics'e de raporla
  if (!__DEV__) {
    // Dinamik import ile döngüyü kır
    const { default: CrashlyticsService } =
      await import("../services/CrashlyticsService");
    const message = getErrorMessage(error);
    const errorObj = error instanceof Error ? error : new Error(message);
    await CrashlyticsService.recordError(errorObj, context);
  }
}
