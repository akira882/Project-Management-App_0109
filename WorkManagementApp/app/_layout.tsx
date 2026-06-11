import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';

/**
 * ルートレイアウト。全画面共通の Provider と初期化処理を内包する。
 *
 * - QueryClientProvider / SafeAreaProvider / StatusBar を提供。
 * - 起動時に一度だけ認証セッションを復元（useAuth().restore）。
 * - <SyncManager/> を不可視マウントし、useSync の自動同期（圏内復帰時フラッシュ）を
 *   アプリ全体で常時動作させる。
 * - 認証ゲートは app/index.tsx と各ルートグループ側で行うため、ここでは
 *   ヘッダー非表示の Stack のみを描画する（グループ単位でヘッダーを制御）。
 */

/** 起動時に一度だけセッション復元を実行する初期化コンポーネント。 */
function AuthBootstrap(): null {
  const { restore } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void restore();
  }, [restore]);

  return null;
}

/**
 * 不可視の同期マネージャ。useSync をマウントすることで、
 * オフライン→オンライン復帰時の自動フラッシュをアプリ全体で有効化する。
 */
function SyncManager(): null {
  useSync();
  return null;
}

export default function RootLayout(): JSX.Element {
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
        <StatusBar style="light" />
        <AuthBootstrap />
        <SyncManager />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: '#1E40AF' },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
