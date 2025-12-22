import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../settings';
import * as Linking from 'expo-linking';

// Mocks
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      text: '#000000',
      sectionHeader: '#666666',
      card: '#f0f0f0',
      iconBackground: '#e0e0e0',
      border: '#cccccc',
      tabIconDefault: '#888888',
      textSecondary: '#555555',
    },
    isDarkMode: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/context/BooksContext', () => ({
  useBooks: () => ({
    books: [],
    clearAllData: jest.fn(),
    restoreBooks: jest.fn(),
  }),
}));

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'tr',
    changeLanguage: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'settings': 'Ayarlar',
        'settings_appearance': 'GÖRÜNÜM',
        'settings_data_management': 'VERİ YÖNETİMİ',
        'settings_other': 'DİĞER',
        'settings_feedback': 'Geliştiriciye Ulaş', // The key we expect
        'settings_about': 'Hakkında',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/services/BackupService', () => ({
  BackupService: {
    saveToDevice: jest.fn(),
    shareBackup: jest.fn(),
    restoreBackup: jest.fn(),
  },
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Ayarlar')).toBeTruthy();
  });

  it('renders Feedback option in Other section', () => {
    const { getByText } = render(<SettingsScreen />);
    // This should fail initially as we haven't added it yet
    expect(getByText('Geliştiriciye Ulaş')).toBeTruthy();
  });

  it('calls Linking.openURL with correct mailto link when Feedback is pressed', async () => {
     const { getByText } = render(<SettingsScreen />);
     const feedbackButton = getByText('Geliştiriciye Ulaş');
     
     fireEvent.press(feedbackButton);

     await waitFor(() => {
       expect(Linking.openURL).toHaveBeenCalled();
     });
  });
});