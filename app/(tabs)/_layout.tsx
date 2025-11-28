import { Tabs } from 'expo-router';
import { Home, Book, Settings } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarBackground: () => (
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#27221F'] : ['#FFFFFF', '#FFF7ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderTopWidth: 1,
              borderTopColor: isDarkMode ? '#334155' : '#E2E8F0',
            }}
          />
        ),
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Home
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: t('books'),
          tabBarIcon: ({ color, size, focused }) => (
            <Book
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <Settings
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
