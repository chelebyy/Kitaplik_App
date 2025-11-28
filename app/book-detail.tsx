import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBooks, BookStatus } from '../context/BooksContext';
import { useTranslation } from 'react-i18next';
import PriceComparisonModal from '../components/PriceComparisonModal';

export default function BookDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { getBookById, updateBookStatus, updateBookNotes, updateBookProgress, deleteBook } = useBooks();

  // params.id'yi güvenli bir şekilde al
  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Kitap verisini al
  const book = getBookById(bookId || '');

  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isPriceModalVisible, setPriceModalVisible] = useState(false);

  useEffect(() => {
    if (book) {
      setNotes(book.notes || '');
      setCurrentPage(book.currentPage || 0);
      setPageCount(book.pageCount || 0);
    }
  }, [book]);

  // Kitap silindiğinde veya bulunamadığında
  if (!book) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>{t('book_detail_not_found')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = (newStatus: BookStatus) => {
    if (!bookId) return;
    updateBookStatus(bookId, newStatus);
  };

  const handleNotesChange = (text: string) => {
    if (!bookId) return;
    setNotes(text);
    updateBookNotes(bookId, text);
  };

  const handleProgressChange = (current: string, total: string) => {
    if (!bookId) return;

    const currentNum = parseInt(current) || 0;
    const totalNum = parseInt(total) || 0;

    setCurrentPage(currentNum);
    setPageCount(totalNum);

    updateBookProgress(bookId, currentNum, totalNum);
  };

  const handleDelete = () => {
    if (!bookId) return;

    Alert.alert(
      t('book_detail_delete_title'),
      t('book_detail_delete_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('book_detail_delete_button'),
          style: 'destructive',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/books');
            }
            deleteBook(bookId);
          }
        }
      ]
    );
  };

  const statuses: BookStatus[] = ['Okunacak', 'Okunuyor', 'Okundu'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('book_detail_title')}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Trash2 size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{book.author}</Text>

            <View style={styles.tagsContainer}>
              <View style={[styles.tagChip, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>{book.genre || t('general')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.compareButton, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setPriceModalVisible(true)}
            >
              <ShoppingCart size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.compareButtonText, { color: colors.primary }]}>{t('price_compare')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>{t('book_detail_status')}</Text>
            <View style={styles.statusContainer}>
              {statuses.map((s) => {
                const isActive = book.status === s;
                // Active Colors
                const activeBg = isDarkMode ? '#1E293B' : '#334155';
                const activeBorder = isDarkMode ? colors.primary : '#334155';

                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      isActive
                        ? { backgroundColor: activeBg, borderWidth: 1.5, borderColor: activeBorder }
                        : { borderWidth: 1, borderColor: colors.border }
                    ]}
                    onPress={() => handleStatusChange(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary }
                    ]}>
                      {t(s === 'Okundu' ? 'read' : s === 'Okunuyor' ? 'reading' : 'to_read')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.sectionLabel, { color: colors.sectionHeader, marginBottom: 0 }]}>{t('book_detail_progress')}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', color: colors.textSecondary, fontSize: 14 }}>
                {book.currentPage || 0} / {book.pageCount || 0} {t('book_detail_pages')}
              </Text>
            </View>

            <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Progress Bar */}
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(((book.currentPage || 0) / (book.pageCount || 1)) * 100, 100)}%`,
                      backgroundColor: book.status === 'Okundu' ? '#4CAF50' : colors.primary
                    }
                  ]}
                />
              </View>

              {/* Inputs */}
              <View style={styles.progressInputsRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('book_detail_current_page')}</Text>
                  <TextInput
                    style={[styles.progressInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                    value={String(currentPage)}
                    onChangeText={(text) => handleProgressChange(text, String(pageCount))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('book_detail_total_pages')}</Text>
                  <TextInput
                    style={[styles.progressInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                    value={String(pageCount)}
                    onChangeText={(text) => handleProgressChange(String(currentPage), text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>{t('book_detail_notes')}</Text>
            <View style={[styles.notesContainer, { backgroundColor: colors.noteBackground }]}>
              <TextInput
                style={[styles.notesInput, { color: colors.text }]}
                placeholder={t('book_detail_notes_placeholder')}
                placeholderTextColor={colors.placeholder}
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={handleNotesChange}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PriceComparisonModal
        visible={isPriceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        bookTitle={book.title}
        bookAuthor={book.author}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  iconButton: { padding: 8 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  imageContainer: { alignItems: 'center', marginTop: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  coverImage: { width: 180, height: 270, borderRadius: 12, backgroundColor: '#E0E0E0' },
  infoContainer: { alignItems: 'center', marginBottom: 32 },
  bookTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, marginBottom: 8, textAlign: 'center' },
  bookAuthor: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tagChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  compareButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 16 },
  compareButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  sectionContainer: { marginBottom: 24 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 12 },
  statusContainer: { flexDirection: 'row', gap: 12 },
  statusButton: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  statusButtonActive: { borderColor: 'transparent' },
  statusButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  notesContainer: { borderRadius: 16, padding: 16, minHeight: 150 },
  notesInput: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, height: '100%' },
  progressCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  progressBarBg: { height: 8, borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressInputsRow: { flexDirection: 'row' },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 8 },
  progressInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
