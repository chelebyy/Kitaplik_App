import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, ExternalLink, ShoppingCart, Search, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PriceService, StoreLink } from '../services/PriceService';

interface PriceComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor?: string;
  isbn?: string;
}

// Fiyat karşılaştırma siteleri
const COMPARISON_SITES = [
  {
    id: 'google',
    name: 'Google Shopping',
    color: '#4285F4',
    getUrl: (query: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`
  },
  {
    id: 'akakce',
    name: 'Akakçe',
    color: '#FF6B00',
    getUrl: (query: string) => `https://www.akakce.com/arama/?q=${encodeURIComponent(query)}`
  },
  {
    id: 'cimri',
    name: 'Cimri',
    color: '#00C853',
    getUrl: (query: string) => `https://www.cimri.com/arama?q=${encodeURIComponent(query)}`
  }
];

export default function PriceComparisonModal({
  visible,
  onClose,
  bookTitle,
  bookAuthor,
  isbn
}: PriceComparisonModalProps) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const storeLinks = PriceService.getStoreLinks(bookTitle, isbn, bookAuthor);
  const searchQuery = `${bookTitle}${bookAuthor ? ' ' + bookAuthor : ''} kitap`;

  const openComparisonSite = (site: typeof COMPARISON_SITES[0]) => {
    Linking.openURL(site.getUrl(searchQuery));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('compare_options')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Fiyat Karşılaştırma Bölümü */}
            <View style={[styles.comparisonSection, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
              <View style={styles.comparisonHeader}>
                <TrendingDown size={20} color={colors.primary} />
                <Text style={[styles.comparisonTitle, { color: colors.text }]}>
                  {t('compare_prices') || 'Fiyatları Karşılaştır'}
                </Text>
              </View>
              <Text style={[styles.comparisonSubtitle, { color: colors.textSecondary }]}>
                {t('compare_prices_desc') || 'En uygun fiyatı bulmak için karşılaştırma sitelerini kullanın'}
              </Text>
              
              <View style={styles.comparisonButtons}>
                {COMPARISON_SITES.map((site) => (
                  <TouchableOpacity
                    key={site.id}
                    style={[styles.comparisonButton, { backgroundColor: site.color }]}
                    onPress={() => openComparisonSite(site)}
                  >
                    <Search size={16} color="#FFF" />
                    <Text style={styles.comparisonButtonText}>{site.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mağaza Linkleri Bölümü */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('or_go_directly') || 'veya doğrudan mağazaya git'}
            </Text>

            {storeLinks.map((link: StoreLink, index: number) => (
              <View
                key={index}
                style={[styles.storeItem, { borderColor: colors.border, backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}
              >
                <View style={styles.storeRow}>
                  <View style={styles.storeInfo}>
                    <View style={[styles.storeIconPlaceholder, { backgroundColor: link.store.logoColor }]}>
                       <ShoppingCart size={20} color="#FFF" />
                    </View>
                    <Text style={[styles.storeName, { color: colors.text }]}>{link.store.name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.goButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => PriceService.openStore(link.url)}
                  >
                    <Text style={[styles.actionText, { color: colors.primary }]}>{t('go_to_store')}</Text>
                    <ExternalLink size={14} color={colors.primary} style={{marginLeft: 4}} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  // Fiyat Karşılaştırma Bölümü
  comparisonSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  comparisonSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  comparisonButtons: {
    marginTop: 8,
    gap: 12,
  },
  comparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comparisonButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  // Mağaza Linkleri
  storeItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  }
});
