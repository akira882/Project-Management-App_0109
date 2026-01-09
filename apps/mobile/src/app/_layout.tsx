import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'ダッシュボード',
              headerStyle: {
                backgroundColor: '#3B82F6',
              },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="projects"
            options={{
              title: 'プロジェクト',
              headerStyle: {
                backgroundColor: '#3B82F6',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
