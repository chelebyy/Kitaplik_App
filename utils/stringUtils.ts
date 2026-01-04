/**
 * Normalize text by replacing Turkish characters with English equivalents
 * to ensure better matching (e.g., "ü" -> "u", "ş" -> "s")
 * Also converts to lowercase.
 */
export function normalizeForMatching(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i") // Handle uppercase I with dot
    .replaceAll("i̇", "i") // Handle crazy NFD normalized I
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}
