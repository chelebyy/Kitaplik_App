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
import { LinearGradient } from 'expo-linear-gradient';
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

export default function HomeScreen() {
  const router = useRouter();
  const { colors, toggleTheme, isDarkMode } = useTheme();
  const { books } = useBooks();

  const [activeFilter, setActiveFilter] = useState('Tümü');
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
      // 1. Durum Filtresi
      const matchesStatus = activeFilter === 'Tümü' || book.status === activeFilter;

      // 2. Arama Filtresi
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [books, activeFilter, searchQuery]);

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-detail',
      params: { id: book.id }
    });
  };

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

      {/* Summary Card (Interactive Filters) */}
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#27221F'] : ['#FFFFFF', '#FFF7ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.summaryCard, { borderColor: colors.border }]}
      >
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statItem, { opacity: activeFilter === 'Tümü' ? 1 : 0.5 }]}
            onPress={() => setActiveFilter('Tümü')}
          >
            <Text style={styles.statLabel}>Tüm Kitaplar</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalBooks}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statItem, { opacity: activeFilter === 'Okundu' ? 1 : 0.5 }]}
            onPress={() => setActiveFilter('Okundu')}
          >
            <Text style={styles.statLabel}>Okunan</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.readBooks}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statItem, { opacity: activeFilter === 'Okunuyor' ? 1 : 0.5 }]}
            onPress={() => setActiveFilter('Okunuyor')}
          >
            <Text style={styles.statLabel}>Okunuyor</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.readingBooks}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statItem, { opacity: activeFilter === 'Okunacak' ? 1 : 0.5 }]}
            onPress={() => setActiveFilter('Okunacak')}
          >
            <Text style={styles.statLabel}>Okunacak</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.toReadBooks}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {activeFilter === 'Tümü' ? 'Tüm Kitaplar' : activeFilter}
        </Text>
      </View>
    </View>
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    const isReading = item.status === 'Okunuyor';

    // Calculate progress display
    let progressText = '';
    let progressPercent = item.progress || 0;

    if (item.status === 'Okundu') {
      progressPercent = 1;
      progressText = 'Tamamlandı';
    } else if (item.status === 'Okunacak') {
      progressPercent = 0;
      progressText = 'Henüz başlanmadı';
    } else {
      // Reading status
      if (item.pageCount && item.currentPage !== undefined) {
        progressText = `${item.currentPage} / ${item.pageCount} Sayfa`;
        // Ensure percent is accurate based on pages if available
        progressPercent = item.pageCount > 0 ? item.currentPage / item.pageCount : 0;
      } else {
        progressText = `%${Math.round(progressPercent * 100)}`;
      }
    }

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
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%`,
                    backgroundColor: item.status === 'Okundu' ? '#4CAF50' : colors.primary
                  }
                ]}
              />
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.lastReadText}>
                Durum: <Text style={{ fontWeight: '600', color: colors.text }}>{item.status}</Text>
              </Text>
              {isReading && (
                <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: 11 }]}>
                  {progressText}
                </Text>
              )}
            </View>
          </View>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
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
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#667085',
  },
  lastReadText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#667085',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DASHBOARD_COLORS.fab,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
  },
});
