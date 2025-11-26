import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { X, Sparkles, BookOpen, Globe, Check, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Book, useBooks } from '../context/BooksContext';
import { RecommendationService } from '../services/RecommendationService';
import { useRouter } from 'expo-router';

interface RecommendationModalProps {
    visible: boolean;
    onClose: () => void;
}

type Step = 'selection' | 'loading' | 'result';

export default function RecommendationModal({ visible, onClose }: RecommendationModalProps) {
    const { colors, isDarkMode } = useTheme();
    const { books, addBook, updateBookStatus } = useBooks();
    const router = useRouter();

    const [step, setStep] = useState<Step>('selection');
    const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
    const [source, setSource] = useState<'library' | 'external'>('library');
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setStep('selection');
        setRecommendedBook(null);
        setError(null);
        onClose();
    };

    const handleGetLocalRecommendation = () => {
        setStep('loading');
        setSource('library');

        // Simulate a short delay for "magic" effect
        setTimeout(() => {
            const book = RecommendationService.getRandomFromLibrary(books);
            if (book) {
                setRecommendedBook(book);
                setStep('result');
            } else {
                setError('Okunacak listenizde hiç kitap yok!');
                setStep('result');
            }
        }, 1500);
    };

    const handleGetExternalRecommendation = async () => {
        setStep('loading');
        setSource('external');

        const favoriteGenre = RecommendationService.getFavoriteGenre(books);

        try {
            const book = await RecommendationService.getDiscoveryRecommendation(favoriteGenre);
            if (book) {
                // Check if we already have this book (by title match roughly)
                const exists = books.some(b => b.title.toLowerCase() === book.title.toLowerCase());
                if (exists) {
                    // Retry once if duplicate
                    const retryBook = await RecommendationService.getDiscoveryRecommendation(favoriteGenre);
                    setRecommendedBook(retryBook || book);
                } else {
                    setRecommendedBook(book);
                }
                setStep('result');
            } else {
                setError('Öneri bulunamadı. İnternet bağlantınızı kontrol edin.');
                setStep('result');
            }
        } catch (e) {
            setError('Bir hata oluştu.');
            setStep('result');
        }
    };

    const handleAction = () => {
        if (!recommendedBook) return;

        if (source === 'library') {
            // If local, maybe update status to 'Okunuyor' or just go to detail
            updateBookStatus(recommendedBook.id, 'Okunuyor');
            handleClose();
            router.push({ pathname: '/book-detail', params: { id: recommendedBook.id } });
        } else {
            // If external, add to library
            addBook({
                title: recommendedBook.title,
                author: recommendedBook.author,
                status: 'Okunacak',
                coverUrl: recommendedBook.coverUrl,
                genre: recommendedBook.genre,
                notes: recommendedBook.notes
            });
            handleClose();
            // Navigate to the new book (we'd need the new ID, but for now just closing is fine, or we can find it by title)
            // Simple UX: just close and show success toast (or just close)
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Sparkles size={20} color="#F79009" style={{ marginRight: 8 }} />
                            <Text style={[styles.title, { color: colors.text }]}>Sihirli Öneri</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {step === 'selection' && (
                            <View style={styles.selectionContainer}>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Bugün ne okumak istersiniz?
                                </Text>

                                <TouchableOpacity
                                    style={[styles.optionCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}
                                    onPress={handleGetLocalRecommendation}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                                        <BookOpen size={24} color="#0284C7" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>Rafımdan Seç</Text>
                                        <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                            "Okunacak" listenizden rastgele bir kitap.
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.optionCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}
                                    onPress={handleGetExternalRecommendation}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                                        <Globe size={24} color="#9333EA" />
                                    </View>
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>Yeni Keşfet</Text>
                                        <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                            Zevkinize uygun yeni bir kitap önerisi.
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 'loading' && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    {source === 'library' ? 'Raflar karıştırılıyor...' : 'Dünya taranıyor...'}
                                </Text>
                            </View>
                        )}

                        {step === 'result' && (
                            <View style={styles.resultContainer}>
                                {error ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                                        <TouchableOpacity
                                            style={[styles.retryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                            onPress={() => setStep('selection')}
                                        >
                                            <RefreshCw size={16} color={colors.text} style={{ marginRight: 6 }} />
                                            <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Tekrar Dene</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    recommendedBook && (
                                        <>
                                            <View style={styles.bookPreview}>
                                                <Image
                                                    source={{ uri: recommendedBook.coverUrl }}
                                                    style={styles.bookCover}
                                                    resizeMode="cover"
                                                />
                                                <Text style={[styles.bookTitle, { color: colors.text }]}>{recommendedBook.title}</Text>
                                                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{recommendedBook.author}</Text>
                                                <View style={[styles.genreTag, { backgroundColor: isDarkMode ? '#333' : '#F1F5F9' }]}>
                                                    <Text style={[styles.genreText, { color: colors.textSecondary }]}>{recommendedBook.genre}</Text>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                                onPress={handleAction}
                                            >
                                                {source === 'library' ? (
                                                    <>
                                                        <BookOpen size={18} color="#FFF" style={{ marginRight: 8 }} />
                                                        <Text style={styles.actionButtonText}>Okumaya Başla</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} color="#FFF" style={{ marginRight: 8 }} />
                                                        <Text style={styles.actionButtonText}>Kütüphaneme Ekle</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{ marginTop: 12 }}
                                                onPress={() => setStep('selection')}
                                            >
                                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Başka bir tane seç</Text>
                                            </TouchableOpacity>
                                        </>
                                    )
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 24,
        minHeight: 300,
        justifyContent: 'center',
    },
    selectionContainer: {
        gap: 16,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Inter_400Regular',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontFamily: 'Inter_500Medium',
    },
    resultContainer: {
        alignItems: 'center',
    },
    bookPreview: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bookCover: {
        width: 100,
        height: 150,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    bookTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginBottom: 12,
    },
    genreTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    genreText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Inter_500Medium',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    }
});
