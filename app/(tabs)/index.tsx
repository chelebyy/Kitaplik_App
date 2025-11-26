import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MoreVertical, Filter, Bookmark, Sun, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useBooks, Book } from '../../context/BooksContext';

// Görseldeki tasarıma özel renk paleti (Sabit renkler)
const DASHBOARD_COLORS = {
  accent: '#F79009', 
  blueAccent: '#448AFF',
  fab: '#0F172A'
};

const CATEGORIES = ['Tümü', 'Roman', 'Bilim Kurgu', 'Tarih', 'Fantastik', 'Kişisel Gelişim'];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, toggleTheme, isDarkMode } = useTheme(); 
  const { books } = useBooks();
  
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Yeni Filtre State'i: Sadece 'Okunuyor' olanları göster
  const [showOnlyReading, setShowOnlyReading] = useState(false);

  // İstatistik Hesaplama
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const uniqueAuthors = new Set(books.map(b => b.author)).size;
    const readBooks = books.filter(b => b.status === 'Okundu').length;
    const toReadBooks = books.filter(b => b.status === 'Okunacak').length;

    return { totalBooks, uniqueAuthors, readBooks, toReadBooks };
  }, [books]);

  // Filtreleme Mantığı
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // 1. Kategori Filtresi
      const matchesCategory = activeCategory === 'Tümü' || book.genre === activeCategory;
      
      // 2. Arama Filtresi
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. "Sadece Okunanlar" Filtresi (Buton ile tetiklenir)
      const matchesStatus = showOnlyReading ? book.status === 'Okunuyor' : true;
      
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [books, activeCategory, searchQuery, showOnlyReading]);

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-detail',
      params: { id: book.id }
    });
  };

  const toggleFilter = () => {
    setShowOnlyReading(!showOnlyReading);
  };

  // --- Alt Bileşenler ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={[styles.dashboardTitle, { color: colors.text }]}>Yönetim Paneli</Text>
        
        {/* Karanlık Mod Toggle Butonu */}
        <TouchableOpacity 
          onPress={toggleTheme}
          style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          {isDarkMode ? (
            <Sun size={22} color={colors.text} />
          ) : (
            <Moon size={22} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? colors.card : '#E4E7EC' }]}>
          <Search size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Tüm koleksiyonda ara..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Kütüphane Özeti</Text>
        
        <View style={styles.statsGrid}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Toplam Kitap</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalBooks}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Farklı Yazar</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.uniqueAuthors}</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={[styles.statsRow, { marginTop: 20 }]}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Okunan Cilt</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.readBooks}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Okunacak</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.toReadBooks}</Text>
                <Bookmark size={16} color={DASHBOARD_COLORS.blueAccent} fill={DASHBOARD_COLORS.blueAccent} style={{ marginLeft: 6, marginTop: 2 }} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Section Header & Filters */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {showOnlyReading ? 'Okunuyor' : (activeCategory === 'Tümü' ? 'Tüm Kitaplar' : activeCategory)}
        </Text>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            showOnlyReading ? { backgroundColor: colors.primary } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }
          ]}
          onPress={toggleFilter}
          activeOpacity={0.7}
        >
          <Filter 
            size={16} 
            color={showOnlyReading ? '#FFFFFF' : colors.textSecondary} 
            style={{ marginRight: 4 }} 
          />
          <Text style={[
            styles.filterButtonText,
            { color: showOnlyReading ? '#FFFFFF' : colors.textSecondary }
          ]}>
            {showOnlyReading ? 'Filtreyi Kaldır' : 'Filtrele'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Categories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                isActive 
                  ? { backgroundColor: colors.primary, borderColor: colors.primary } 
                  : { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                { color: isActive ? '#FFFFFF' : colors.text }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    // İlerleme yüzdesi (0-100)
    const progressPercent = Math.round((item.progress || 0) * 100);
    
    return (
      <TouchableOpacity 
        style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.bookCoverWrapper}>
          <Image 
            source={{ uri: item.coverUrl }} 
            style={[styles.bookCover, { backgroundColor: colors.background }]}
            resizeMode="cover"
          />
        </View>

        <View style={styles.bookInfo}>
          <View style={styles.bookHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
            </View>
            <TouchableOpacity style={{ padding: 4 }}>
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? '#333' : '#F2F4F7' }]}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>

          <Text style={styles.lastReadText}>
            Durum: <Text style={{ fontWeight: '600', color: colors.text }}>{item.status}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {showOnlyReading 
                ? 'Şu an okuduğunuz bir kitap bulunmuyor.' 
                : 'Bu kriterlere uygun kitap bulunamadı.'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-book')}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 8,
  },
  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dashboardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  // Search
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    height: '100%',
  },
  // Summary Card
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  summaryTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsGrid: {
    gap: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#667085',
    marginBottom: 6,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  // Categories
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  // Book Card
  bookCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCoverWrapper: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  bookAuthor: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#667085',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#667085',
    width: 35,
    textAlign: 'right',
  },
  lastReadText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#98A2B3',
    marginTop: 8,
  },
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: '#667085',
    textAlign: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DASHBOARD_COLORS.fab,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
