/**
 * Scraper Test Ekranı
 * Bu ekran sadece geliştirme amaçlıdır.
 * Cimri ve Akakçe'den veri çekilip çekilemeyeceğini test eder.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { ScraperTestService, ScraperTestResult } from '../services/ScraperTestService';

export default function ScraperTestScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('Harry Potter');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScraperTestResult[]>([]);

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const testResults = await ScraperTestService.runAllTests(searchQuery);
      setResults(testResults);
    } catch (error) {
      console.error('Test hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>🧪 Scraper Test</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Açıklama */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Bu ekran, Cimri ve Akakçe sitelerinden fiyat verisi çekilip çekilemeyeceğini test eder.
            {'\n\n'}
            Konsol loglarını (Metro terminal) kontrol edin.
          </Text>
        </View>

        {/* Arama Input */}
        <Text style={[styles.label, { color: colors.text }]}>Arama Terimi:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Kitap adı girin..."
          placeholderTextColor={colors.textSecondary}
        />

        {/* Test Butonu */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={runTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Play size={20} color="#FFF" />
              <Text style={styles.testButtonText}>Testi Başlat</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sonuçlar */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Sonuçlar:</Text>
            
            {results.map((result, index) => (
              <View 
                key={index} 
                style={[
                  styles.resultCard, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: result.success ? '#10B981' : '#EF4444',
                    borderWidth: 2,
                  }
                ]}
              >
                <View style={styles.resultHeader}>
                  {result.success ? (
                    <CheckCircle size={24} color="#10B981" />
                  ) : (
                    <XCircle size={24} color="#EF4444" />
                  )}
                  <Text style={[styles.resultSite, { color: colors.text }]}>
                    {result.site}
                  </Text>
                  <Text style={[
                    styles.resultStatus, 
                    { color: result.success ? '#10B981' : '#EF4444' }
                  ]}>
                    {result.success ? 'BAŞARILI' : 'BAŞARISIZ'}
                  </Text>
                </View>

                {result.success ? (
                  <View style={styles.resultDetails}>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      HTML Boyutu: {result.htmlLength?.toLocaleString()} karakter
                    </Text>
                    {result.priceFound && (
                      <Text style={[styles.priceText, { color: '#10B981' }]}>
                        Bulunan Fiyat: {result.priceFound}
                      </Text>
                    )}
                    <Text style={[styles.sampleText, { color: colors.textSecondary }]} numberOfLines={3}>
                      Örnek: {result.sampleContent?.substring(0, 150)}...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>
                    Hata: {result.error}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Konsol Notu */}
        <View style={[styles.noteBox, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.noteText}>
            💡 Detaylı loglar için Metro terminal'i kontrol edin.
            {'\n'}
            "[ScraperTest]" ile başlayan satırları arayın.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultSite: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sampleText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
  },
  noteBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});
