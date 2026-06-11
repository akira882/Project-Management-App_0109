import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * 動的 Expo 設定。
 * 環境変数（.env / CI / EAS シークレット）を expo.extra に注入し、
 * src/config/index.ts から型安全に参照する。
 * シークレットはリポジトリにコミットしないこと（env.example のみ追跡）。
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '勤怠管理アプリ',
  slug: 'work-management-app',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'workmanagement',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.workmanagement.app',
  },
  android: {
    package: 'com.workmanagement.app',
  },
  web: {
    bundler: 'metro',
    // 認証ゲート型のクライアント主体アプリのため SPA 出力。
    // （静的プリレンダーはビルド時に各ルートを実行するため、本アプリでは 'single' が適切）
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-secure-store'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    appEnv: process.env.APP_ENV ?? 'development',
    debugMode: process.env.DEBUG_MODE === 'true',
  },
});
