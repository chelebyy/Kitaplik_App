// Updated Simulation to test the NEW logic in GoogleBooksService.ts

// MOCK of the new normalization function
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i") // Handle uppercase I with dot
    .replace(/i̇/g, "i") // Handle crazy NFD normalized I
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

interface VolumeInfo {
  title: string;
  authors: string[];
}

interface Book {
  volumeInfo: VolumeInfo;
}

function filterRelevantResults(
  query: string,
  books: Book[],
  searchType: "book" | "author",
): Book[] {
  // Normalize both query and content for comparison
  const normalizedQuery = normalizeForMatching(query.trim());
  const queryWords = normalizedQuery.split(/\s+/);

  return books.filter((book) => {
    const title = book.volumeInfo.title || "";
    const authors = book.volumeInfo.authors?.join(" ") || "";

    const rawTarget = searchType === "author" ? authors : title;
    // Normalize target content too
    const normalizedTarget = normalizeForMatching(rawTarget);

    // Check if at least 70% of query words appear in the target
    const matchedWords = queryWords.filter((word) =>
      normalizedTarget.includes(word),
    );

    const matchRatio = matchedWords.length / queryWords.length;
    console.log(
      `Matching '${normalizedQuery}' against '${normalizedTarget}': Ratio ${matchRatio}`,
    );
    return matchRatio >= 0.7; // At least 70% word match
  });
}

// Test Data
const books: Book[] = [
  { volumeInfo: { title: "Kitap 1", authors: ["Ahmet Ümit"] } }, // Exact match
  { volumeInfo: { title: "Kitap 2", authors: ["Ahmet Umit"] } }, // No Turkish chars
  { volumeInfo: { title: "Kitap 3", authors: ["Ahmet ÜMİT"] } }, // Mixed case
  { volumeInfo: { title: "Kitap 4", authors: ["Baska Yazar", "Ahmet Ümit"] } }, // Multiple authors
];

console.log("--- Testing 'ahmet ümit' with Normalization Fix ---");
const results1 = filterRelevantResults("ahmet ümit", books, "author");
console.log("Results count:", results1.length);
