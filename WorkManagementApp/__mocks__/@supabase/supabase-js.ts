/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @supabase/supabase-js のテスト用手動モック。
 * jest が node_modules を自動置換する（ルート __mocks__/）。
 *
 * 提供するもの:
 * - auth: signInWithPassword / signUp / signOut / getUser / getSession /
 *   onAuthStateChange（インメモリの現在ユーザーで動作）。
 * - from(table): select / eq / single / insert / order / limit を持つチェーン可能な
 *   ビルダー。呼び出しは __calls に記録し、insert 行は __rows に蓄積する。
 *
 * テスト用ヘルパー（__ 接頭辞）で挙動を上書き・検証できる。
 */

/** auth が返すユーザーの最小形。 */
interface MockUser {
  id: string;
  email: string | null;
}

/** auth が返すエラーの最小形（AuthError 互換の duck type）。 */
interface MockError {
  message: string;
  status?: number;
  code?: string;
}

/** from(...).insert(...) などで記録する呼び出しログ。 */
interface MockCall {
  table: string;
  method: string;
  args: any[];
}

// ---- インメモリ状態（テスト間で __reset() により初期化する） ---------------

let currentUser: MockUser | null = { id: 'user-1', email: 'test@example.com' };
let authError: MockError | null = null;

/** insert で蓄積された行。テストから __getRows() で参照する。 */
const rows: any[] = [];
/** from(...) チェーンの呼び出しログ。テストから __getCalls() で参照する。 */
const calls: MockCall[] = [];
/** select 系が返すデータ。__setSelectResult() で上書きする。 */
let selectResult: any = null;

// ---- テスト用ヘルパー --------------------------------------------------------

/** 現在の認証ユーザーを差し替える。 */
export function __setMockUser(user: MockUser | null): void {
  currentUser = user;
}

/** auth 操作が返すエラーを設定する（null で解除）。 */
export function __setMockError(error: MockError | null): void {
  authError = error;
}

/** select / single が返すデータを設定する。 */
export function __setSelectResult(data: any): void {
  selectResult = data;
}

/** すべてのインメモリ状態を初期化する。 */
export function __reset(): void {
  currentUser = { id: 'user-1', email: 'test@example.com' };
  authError = null;
  rows.length = 0;
  calls.length = 0;
  selectResult = null;
}

/** insert で蓄積された行の配列を返す。 */
export function __getRows(): any[] {
  return rows;
}

/** from(...) チェーンの呼び出しログを返す。 */
export function __getCalls(): MockCall[] {
  return calls;
}

// ---- セッション生成 ----------------------------------------------------------

/** 現在ユーザーから簡易セッションを生成する（無ければ null）。 */
function makeSession(): { user: MockUser } | null {
  return currentUser ? { user: currentUser } : null;
}

// ---- from(table) チェーンビルダー -------------------------------------------

/**
 * select / eq / single / insert / order / limit を持つチェーン可能ビルダー。
 * 各メソッドは呼び出しを記録し、自身（thenable）を返す。
 * await されると select 結果（または insert 行）を { data, error } で解決する。
 */
function createQueryBuilder(table: string): any {
  // insert された行をこのチェーンの解決値として保持する。
  let resolvedData: any = selectResult;

  const record = (method: string, args: any[]): void => {
    calls.push({ table, method, args });
  };

  const builder: any = {
    select(...args: any[]) {
      record('select', args);
      resolvedData = selectResult;
      return builder;
    },
    eq(...args: any[]) {
      record('eq', args);
      return builder;
    },
    order(...args: any[]) {
      record('order', args);
      return builder;
    },
    limit(...args: any[]) {
      record('limit', args);
      return builder;
    },
    insert(values: any) {
      record('insert', [values]);
      const inserted = Array.isArray(values) ? values : [values];
      for (const row of inserted) {
        rows.push(row);
      }
      resolvedData = inserted;
      return builder;
    },
    single(...args: any[]) {
      record('single', args);
      // single は配列ではなく単一オブジェクトを返す想定。
      const data = Array.isArray(resolvedData) ? (resolvedData[0] ?? null) : resolvedData;
      return Promise.resolve({ data, error: null });
    },
    // await された場合に { data, error } を解決する（thenable）。
    then(onFulfilled: (value: { data: any; error: null }) => any) {
      return Promise.resolve({ data: resolvedData, error: null }).then(onFulfilled);
    },
  };

  return builder;
}

// ---- auth クライアント -------------------------------------------------------

function createAuthClient(): any {
  return {
    async signInWithPassword(_creds: { email: string; password: string }) {
      if (authError) return { data: { user: null, session: null }, error: authError };
      return { data: { user: currentUser, session: makeSession() }, error: null };
    },
    async signUp(_creds: { email: string; password: string }) {
      if (authError) return { data: { user: null, session: null }, error: authError };
      return { data: { user: currentUser, session: makeSession() }, error: null };
    },
    async signOut() {
      if (authError) return { error: authError };
      currentUser = null;
      return { error: null };
    },
    async getUser() {
      if (authError) return { data: { user: null }, error: authError };
      return { data: { user: currentUser }, error: null };
    },
    async getSession() {
      return { data: { session: makeSession() }, error: null };
    },
    onAuthStateChange(_cb: (event: string, session: unknown) => void) {
      return {
        data: {
          subscription: {
            unsubscribe(): void {
              /* テストでは購読解除は no-op */
            },
          },
        },
      };
    },
  };
}

// ---- createClient ------------------------------------------------------------

/** 偽の SupabaseClient を生成して返す。 */
export function createClient(_url?: string, _key?: string, _opts?: any): any {
  return {
    auth: createAuthClient(),
    from(table: string) {
      return createQueryBuilder(table);
    },
  };
}

// 実型と同名の型もエクスポートしておく（型のみ利用箇所向けのスタンド・イン）。
export type SupabaseClient = any;
export type User = MockUser;
export type Session = { user: MockUser } | null;
export type AuthError = MockError;
export type PostgrestError = { message: string; code: string; details: string; hint: string };
