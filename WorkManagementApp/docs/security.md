# セキュリティガイド（WorkManagementApp）

本書は **勤怠管理アプリ（Expo + Supabase）** のセキュリティ方針と運用手順をまとめたものです。
バックエンドは Supabase（PostgreSQL + Auth + Row Level Security）、クライアントは Expo（iOS / Android / Web）です。
データベースの実装は `infra/sql/`（`schema.sql` → `rls_attendance.sql` → `seed.sql`）を参照してください。

> 対象読者: 本リポジトリの開発者・運用者。MVP 段階での「許容するリスク」と「将来強化すべき点」を明示します。

---

## 1. シークレット管理（Secret management）

### 基本原則

- **`.env` は絶対にコミットしない。** `.gitignore` に登録済みであることを前提とし、誤コミットを防ぐ。万一コミットした場合は履歴からの除去だけでなく、**該当キーのローテーション（無効化と再発行）** を必ず行う。
- コミットしてよいのは **`env.example`（プレースホルダのみ）**。実値は各自のローカル `.env` か CI/CD のシークレットストアに置く。
- 設定の読み込みは `src/config/index.ts` の `Config` 経由で型安全に行い、**`Config` にはシークレットを載せない**（公開値である anon キーのみ）。

### EXPO_PUBLIC_ プレフィックスの扱い（重要）

- `EXPO_PUBLIC_` で始まる環境変数は **クライアントバンドルに埋め込まれる「公開値」** である。難読化されても抽出可能なため、**秘密情報を `EXPO_PUBLIC_` に入れてはならない**。
- 本アプリで公開してよいのは以下のみ:
  - `EXPO_PUBLIC_SUPABASE_URL`（プロジェクト URL）
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`（**anon キー**）
- **anon キーは公開前提**で設計されている。これ単体ではデータにアクセスできず、**Row Level Security（RLS）によって保護される**（後述の第 4 章）。RLS が正しく設定されていることが、anon キー公開の安全性の前提となる。

### service_role キー（最重要）

- **`service_role` キーは RLS を完全にバイパスする全権キー**であり、**クライアント（Expo アプリ / Web バンドル）には絶対に同梱しない**。
- 使用してよいのは **サーバ環境のみ**: Supabase Edge Function、バックエンドサーバ、信頼できる CI ジョブ等。
- `env.example` でも `SUPABASE_SERVICE_ROLE_KEY` はコメントアウトし「クライアントに入れない」と明記している（`EXPO_PUBLIC_` を付けない＝バンドルに入らない）。
- 流出は全データ漏洩・改ざんに直結する。漏えいが疑われたら**即時ローテーション**する。

### キーのローテーション手順（Supabase ダッシュボード）

1. Supabase ダッシュボード → **Project Settings → API**（または **API Keys**）を開く。
2. 対象キー（`anon` / `service_role`）の **Reset / Rotate（再生成）** を実行する。
3. 新しいキーを各環境に配布する:
   - クライアント: `.env` の `EXPO_PUBLIC_SUPABASE_ANON_KEY` を更新し、**再ビルド・再配布**（埋め込み値のため再ビルドが必要）。
   - サーバ / Edge Function: `service_role` キーをシークレットストア（環境変数）で更新。
4. 旧キーを無効化し、ログ・監視で旧キー利用が止まったことを確認する。
5. JWT シークリート（Auth）を再生成した場合は、**既存セッションが全て失効**する点に注意（ユーザー再ログインが必要）。

---

## 2. セキュアストレージ（Secure storage）

セッショントークン（アクセストークン / リフレッシュトークン）の永続化に関する方針。
実装は `src/services/storage/secureStorage.ts`（ネイティブ）と `secureStorage.web.ts`（Web）にプラットフォーム分岐している。Supabase クライアント（`src/services/supabase/client.ts`）はこれを auth ストレージアダプタとして利用する。

### ネイティブ（iOS / Android）

- **iOS は Keychain、Android は Keystore（EncryptedSharedPreferences）** を `expo-secure-store` 経由で使用する。OS が暗号化・アクセス制御を行うため、平文での永続化を避けられる。
- これにより、リフレッシュトークンを端末の安全な領域に保存できる。

### Web フォールバック（MVP 許容のリスク）

- **Web では `expo-secure-store` が非対応**のため、`secureStorage.web.ts` は **`localStorage` にフォールバック**する（`localStorage` 不可の SSR 等ではさらに in-memory にフォールバック）。
- **`localStorage` は XSS（クロスサイトスクリプティング）で読み取られうる**。トークンが JavaScript から到達可能なため、スクリプト混入時に窃取されるリスクがある。
- 本アプリでは **MVP として本リスクを許容**する。ただし以下の緩和策を併用する:
  - 依存ライブラリの最小化・定期更新（サプライチェーン経由の XSS 抑止）。
  - ユーザー入力・サーバ応答の出力エスケープ（React の既定エスケープを無効化する `dangerouslySetInnerHTML` を使わない）。
  - Content Security Policy（CSP）の適用検討。
- **将来の強化方針: PKCE フロー + httpOnly Cookie**。リフレッシュトークンを JavaScript から不可視（httpOnly）な Cookie に置き、Authorization Code + PKCE で取得することで、XSS による窃取耐性を高める（`Secure` / `SameSite` 属性も付与）。

### サイズ制限の注意（expo-secure-store ~2KB）

- **`expo-secure-store` は 1 値あたり約 2KB の上限**がある（特に Android の制約）。
- 通常の Supabase セッショントークンはこの範囲に収まるが、**大きなカスタムデータをセキュアストレージに保存しない**こと。超過すると保存に失敗し、セッション永続化が壊れる恐れがある。
- 大きなデータはセキュアストレージではなく、用途に応じた別の保存先（暗号化が不要なら通常ストレージ、機密なら分割やサーバ管理）を検討する。

---

## 3. TLS / HTTPS の強制

- **Supabase へのすべての通信は HTTPS（TLS）** で行う。`EXPO_PUBLIC_SUPABASE_URL` は `https://` を用い、平文 HTTP を使わない。
- **TLS 終端は Supabase 側で実施済み**であり、クライアントからエッジまで暗号化される。アプリ側で証明書を自前管理する必要は通常ない。
- 注意点:
  - **証明書の検証を無効化しない**（開発時でも `rejectUnauthorized: false` 相当の設定を入れない）。中間者攻撃（MITM）を招く。
  - ネイティブで追加防御が必要な場合は **証明書ピンニング（certificate pinning）** を検討するが、Supabase のローテーション運用と両立できるよう **公開鍵ピンニング + バックアップピン**で運用する（ピン不一致で全クライアントが疎通不能になる事故に注意）。
  - iOS の ATS（App Transport Security）/ Android の `cleartextTrafficPermitted=false` を維持し、平文通信を OS レベルで拒否する。

