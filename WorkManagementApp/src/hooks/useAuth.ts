import { useAuthStore } from '@/store/authStore';
import type { AuthUser, Credentials, Profile } from '@/types/auth';

/**
 * 認証ストア（authStore）への薄いラッパーフック。
 *
 * zustand ストアの状態とアクションをそのまま公開しつつ、UI が扱いやすいよう
 * `isAuthenticated`（status === 'authenticated'）を派生値として追加する。
 * ロジックはストア側に集約し、本フックは購読と射影のみを担う。
 */

/** 認証ライフサイクル状態。 */
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface UseAuth {
  /** 認証済みユーザー（未認証なら null）。 */
  user: AuthUser | null;
  /** プロフィール（未取得なら null）。 */
  profile: Profile | null;
  /** 現在の認証状態。 */
  status: AuthStatus;
  /** 直近のエラーメッセージ（日本語）。無ければ null。 */
  error: string | null;
  /** 認証済みかどうか（status === 'authenticated'）。 */
  isAuthenticated: boolean;
  /** ログイン。 */
  signIn: (creds: Credentials) => Promise<void>;
  /** 新規登録。 */
  signUp: (creds: Credentials) => Promise<void>;
  /** ログアウト。 */
  signOut: () => Promise<void>;
  /** アプリ起動時のセッション復元。 */
  restore: () => Promise<void>;
}

export function useAuth(): UseAuth {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);
  const restore = useAuthStore((s) => s.restore);

  return {
    user,
    profile,
    status,
    error,
    isAuthenticated: status === 'authenticated',
    signIn,
    signUp,
    signOut,
    restore,
  };
}
