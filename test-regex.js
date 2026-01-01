const fs = require("fs");

const html = fs.readFileSync("kitapyurdu_sample.html", "utf8");

console.log("HTML length:", html.length);

// Test 1: Basit TL arama
const simpleMatch = html.match(/\d{2,3},\d{2}/g);
console.log(
  "\nBasit sayı formatı:",
  simpleMatch ? simpleMatch.slice(0, 10) : "YOK",
);

// Test 2: value span içinde
const valueMatch = html.match(/<span class="value">[^]*?(\d+,\d{2})/g);
console.log("\nValue span:", valueMatch ? valueMatch.slice(0, 3) : "YOK");

// Test 3: TL span sonrası
const tlMatch = html.match(/<span class="TL"><\/span>\s*(\d+,\d{2})/g);
console.log("\nTL span sonrası:", tlMatch ? tlMatch.slice(0, 5) : "YOK");

// Test 4: Fiyat içeren satır örneği
const priceLineMatch = html.match(/price-new[\s\S]{0,200}/g);
if (priceLineMatch) {
  console.log("\nFiyat satırı örneği:");
  console.log(priceLineMatch[0]);
}