---

## 4. Row Level Security（RLS）

DB 側のアクセス制御の中核。実装は `infra/sql/rls_attendance.sql`。

### 方針

- **最小権限（least privilege）**: 認証ユーザーは原則「自分の行」のみアクセス可。管理者（manager）は配下従業員（`manager_id = auth.uid()`）の行のみ閲覧可。
- **両テーブルで RLS 有効化が必須**:
  - `attendance_records` だけでなく **`profiles` も `enable row level security` する**。profiles を無効のままにすると、**氏名・上長関係などの個人情報が他ユーザーに漏洩**する。
- **append-only 台帳（追記専用）**: `attendance_records` は **UPDATE / DELETE ポリシーを意図的に定義しない**。RLS ではポリシー未定義の操作は既定で拒否されるため、一般ユーザーからの行の書き換え・削除は不可となる。打刻は改ざん不可な **監査証跡（audit trail）** として扱い、訂正は「打ち消しレコードの追記」で行う。

### INSERT は `with check`（バグ修正点）

- **INSERT ポリシーに `using` は存在しない**。挿入される行の検証は **必ず `with check` で行う**。
  - 本リポジトリの `ins_own` ポリシーは `with check (auth.uid() = user_id)` を使用し、**自分の `user_id` でのみ打刻を作成できる**ようにしている。
  - （元仕様では `using` を使う誤りがあったため、`with check` に修正済み。）
- SELECT は `using` 句で可視行を制御する（`sel_own_or_mgr`: 本人、またはその打刻ユーザーの上長が自分である場合に閲覧可）。

### role 昇格の防止

- `profiles` の自己更新ポリシー（`profiles_update_own`）は `with check (auth.uid() = id and role = 'employee')` とし、**一般ユーザーが自分を `manager` に昇格させる更新を拒否**する。
- 想定する自己更新対象は **`display_name` のみ**。`role` / `manager_id` の変更は管理者運用（service_role を用いるサーバ処理など）で行い、クライアントからは変更させない。
- より厳密な列単位制御が必要なら、`GRANT UPDATE (display_name) ON public.profiles` のような **列権限**を併用する。

---

## 5. PostgreSQL ロール（anon / authenticated / service_role）

Supabase が用意する 3 つの主要ロールと最小権限の考え方。

