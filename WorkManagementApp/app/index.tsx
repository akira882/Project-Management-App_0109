import { Redirect } from 'expo-router';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * エントリ画面。認証状態に応じて遷移先を振り分ける認証ゲート。
 *
 * - idle / loading … セッション復元中。ローディングを表示する。
 * - authenticated … 打刻画面（(tabs)/attendance）へ。
 * - unauthenticated … ログイン画面（(auth)/login）へ。
 */
export default function Index(): JSX.Element {
  const { status } = useAuth();

  if (status === 'idle' || status === 'loading') {
    return <LoadingSpinner message="読み込み中…" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)/attendance" />;
  }

  return <Redirect href="/(auth)/login" />;
}
