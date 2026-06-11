import Constants from 'expo-constants';

/**
 * アプリ全体の設定。app.config.ts の `extra` を型安全に公開する。
 * シークレットは含めない（anon キーは RLS 前提の公開値）。
 */
type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: 'development' | 'production' | 'test' | string;
  debugMode: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const Config = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  appEnv: extra.appEnv ?? 'development',
  debugMode: extra.debugMode ?? false,
} as const;

export function assertSupabaseConfig(): void {
  if (!Config.supabaseUrl || !Config.supabaseAnonKey) {
    throw new Error(
      'Supabase 設定が見つかりません。env.example を .env にコピーし EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を設定してください。',
    );
  }
}
