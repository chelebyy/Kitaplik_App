import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { X, Sparkles, BookOpen, Globe, Check, RefreshCw, Coins, PlayCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Book, useBooks } from '../context/BooksContext';
import { RecommendationService } from '../services/RecommendationService';
import { useCredits } from '../context/CreditsContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';

// Kullanıcının verdiği Unit ID (App ID formatında verilmiş olsa da istek üzerine buraya ekleniyor)
// Geliştirme ortamında TestIds.REWARDED kullanılır.
const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-6110532791964487~7550541087';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    keywords: ['fashion', 'clothing'],
});

interface RecommendationModalProps {
    visible: boolean;
    onClose: () => void;
}

type Step = 'selection' | 'loading' | 'result';

export default function RecommendationModal({ visible, onClose }: RecommendationModalProps) {
    const { colors, isDarkMode } = useTheme();
    const { books, addBook, updateBookStatus } = useBooks();
    const router = useRouter();
    const { t } = useTranslation();
    const { credits, addCredits, spendCredits } = useCredits();

    const [step, setStep] = useState<Step>('selection');
    const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
    const [source, setSource] = useState<'library' | 'external'>('library');
    const [error, setError] = useState<string | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);


    React.useEffect(() => {
        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            console.log('Ad Loaded');
            setAdLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                addCredits(1);
            },
        );
        const unsubscribeError = rewarded.addAdEventListener(
            AdEventType.ERROR,
            error => {
                console.error('Ad failed to load: ', error);
                setAdLoaded(false);
            }
        );

        // Start loading the rewarded ad straight away
        rewarded.load();

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeError();
        };
    }, []);

    const handleEarnCredit = () => {
        if (adLoaded) {
            rewarded.show();
            // Reklam gösterildikten sonra tekrar yükle
            setAdLoaded(false);
            // Show is usually immediate, loading next one should happen after close or earned, 
            // but the library handles reload requests. 
            // Note: calling load() immediately after show() might be too early for some networks, 
            // but standard practice is often to load in the background.
            // Better to load a new one after the current one finishes or closes.
            // For simplicity, we just set loaded false. The event listener (EARNED/CLOSED) should probably trigger reload.
            // But let's keep it simple: just mark false.
            rewarded.load();
        } else {
            // Reklam hazır değilse, yüklemeyi dene ve kullanıcıya bilgi ver
            console.log('Ad not ready');
            Alert.alert(t('attention', { defaultValue: 'Dikkat' }), t('ad_not_ready', { defaultValue: 'Reklam henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin.' }));
            rewarded.load();
        }
    };

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
                setError(t('recommendation_error_no_books'));
                setStep('result');
            }
        }, 1500);
    };

    const handleGetExternalRecommendation = async () => {
        if (credits < 1) {
            // Optional: Alert user or show modal
            Alert.alert(
                t('attention', { defaultValue: 'Dikkat' }),
                t('insufficient_credit', { defaultValue: 'Bu işlem için krediniz yetersiz. Lütfen reklam izleyerek kredi kazanın.' })
            );
            return;
        }

        const success = await spendCredits(1);
        if (!success) return; // Should not happen given check above, but safely handle it

        setStep('loading');
        setSource('external');

        const favoriteGenre = RecommendationService.getFavoriteGenre(books);
        const excludedTitles = books.map(b => b.title);

        try {
            const book = await RecommendationService.getDiscoveryRecommendation(favoriteGenre, excludedTitles);
            if (book) {
                setRecommendedBook(book);
                setStep('result');
            } else {
                setError(t('recommendation_error_not_found'));
                setStep('result');
            }
        } catch (e) {
            setError(t('recommendation_error_generic'));
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
                notes: recommendedBook.notes,
                pageCount: recommendedBook.pageCount,
                currentPage: recommendedBook.currentPage
            });
            handleClose();
            // Navigate to the new book (we'd need the new ID, but for now just closing is fine, or we can find it by title)
            // Simple UX: just close and show success toast (or just close)
        }
    };

    const handleRetry = () => {
        if (source === 'library') {
            handleGetLocalRecommendation();
        } else {
            handleGetExternalRecommendation();
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
                            <Text style={[styles.title, { color: colors.text }]}>{t('recommendation_title')}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.creditContainer}>
                                <Coins size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                                <Text style={[styles.creditText, { color: colors.text }]}>
                                    {t('credit_balance', { count: credits })}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {step === 'selection' && (
                            <View style={styles.selectionContainer}>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    {t('recommendation_subtitle')}
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
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>{t('recommendation_library')}</Text>
                                        <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                            {t('recommendation_library_desc')}
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
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>{t('recommendation_discover')}</Text>
                                        <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                            {t('recommendation_discover_desc')}
                                        </Text>
                                    </View>
                                    <View style={styles.costBadge}>
                                        <Text style={styles.costText}>{t('cost_1_credit')}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.earnCreditButton, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                                    onPress={handleEarnCredit}
                                    activeOpacity={0.8}
                                >
                                    <PlayCircle size={20} color="#16A34A" style={{ marginRight: 8 }} />
                                    <Text style={[styles.earnCreditText, { color: '#15803D' }]}>{t('earn_credit')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 'loading' && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    {source === 'library' ? t('recommendation_loading_library') : t('recommendation_loading_discover')}
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
                                            <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>{t('recommendation_retry')}</Text>
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
                                                        <Text style={styles.actionButtonText}>{t('recommendation_start_reading')}</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} color="#FFF" style={{ marginRight: 8 }} />
                                                        <Text style={styles.actionButtonText}>{t('recommendation_add_library')}</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={{ marginTop: 12 }}
                                                onPress={handleRetry}
                                            >
                                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t('recommendation_try_another')}</Text>
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    creditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    creditText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#B45309'
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexShrink: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        flexShrink: 1,
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
    costBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    costText: {
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        color: '#B45309',
    },
    earnCreditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    earnCreditText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
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
