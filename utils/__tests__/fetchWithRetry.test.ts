/**
 * fetchWithRetry Test Suite
 *
 * TDD approach: Tests written BEFORE implementation
 * Covers: retry behavior, exponential backoff, status codes, abort handling
 */

// Mock fetchWithTimeout module
jest.mock("../fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
  isTimeoutError: jest.fn(),
}));

// Mock errorUtils
jest.mock("../errorUtils", () => ({
  logError: jest.fn(),
}));

import { fetchWithRetry, RetryPresets } from "../fetchWithRetry";
import { fetchWithTimeout, isTimeoutError } from "../fetchWithTimeout";
import { logError } from "../errorUtils";

const mockFetchWithTimeout = fetchWithTimeout as jest.MockedFunction<
  typeof fetchWithTimeout
>;
const mockIsTimeoutError = isTimeoutError as jest.MockedFunction<
  typeof isTimeoutError
>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("fetchWithRetry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsTimeoutError.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("başarılı istekler", () => {
    it("ilk denemede başarılı olursa response döner", async () => {
      const mockResponse = { ok: true, status: 200 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(mockResponse);

      const promise = fetchWithRetry("https://example.com");
      jest.runAllTimers();
      const response = await promise;

      expect(response).toBe(mockResponse);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });

    it("başarılı istekte retry yapmaz", async () => {
      const mockResponse = { ok: true, status: 200 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(mockResponse);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );
      jest.runAllTimers();
      await promise;

      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
      expect(mockLogError).not.toHaveBeenCalled();
    });

    it("fetch seçeneklerini iletir", async () => {
      const mockResponse = { ok: true, status: 200 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(mockResponse);

      const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      };

      const promise = fetchWithRetry("https://example.com", options);
      jest.runAllTimers();
      await promise;

      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        "https://example.com",
        options,
      );
    });
  });

  describe("retry davranışı - hatalar", () => {
    it("timeout hatasında retry yapar", async () => {
      const timeoutError = new Error("Timeout");
      timeoutError.name = "AbortError";
      mockIsTimeoutError.mockReturnValue(true);

      mockFetchWithTimeout
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      // İlk deneme başarısız
      await jest.advanceTimersByTimeAsync(0);

      // Delay bekle ve ikinci deneme
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("network hatasında retry yapar", async () => {
      const networkError = new TypeError("Network request failed");
      mockIsTimeoutError.mockReturnValue(false);

      mockFetchWithTimeout
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("retry edilemez hatada hemen throw eder", async () => {
      const syntaxError = new SyntaxError("Invalid JSON");
      mockIsTimeoutError.mockReturnValue(false);

      mockFetchWithTimeout.mockRejectedValueOnce(syntaxError);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await expect(promise).rejects.toThrow("Invalid JSON");
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe("retry davranışı - status kodları", () => {
    it("500 status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("502 status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("503 status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("504 status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 504 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("429 (rate limit) status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("408 (request timeout) status'ta retry yapar", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 408 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);

      const response = await promise;

      expect(response.ok).toBe(true);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
    });

    it("400 status'ta retry YAPMAZ", async () => {
      const badRequestResponse = { ok: false, status: 400 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(badRequestResponse);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );
      jest.runAllTimers();
      const response = await promise;

      expect(response.status).toBe(400);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });

    it("401 status'ta retry YAPMAZ", async () => {
      const unauthorizedResponse = { ok: false, status: 401 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(unauthorizedResponse);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );
      jest.runAllTimers();
      const response = await promise;

      expect(response.status).toBe(401);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });

    it("404 status'ta retry YAPMAZ", async () => {
      const notFoundResponse = { ok: false, status: 404 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(notFoundResponse);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );
      jest.runAllTimers();
      const response = await promise;

      expect(response.status).toBe(404);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });

    it("403 status'ta retry YAPMAZ", async () => {
      const forbiddenResponse = { ok: false, status: 403 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(forbiddenResponse);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );
      jest.runAllTimers();
      const response = await promise;

      expect(response.status).toBe(403);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe("exponential backoff", () => {
    it("ilk başarısızlıktan sonra ~1s bekler", async () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);
      await promise;

      // setTimeout'a verilen delay'i kontrol et (jitter dahil olabilir)
      const calls = setTimeoutSpy.mock.calls;
      const delayCall = calls.find(
        (call) =>
          typeof call[1] === "number" && call[1] >= 1000 && call[1] <= 1300,
      );
      expect(delayCall).toBeDefined();

      setTimeoutSpy.mockRestore();
    });

    it("ikinci başarısızlıktan sonra ~2s bekler", async () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);
      await jest.advanceTimersByTimeAsync(3000);
      await promise;

      // İkinci delay yaklaşık 2000ms olmalı (jitter dahil)
      const calls = setTimeoutSpy.mock.calls;
      const secondDelayCall = calls.find(
        (call) =>
          typeof call[1] === "number" && call[1] >= 2000 && call[1] <= 2600,
      );
      expect(secondDelayCall).toBeDefined();

      setTimeoutSpy.mockRestore();
    });

    it("üçüncü başarısızlıktan sonra ~4s bekler", async () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 4, initialDelayMs: 1000, backoffMultiplier: 2 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);
      await jest.advanceTimersByTimeAsync(3000);
      await jest.advanceTimersByTimeAsync(5000);
      await promise;

      // Üçüncü delay yaklaşık 4000ms olmalı (jitter dahil)
      const calls = setTimeoutSpy.mock.calls;
      const thirdDelayCall = calls.find(
        (call) =>
          typeof call[1] === "number" && call[1] >= 4000 && call[1] <= 5200,
      );
      expect(thirdDelayCall).toBeDefined();

      setTimeoutSpy.mockRestore();
    });

    it("maxDelayMs'i aşmaz", async () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      // 5 başarısız deneme: delay = 1, 2, 4, 8, 16 olur ama max 8
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        {
          maxRetries: 5,
          initialDelayMs: 1000,
          maxDelayMs: 8000,
          backoffMultiplier: 2,
        },
      );

      // Tüm timer'ları ilerlet
      for (let i = 0; i < 10; i++) {
        await jest.advanceTimersByTimeAsync(10000);
      }
      await promise;

      // Hiçbir delay 8000'i aşmamalı
      const calls = setTimeoutSpy.mock.calls;
      const delays = calls
        .map((call) => call[1])
        .filter((d): d is number => typeof d === "number" && d > 500);

      delays.forEach((delay) => {
        expect(delay).toBeLessThanOrEqual(8000);
      });

      setTimeoutSpy.mockRestore();
    });

    it("jitter ekler (delay tam exponential değil)", async () => {
      // Math.random'ı mock'la, delay hesaplamasında jitter etkisini kontrol et
      const mockMath = jest.spyOn(Math, "random").mockReturnValue(0.15); // %15 jitter

      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);
      await promise;

      // setTimeout çağrılarını kontrol et
      const calls = setTimeoutSpy.mock.calls;
      const delayCall = calls.find(
        (call) =>
          typeof call[1] === "number" && call[1] >= 1000 && call[1] <= 1500,
      );
      expect(delayCall).toBeDefined();
      // Jitter ile delay = 1000 + (0.15 * 0.3 * 1000) = 1045
      expect(delayCall![1]).toBe(1045);

      mockMath.mockRestore();
      setTimeoutSpy.mockRestore();
    });
  });

  describe("max retries", () => {
    it("max retry aşıldığında throw eder", async () => {
      // Her çağrı için ayrı mock
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 2 },
      );

      // Promise'i hemen error handler'a bağla
      let caughtError: Error | undefined;
      const errorPromise = promise.catch((err) => {
        caughtError = err;
      });

      // Timer'ları çalıştır
      await jest.runAllTimersAsync();
      await errorPromise;

      // İlk deneme + 2 retry = 3 çağrı
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(3);
      expect(caughtError).toBeDefined();
      expect(caughtError!.message).toBe("HTTP 500");
    });

    it("özel maxRetries değerini kullanır", async () => {
      // 6 çağrı için mock
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 5 },
      );

      let caughtError: Error | undefined;
      const errorPromise = promise.catch((err) => {
        caughtError = err;
      });

      await jest.runAllTimersAsync();
      await errorPromise;

      // İlk deneme + 5 retry = 6 çağrı
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(6);
      expect(caughtError).toBeDefined();
      expect(caughtError!.message).toBe("HTTP 500");
    });

    it("maxRetries: 0 ile sadece 1 deneme yapar", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 0 },
      );

      jest.runAllTimers();

      await expect(promise).rejects.toThrow();
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe("abort handling", () => {
    it("AbortController signal'ı iletir", async () => {
      const mockResponse = { ok: true, status: 200 } as Response;
      mockFetchWithTimeout.mockResolvedValueOnce(mockResponse);

      const controller = new AbortController();
      const options: RequestInit = { signal: controller.signal };

      const promise = fetchWithRetry("https://example.com", options);
      jest.runAllTimers();
      await promise;

      expect(mockFetchWithTimeout).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({ signal: controller.signal }),
      );
    });

    it("kullanıcı abort'unda retry YAPMAZ", async () => {
      const abortError = new Error("User aborted");
      abortError.name = "AbortError";
      mockIsTimeoutError.mockReturnValue(false); // Kullanıcı abort'u, timeout değil

      mockFetchWithTimeout.mockRejectedValueOnce(abortError);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await expect(promise).rejects.toThrow("User aborted");
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe("logError entegrasyonu", () => {
    it("her retry'da logError çağırır", async () => {
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        { maxRetries: 3 },
      );

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(1500);
      await jest.advanceTimersByTimeAsync(3000);
      await promise;

      // 2 retry = 2 log
      expect(mockLogError).toHaveBeenCalledTimes(2);
      expect(mockLogError).toHaveBeenCalledWith(
        "fetchWithRetry",
        expect.objectContaining({
          url: "https://example.com",
          attempt: expect.any(Number),
          maxRetries: 3,
        }),
      );
    });
  });

  describe("RetryPresets", () => {
    it("aggressive preset daha fazla retry yapar", async () => {
      // 6 çağrı için mock (maxRetries: 5)
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        RetryPresets.aggressive,
      );

      let caughtError: Error | undefined;
      const errorPromise = promise.catch((err) => {
        caughtError = err;
      });

      await jest.runAllTimersAsync();
      await errorPromise;

      // aggressive: maxRetries: 5 → 6 çağrı
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(6);
      expect(caughtError).toBeDefined();
      expect(caughtError!.message).toBe("HTTP 500");
    });

    it("minimal preset az retry yapar", async () => {
      // 2 çağrı için mock (maxRetries: 1)
      mockFetchWithTimeout
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        RetryPresets.minimal,
      );

      let caughtError: Error | undefined;
      const errorPromise = promise.catch((err) => {
        caughtError = err;
      });

      await jest.runAllTimersAsync();
      await errorPromise;

      // minimal: maxRetries: 1 → 2 çağrı
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(2);
      expect(caughtError).toBeDefined();
      expect(caughtError!.message).toBe("HTTP 500");
    });

    it("none preset hiç retry yapmaz", async () => {
      mockFetchWithTimeout.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const promise = fetchWithRetry(
        "https://example.com",
        {},
        RetryPresets.none,
      );

      jest.runAllTimers();

      await expect(promise).rejects.toThrow();
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
    });
  });
});
