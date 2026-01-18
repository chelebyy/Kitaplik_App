import { useEffect, useState } from "react";
import {
  View,
  Alert,
  ActivityIndicator,
  Text,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useBooks } from "../context/BooksContext";
import { useTranslation } from "react-i18next";
import { GoogleBookResult } from "../services/GoogleBooksService";
import { useBookSearchQuery } from "../hooks/book/useBookSearchQuery";
import { useIsbnSearchQuery } from "../hooks/book/useIsbnSearchQuery";
import { useAddBookForm } from "../hooks/book/useAddBookForm";
import { translateGenre } from "../utils/genreTranslator";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import BookSelectionModal from "../components/BookSelectionModal";
import GenrePickerModal from "../components/GenrePickerModal";
import {
  AddBookHeader,
  AddBookTabBar,
  ManualTab,
  SearchTab,
  InputMode,
} from "../components/AddBook";

// Extract book data from Google Books API result
const extractBookData = (book: GoogleBookResult) => {
  const title = book.volumeInfo.title || "";
  const author = book.volumeInfo.authors ? book.volumeInfo.authors[0] : "";
  let image = book.volumeInfo.imageLinks?.thumbnail;
  if (image) {
    image = image.replace("http://", "https://");
  }
  const rawGenre = book.volumeInfo.categories?.[0];
  const genre = translateGenre(rawGenre);
  const pageCount = book.volumeInfo.pageCount || 0;
  return { title, author, image, genre, pageCount };
};

export default function AddBookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addBook } = useBooks();
  const { t, i18n } = useTranslation();

  // Form state via custom hook
  const form = useAddBookForm();

  // Mode State
  const [mode, setMode] = useState<InputMode>("manual");

  // Search State
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    isLoading: isSearchLoading,
    searchType,
    setSearchType,
    search: searchGoogleBooks,
    clear: clearSearch,
  } = useBookSearchQuery();

  // Modal States
  const [isScannerVisible, setIsScannerVisible] = useState<boolean>(false);
  const [isGenrePickerVisible, setGenrePickerVisible] = useState(false);
  const [isSelectionModalVisible, setIsSelectionModalVisible] =
    useState<boolean>(false);
  const [candidateBooks, setCandidateBooks] = useState<GoogleBookResult[]>([]);
  const [scannedIsbn, setScannedIsbn] = useState<string | null>(null);

  // ISBN Search Query
  const {
    data: barcodeResults,
    isLoading: isBarcodeLoading,
    isError: isBarcodeError,
  } = useIsbnSearchQuery(scannedIsbn, {
    language: i18n.language?.split("-")[0],
  });

  // Handle barcode search results
  useEffect(() => {
    if (isBarcodeError) {
      Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
      setScannedIsbn(null);
      return;
    }

    if (!scannedIsbn || isBarcodeLoading || !barcodeResults) return;

    if (barcodeResults.length === 0) {
      Alert.alert(t("add_book_not_found"), t("add_book_not_found_msg"));
      setScannedIsbn(null);
      return;
    }

    if (barcodeResults.length > 1) {
      setCandidateBooks(barcodeResults);
      setIsSelectionModalVisible(true);
    } else {
      // Single result
      const primaryBook = barcodeResults[0];
      const { title, author, image, genre, pageCount } =
        extractBookData(primaryBook);

      const success = addBook({
        title,
        author,
        status: form.status,
        genre,
        coverUrl:
          image ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600",
        progress: form.status === "Okundu" ? 1 : 0,
        pageCount,
        currentPage: form.status === "Okundu" ? pageCount : 0,
      });

      if (success) {
        const message = image
          ? t("add_book_success_msg")
          : t("barcode_no_cover_warning");
        Alert.alert(t("add_book_success"), message);
        router.back();
      }
    }
    setScannedIsbn(null);
  }, [
    barcodeResults,
    isBarcodeLoading,
    isBarcodeError,
    scannedIsbn,
    addBook,
    form.status,
    router,
    t,
  ]);

  // Handle adding book from search results
  const handleAddFromSearch = (book: GoogleBookResult) => {
    const { title, author, image, genre, pageCount } = extractBookData(book);

    const success = addBook({
      title,
      author,
      status: form.status,
      genre,
      coverUrl:
        image ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600",
      progress: form.status === "Okundu" ? 1 : 0,
      pageCount,
      currentPage: form.status === "Okundu" ? pageCount : 0,
    });

    if (success) {
      Alert.alert(t("add_book_success"), t("add_book_success_msg"));
      router.back();
    }
  };

  // Handle barcode scan
  const handleBarcodeScanned = (isbn: string) => {
    setScannedIsbn(isbn);
  };

  // Handle book selection from modal (multiple editions)
  const handleBookSelect = (book: GoogleBookResult) => {
    setIsSelectionModalVisible(false);
    const { title, author, image, genre, pageCount } = extractBookData(book);

    const success = addBook({
      title,
      author,
      status: form.status,
      genre,
      coverUrl:
        image ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600",
      progress: form.status === "Okundu" ? 1 : 0,
      pageCount,
      currentPage: form.status === "Okundu" ? pageCount : 0,
    });

    if (success) {
      Alert.alert(t("add_book_success"), t("add_book_success_msg"));
      router.back();
    }
  };

  // Handle manual save
  const handleSave = () => {
    const validation = form.validate();

    if (!validation.isValid) {
      Alert.alert(t("add_book_fill_required"), t("add_book_fill_required_msg"));
      return;
    }

    const bookData = form.getBookData();
    addBook(bookData);
    Alert.alert(t("add_book_success"), t("add_book_success_msg"));
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <AddBookHeader />

      {/* Tab Bar */}
      <AddBookTabBar mode={mode} onModeChange={setMode} />

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {mode === "manual" ? (
          <ManualTab
            title={form.title}
            author={form.author}
            genre={form.genre}
            pageCount={form.pageCount}
            currentPage={form.currentPage}
            coverUrl={form.coverUrl}
            status={form.status}
            onTitleChange={form.setTitle}
            onAuthorChange={form.setAuthor}
            onPageCountChange={form.setPageCount}
            onCurrentPageChange={form.setCurrentPage}
            onCoverChange={form.setCoverUrl}
            onStatusChange={form.setStatus}
            onGenrePress={() => setGenrePickerVisible(true)}
            onBarcodePress={() => setIsScannerVisible(true)}
            onSave={handleSave}
          />
        ) : (
          <SearchTab
            searchQuery={searchQuery}
            searchType={searchType}
            searchResults={searchResults}
            isLoading={isSearchLoading}
            status={form.status}
            onQueryChange={setSearchQuery}
            onSearchTypeChange={setSearchType}
            onSearch={searchGoogleBooks}
            onClearSearch={clearSearch}
            onAddBook={handleAddFromSearch}
          />
        )}
      </KeyboardAvoidingView>

      {/* Modals */}
      <BarcodeScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />

      <BookSelectionModal
        visible={isSelectionModalVisible}
        books={candidateBooks}
        onSelect={handleBookSelect}
        onClose={() => setIsSelectionModalVisible(false)}
      />

      <GenrePickerModal
        visible={isGenrePickerVisible}
        selectedGenre={form.genre || "Diğer"}
        onSelect={form.setGenre}
        onClose={() => setGenrePickerVisible(false)}
      />

      {/* Loading Overlay */}
      {isBarcodeLoading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#FFF" />
          <Text
            className="text-white mt-2.5 font-semibold"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            {t("loading_book_info") || "Kitap bilgileri getiriliyor..."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
