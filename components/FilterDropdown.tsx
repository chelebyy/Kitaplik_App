import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Pressable,
  Platform
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface FilterDropdownProps {
  label: string;
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function FilterDropdown({ 
  label, 
  items, 
  selectedValue, 
  onValueChange 
}: FilterDropdownProps) {
  const { colors, isDarkMode } = useTheme();
  const [visible, setVisible] = useState(false);

  const handleSelect = (item: string) => {
    onValueChange(item);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.triggerButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          <Text style={[styles.triggerLabel, { color: colors.textSecondary }]}>{label}:</Text>
          <Text style={[styles.triggerValue, { color: colors.primary }]} numberOfLines={1}>
            {selectedValue}
          </Text>
        </View>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{label} Seçin</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item === selectedValue;
                return (
                  <TouchableOpacity 
                    style={[
                      styles.item, 
                      isSelected && { backgroundColor: isDarkMode ? '#333' : '#F0F9F0' }
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[
                      styles.itemText, 
                      { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '400' }
                    ]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 150,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  triggerLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginRight: 6,
  },
  triggerValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
});
