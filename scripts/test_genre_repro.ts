import {
  translateGenre,
  getGenreTranslationKey,
} from "../utils/genreTranslator";

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
  const key = getGenreTranslationKey(output);
  console.log(`"${input}" -> "${output}" (Key: ${key})`);
});
