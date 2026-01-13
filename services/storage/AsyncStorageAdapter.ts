import AsyncStorage from "@react-native-async-storage/async-storage";
import { IStorageAdapter } from "./IStorageAdapter";
import { logError } from "../../utils/errorUtils";

/**
 * AsyncStorageAdapter - AsyncStorage için IStorageAdapter implementasyonu
 *
 * Mevcut AsyncStorage çağrılarını soyutlayan adapter.
 * JSON serialize/deserialize işlemlerini otomatik yapar.
 */
export class AsyncStorageAdapter implements IStorageAdapter {
  /**
   * Belirtilen key için değer al
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logError(`AsyncStorageAdapter.getItem(${key})`, error);
      return null;
    }
  }

  /**
   * Belirtilen key için değer kaydet
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      logError(`AsyncStorageAdapter.setItem(${key})`, error);
      throw error;
    }
  }

  /**
   * Belirtilen key'i sil
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logError(`AsyncStorageAdapter.removeItem(${key})`, error);
      throw error;
    }
  }
}
