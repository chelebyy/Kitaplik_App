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
 * @param options - Fetch seçenekleri (opsiyonel signal desteği)
 * @param timeout - Maksimum bekleme süresi (ms), varsayılan 10 saniye
 * @returns Promise<Response>
 * @throws AbortError - Timeout veya dış signal iptal durumunda
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  // Dışarıdan gelen signal varsa, onu da dahil et
  const externalSignal = options.signal;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Her iki signal'dan biri iptal edildiğinde isteği iptal et
  function onAbort() {
    controller.abort();
    clearTimeout(timeoutId);
  }

  // Dış signal'i dinle
  if (externalSignal) {
    if (externalSignal.aborted) {
      onAbort();
    } else {
      externalSignal.addEventListener("abort", onAbort);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
    // Dış signal listener'ını temizle
    if (externalSignal && !externalSignal.aborted) {
      externalSignal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Timeout hatasını kontrol eder.
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
