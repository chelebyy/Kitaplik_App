/**
 * @fileoverview useDebounce hook testleri
 * TDD RED fazı: Bu testler başlangıçta başarısız olmalı
 */

import { renderHook, act } from "@testing-library/react-native";

// Hook henüz yok, import başarısız olacak (RED)
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initial state", () => {
    it("should return initial value immediately", () => {
      const { result } = renderHook(() => useDebounce("test", 300));

      expect(result.current.debouncedValue).toBe("test");
    });
  });

  describe("debounce behavior", () => {
    it("should not update value before delay", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 300 } },
      );

      // Değeri değiştir
      rerender({ value: "updated", delay: 300 });

      // Delay'den önce değer değişmemeli
      expect(result.current.debouncedValue).toBe("initial");
    });

    it("should update value after delay", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 300 } },
      );

      // Değeri değiştir
      rerender({ value: "updated", delay: 300 });

      // Timer'ı ilerlet
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Delay sonrası değer güncellenmeli
      expect(result.current.debouncedValue).toBe("updated");
    });

    it("should reset timer on rapid value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 300 } },
      );

      // Hızlı değişiklikler
      rerender({ value: "change1", delay: 300 });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: "change2", delay: 300 });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: "final", delay: 300 });

      // Henüz güncellenmemeli
      expect(result.current.debouncedValue).toBe("initial");

      // Son değişiklikten 300ms sonra
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Sadece son değer olmalı
      expect(result.current.debouncedValue).toBe("final");
    });
  });

  describe("default delay", () => {
    it("should use 300ms as default delay", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value),
        { initialProps: { value: "initial" } },
      );

      rerender({ value: "updated" });

      // 299ms'de güncellenmemeli
      act(() => {
        jest.advanceTimersByTime(299);
      });
      expect(result.current.debouncedValue).toBe("initial");

      // 300ms'de güncellenmeli
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe("updated");
    });
  });

  describe("cleanup", () => {
    it("should clear timeout on unmount", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      const { unmount, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: "initial" } },
      );

      rerender({ value: "updated" });
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe("generic types", () => {
    it("should work with numbers", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 0 } },
      );

      rerender({ value: 42 });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedValue).toBe(42);
    });

    it("should work with objects", () => {
      const initialObj = { name: "test" };
      const updatedObj = { name: "updated" };

      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: initialObj } },
      );

      rerender({ value: updatedObj });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedValue).toEqual(updatedObj);
    });
  });
});
