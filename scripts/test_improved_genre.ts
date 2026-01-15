// Mock GENRE_LIST and GENRE_MAP (Same as before)
const GENRE_MAP: Record<string, string> = {
  // Fiction variants
  Fiction: "Roman",
  "Literary Fiction": "Roman",
  Novel: "Roman",
  "General Fiction": "Roman",
  Literature: "Roman",
  Classics: "Roman",
  Sagas: "Roman",

  // Science Fiction
  "Science Fiction": "Bilim Kurgu",
  SciFi: "Bilim Kurgu",
  "Sci-Fi": "Bilim Kurgu",
  Dystopian: "Bilim Kurgu",

  // Fantasy
  Fantasy: "Fantastik",
  "High Fantasy": "Fantastik",
  "Urban Fantasy": "Fantastik",
  "Dark Fantasy": "Fantastik",
  Magic: "Fantastik",

  // Mystery & Detective
  Mystery: "Polisiye",
  Detective: "Polisiye",
  Crime: "Polisiye",
  "Crime Fiction": "Polisiye",
  Noir: "Polisiye",

  // Thriller
  Thriller: "Gerilim",
  Suspense: "Gerilim",
  "Psychological Thriller": "Gerilim",

  // Horror
  Horror: "Korku",
  "Gothic Horror": "Korku",
  Ghost: "Korku",

  // Romance
  Romance: "Romantik",
  "Love Story": "Romantik",
  "Romantic Fiction": "Romantik",

  // History
  History: "Tarih",
  "Historical Fiction": "Tarih",
  Historical: "Tarih",
  War: "Tarih",

  // Biography
  Biography: "Biyografi",
  Autobiography: "Biyografi",
  Memoir: "Biyografi",
  "Biography & Autobiography": "Biyografi",

  // Self-Help
  "Self-Help": "Kişisel Gelişim",
  "Self Help": "Kişisel Gelişim",
  "Personal Development": "Kişisel Gelişim",
  "Self-Improvement": "Kişisel Gelişim",
  Success: "Kişisel Gelişim",

  // Philosophy
  Philosophy: "Felsefe",

  // Poetry
  Poetry: "Şiir",
  Poems: "Şiir",

  // Children
  Children: "Çocuk",
  "Children's": "Çocuk",
  "Children's Fiction": "Çocuk",
  Juvenile: "Çocuk",
  "Juvenile Fiction": "Çocuk",

  // Young Adult
  "Young Adult": "Gençlik",
  "Young Adult Fiction": "Gençlik",
  YA: "Gençlik",
  Teen: "Gençlik",

  // Religion
  Religion: "Din",
  Religious: "Din",
  Islam: "Din",
  Spirituality: "Din",
  Theology: "Din",

  // Psychology
  Psychology: "Psikoloji",
  "Mental Health": "Psikoloji",
  Counseling: "Psikoloji",

  // Business
  Business: "İş/Ekonomi",
  Economics: "İş/Ekonomi",
  Finance: "İş/Ekonomi",
  "Business & Economics": "İş/Ekonomi",
  Management: "İş/Ekonomi",

  // Humor
  Humor: "Mizah",
  Comedy: "Mizah",
  Satire: "Mizah",

  // Travel
  Travel: "Gezi",
  "Travel Writing": "Gezi",
  Guidebooks: "Gezi",

  // New Genres Mappings
  Adventure: "Macera",
  Action: "Macera",
  "Action & Adventure": "Macera",

  Drama: "Dram",
  Plays: "Dram",

  Art: "Sanat",
  Design: "Sanat",
  Photography: "Sanat",
  Architecture: "Sanat",
  Music: "Sanat",
  "Performing Arts": "Sanat",

  Science: "Bilim",
  Nature: "Bilim",
  Physics: "Bilim",
  Biology: "Bilim",
  Chemistry: "Bilim",
  Mathematics: "Bilim",
  Computers: "Bilim",
  Technology: "Bilim",

  Health: "Sağlık",
  Fitness: "Sağlık",
  Medicine: "Sağlık",
  "Health & Fitness": "Sağlık",
  Yoga: "Sağlık",

  Comics: "Çizgi Roman",
  "Graphic Novels": "Çizgi Roman",
  Manga: "Çizgi Roman",
  "Comics & Graphic Novels": "Çizgi Roman",

  Cooking: "Yemek",
  Cookbook: "Yemek",
  Food: "Yemek",
  Baking: "Yemek",

  "Political Science": "Siyaset",
  Politics: "Siyaset",
  Government: "Siyaset",

  Education: "Eğitim",
  "Study Aids": "Eğitim",
  Teaching: "Eğitim",

  Sociology: "Sosyoloji",
  "Social Science": "Sosyoloji",
  Anthropology: "Sosyoloji",

  // Partial matches fallback
  Law: "Diğer",
};

// IMPROVED logic
function translateGenre(englishGenre: string | undefined): string {
  if (!englishGenre) return "Diğer";

  // 1. Pre-processing: Split by / or & or -
  // Google Books often sends "Juvenile Fiction / Fantasy / Epic"
  const parts = englishGenre.split(/[\/\&]|\s-\s/).map((p) => p.trim());

  // 2. Iterate parts and try to find a specific match
  for (const part of parts) {
    if (!part) continue; // skip empty

    // A. Direct Match
    const directMatch = GENRE_MAP[part];
    if (directMatch) return directMatch;

    // B. Case-insensitive
    const lowerPart = part.toLowerCase();
    for (const [key, value] of Object.entries(GENRE_MAP)) {
      if (key.toLowerCase() === lowerPart) {
        return value;
      }
    }
  }

  // 3. If no direct match in parts, try partial match in parts
  // But be careful about "General" or "Fiction" being too greedy.
  // We prefer longer matches.

  let bestMatch = "";
  let bestMatchLength = 0;

  for (const part of parts) {
    const lowerPart = part.toLowerCase();

    for (const [key, value] of Object.entries(GENRE_MAP)) {
      const lowerKey = key.toLowerCase();

      // Check if key is contained in part
      if (lowerPart.includes(lowerKey)) {
        // Priority: Longer key is better match (e.g. "Science Fiction" > "Fiction")
        if (lowerKey.length > bestMatchLength) {
          bestMatch = value;
          bestMatchLength = lowerKey.length;
        }
      }
    }
  }

  if (bestMatch) return bestMatch;

  // 4. Fallback: Check if original is valid Turkish (via mock list check, skipped here or assumed)
  return "Diğer";
}

const testCases = [
  "Fiction",
  "Science Fiction",
  "Fiction / General",
  "Young Adult Fiction",
  "Juvenile Fiction / Fantasy / Epic",
  "General",
  "Biography & Autobiography",
  "Computers",
  "Technology",
  "Law",
  "Unknown Genre",
  "Cooking / General",
  "History / Modern / 20th Century",
];

console.log("Testing IMPROVED translateGenre logic:");
testCases.forEach((input) => {
  const output = translateGenre(input);
  console.log(`"${input}" -> "${output}"`);
});
