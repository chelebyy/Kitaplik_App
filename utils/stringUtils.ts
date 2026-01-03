
/**
 * Normalize text by replacing Turkish characters with English equivalents
 * to ensure better matching (e.g., "ü" -> "u", "ş" -> "s")
 * Also converts to lowercase.
 */
export function normalizeForMatching(text: string): string {
    if (!text) return "";
    return text
        .toLowerCase()
        .replaceAll(/ğ/g, "g")
        .replaceAll(/ü/g, "u")
        .replaceAll(/ş/g, "s")
        .replaceAll(/ı/g, "i")
        .replaceAll(/İ/g, "i") // Handle uppercase I with dot
        .replaceAll(/i̇/g, "i") // Handle crazy NFD normalized I
        .replaceAll(/ö/g, "o")
        .replaceAll(/ç/g, "c");
}