| ロール | 付与される相手 | 役割 | RLS |
|--------|----------------|------|-----|
| `anon` | 未認証（匿名）リクエスト。**anon キー**使用時。 | 公開可能な最小限の読み取りなど。本アプリでは原則アクセス不可（要ログイン）。 | **適用される** |
| `authenticated` | ログイン済みユーザー（有効な JWT 保持）。 | 自分の行・配下の行へのアクセス。`auth.uid()` が JWT の `sub` に対応。 | **適用される** |
| `service_role` | サーバ / Edge Function のみ。**service_role キー**使用時。 | 管理操作・バッチ。**RLS をバイパス**する全権。 | **バイパス（無視）** |

### 最小権限の考え方

- クライアントは `anon` / `authenticated` のいずれかで動作し、**常に RLS の制約下**にある。anon キー公開の安全性はここに依存する。
- `service_role` は RLS を素通りするため、**クライアントに渡さない / サーバ内に閉じる**（第 1 章参照）。
- 不要なテーブル権限は付与しない。Supabase の既定では `anon` / `authenticated` に広めの権限が付くことがあるため、**RLS を「最後の砦」としつつ**、必要に応じて `REVOKE` で過剰権限を絞る。
- 関数を `security definer` で作る場合（例: `handle_new_user`）は **`search_path` を固定**し、権限昇格・関数乗っ取りを防ぐ（`schema.sql` で実施済み）。

---

## 6. 個人情報保護法 / 位置情報の取り扱い

本アプリは打刻時に **位置情報（緯度・経度）** を保存しうる（`attendance_records.location` jsonb、例: `{"lat":35.6895,"lng":139.6917}`）。位置情報・氏名・勤務実績は **個人情報** にあたるため、個人情報保護法（および社内規程）に沿って扱う。

### 取り扱いの原則

- **取得は同意前提（opt-in）**: 打刻位置の保存は **利用目的を明示して同意を得たうえで**行う。同意がない場合は位置情報なしで打刻できるようにする（`location` は任意項目）。
- **利用目的の特定・限定**: 取得した位置情報は「勤怠の正当性確認」などの**明示目的のみ**に使用し、目的外利用・第三者提供を行わない。
- **データ最小化（minimization）**:
  - 必要以上の精度・頻度で取得しない（打刻時点のみ等）。
  - **EXIF / GPS メタデータ**を含む写真等を扱う場合は、**不要な位置・端末情報を保存前に除去**する。
  - 保存は `{lat, lng}` の最小構造にとどめ、住所変換結果や移動履歴など過剰な情報を蓄積しない。
- **保存期間と削除**: 勤怠台帳は append-only だが、法定保存期間や社内規程に沿った **保管期間の定義と、期間経過後の削除/匿名化** 方針を運用で定める。
- **開示・訂正請求への対応**: 本人からの開示・訂正・利用停止の請求に応じられる運用（RLS で本人が自分の打刻を閲覧可能）を維持する。台帳の訂正は打ち消しレコードの追記で対応する。
- **アクセス制御**: 位置情報を含む行は RLS で本人と上長のみに限定し、不要な閲覧を防ぐ（第 4 章）。

---

## 7. 端末紛失時の対応

- **ログアウトでトークンを破棄**: ログアウト時に `secureStorage.removeItem` 相当でローカルのセッショントークンを確実に削除する（Supabase の `signOut()` がローカルセッションを破棄）。共有端末では使用後のログアウトを徹底する。
- **サーバ側でのセッション失効**: 紛失が判明したら、Supabase ダッシュボードから当該ユーザーのセッションを失効させる、または **JWT シークレットのローテーション**で全セッションを一括失効させる（全ユーザー再ログインが必要になる点に注意）。
- **トークン有効期限の短縮 + リフレッシュ**: アクセストークンの寿命を短く保ち、リフレッシュトークン失効で再アクセスを断つ。
- **将来のリモートワイプ（remote wipe）**: 端末紛失時にローカルキャッシュ（オフライン打刻キュー含む）を遠隔消去する仕組みを将来的に検討する。現状の MVP では、**ログアウト時のローカルデータ破棄**と**サーバ側セッション失効**を一次対応とする。
- **物理保護との併用**: OS の画面ロック・端末暗号化（iOS / Android の標準暗号化）を前提とし、Keychain / Keystore に保存されたトークンを端末ロックで保護する。

---

## 付録: 関連ファイル

- DB スキーマ: `infra/sql/schema.sql`
- RLS ポリシー: `infra/sql/rls_attendance.sql`
- 開発用シード: `infra/sql/seed.sql`
- 環境変数サンプル: `env.example`
- 設定読み込み: `src/config/index.ts`
- セキュアストレージ: `src/services/storage/secureStorage.ts` / `secureStorage.web.ts`
- Supabase クライアント: `src/services/supabase/client.ts`
