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
import { Search, Plus, MoreVertical, Sun, Moon, Sparkles, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useBooks, Book } from '../../context/BooksContext';
import RecommendationModal from '../../components/RecommendationModal';
import ProfileModal from '../../components/ProfileModal';

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
  const [isRecommendationModalVisible, setRecommendationModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);



  // İstatistik Hesaplama
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const readBooks = books.filter(b => b.status === 'Okundu').length;
    const readingBooks = books.filter(b => b.status === 'Okunuyor').length;
    const toReadBooks = books.filter(b => b.status === 'Okunacak').length;

    return { totalBooks, readBooks, readingBooks, toReadBooks };
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

      return matchesCategory && matchesSearch;
    });
  }, [books, activeCategory, searchQuery]);

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-detail',
      params: { id: book.id }
    });
  };



  // --- Alt Bileşenler ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={[styles.dashboardTitle, { color: colors.text }]}>Kitaplığım</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Profil Butonu */}
          <TouchableOpacity
            onPress={() => setProfileModalVisible(true)}
            style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <User size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Öneri Butonu */}
          <TouchableOpacity
            onPress={() => setRecommendationModalVisible(true)}
            style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Sparkles size={20} color="#F79009" />
          </TouchableOpacity>

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
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tüm Kitaplar</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalBooks}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Okunan</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.readBooks}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Okunuyor</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.readingBooks}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Okunacak</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.toReadBooks}</Text>
          </View>
        </View>
      </View>

      {/* Section Header & Filters */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {activeCategory === 'Tümü' ? 'Tüm Kitaplar' : activeCategory}
        </Text>

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
              Bu kriterlere uygun kitap bulunamadı.
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

      <RecommendationModal
        visible={isRecommendationModalVisible}
        onClose={() => setRecommendationModalVisible(false)}
      />

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
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
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#667085',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    textAlign: 'center',
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
