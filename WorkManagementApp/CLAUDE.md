# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository (the `WorkManagementApp/` project).

## プロジェクト目標

**WorkManagementApp（勤怠管理ワークフローアプリ）** — iPhone / Android / Mac / Windows のどの端末でも最高品質で動作する、日本語UIのユニバーサル業務アプリ。中核は **勤怠打刻ワークフロー**（出勤打刻・退勤打刻・休憩開始・休憩終了・勤怠履歴）で、**オフラインファースト**（圏外で打刻 → 復帰時に自動同期）を満たす。バックエンドは **Supabase**（Postgres + Auth + RLS）。

## どこから始めるか

1. ルートで `npm install`（このプロジェクトは独立。親モノレポの pnpm ワークスペースには参加しない）。
2. `cp env.example .env` し、Supabase の URL / anon キーを設定。
3. `npm run web` でブラウザ起動（Mac/Windows 相当の確認）。`npm run ios` / `npm run android` は macOS / Android SDK が必要。
4. `infra/sql/` の SQL を Supabase SQL エディタに適用（schema → rls → seed の順）。

## コマンド

```bash
npm run web          # Expo Web（ブラウザ = Mac/Windows）
npm run ios          # iOS シミュレータ（要 macOS/Xcode）
npm run android      # Android エミュレータ（要 Android SDK）
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Jest（単体 + モック e2e）
npm run test:e2e:mock# モック Supabase での e2e のみ
npm run export:web   # 静的 Web 出力（CI でビルド検証）
npm run build:ios    # eas build（Mac/EAS）
```

## アーキテクチャ

- **ルーティング**: Expo Router（`app/` ファイルベース）。`app/_layout.tsx` が全 Provider（QueryClient / SafeArea / 認証ゲート）を内包。`(auth)` と `(tabs)` のルートグループで未認証/認証済みを分離。
- **状態**: サーバ状態は TanStack React Query、クライアント状態は Zustand（`src/store/`）。
- **バックエンド層**: `src/services/supabase/` に Supabase クライアント・認証・勤怠 API。エラーは `SupabaseError` クラスに正規化。
- **オフライン**: `src/services/queue/attendanceQueue.ts`（MMKV、Web は `kvStore.ts` 経由で AsyncStorage フォールバック）＋ `src/hooks/useSync.ts`（NetInfo 監視で自動フラッシュ）。打刻 `id` はクライアント生成 UUID で**冪等**（再送による重複を PK で防止）。
- **セキュア保存**: `src/services/storage/secureStorage.ts`。ネイティブは expo-secure-store（Keychain/Keystore）、Web は localStorage フォールバック（`docs/security.md` に注意点）。

## Claude が変更してよいファイル / 触れないもの

- 変更可: `app/`, `src/`, `tests/`, `infra/sql/`, `docs/`, `README.md`, 各種設定ファイル。
- 変更時注意: `package.json` の依存は既存バージョン（Expo SDK 50 系）に整合させる。`tsconfig.json` は親モノレポを `extends` しない（独立構成を維持）。
- 触れない: `.env`（秘密情報）, `node_modules/`, `dist/`, `.expo/`。

## テストの実行方法

- 単体: `src/utils`（勤務時間計算）, `src/services/queue`（フラッシュ条件）, 認証ストア。
- e2e（モック）: ログイン → オフライン打刻 → オンライン復帰 → 同期 → モック Supabase が受領、を検証。
- モックは `__mocks__/`（`@supabase/supabase-js`, `react-native-mmkv`, `@react-native-community/netinfo`）に配置し node_modules を自動置換。

## エージェント運用方針（このプロジェクト固有）

- **インクリメンタルに作業**し、各タスク後に 1 コミット（`feat:` / `chore:` / `docs:` / `test:` 等の規約）。
- コミット時は「変更ファイル・テスト結果（pass/fail）」を要約する。
- UI ラベルとサンプル文言は**すべて日本語**。
- 秘密情報をリポジトリに保存しない（`env.example` のプレースホルダのみ）。
- ファイルを正確に作成できない場合は **「不明」** と返す。
- ネイティブ専用 API（MMKV / SecureStore）は必ず抽象層（`kvStore` / `secureStorage`）経由で使い、Web 出力を壊さない。

## 既知の制約 / プラットフォーム差異

| 機能 | iOS/Android | Web (Mac/Windows) |
|------|-------------|-------------------|
| セキュア保存 | Keychain / Keystore | localStorage（XSS 注意・MVP 許容） |
| 高速 KV（キュー） | MMKV | AsyncStorage フォールバック |
| 位置情報 | expo-location | ブラウザ Geolocation（任意） |
| ネイティブビルド | eas build / Xcode | 不要（静的 Web 出力） |
