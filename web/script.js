const translations = {
  tr: {
    title: "Kitaplarınızı Kolayca Yönetin",
    subtitle:
      "Ayraç ile okuma maceralarınızı takip edin, kütüphanenizi cebinizde taşıyın. Tamamen çevrimdışı ve güvenli.",
    btnDownload: "Hemen İndir",
    btnLearn: "Özellikleri Keşfet",

    sectionFeaturesTitle: "Neden Ayraç?",
    sectionFeaturesDesc: "Okuma deneyiminizi zenginleştirmek için tasarlandı.",

    feat1Title: "Çevrimdışı ve Hızlı",
    feat1Desc:
      "İnternet bağlantısına ihtiyacınız yok. Tüm kitap verileriniz cihazınızda güvenle saklanır.",
    feat2Title: "Barkod ile Ekleme",
    feat2Desc:
      "Kameranızı kullanarak kitap barkodunu okutun ve saniyeler içinde kütüphanenize ekleyin.",
    feat3Title: "Tam Gizlilik",
    feat3Desc:
      "Üyelik gerektirmez. Verileriniz buluta gönderilmez, satılmaz veya paylaşılmaz.",
    feat4Title: "Yedekleme",
    feat4Desc:
      "Kütüphanenizi cihazınıza yedekleyin veya istediğiniz yere aktarın. Veri kaybı korkusu yok.",
    feat5Title: "Akıllı Bildirimler",
    feat5Desc:
      "Okuma hedeflerinizi tutturmanız için kişiselleştirilmiş hatırlatıcılar ve istatistikler.",
    feat6Title: "Okuma İstatistikleri",
    feat6Desc: "Haftalık ve yıllık okuma özetleri ile gelişiminizi takip edin.",

    footerRights: "© 2026 Ayraç. Tüm hakları saklıdır.",
    linkPrivacy: "Gizlilik Politikası",
    linkTerms: "Kullanım Koşulları",
    linkContact: "İletişim",

    // General UI
    backHome: "← Ana Sayfaya Dön",

    // Privacy Page
    privacyTitle: "Gizlilik Politikası",
    privacyLastUpdate: "Son Güncelleme: 14 Ocak 2026",
    privacyIntro:
      "Bu Gizlilik Politikası, Ayraç uygulamasını ('Uygulama') kullanırken verilerinizin nasıl toplandığını, kullanıldığını ve paylaşıldığını açıklar. Gizliliğiniz bizim için temel bir haktır.",

    privSec1: "1. Toplanan Bilgiler ve Kullanımı",
    privSec1Text:
      "Ayraç, 'Offline-First' (Önce Çevrimdışı) prensibiyle çalışır. Kişisel verileriniz (kitap listeleri, okuma notları, istatistikler) sunucularımıza GÖNDERİLMEZ. Tüm veriler cihazınızın yerel belleğinde (AsyncStorage & dosya sistemi) saklanır.",

    privSub1: "1.1 Kamera İzni",
    privSub1Text:
      "Uygulama, kitap ekleme işlemini hızlandırmak için kamera erişimi ister. Kamera sadece kitabın barkodunu (ISBN) taramak veya kitap kapağı fotoğrafı çekmek için kullanılır. Görüntüler sunucularımıza gönderilmez.",

    privSub2: "1.2 Depolama ve Medya Erişimi",
    privSub2Text:
      "Kütüphanenizi yedeklemek (Backup) ve geri yüklemek (Restore) için cihaz depolama alanına okuma/yazma izni istenir. Ayrıca kitap kapağı olarak galeriden görsel seçmek isterseniz medya erişimi gerekir. Bu veriler sadece sizin kontrolünüzdedir.",

    privSub3: "1.3 Bildirimler",
    privSub3Text:
      "Size okuma hatırlatmaları, haftalık raporlar ve 'sihirli öneriler' göndermek için yerel bildirim izni (Local Notifications) kullanılır. Bildirim içerikleri cihazınızda oluşturulur, dışarıdan tetiklenmez.",

    privSec2: "2. İnternet Erişimi ve Üçüncü Taraflar",
    privSec2Text:
      "Uygulama temel olarak çevrimdışı çalışsa da, kitap bilgilerini zenginleştirmek için aşağıdaki API servislerini kullanır:",
    privList1:
      "<strong>Google Books API:</strong> Kitap kapakları, özetler ve yazar bilgileri için.",
    privList2:
      "<strong>Open Library API:</strong> Alternatif kitap verisi kaynağı olarak.",
    privNote:
      "Not: Bu servisler kullanılırken cihazınızın IP adresi ilgili servis sağlayıcı (Google veya Internet Archive) tarafından görülebilir. Ayraç, bu servislere kimlik bilgilerini göndermez.",

    privSec3: "3. Veri Güvenliği ve Yedekleme",
    privSec3Text:
      "Verileriniz cihazınızda şifrelenmeden saklanır (Standart Android Sandbox koruması altındadır). Veri güvenliğiniz için 'Ayarlar' menüsünden düzenli olarak 'Yedekle' özelliğini kullanmanızı öneririz. Yedek dosyalarınızı güvenli bir yerde (Google Drive vb.) saklamak kullanıcının sorumluluğundadır.",

    privSec4: "4. Çocukların Gizliliği",
    privSec4Text:
      "Hizmetlerimiz genel izleyici kitlesine yöneliktir ancak 13 yaş altı çocuklar için özel veri toplama işlemi yapmaz. Ebeveynler, çocuklarının cihaz kullanımını Google Family Link vb. araçlarla denetleyebilir.",

    privSecContact: "İletişim",
    privContactText:
      "Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:",

    // Contact Page
    contactPageTitle: "İletişim",
    contactPageDesc: "Görüş, öneri ve destek talepleriniz için bize ulaşın.",
    contactEmailLabel: "E-posta Adresemiz:",
    contactNote: "Mesajlarınıza en kısa sürede dönüş yapmaya çalışıyoruz.",

    // Terms of Use Page
    termsTitle: "Kullanım Koşulları",
    termsLastUpdate: "Son Güncelleme: 14 Ocak 2026",
    termsIntro:
      "Ayraç uygulamasını kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Bu koşullar, uygulamaya erişiminizi ve kullanımınızı düzenler.",

    termsSec1: "1. Hizmet Tanımı",
    termsSec1Text:
      "Ayraç, kullanıcıların kitaplarını takip etmelerini sağlayan kişisel bir kütüphane yönetim uygulamasıdır. Uygulama 'olduğu gibi' sunulmaktadır ve geliştirici özellikleri istediği zaman değiştirme hakkını saklı tutar.",

    termsSec2: "2. Kullanım Şartları",
    termsSec2Text:
      "Uygulamayı yasalara aykırı amaçlarla kullanamazsınız. Uygulamanın çalışmasını engelleyecek tersine mühendislik, kaynak koda dönüştürme veya benzeri faaliyetlerde bulunamazsınız.",

    termsSec3: "3. Veri ve Sorumluluk",
    termsSec3Text:
      "Ayraç çevrimdışı çalışan bir uygulamadır. Verilerinizin güvenliği, gizliliği ve düzenli yedeklenmesi tamamen sizin sorumluluğunuzdadır. Cihaz kaybı, teknik hata veya veri bozulması durumunda Ayraç (ve geliştiricisi) hiçbir veri kaybından sorumlu tutulamaz.",

    termsSec4: "4. Fikri Mülkiyet",
    termsSec4Text:
      "Uygulama tasarımı, logosu, metinleri ve kaynak kodları Ayraç geliştiricisine aittir. Herhangi bir bölümü izinsiz kopyalanamaz, çoğaltılamaz veya başka bir projede kullanılamaz.",

    termsSec5: "5. Değişiklikler",
    termsSec5Text:
      "Kullanım koşulları zaman zaman güncellenebilir. Uygulamayı kullanmaya devam ederek güncel koşulları kabul etmiş sayılırsınız. Değişiklikleri bu sayfa üzerinden takip edebilirsiniz.",
  },
  en: {
    title: "Manage Your Books With Ease",
    subtitle:
      "Track your reading adventures with Ayraç, carry your library in your pocket. Fully offline and secure.",
    btnDownload: "Download Now",
    btnLearn: "Explore Features",

    sectionFeaturesTitle: "Why Ayraç?",
    sectionFeaturesDesc: "Designed to enrich your reading experience.",

    feat1Title: "Offline & Fast",
    feat1Desc:
      "No internet needed. All your book data is securely stored on your device.",
    feat2Title: "Barcode Scanning",
    feat2Desc: "Scan book barcodes with your camera to add them in seconds.",
    feat3Title: "Total Privacy",
    feat3Desc:
      "No sign-up required. Your data is not sent to the cloud, sold, or shared.",
    feat4Title: "Backup & Restore",
    feat4Desc:
      "Backup your library to your device or share it anywhere. Never lose your data.",
    feat5Title: "Smart Notifications",
    feat5Desc:
      "Personalized reminders and magic recommendations to keep you reading.",
    feat6Title: "Reading Stats",
    feat6Desc:
      "Track your progress with weekly summaries and year-end reports.",

    footerRights: "© 2026 Ayraç. All rights reserved.",
    linkPrivacy: "Privacy Policy",
    linkTerms: "Terms of Use",
    linkContact: "Contact",

    // General UI
    backHome: "← Back to Home",

    // Privacy Page
    privacyTitle: "Privacy Policy",
    privacyLastUpdate: "Last Updated: January 14, 2026",
    privacyIntro:
      "This Privacy Policy describes how your data is collected, used, and shared when you use the Ayraç app. Your privacy is a fundamental right.",

    privSec1: "1. Information Collection and Use",
    privSec1Text:
      "Ayraç operates on an 'Offline-First' principle. Your personal data (book lists, notes, stats) is NOT sent to our servers. All data is stored locally on your device (AsyncStorage & File System).",

    privSub1: "1.1 Camera Permission",
    privSub1Text:
      "The App requests camera access to speed up adding books. The camera is used solely to scan barcodes (ISBN) or capture book covers. Images are not sent to our servers.",

    privSub2: "1.2 Storage & Media Access",
    privSub2Text:
      "Read/Write access to storage is requested to Backup and Restore your library. Media access is required if you verify/choose a book cover from your gallery. This data remains under your control.",

    privSub3: "1.3 Notifications",
    privSub3Text:
      "Local Notification permission is used to send you reading reminders, weekly reports, and 'magic recommendations'. Notifications are generated on-device.",

    privSec2: "2. Internet Access & Third Parties",
    privSec2Text:
      "While primarily offline, the app uses the following API services to fetch rich book data:",
    privList1:
      "<strong>Google Books API:</strong> For covers, summaries, and metadata.",
    privList2:
      "<strong>Open Library API:</strong> As an alternative data source.",
    privNote:
      "Note: When using these services, your IP address may be visible to the service provider (Google or Internet Archive). Ayraç does not execute any identity tracking.",

    privSec3: "3. Data Security & Backup",
    privSec3Text:
      "Your data is stored unencrypted on your device (protected by Android Sandbox). We recommend using the 'Backup' feature in Settings regularly. Keeping backup files safe is the user's responsibility.",

    privSec4: "4. Children's Privacy",
    privSec4Text:
      "Our services are for general audiences. We do not knowingly collect personal data from children under 13.",

    privSecContact: "Contact Us",
    privContactText:
      "If you have any questions about our Privacy Policy, please contact us:",

    // Contact Page
    contactPageTitle: "Contact Us",
    contactPageDesc: "Reach out for feedback, suggestions, or support.",
    contactEmailLabel: "Our Email Address:",
    contactNote: "We try to respond to all messages as soon as possible.",

    // Terms of Use Page
    termsTitle: "Terms of Use",
    termsLastUpdate: "Last Updated: January 14, 2026",
    termsIntro:
      "By using the Ayraç app, you agree to the following terms and conditions. These terms govern your access to and use of the application.",

    termsSec1: "1. Service Description",
    termsSec1Text:
      "Ayraç is a personal library management application that allows users to track their books. The application is provided 'as is' and the developer reserves the right to modify features at any time.",

    termsSec2: "2. Terms of Use",
    termsSec2Text:
      "You may not use the app for illegal purposes. You may not engage in reverse engineering, decompiling, or similar activities that would interfere with the operation of the app.",

    termsSec3: "3. Data and Responsibility",
    termsSec3Text:
      "Ayraç is an offline-working application. The security, privacy, and regular backup of your data are entirely your responsibility. Ayraç (and its developer) cannot be held responsible for any data loss due to device loss, technical errors, or data corruption.",

    termsSec4: "4. Intellectual Property",
    termsSec4Text:
      "The app design, logo, texts, and source code belong to the Ayraç developer. No part may be copied, reproduced, or used in another project without permission.",

    termsSec5: "5. Changes",
    termsSec5Text:
      "The terms of use may be updated from time to time. By continuing to use the app, you agree to the updated terms. You can follow the changes via this page.",
  },
};

function setLanguage(lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      if (translations[lang][key].includes("<")) {
        element.innerHTML = translations[lang][key];
      } else {
        element.innerText = translations[lang][key];
      }
    }
  });

  localStorage.setItem("preferredLang", lang);
  document.documentElement.lang = lang;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferredLang");
  const browserLang = navigator.language.startsWith("tr") ? "tr" : "en";
  const defaultLang = savedLang || browserLang;

  setLanguage(defaultLang);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      setLanguage(e.target.dataset.lang);
    });
  });
});
