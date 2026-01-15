/**
 * Kitap Türleri Çeviri Utility
 *
 * Bu modül:
 * 1. Türkçe tür listesi sağlar (UI dropdown için)
 * 2. İngilizce türleri Türkçe'ye çevirir (API'den gelen veriler için)
 * 3. Bilinmeyen türleri "Diğer" olarak normalize eder
 */

// 30 Ana Tür - UI Dropdown için
export const GENRE_LIST = [
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
  "Macera", // Yeni
  "Dram", // Yeni
  "Sanat", // Yeni
  "Bilim", // Yeni
  "Sağlık", // Yeni
  "Çizgi Roman", // Yeni
  "Yemek", // Yeni
  "Siyaset", // Yeni
  "Eğitim", // Yeni
  "Sosyoloji", // Yeni
  "Diğer",
] as const;

export type GenreType = (typeof GENRE_LIST)[number];

// İngilizce → Türkçe Mapping
const GENRE_MAP: Record<string, GenreType> = {
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
  Technology: "Bilim", // Map tech to science or keep other
  Computers: "Bilim",
};

/**
 * İngilizce tür ismini Türkçe'ye çevirir
 * @param englishGenre - API'den gelen İngilizce tür
 * @returns Türkçe karşılık veya "Diğer"
 */
export function translateGenre(englishGenre: string | undefined): GenreType {
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
      return value;
    }
  }

  // Zaten Türkçe mi kontrol et
  if (GENRE_LIST.includes(englishGenre as GenreType)) {
    return englishGenre as GenreType;
  }

  return "Diğer";
}

/**
 * Tür değerini normalize eder (hem çeviri hem de doğrulama)
 * @param genre - Herhangi bir tür değeri
 * @returns Geçerli bir Türkçe tür
 */
export function normalizeGenre(genre: string | undefined): GenreType {
  if (!genre || genre.trim() === "") return "Diğer";

  // Zaten geçerli Türkçe tür mü?
  if (GENRE_LIST.includes(genre as GenreType)) {
    return genre as GenreType;
  }

  // İngilizce'den çevir
  return translateGenre(genre);
}

/**
 * Türkçe tür ismini i18n anahtarına çevirir
 * @param genre - Türkçe tür ismi (örn: "Bilim Kurgu")
 * @returns i18n key (örn: "genre_bilim_kurgu")
 */
export function getGenreTranslationKey(genre: string): string {
  // Mapping for specific cases
  const specialKeys: Record<string, string> = {
    "Bilim Kurgu": "genre_bilim_kurgu",
    "Kişisel Gelişim": "genre_kisisel_gelisim",
    "İş/Ekonomi": "genre_is_ekonomi",
    "Çizgi Roman": "genre_cizgi_roman",
    genel: "genre_diger", // Fallback for "genel" to "Other"
  };

  if (specialKeys[genre]) {
    return specialKeys[genre];
  }

  // Default conversion: lowercase + replace spaces/special chars
  // Roman -> genre_roman
  // Macera -> genre_macera
  const normalized = genre
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll(/\s+/g, "_")
    .replaceAll("/", "_");

  return `genre_${normalized}`;
}
