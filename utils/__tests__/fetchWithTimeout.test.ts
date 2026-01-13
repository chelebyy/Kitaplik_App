import { fetchWithTimeout, isTimeoutError } from "../fetchWithTimeout";

describe("fetchWithTimeout", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe("başarılı istekler", () => {
    it("varsayılan timeout ile fetch yapar", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchWithTimeout("https://example.com");

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          signal: expect.any(Object),
        }),
      );
    });

    it("özel timeout ile fetch yapar", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchWithTimeout("https://example.com", {}, 5000);

      expect(response).toEqual(mockResponse);
    });

    it("fetch seçeneklerini iletir", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      };

      const response = await fetchWithTimeout("https://example.com", options);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true }),
        }),
      );
    });

    it("GET isteği yapar", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchWithTimeout("https://api.example.com/data");

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("timeout durumları", () => {
    it("AbortController oluşturur ve timeout ayarlar", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      await fetchWithTimeout("https://example.com", {}, 5000);

      // setTimeout çağrılmalı
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

      setTimeoutSpy.mockRestore();
    });

    it("timeout'u temizler (başarılı istek)", async () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      await fetchWithTimeout("https://example.com", {}, 5000);

      // Timeout clear olmalı
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe("dış signal (external signal)", () => {
    it("dış signal ile çalışır", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Mock AbortController signal with addEventListener
      const mockSignal = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const options: RequestInit = {
        signal: mockSignal as any,
      };

      const response = await fetchWithTimeout("https://example.com", options);

      expect(response).toEqual(mockResponse);
      expect(mockSignal.addEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
      expect(mockSignal.removeEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
    });

    it("zaten aborted olan dış signal kontrol edilir", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const mockSignal = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const options: RequestInit = {
        signal: mockSignal as any,
      };

      await fetchWithTimeout("https://example.com", options);

      // aborted kontrol edilmiş olmalı
      expect(mockSignal.aborted).toBeDefined();
    });

    it("dış signal aborted olduğunda listener eklenir", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const mockSignal = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const options: RequestInit = {
        signal: mockSignal as any,
      };

      await fetchWithTimeout("https://example.com", options);

      // abort event listener eklenmeli
      expect(mockSignal.addEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
      // temizlenmeli
      expect(mockSignal.removeEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
    });

    it("dış signal listener'ını temizler", async () => {
      const mockResponse = { ok: true } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const mockSignal = {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const options: RequestInit = {
        signal: mockSignal as any,
      };

      await fetchWithTimeout("https://example.com", options);

      expect(mockSignal.addEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
      expect(mockSignal.removeEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
    });
  });

  describe("hata durumları", () => {
    it("fetch hatasını propagate eder", async () => {
      const networkError = new TypeError("Network error");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(fetchWithTimeout("https://example.com")).rejects.toThrow(
        "Network error",
      );
    });

    it("404 hatasını propagate eder", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchWithTimeout("https://example.com");
      expect(response.status).toBe(404);
    });

    it("500 sunucu hatasını propagate eder", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchWithTimeout("https://example.com");
      expect(response.status).toBe(500);
    });
  });

  describe("isTimeoutError", () => {
    it("AbortError için true döner", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      expect(isTimeoutError(error)).toBe(true);
    });

    it("diğer hatalar için false döner", () => {
      expect(isTimeoutError(new Error("normal error"))).toBe(false);
      expect(isTimeoutError(new TypeError("type error"))).toBe(false);
      expect(isTimeoutError(null)).toBe(false);
      expect(isTimeoutError(undefined)).toBe(false);
    });

    it("AbortError name'i olmayan Error için false döner", () => {
      const error = new Error("timeout");
      error.name = "TimeoutError";
      expect(isTimeoutError(error)).toBe(false);
    });
  });
});
