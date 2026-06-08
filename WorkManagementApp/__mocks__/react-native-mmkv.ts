/* eslint-disable */
/**
 * react-native-mmkv のテスト用モック。
 * 実 MMKV の代わりにインメモリ Map で同期 API を再現する。
 * jest が node_modules を自動置換する（ルート __mocks__/）。
 */

export class MMKV {
  private store = new Map<string, string>();

  constructor(_opts?: { id?: string; path?: string; encryptionKey?: string }) {}

  getString(key: string): string | undefined {
    return this.store.get(key);
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clearAll(): void {
    this.store.clear();
  }
}
