import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CloudUpload, 
  History, 
  Info, 
  FileText, 
  ChevronRight 
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useTheme();

  const handleAction = (action: string) => {
    Alert.alert('Bilgi', `${action} özelliği yakında eklenecek.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: VERİ YÖNETİMİ */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>VERİ YÖNETİMİ</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => handleAction('Verileri Yedekle')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
                <CloudUpload size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Verileri Yedekle</Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
            
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => handleAction('Verileri Geri Yükle')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
                <History size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Verileri Geri Yükle</Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

        {/* GÖRÜNÜM bölümü Ana Sayfaya taşındığı için buradan kaldırıldı */}

        {/* Section: DİĞER */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>DİĞER</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
                <Info size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Uygulama Sürümü</Text>
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
            
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.row} 
              activeOpacity={0.7}
              onPress={() => handleAction('Hakkında')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
                <FileText size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Hakkında</Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowLabel: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  versionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  separator: {
    height: 1,
    marginLeft: 56, 
  },
});
