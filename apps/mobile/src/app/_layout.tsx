import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Config from '@/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function RootLayout() {
  // 設定の検証
  useEffect(() => {
    const validation = Config.validate();
    if (!validation.valid) {
      console.error('Configuration errors:', validation.errors);
    }

    if (Config.DEBUG_MODE) {
      console.log('App Configuration:', Config.getSafeConfig());
    }
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3B82F6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'ダッシュボード',
            }}
          />
          <Stack.Screen
            name="projects/index"
            options={{
              title: 'プロジェクト一覧',
            }}
          />
          <Stack.Screen
            name="projects/[id]"
            options={{
              title: 'プロジェクト詳細',
            }}
          />
          <Stack.Screen
            name="projects/create"
            options={{
              title: '新規プロジェクト',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="tasks/index"
            options={{
              title: 'タスク一覧',
            }}
          />
          <Stack.Screen
            name="tasks/[id]"
            options={{
              title: 'タスク詳細',
            }}
          />
          <Stack.Screen
            name="tasks/create"
            options={{
              title: '新規タスク',
              presentation: 'modal',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
