import { createMMKV } from "react-native-mmkv";

const mmkvStorage = createMMKV();
const MIGRATION_FLAG_KEY = "mmkv_migration_completed";

/**
 * Migration durumunu kontrol et
 */
export function hasMigratedToMMKV(): boolean {
  return mmkvStorage.getBoolean(MIGRATION_FLAG_KEY) === true;
}

/**
 * Migration flag'ini temizle (rollback için)
 */
export function clearMigrationFlag(): void {
  mmkvStorage.remove(MIGRATION_FLAG_KEY);
}
