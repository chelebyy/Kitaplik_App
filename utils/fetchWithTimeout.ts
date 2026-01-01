/**
 * Timeout destekli fetch wrapper.
 * Slowloris DoS saldırılarına karşı koruma sağlar.
 */

const DEFAULT_TIMEOUT_MS = 10000; // 10 saniye

/**
 * Timeout destekli fetch fonksiyonu.
 * Belirtilen süre içinde yanıt alınamazsa AbortError fırlatır.
 *
 * @param url - İstek yapılacak URL
 * @param options - Fetch seçenekleri
 * @param timeout - Maksimum bekleme süresi (ms), varsayılan 10 saniye
 * @returns Promise<Response>
 * @throws AbortError - Timeout durumunda
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Timeout hatasını kontrol eder.
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
