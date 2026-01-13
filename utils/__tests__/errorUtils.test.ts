import { getErrorMessage, getErrorCode, logError } from "../errorUtils";

describe("errorUtils", () => {
  describe("getErrorMessage", () => {
    it("Error nesnesinden mesaj çıkarır", () => {
      const error = new Error("Test hatası");
      expect(getErrorMessage(error)).toBe("Test hatası");
    });

    it("String hatadan mesaj çıkarır", () => {
      const error = "String hata mesajı";
      expect(getErrorMessage(error)).toBe("String hata mesajı");
    });

    it("Bilinmeyen hata türü için varsayılan mesaj döner", () => {
      expect(getErrorMessage(null)).toBe("Bilinmeyen bir hata oluştu");
      expect(getErrorMessage(undefined)).toBe("Bilinmeyen bir hata oluştu");
      expect(getErrorMessage(123)).toBe("Bilinmeyen bir hata oluştu");
      expect(getErrorMessage({})).toBe("Bilinmeyen bir hata oluştu");
    });

    it("Boş Error nesnesi için boş string döner", () => {
      const error = new Error();
      expect(getErrorMessage(error)).toBe("");
    });
  });

  describe("getErrorCode", () => {
    it("Error nesnesinden kod çıkarır", () => {
      const error = { code: "ERR_TEST", message: "Test" };
      expect(getErrorCode(error)).toBe("ERR_TEST");
    });

    it("Sayısal kodu string'e çevirir", () => {
      const error = { code: 404 };
      expect(getErrorCode(error)).toBe("404");
    });

    it("Kod olmayan nesneler için undefined döner", () => {
      expect(getErrorCode({ message: "test" })).toBeUndefined();
      expect(getErrorCode(null)).toBeUndefined();
      expect(getErrorCode(undefined)).toBeUndefined();
      expect(getErrorCode("string")).toBeUndefined();
      expect(getErrorCode(123)).toBeUndefined();
    });

    it("Boş kod için string döner", () => {
      const error = { code: "" };
      expect(getErrorCode(error)).toBe("");
    });
  });

  describe("logError", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("Development modunda tam hata bilgisini loglar", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      const error = new Error("Test hatası");
      logError("TestContext", error);

      expect(consoleErrorSpy).toHaveBeenCalledWith("[TestContext]", error);

      global.__DEV__ = originalDev;
    });

    it("Production modunda sadece güvenli mesaj loglar", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      const error = new Error("Test hatası");
      logError("TestContext", error);

      expect(consoleErrorSpy).toHaveBeenCalledWith("[TestContext] Test hatası");

      global.__DEV__ = originalDev;
    });

    it("Production modunda hata kodu ile loglar", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      const error = { code: "ERR_001", message: "Test hatası" };
      logError("TestContext", error);

      // Error nesnesi Error instance olmadığı için "Bilinmeyen bir hata oluştu" döner
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[TestContext] (ERR_001) Bilinmeyen bir hata oluştu",
      );

      global.__DEV__ = originalDev;
    });

    it("String hata için loglar", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      logError("TestContext", "String hata");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[TestContext]",
        "String hata",
      );

      global.__DEV__ = originalDev;
    });

    it("Bilinmeyen hata için varsayılan mesaj loglar (production)", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      logError("TestContext", null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[TestContext] Bilinmeyen bir hata oluştu",
      );

      global.__DEV__ = originalDev;
    });

    it("Kodsuz hata için parantez olmadan loglar (production)", () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      const error = { message: "Kodsuz hata" };
      logError("TestContext", error);

      // Error nesnesi Error instance olmadığı için "Bilinmeyen bir hata oluştu" döner
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[TestContext] Bilinmeyen bir hata oluştu",
      );

      global.__DEV__ = originalDev;
    });
  });
});
