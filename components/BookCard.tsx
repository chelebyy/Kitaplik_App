import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Book } from '../context/BooksContext';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

interface BookCardProps {
    book: Book;
    variant?: 'list' | 'grid';
    onPress?: () => void;
    onPressId?: (id: string) => void;
    showProgress?: boolean;
}

// ... imports unchanged

export const BookCard = React.memo(({
    book,
    variant = 'list',
    onPress,
    onPressId,
    showProgress = true
}: BookCardProps) => {
    // ... implementation unchanged
    const { t } = useTranslation();
    const { colors, isDarkMode } = useTheme();

    const handlePress = React.useCallback(() => {
        if (onPress) onPress();
        if (onPressId) onPressId(book.id);
    }, [onPress, onPressId, book.id]);

    // Progress logic
    const progressPercent = book.pageCount && book.currentPage
        ? Math.min(Math.max(book.currentPage / book.pageCount, 0), 1)
        : (book.progress || 0);

    const progressText = book.status === 'Okundu'
        ? t('read') // Okundu
        : book.status === 'Okunacak'
            ? t('to_read') // Okunacak
            : `%${Math.round(progressPercent * 100)}`;

    const isReading = book.status === 'Okunuyor';

    // Status Colors (matching index.tsx logic)
    const getStatusColor = () => {
        switch (book.status) {
            case 'Okundu': return '#4CAF50'; // Green
            case 'Okunuyor': return colors.primary; // Blue/Theme
            case 'Okunacak': return colors.textSecondary; // Grey
            default: return colors.textSecondary;
        }
    };

    const getStatusLabel = () => {
        switch (book.status) {
            case 'Okunuyor': return t('reading');
            case 'Okundu': return t('read');
            case 'Okunacak': return t('to_read');
            default: return book.status;
        }
    };

    if (variant === 'grid') {
        return (
            <Pressable
                onPress={handlePress}
                className={cn(
                    "mb-4 rounded-xl overflow-hidden shadow-sm",
                    isDarkMode ? "bg-slate-800" : "bg-white"
                )}
                style={{
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                }}
                accessibilityRole="button"
                accessibilityLabel={`${book.title}, ${book.author}`}
                accessibilityHint={t('book_detail_hint')}
            >
                <View className="relative">
                    <Image
                        source={{ uri: book.coverUrl || 'https://via.placeholder.com/150' }}
                        className="w-full h-48 bg-slate-200"
                        resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 px-2 py-1 rounded-md" style={{ backgroundColor: getStatusColor() }}>
                        <Text className="text-[10px] font-bold text-white">{getStatusLabel()}</Text>
                    </View>
                </View>

                <View className="p-3">
                    <Text
                        className={cn("text-sm font-bold mb-1", isDarkMode ? "text-white" : "text-slate-900")}
                        numberOfLines={1}
                    >
                        {book.title}
                    </Text>
                    <Text
                        className="text-xs text-slate-500 font-medium"
                        numberOfLines={1}
                    >
                        {book.author}
                    </Text>

                    {/* Progress Bar for Grid - tüm durumlar için */}
                    {showProgress && (
                        <View className="mt-2">
                            <View className={cn("h-1 rounded-full overflow-hidden", isDarkMode ? "bg-gray-700" : "bg-gray-100")}>
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%`,
                                        backgroundColor: getStatusColor()
                                    }}
                                />
                            </View>
                            <View className="flex-row justify-between items-center mt-1">
                                <Text className="text-[10px] text-slate-400 font-medium">
                                    {getStatusLabel()}
                                </Text>
                                {isReading && (
                                    <Text className="text-[10px] text-slate-400 font-medium">
                                        {`%${Math.round(progressPercent * 100)}`}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    // List Variant (Default)
    return (
        <Pressable
            onPress={handlePress}
            className={cn(
                "flex-row p-4 mb-4 rounded-2xl border shadow-sm",
                isDarkMode ? "bg-slate-800 border-purple-500/30" : "bg-white border-pink-500/20"
            )}
            style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4
            }}
            accessibilityRole="button"
            accessibilityLabel={`${book.title}, ${book.author}, ${getStatusLabel()}`}
            accessibilityHint={t('book_detail_hint')}
        >
            {/* Cover */}
            <View className="mr-4 shadow-sm">
                <Image
                    source={{ uri: book.coverUrl || 'https://via.placeholder.com/100x150' }}
                    className="w-16 h-24 rounded-md bg-slate-200"
                    resizeMode="cover"
                />
            </View>

            {/* Content */}
            <View className="flex-1 justify-between py-0.5">
                <View>
                    <Text
                        className={cn("text-base font-bold mb-1", isDarkMode ? "text-white" : "text-slate-900")}
                        numberOfLines={1}
                    >
                        {book.title}
                    </Text>
                    <Text
                        className="text-sm text-slate-500 font-medium"
                        numberOfLines={1}
                    >
                        {book.author}
                    </Text>
                </View>

                {/* Progress & Status */}
                <View className="mt-2">

                    {/* Progress Bar Background */}
                    <View className={cn("h-1.5 rounded-full mb-1.5 overflow-hidden", isDarkMode ? "bg-gray-700" : "bg-gray-100")}>
                        <View
                            className="h-full rounded-full"
                            style={{
                                width: `${Math.min(Math.max(progressPercent * 100, 0), 100)}%`,
                                backgroundColor: getStatusColor()
                            }}
                        />
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-slate-500 font-normal">
                            {t('status_label')}: <Text className={cn("font-semibold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{getStatusLabel()}</Text>
                        </Text>

                        {isReading && (
                            <Text className="text-[11px] text-slate-400 font-medium">
                                {progressText}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
});
