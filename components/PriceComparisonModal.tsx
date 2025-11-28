import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, ExternalLink, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PriceService } from '../services/PriceService';

interface PriceComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor?: string;
  isbn?: string;
}

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
            {storeLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.storeItem, { borderColor: colors.border, backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}
                onPress={() => PriceService.openStore(link.url)}
              >
                <View style={styles.storeInfo}>
                  <View style={[styles.storeIconPlaceholder, { backgroundColor: link.store.logoColor }]}>
                     <ShoppingCart size={20} color="#FFF" />
                  </View>
                  <Text style={[styles.storeName, { color: colors.text }]}>{link.store.name}</Text>
                </View>
                <View style={styles.actionRow}>
                    <Text style={[styles.actionText, { color: colors.primary }]}>{t('go_to_store')}</Text>
                    <ExternalLink size={16} color={colors.primary} style={{marginLeft: 4}} />
                </View>
              </TouchableOpacity>
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
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  actionText: {
      fontSize: 14,
      fontWeight: '500',
  }
});
