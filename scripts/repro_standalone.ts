// Mock GENRE_LIST and GENRE_MAP from utils/genreTranslator.ts
const GENRE_LIST = [
  "Roman",
  "Bilim Kurgu",
  "Fantastik",
  "Polisiye",
  "Gerilim",
  "Korku",
  "Romantik",
  "Tarih",
  "Biyografi",
  "Kişisel Gelişim",
  "Felsefe",
  "Şiir",
  "Çocuk",
  "Gençlik",
  "Din",
  "Psikoloji",
  "İş/Ekonomi",
  "Mizah",
  "Gezi",
  "Macera",
  "Dram",
  "Sanat",
  "Bilim",
  "Sağlık",
  "Çizgi Roman",
  "Yemek",
  "Siyaset",
  "Eğitim",
  "Sosyoloji",
  "Diğer",
];

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

// CURRENT IMPLEMENTATION OF translateGenre
function translateGenre(englishGenre: string | undefined): string {
  if (!englishGenre) return "Diğer";

  // Önce birebir eşleşme dene
  const directMatch = GENRE_MAP[englishGenre];
  if (directMatch) return directMatch;

  // Case-insensitive arama
  const lowerGenre = englishGenre.toLowerCase();
  for (const [key, value] of Object.entries(GENRE_MAP)) {
    if (key.toLowerCase() === lowerGenre) {
      return value;
    }
  }

  // Kısmi eşleşme (içeriyorsa)
  for (const [key, value] of Object.entries(GENRE_MAP)) {
    if (
      lowerGenre.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lowerGenre)
    ) {
      // console.log(`Matched partial: "${englishGenre}" matches key "${key}" -> "${value}"`);
      return value;
    }
  }

  // Zaten Türkçe mi kontrol et
  if (GENRE_LIST.includes(englishGenre)) {
    return englishGenre;
  }

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

console.log("Testing translateGenre logic:");
testCases.forEach((input) => {
  const output = translateGenre(input);
  console.log(`"${input}" -> "${output}"`);
});
