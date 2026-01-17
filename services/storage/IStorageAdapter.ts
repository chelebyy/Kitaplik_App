/**
 * IStorageAdapter - Storage soyutlama interface'i
 *
 * MMKV, Supabase veya diğer storage çözümlerine
 * geçişi kolaylaştırmak için ortak interface.
 */
export interface IStorageAdapter {
  /**
   * Belirtilen key için değer al
   * @param key Storage key
   * @returns Parsed value veya null
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * Belirtilen key için değer kaydet
   * @param key Storage key
   * @param value Kaydedilecek değer (JSON serialize edilir)
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * Belirtilen key'i sil
   * @param key Storage key
   */
  removeItem(key: string): Promise<void>;

  /**
   * Tüm storage key'lerini al
   * @returns Tüm key listesi
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Tüm storage'ı temizle
   */
  clear(): Promise<void>;
}
