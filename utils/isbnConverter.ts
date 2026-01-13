/**
 * ISBN Converter Utility
 *
 * Converts between ISBN-10 and ISBN-13 formats
 * Based on official ISBN conversion algorithm
 */

/**
 * Normalize ISBN by removing hyphens and spaces
 */
export function normalizeISBN(isbn: string): string {
  return isbn.replaceAll(/[-\s]/g, "");
}

/**
 * Validate if string is a valid ISBN-10
 */
function isValidISBN10(isbn: string): boolean {
  const normalized = normalizeISBN(isbn);
  return /^\d{9}[\dX]$/.test(normalized);
}

/**
 * Validate if string is a valid ISBN-13
 */
function isValidISBN13(isbn: string): boolean {
  const normalized = normalizeISBN(isbn);
  return /^\d{13}$/.test(normalized);
}

/**
 * Calculate ISBN-10 check digit from remainder
 */
function calculateISBN10CheckDigit(remainder: number): string {
  if (remainder === 0) return "0";
  const value = 11 - remainder;
  return value === 10 ? "X" : String(value);
}

/**
 * Convert ISBN-10 to ISBN-13
 *
 * Algorithm:
 * 1. Remove check digit (last digit) from ISBN-10
 * 2. Add "978" prefix
 * 3. Calculate new check digit
 *
 * @param isbn10 - ISBN-10 string (with or without hyphens)
 * @returns ISBN-13 string or null if invalid
 */
export function convertISBN10ToISBN13(isbn10: string): string | null {
  const normalized = normalizeISBN(isbn10);

  // Validate input
  if (!isValidISBN10(normalized)) {
    return null;
  }

  // Step 1: Remove check digit (last character)
  const digits = normalized.slice(0, 9);

  // Step 2: Add 978 prefix
  const isbn12 = "978" + digits;

  // Step 3: Calculate new check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(isbn12[i], 10);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return isbn12 + checkDigit;
}

/**
 * Convert ISBN-13 to ISBN-10
 *
 * Note: Only ISBN-13 with "978" prefix can be converted
 * ISBN-13 with "979" prefix cannot be converted to ISBN-10
 *
 * @param isbn13 - ISBN-13 string (with or without hyphens)
 * @returns ISBN-10 string or null if invalid/not convertible
 */
export function convertISBN13ToISBN10(isbn13: string): string | null {
  const normalized = normalizeISBN(isbn13);

  // Validate input
  if (!isValidISBN13(normalized)) {
    return null;
  }

  // Check if it starts with 978 (979 prefix cannot be converted)
  if (!normalized.startsWith("978")) {
    return null;
  }

  // Extract the middle 9 digits (remove 978 prefix and check digit)
  const digits = normalized.slice(3, 12);

  // Calculate ISBN-10 check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(digits[i], 10) * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = calculateISBN10CheckDigit(remainder);

  return digits + checkDigit;
}
