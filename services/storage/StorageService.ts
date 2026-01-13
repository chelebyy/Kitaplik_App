import { IStorageAdapter } from "./IStorageAdapter";
import { AsyncStorageAdapter } from "./AsyncStorageAdapter";

/**
 * StorageService - Storage Factory
 *
 * Aktif storage adapter'ı yöneten singleton.
 * MMKV geçişinde sadece bu dosyayı değiştirmek yeterli.
 *
 * @example
 * ```ts
 * // Değer al
 * const books = await StorageService.getItem<Book[]>("books");
 *
 * // Değer kaydet
 * await StorageService.setItem("books", books);
 *
 * // Değer sil
 * await StorageService.removeItem("books");
 * ```
 */
class StorageServiceClass implements IStorageAdapter {
  private adapter: IStorageAdapter;

  constructor() {
    // Varsayılan: AsyncStorage
    // MMKV geçişinde: new MMKVAdapter()
    this.adapter = new AsyncStorageAdapter();
  }

  /**
   * Adapter'ı değiştir (test veya migration için)
   */
  setAdapter(adapter: IStorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Mevcut adapter'ı al
   */
  getAdapter(): IStorageAdapter {
    return this.adapter;
  }

  // IStorageAdapter delegation
  async getItem<T>(key: string): Promise<T | null> {
    return this.adapter.getItem<T>(key);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    return this.adapter.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return this.adapter.removeItem(key);
  }
}

// Singleton export
export const StorageService = new StorageServiceClass();
