/**
 * Jest グローバルセットアップ。
 * - Testing Library のカスタムマッチャを読み込む
 * - ネイティブ専用モジュール（SecureStore など）の既定モックを登録する
 *   （MMKV / NetInfo / @supabase/supabase-js はルート __mocks__/ で自動適用）
 */
import '@testing-library/jest-native/extend-expect';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'http://localhost:54321',
      supabaseAnonKey: 'test-anon-key',
      appEnv: 'test',
      debugMode: false,
    },
  },
}));
