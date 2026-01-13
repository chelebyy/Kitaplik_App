import { useState, useEffect } from "react";

/**
 * useDebounce - Değer değişikliklerini geciktiren utility hook
 *
 * Arama kutuları gibi kullanıcı girdilerinde API çağrılarını
 * optimize etmek için kullanılır.
 *
 * @template T - Debounce edilecek değerin tipi
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme süresi (ms), varsayılan 300ms
 * @returns Debounce edilmiş değeri içeren object
 *
 * @example
 * ```tsx
 * const { debouncedValue } = useDebounce(searchQuery, 300);
 *
 * useEffect(() => {
 *   if (debouncedValue) {
 *     searchApi(debouncedValue);
 *   }
 * }, [debouncedValue]);
 * ```
 */

interface UseDebounceReturn<T> {
  debouncedValue: T;
}

export function useDebounce<T>(
  value: T,
  delay: number = 300,
): UseDebounceReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Delay sonrası değeri güncelle
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Yeni değer geldiğinde önceki timer'ı temizle
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { debouncedValue };
}
