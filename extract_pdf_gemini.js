const fs = require("fs");
const pdf = require("pdf-parse");

const pdfPath = "mobsf.pdf";

if (!fs.existsSync(pdfPath)) {
  console.error(`File not found: ${pdfPath}`);
  process.exit(1);
}

let dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer)
  .then(function (data) {
    console.log(data.text);
  })
  .catch(function (error) {
    // Güvenli hata loglama - stack trace'i gizle
    console.error("Error parsing PDF:", error.message || "Unknown error");
  });
