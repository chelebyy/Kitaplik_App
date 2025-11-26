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
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBooks, BookStatus } from '../context/BooksContext';

export default function BookDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { getBookById, updateBookStatus, updateBookNotes, deleteBook } = useBooks();
  
  // params.id'yi güvenli bir şekilde al
  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Kitap verisini al
  const book = getBookById(bookId || '');

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (book) {
      setNotes(book.notes || '');
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
          <Text style={{ color: colors.text }}>Kitap bulunamadı veya silindi.</Text>
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

  const handleDelete = () => {
    if (!bookId) return;

    Alert.alert(
      'Kitabı Sil',
      'Bu kitabı kütüphanenizden silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: () => {
            // Önce sayfadan çık, sonra silme işlemini gerçekleştir
            // Bu sıralama kullanıcı deneyimi açısından daha akıcıdır
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/books');
            }
            
            // Navigasyon başladıktan hemen sonra sil
            // setTimeout kullanmadan doğrudan çağırıyoruz, context güncellemesi arkaplanda olur
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kitap Detayı</Text>
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
                <Text style={[styles.tagText, { color: colors.text }]}>{book.genre || 'Genel'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>Durum</Text>
            <View style={[styles.statusContainer, { backgroundColor: colors.chipBackground }]}>
              {statuses.map((s) => {
                const isActive = book.status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      isActive && styles.statusButtonActive
                    ]}
                    onPress={() => handleStatusChange(s)}
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

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.sectionHeader }]}>Notlarım</Text>
            <View style={[styles.notesContainer, { backgroundColor: colors.noteBackground }]}>
              <TextInput
                style={[styles.notesInput, { color: colors.text }]}
                placeholder="Kitapla ilgili notlarınızı, alıntılarınızı veya düşüncelerinizi buraya ekleyin..."
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  iconButton: { padding: 8 }, // Tıklama alanını artırdım
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  imageContainer: { alignItems: 'center', marginTop: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  coverImage: { width: 180, height: 270, borderRadius: 12, backgroundColor: '#E0E0E0' },
  infoContainer: { alignItems: 'center', marginBottom: 32 },
  bookTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, marginBottom: 8, textAlign: 'center' },
  bookAuthor: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tagChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 12 },
  statusContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, height: 48 },
  statusButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  statusButtonActive: { backgroundColor: '#1E88E5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statusButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  notesContainer: { borderRadius: 16, padding: 16, minHeight: 150 },
  notesInput: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, height: '100%' },
});
