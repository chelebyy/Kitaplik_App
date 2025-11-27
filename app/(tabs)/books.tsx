import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Grid, List, Plus, ArrowUpDown, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBooks, Book, BookStatus } from '../../context/BooksContext';
import FilterDropdown from '../../components/FilterDropdown';

type SortOption = 'title_asc' | 'title_desc' | 'author_asc' | 'rating_desc';

export default function BooksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { books } = useBooks();
  const { width } = useWindowDimensions();

  // States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tümü');
  const [sortBy, setSortBy] = useState<SortOption>('title_asc');

  // Grid hesaplamaları
  const COLUMN_WIDTH = (width - 48 - 16) / 2;

  // Dinamik Filtre Listesi (Kitaplardan gelen türler)
  const filters = useMemo(() => {
    const genres = new Set(books.map(b => b.genre || 'Genel'));
    return ['Tümü', ...Array.from(genres)];
  }, [books]);

  // Filtreleme ve Sıralama Mantığı
  const processedBooks = useMemo(() => {
    let result = books.filter(book => {
      // 1. Tür Filtresi
      const matchesGenre = selectedGenre === 'Tümü' || book.genre === selectedGenre;

      // 2. Arama Filtresi
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGenre && matchesSearch;
    });

    // 3. Sıralama
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc': return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'author_asc': return a.author.localeCompare(b.author);
        // Rating sort removed as property doesn't exist yet
        default: return 0;
      }
    });

    return result;
  }, [books, selectedGenre, searchQuery, sortBy]);

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case 'Okunuyor': return colors.statusReading;
      case 'Okundu': return colors.statusRead;
      case 'Okunacak': return colors.statusToRead;
      default: return colors.textSecondary;
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    // Progress Calculation
    const progress = item.pageCount && item.currentPage
      ? Math.min(item.currentPage / item.pageCount, 1)
      : 0;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={[styles.bookCardGrid, { width: COLUMN_WIDTH }]}
          onPress={() => router.push({ pathname: '/book-detail', params: { id: item.id } })}
          activeOpacity={0.7}
        >
          <View style={[styles.coverContainer, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: item.coverUrl }}
              style={[styles.bookCoverGrid, { height: COLUMN_WIDTH * 1.5 }]}
              resizeMode="cover"
            />
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{item.author}</Text>
        </TouchableOpacity>
      );
    } else {
      // Liste Görünümü
      return (
        <TouchableOpacity
          style={[styles.bookCardList, { backgroundColor: colors.card }]}
          onPress={() => router.push({ pathname: '/book-detail', params: { id: item.id } })}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.coverUrl }}
            style={styles.bookCoverList}
            resizeMode="cover"
          />
          <View style={styles.bookInfoList}>
            <View>
              <View style={[styles.statusBadgeList, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Text style={[styles.bookTitle, { color: colors.text, fontSize: 18 }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.bookAuthor, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>{item.author}</Text>
            </View>

            <View>
              {/* Progress Bar for List View */}
              {item.status === 'Okunuyor' && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>%{Math.round(progress * 100)}</Text>
                </View>
              )}
              <View style={styles.genreTag}>
                <Text style={[styles.genreText, { color: colors.textSecondary }]}>{item.genre || 'Genel'}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kitaplarım</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Sort Button */}
            <TouchableOpacity
              onPress={() => {
                const options: SortOption[] = ['title_asc', 'title_desc', 'author_asc', 'rating_desc'];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex]);
              }}
              style={[styles.iconButton, { backgroundColor: colors.card }]}
            >
              <ArrowUpDown size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
              style={[styles.iconButton, { backgroundColor: colors.card }]}
            >
              {viewMode === 'grid' ? (
                <List size={24} color={colors.text} />
              ) : (
                <Grid size={24} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Kitap veya yazar ara..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Minimal Dropdown Filtre Alanı */}
        <View style={styles.filtersContainer}>
          <FilterDropdown
            label="Tür"
            items={filters}
            selectedValue={selectedGenre}
            onValueChange={setSelectedGenre}
          />
          {/* Active Sort Indicator */}
          <View style={[styles.sortBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.sortText, { color: colors.textSecondary }]}>
              {sortBy === 'title_asc' && 'A-Z'}
              {sortBy === 'title_desc' && 'Z-A'}
              {sortBy === 'author_asc' && 'Yazar'}
              {sortBy === 'rating_desc' && 'Puan'}
            </Text>
          </View>
        </View>

        <FlatList
          key={viewMode}
          data={processedBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridColumnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BookOpen size={48} color={colors.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? `"${searchQuery}" araması için kitap bulunamadı.`
                  : 'Bu kategoride henüz kitap yok.'}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.fabBlue }]}
          onPress={() => router.push('/add-book')}
        >
          <Plus size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  iconButton: { padding: 8, borderRadius: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16 },
  filtersContainer: { marginBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  gridColumnWrapper: { justifyContent: 'space-between', marginBottom: 24 },

  // Sort Badge
  sortBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  sortText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  // Grid Styles
  bookCardGrid: {},
  coverContainer: { position: 'relative', marginBottom: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  bookCoverGrid: { width: '100%', borderRadius: 12 },
  statusBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  // List Styles
  bookCardList: { flexDirection: 'row', marginBottom: 16, borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  bookCoverList: { width: 70, height: 105, borderRadius: 8, marginRight: 16 },
  bookInfoList: { flex: 1, justifyContent: 'space-between' },
  statusBadgeList: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  genreTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  genreText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  // Progress Bar
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  progressBarBg: { flex: 1, height: 4, borderRadius: 2, marginRight: 8 },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Common
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#FFFFFF' },
  bookTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 },
  bookAuthor: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },

  // Empty State
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontFamily: 'Inter_400Regular', textAlign: 'center', fontSize: 16 },
});
