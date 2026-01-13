/**
 * stringUtils Test Suite
 *
 * Veri normalizasyon fonksiyonlarını test eder.
 */

import { normalizeForMatching } from "../stringUtils";

describe("stringUtils", () => {
  describe("normalizeForMatching", () => {
    test("should handle empty strings", () => {
      expect(normalizeForMatching("")).toBe("");
    });

    test("should convert turkish chars to english equivalents", () => {
      const input = "Şekerçioğlu";
      const expected = "sekercioglu";
      expect(normalizeForMatching(input)).toBe(expected);
    });

    test("should lowercase all characters", () => {
      const input = "TEST";
      const expected = "test";
      expect(normalizeForMatching(input)).toBe(expected);
    });

    test("should handle dotted and dotless I correctly", () => {
      expect(normalizeForMatching("İSTANBUL")).toBe("istanbul");
      expect(normalizeForMatching("ısparta")).toBe("isparta");
    });

    test("should handle complex turkish sentence", () => {
      const input = "Pijamalı hasta, yağız şoföre çabucak güvendi.";
      const expected = "pijamali hasta, yagiz sofore cabucak guvendi.";
      expect(normalizeForMatching(input)).toBe(expected);
    });
  });
});
