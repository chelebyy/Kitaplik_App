/**
 * Retry destekli fetch wrapper.
 * Exponential backoff ile network hatalarını graceful handle eder.
 */

import { fetchWithTimeout, isTimeoutError } from "./fetchWithTimeout";

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 saniye
  maxDelayMs: 8000, // 8 saniye max
  backoffMultiplier: 2, // 1s → 2s → 4s
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Exponential backoff hesapla (jitter ile)
 * Jitter: %0-30 arası rastgele ek süre
 */
function calculateDelay(
  attempt: number,
  config: Required<RetryConfig>,
): number {
  const exponentialDelay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // %30 jitter
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

/**
 * Retry edilebilir hata mı kontrol et
 * - Timeout hatası (AbortError from fetchWithTimeout)
 * - Network hatası (TypeError with "Network" message)
 */
function isRetryableError(error: unknown): boolean {
  if (isTimeoutError(error)) return true;
  if (error instanceof TypeError && error.message.includes("Network"))
    return true;
  return false;
}

/**
 * Retry edilebilir status code mu kontrol et
 */
function isRetryableStatus(
  status: number,
  config: Required<RetryConfig>,
): boolean {
  return config.retryableStatusCodes.includes(status);
}

/**
 * Retry destekli fetch wrapper
 *
 * Exponential backoff ile belirli hatalarda otomatik retry yapar.
 * - Timeout hatalarında retry yapar
 * - Network hatalarında retry yapar
 * - 408, 429, 500, 502, 503, 504 status kodlarında retry yapar
 * - 400, 401, 403, 404 gibi client hatalarında retry YAPMAZ
 *
 * @param url - İstek yapılacak URL
 * @param options - Fetch seçenekleri (opsiyonel signal desteği)
 * @param retryConfig - Retry konfigürasyonu
 * @returns Promise<Response>
 *
 * @example
 * // Standart kullanım
 * const response = await fetchWithRetry('https://api.example.com/data');
 *
 * @example
 * // Özel konfigürasyon
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ data: 'test' }),
 * }, { maxRetries: 5 });
 *
 * @example
 * // Preset kullanımı
 * const response = await fetchWithRetry(url, {}, RetryPresets.aggressive);
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = {},
): Promise<Response> {
  const config = { ...DEFAULT_CONFIG, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Başarılı veya retry edilemez status
      if (response.ok || !isRetryableStatus(response.status, config)) {
        return response;
      }

      // Retry edilebilir status - devam et
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Retry edilemez hata
      if (!isRetryableError(error)) {
        throw error;
      }
    }

    // Son deneme değilse bekle
    if (attempt < config.maxRetries) {
      const delay = calculateDelay(attempt, config);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.warn(
        `[fetchWithRetry] Retry attempt ${attempt + 1}/${config.maxRetries}`,
        {
          url,
          nextDelayMs: delay,
        },
      );
    }
  }

  throw lastError ?? new Error("Max retries exceeded");
}

/**
 * Retry konfigürasyonu ön tanımları
 */
export const RetryPresets = {
  /** Kritik API çağrıları için agresif retry */
  aggressive: {
    maxRetries: 5,
    initialDelayMs: 500,
  } as RetryConfig,

  /** Normal API çağrıları için standart retry */
  standard: { ...DEFAULT_CONFIG } as RetryConfig,

  /** Hızlı fail istenen durumlar için minimal retry */
  minimal: {
    maxRetries: 1,
    initialDelayMs: 1000,
  } as RetryConfig,

  /** Retry istenmeyen durumlar */
  none: {
    maxRetries: 0,
  } as RetryConfig,
} as const;
