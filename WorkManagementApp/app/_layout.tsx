import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * ルートレイアウト。全画面共通の Provider を内包する。
 * 注意: 認証ゲートや同期初期化（useSync）の組み込みは P2/P3 で拡張する。
 * （このファイルは P0 の最小版。UI フェーズで肉付けする）
 */
export default function RootLayout() {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 24 * 60 * 60 * 1000,
          retry: 1,
        },
      },
    }),
  ).current;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: '#1E40AF' }, headerTintColor: '#fff' }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
