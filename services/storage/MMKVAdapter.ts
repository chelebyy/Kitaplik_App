import { createMMKV } from 'react-native-mmkv';
import { IStorageAdapter } from './IStorageAdapter';
import { logError } from '../../utils/errorUtils';

// MMKV instance - şifreleme yok (kullanıcı kararı)
const storage = createMMKV();

/**
 * MMKVAdapter - MMKV için IStorageAdapter implementasyonu
 *
 * AsyncStorage'a göre ~30x daha hızlı storage çözümü.
 * JSON serialize/deserialize işlemlerini otomatik yapar.
 */
export class MMKVAdapter implements IStorageAdapter {
  /**
   * Belirtilen key için değer al
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const json = storage.getString(key);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      logError(`MMKVAdapter.getItem(${key})`, error);
      return null;
    }
  }

  /**
   * Belirtilen key için değer kaydet
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      logError(`MMKVAdapter.setItem(${key})`, error);
      throw error;
    }
  }

  /**
   * Belirtilen key'i sil
   */
  async removeItem(key: string): Promise<void> {
    try {
      storage.remove(key);
    } catch (error) {
      logError(`MMKVAdapter.removeItem(${key})`, error);
      throw error;
    }
  }

  /**
   * Tüm storage key'lerini al
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return storage.getAllKeys();
    } catch (error) {
      logError('MMKVAdapter.getAllKeys', error);
      return [];
    }
  }

  /**
   * Tüm storage'ı temizle
   */
  async clear(): Promise<void> {
    try {
      storage.clearAll();
    } catch (error) {
      logError('MMKVAdapter.clear', error);
      throw error;
    }
  }
}
