/**
 * Fiyat Karşılaştırma Siteleri URL Test
 * Bu URL'ler tarayıcıda açılacak - scraping yok
 */

const { exec } = require('child_process');

const bookTitle = 'Harry Potter Felsefe Taşı';
const bookAuthor = 'J.K. Rowling';
const query = encodeURIComponent(`${bookTitle} ${bookAuthor} kitap`);

const comparisonSites = [
  {
    name: 'Google Shopping',
    url: `https://www.google.com/search?tbm=shop&q=${query}`,
    description: 'Google fiyat karşılaştırma'
  },
  {
    name: 'Akakçe',
    url: `https://www.akakce.com/arama/?q=${encodeURIComponent(bookTitle)}`,
    description: 'Türkiye\'nin en büyük fiyat karşılaştırma sitesi'
  },
  {
    name: 'Cimri',
    url: `https://www.cimri.com/arama?q=${encodeURIComponent(bookTitle)}`,
    description: 'Fiyat karşılaştırma sitesi'
  },
  {
    name: 'Google Arama',
    url: `https://www.google.com/search?q=${query}+fiyat`,
    description: 'Normal Google araması + fiyat'
  }
];

console.log('═'.repeat(60));
console.log('🔗 FİYAT KARŞILAŞTIRMA SİTELERİ URL TESTİ');
console.log('═'.repeat(60));
console.log(`\n📚 Kitap: "${bookTitle}" - ${bookAuthor}\n`);

comparisonSites.forEach((site, index) => {
  console.log(`${index + 1}. ${site.name}`);
  console.log(`   📝 ${site.description}`);
  console.log(`   🔗 ${site.url}`);
  console.log('');
});

console.log('═'.repeat(60));
console.log('🧪 TEST: Tarayıcıda açılacak URL\'leri deneyin');
console.log('═'.repeat(60));
console.log('\nHangi siteyi tarayıcıda açmak istersiniz?');
console.log('1 = Google Shopping');
console.log('2 = Akakçe');
console.log('3 = Cimri');
console.log('4 = Google Arama');
console.log('0 = Hepsini aç');
console.log('');

// Readline ile kullanıcı input'u al
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Seçiminiz (0-4): ', (answer) => {
  const choice = parseInt(answer);
  
  function openUrl(url) {
    // Windows için
    exec(`start "" "${url}"`, (error) => {
      if (error) {
        console.log(`Hata: ${error.message}`);
      }
    });
  }
  
  if (choice === 0) {
    console.log('\n🌐 Tüm siteler açılıyor...');
    comparisonSites.forEach((site, i) => {
      setTimeout(() => {
        console.log(`   Açılıyor: ${site.name}`);
        openUrl(site.url);
      }, i * 1000); // Her site için 1 saniye bekle
    });
    setTimeout(() => rl.close(), 5000);
  } else if (choice >= 1 && choice <= 4) {
    const site = comparisonSites[choice - 1];
    console.log(`\n🌐 ${site.name} açılıyor...`);
    openUrl(site.url);
    rl.close();
  } else {
    console.log('\n❌ Geçersiz seçim');
    rl.close();
  }
});
