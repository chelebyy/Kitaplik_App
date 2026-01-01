import { Linking } from "react-native";
import { logError } from "../utils/errorUtils";

export interface Store {
  id: string;
  name: string;
  baseUrl: string;
  logoColor: string; // For UI placeholder if no logo image
  searchPath: (query: string) => string;
}

export interface StoreLink {
  store: Store;
  url: string;
  urlIsbn: string | null;
  price: number | null; // null = fiyat bilgisi yok
  loading?: boolean;
}

export const STORES: Store[] = [
  {
    id: "kitapyurdu",
    name: "Kitapyurdu",
    baseUrl: "https://www.kitapyurdu.com",
    logoColor: "#FF6600",
    searchPath: (q) =>
      `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(q)}`,
  },
  {
    id: "dr",
    name: "D&R",
    baseUrl: "https://www.dr.com.tr",
    logoColor: "#00529B",
    searchPath: (q) =>
      `https://www.dr.com.tr/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "idefix",
    name: "Idefix",
    baseUrl: "https://www.idefix.com",
    logoColor: "#00AEEF",
    searchPath: (q) =>
      `https://www.idefix.com/search/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "amazon_tr",
    name: "Amazon TR",
    baseUrl: "https://www.amazon.com.tr",
    logoColor: "#FF9900",
    searchPath: (q) => `https://www.amazon.com.tr/s?k=${encodeURIComponent(q)}`,
  },
  {
    id: "bkm",
    name: "BKM Kitap",
    baseUrl: "https://www.bkmkitap.com",
    logoColor: "#ED1C24",
    searchPath: (q) =>
      `https://www.bkmkitap.com/arama?q=${encodeURIComponent(q)}`,
  },
  {
    id: "nadir",
    name: "NadirKitap",
    baseUrl: "https://www.nadirkitap.com",
    logoColor: "#8B4513",
    searchPath: (q) =>
      `https://www.nadirkitap.com/kitapara.php?ara=kitap&kitap_adi=${encodeURIComponent(q)}`,
  },
];

export const PriceService = {
  getStoreLinks: (title: string, isbn?: string, author?: string) => {
    // Öncelik: ISBN varsa ISBN, yoksa Başlık + Yazar
    // Not: Bazı siteler ISBN ile aramada daha iyi sonuç verirken, bazıları başlık ile daha iyi çalışabilir.
    // Şimdilik basit bir mantık kuralım: ISBN varsa onu, yoksa başlığı kullanalım.
    // Alternatif: Kullanıcıya iki seçenek sunulabilir veya varsayılan olarak başlık kullanılabilir.
    // Genellikle kullanıcı "kitap adı" ile arama yapmaya alışkındır.

    const query = title + (author ? ` ${author}` : "");

    // Mock fiyatlar - İleride gerçek API entegrasyonu yapılabilir
    // S7748: Gereksiz sıfır ondalıklar kaldırıldı
    const mockPrices: Record<string, number | null> = {
      kitapyurdu: 189,
      dr: 199.5,
      idefix: 195,
      amazon_tr: 185,
      bkm: 179.9,
      nadir: null, // İkinci el kitapçı, fiyat değişken
    };

    return STORES.map((store) => ({
      store,
      url: store.searchPath(query),
      urlIsbn: isbn ? store.searchPath(isbn) : null,
      price: mockPrices[store.id] ?? null,
      loading: false,
    }));
  },

  openStore: async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    } catch (error) {
      logError("PriceService.openStore", error);
    }
  },
};
