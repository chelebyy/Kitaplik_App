import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  ActionSheetIOS
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, ChevronDown, Search, BookOpen, PenTool, ScanLine } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBooks, BookStatus } from '../context/BooksContext';
import * as ImagePicker from 'expo-image-picker';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

type InputMode = 'manual' | 'search';

interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
    categories?: string[];
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

export default function AddBookScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { addBook } = useBooks();

  // Mode State
  const [mode, setMode] = useState<InputMode>('manual');

  // Form State
  const [status, setStatus] = useState<BookStatus>('Okunuyor');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Scanner State
  const [isScannerVisible, setScannerVisible] = useState(false);

  const statuses: BookStatus[] = ['Okunacak', 'Okunuyor', 'Okundu'];

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek veya yüklemek için kamera ve galeri izinlerine ihtiyacımız var.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Kapak Fotoğrafı Ekle',
        'Lütfen bir yöntem seçin',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Fotoğraf Çek', onPress: takePhoto },
          { text: 'Galeriden Seç', onPress: pickImage },
        ]
      );
    }
  };

  const handleBarcodeScanned = async (isbn: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const book = data.items[0];
        selectBook(book);
        Alert.alert('Başarılı', 'Kitap bilgileri barkoddan çekildi.');
      } else {
        Alert.alert('Bulunamadı', 'Bu barkoda ait kitap bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kitap bilgileri getirilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen en az kitap adı ve yazar adını giriniz.');
      return;
    }

    addBook({
      title,
      author,
      status,
      genre: genre || 'Genel',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600',
      progress: status === 'Okundu' ? 1 : 0,
    });

    Alert.alert('Başarılı', 'Kitap kütüphanenize eklendi!');
    router.back();
  };

  const searchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`);
      const data = await response.json();
      if (data.items) {
        setSearchResults(data.items);
      } else {
        setSearchResults([]);
        Alert.alert('Sonuç Bulunamadı', 'Aradığınız kriterlere uygun kitap bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kitap aranırken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectBook = (book: GoogleBookResult) => {
    setTitle(book.volumeInfo.title || '');
    setAuthor(book.volumeInfo.authors ? book.volumeInfo.authors[0] : '');

    let image = book.volumeInfo.imageLinks?.thumbnail;
    if (image) {
      image = image.replace('http://', 'https://');
    }
    setCoverUrl(image || null);

    if (book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
      setGenre(book.volumeInfo.categories[0]);
    }

    setMode('manual');
    setSearchResults([]);
    setSearchQuery('');
  };

  const renderSearchMode = () => (
    <View style={styles.searchModeContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Search size={20} color={colors.placeholder} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Kitap adı, yazar veya ISBN..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={searchGoogleBooks}
        />
        <TouchableOpacity onPress={searchGoogleBooks} style={styles.searchButton}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Ara</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Kitaplar aranıyor...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchResults.length === 0 && searchQuery ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sonuç bulunamadı.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultItem, { backgroundColor: colors.card }]}
              onPress={() => selectBook(item)}
            >
              <Image
                source={{ uri: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x150/png' }}
                style={styles.resultImage}
                resizeMode="cover"
              />
              <View style={styles.resultInfo}>
                <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.volumeInfo.title}
                </Text>
                <Text style={[styles.resultAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                </Text>
                {item.volumeInfo.categories && (
                  <View style={[styles.resultTag, { backgroundColor: colors.chipBackground }]}>
                    <Text style={[styles.resultTagText, { color: colors.textSecondary }]}>
                      {item.volumeInfo.categories[0]}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.selectButtonContainer}>
                <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Seç</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderManualMode = () => (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Scan Barcode Button */}
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
        onPress={() => setScannerVisible(true)}
      >
        <ScanLine size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.scanButtonText, { color: colors.primary }]}>Barkod Tara (Otomatik Doldur)</Text>
      </TouchableOpacity>

      {/* Cover Upload Area */}
      <View style={[styles.uploadContainer, { backgroundColor: isDarkMode ? colors.card : '#F8F9FA', borderColor: colors.border }]}>
        {coverUrl ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: coverUrl }} style={styles.coverPreview} resizeMode="contain" />
            <TouchableOpacity
              style={[styles.removeCoverButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              onPress={() => setCoverUrl(null)}
            >
              <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Kaldır</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.uploadIconCircle, { backgroundColor: colors.iconBackground }]}>
              <ImageIcon size={32} color="#448AFF" />
            </View>
            <Text style={[styles.uploadTitle, { color: colors.text }]}>Kitap Kapağı</Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>Kapak Ekle</Text>
            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.chipBackground }]} onPress={handleUpload}>
              <Text style={[styles.uploadButtonText, { color: colors.text }]}>Yükle</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Kitap Adı</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Kitap adını girin"
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Yazar Adı</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Yazar adını girin"
          placeholderTextColor={colors.placeholder}
          value={author}
          onChangeText={setAuthor}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Tür</Text>
        <View style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0, height: 50 }]}>
          <TextInput
            style={{ flex: 1, color: colors.text, height: '100%', fontFamily: 'Inter_400Regular' }}
            placeholder="Tür girin (Örn: Roman)"
            placeholderTextColor={colors.placeholder}
            value={genre}
            onChangeText={setGenre}
          />
          <ChevronDown size={20} color={colors.textSecondary} />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Durum</Text>
        <View style={[styles.statusContainer, { backgroundColor: colors.chipBackground }]}>
          {statuses.map((s) => {
            const isActive = status === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusButton,
                  isActive && styles.statusButtonActive
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yeni Kitap Ekle</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeSwitcherContainer}>
        <View style={[styles.modeSwitcher, { backgroundColor: colors.chipBackground }]}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'manual' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
            onPress={() => setMode('manual')}
          >
            <PenTool size={16} color={mode === 'manual' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.modeText, { color: mode === 'manual' ? colors.text : colors.textSecondary }]}>Manuel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'search' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
            onPress={() => setMode('search')}
          >
            <Search size={16} color={mode === 'search' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.modeText, { color: mode === 'search' ? colors.text : colors.textSecondary }]}>Google'da Ara</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {mode === 'manual' ? renderManualMode() : renderSearchMode()}

        {mode === 'manual' && (
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      <BarcodeScannerModal
        visible={isScannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />

      {isLoading && mode === 'manual' && (
        <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: '#FFF', marginTop: 10, fontFamily: 'Inter_600SemiBold' }}>Kitap bilgileri getiriliyor...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  modeSwitcherContainer: { paddingHorizontal: 24, marginBottom: 16 },
  modeSwitcher: { flexDirection: 'row', padding: 4, borderRadius: 12, height: 44 },
  modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  modeText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  content: { padding: 24 },
  searchModeContainer: { flex: 1, paddingHorizontal: 24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, paddingVertical: 8 },
  searchButton: { paddingHorizontal: 8, paddingVertical: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontFamily: 'Inter_500Medium', fontSize: 14 },
  resultsList: { paddingBottom: 24 },
  emptyText: { textAlign: 'center', marginTop: 24, fontFamily: 'Inter_400Regular' },
  resultItem: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  resultImage: { width: 50, height: 75, borderRadius: 4, marginRight: 12, backgroundColor: '#E0E0E0' },
  resultInfo: { flex: 1, marginRight: 8 },
  resultTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 4 },
  resultAuthor: { fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 6 },
  resultTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  resultTagText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  selectButtonContainer: { paddingLeft: 8 },
  uploadContainer: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 32, minHeight: 200, justifyContent: 'center' },
  previewContainer: { width: '100%', alignItems: 'center' },
  coverPreview: { width: 120, height: 180, borderRadius: 8, marginBottom: 12 },
  removeCoverButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 4 },
  uploadSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 16 },
  uploadButton: { paddingHorizontal: 32, paddingVertical: 10, borderRadius: 8 },
  uploadButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  formGroup: { marginBottom: 24 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 16 },
  statusContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  statusButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  statusButtonActive: { backgroundColor: '#448AFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statusButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, paddingTop: 16, borderTopWidth: 1 },
  saveButton: { backgroundColor: '#1E88E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: '#1E88E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF' },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 24, borderStyle: 'dashed' },
  scanButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
});
