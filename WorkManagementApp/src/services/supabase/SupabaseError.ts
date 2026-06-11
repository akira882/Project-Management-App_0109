/**
 * Supabase 由来のエラー（PostgrestError / AuthError / 不明な例外）を
 * アプリ全体で統一して扱うための正規化エラークラスとユーティリティ。
 * UI へ表示するメッセージは必ず日本語フォールバックを持つ。
 */

/** 正規化済みエラー。code / status は判定（重複・権限など）に利用する。 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'SupabaseError';
    // ES5 ターゲットでも instanceof を維持するためプロトタイプを明示復元する。
    Object.setPrototypeOf(this, SupabaseError.prototype);
  }
}

/** 既定の日本語メッセージ（個別メッセージが取得できない場合のフォールバック）。 */
const DEFAULT_MESSAGE = '通信中に問題が発生しました。時間をおいて再度お試しください。';

/** PostgrestError 形（duck typing。モック環境では実インスタンスでないため型では判定しない）。 */
function isPostgrestLike(
  e: unknown,
): e is { message?: unknown; code?: unknown; details?: unknown; hint?: unknown } {
  return (
    typeof e === 'object' &&
    e !== null &&
    ('hint' in e || 'details' in e) &&
    'code' in e
  );
}

/** AuthError 形（message と status/code を持つ）。 */
function isAuthLike(
  e: unknown,
): e is { message?: unknown; status?: unknown; code?: unknown } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    ('status' in e || 'code' in e)
  );
}

/** 文字列に変換可能なら返す。それ以外は undefined。 */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** 数値（または数値文字列）なら number で返す。それ以外は undefined。 */
function asStatus(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * 任意の例外を SupabaseError に正規化する。
 * - PostgrestError: code / details / hint を保持しつつメッセージを採用。
 * - AuthError: status / code を保持。
 * - それ以外: 既定の日本語メッセージにフォールバック。
 */
export function toSupabaseError(e: unknown): SupabaseError {
  // すでに正規化済みならそのまま返す。
  if (e instanceof SupabaseError) return e;

  if (isPostgrestLike(e)) {
    const message = asString(e.message) ?? DEFAULT_MESSAGE;
    const code = asString(e.code);
    // PostgrestError 自体は status を持たないため undefined。
    return new SupabaseError(message, code, undefined, e);
  }

  if (isAuthLike(e)) {
    const message = asString(e.message) ?? DEFAULT_MESSAGE;
    const code = asString(e.code);
    const status = asStatus(e.status);
    return new SupabaseError(message, code, status, e);
  }

  if (e instanceof Error) {
    return new SupabaseError(e.message || DEFAULT_MESSAGE, undefined, undefined, e);
  }

  return new SupabaseError(DEFAULT_MESSAGE, undefined, undefined, e);
}

/**
 * PK / ユニーク制約違反かどうか。
 * Postgres のユニーク違反コード '23505'、または HTTP 409 を検出する。
 * 同期処理では「冪等な再送による重複挿入」を成功とみなすために使う。
 */
export function isUniqueViolation(e: unknown): boolean {
  let code: string | undefined;
  let status: number | undefined;

  if (e instanceof SupabaseError) {
    code = e.code;
    status = e.status;
  } else if (typeof e === 'object' && e !== null) {
    code = asString((e as { code?: unknown }).code);
    status = asStatus((e as { status?: unknown }).status);
  }

  return code === '23505' || status === 409;
}
