import 'react-native-get-random-values'; // crypto を使う処理より前に読み込む（UUID 等）
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Config, assertSupabaseConfig } from '@/config';
import { secureStorage } from '@/services/storage/secureStorage';

/**
 * Supabase クライアントのシングルトン。
 *
 * セッション永続化には secureStorage（ネイティブ: Keychain/Keystore、Web: localStorage）を
 * 用いる。Supabase の auth ストレージは getItem/setItem/removeItem の最小 API を要求するため、
 * secureStorage をそのまま委譲アダプタとして渡す。
 *
 * 注意: expo-secure-store は 1 値あたり約 2KB のサイズ制限がある。
 * 通常のセッショントークンは収まるが、大きなカスタムデータを保存しないこと
 * （詳細・制約は docs/security.md を参照）。
 */
const authStorageAdapter = {
  getItem: (key: string): Promise<string | null> => secureStorage.getItem(key),
  setItem: (key: string, value: string): Promise<void> =>
    secureStorage.setItem(key, value),
  removeItem: (key: string): Promise<void> => secureStorage.removeItem(key),
};

let cached: SupabaseClient | null = null;

/**
 * クライアントを生成（または再利用）する。
 * assertSupabaseConfig() はここで遅延的に呼ぶ（import 時には呼ばない）。
 * これによりテストでモジュールをモック置換する際に設定検証で落ちない。
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  assertSupabaseConfig();
  cached = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
    auth: {
      storage: authStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

/**
 * 利便性のためのシングルトンインスタンス。
 * module ロード時に createClient は呼ぶが assertSupabaseConfig() は呼ばない
 * （設定未投入でも import 自体は失敗させない方針。テストではこのモジュールごとモックされる）。
 */
export const supabase: SupabaseClient = createClient(
  Config.supabaseUrl,
  Config.supabaseAnonKey,
  {
    auth: {
      storage: authStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
