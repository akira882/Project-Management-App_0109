# あなたが実行すべきタスク一覧

開発可能な部分はすべて完了しました。以下は、あなた自身で実行する必要があるタスクです。

---

## 📋 タスク概要（優先順位順）

1. **依存関係のインストール** ⭐ 最重要・最初に実行
2. **データベースのセットアップ** ⭐ 最重要
3. **環境変数の設定** ⭐ 最重要
4. **GitHub Personal Access Token の発行**
5. **Slack Webhook URLの取得**
6. **アプリケーションの起動と動作確認**
7. **本番環境へのデプロイ**（オプション）

---

## ✅ タスク 1: 依存関係のインストール

### 結論
**まず最初に `pnpm install` コマンドを実行して、プロジェクトに必要なすべてのライブラリをインストールしてください。**

### 理由
以下のファイルで多数の外部ライブラリを使用しているため、それらをインストールしないとアプリが動作しません。

**エビデンス：**
- `package.json` (ルート): pnpm workspaceの設定
- `apps/web/package.json`: Next.js、React Query、Prismaなど
- `apps/mobile/package.json`: Expo、React Native、AsyncStorageなど

### 実行手順

#### ステップ1: ターミナルを開く
- **Windows**: スタートメニュー → 「コマンドプロンプト」または「PowerShell」
- **Mac**: Spotlight（⌘ + スペース）→ 「ターミナル」と入力
- **Linux**: Ctrl + Alt + T

#### ステップ2: プロジェクトフォルダに移動
```bash
cd Project-Management-App_0109
```

#### ステップ3: pnpmがインストールされているか確認
```bash
pnpm --version
```

もし「コマンドが見つかりません」と表示されたら、pnpmをインストール：
```bash
npm install -g pnpm
```

#### ステップ4: 依存関係をインストール
```bash
pnpm install
```

**完了までの時間:** 約3〜10分（インターネット速度による）

**成功の確認方法:**
- エラーメッセージが表示されず、最後に「Dependencies installed」のようなメッセージが表示される
- `node_modules` フォルダが作成される

---

## ✅ タスク 2: データベースのセットアップ

### 結論
**Prismaを使用してデータベースを初期化し、テーブルを作成してください。**

### 理由
プロジェクトとタスクのデータを保存するためにデータベースが必要です。

**エビデンス：**
- `apps/web/prisma/schema.prisma`: データベーススキーマ定義
  - Project モデル: プロジェクト情報を保存
  - Task モデル: タスク情報を保存
  - リレーション: 1つのプロジェクトに複数のタスク

### 実行手順

#### ステップ1: Webアプリのディレクトリに移動
```bash
cd apps/web
```

#### ステップ2: 環境変数ファイルを作成
```bash
# Windowsの場合
copy .env.example .env

# Mac/Linuxの場合
cp .env.example .env
```

もし`.env.example`が存在しない場合、`.env`を手動作成：
```bash
# Windowsの場合
echo DATABASE_URL="file:./dev.db" > .env

# Mac/Linuxの場合
echo 'DATABASE_URL="file:./dev.db"' > .env
```

#### ステップ3: データベースマイグレーションを実行
```bash
pnpm prisma migrate dev --name init
```

このコマンドは以下を実行します：
1. `dev.db` という名前のSQLiteデータベースファイルを作成
2. `Project` と `Task` テーブルを作成
3. リレーション（外部キー）を設定

**完了までの時間:** 約10〜30秒

**成功の確認方法:**
```bash
pnpm prisma studio
```
を実行すると、ブラウザでデータベース管理画面が開く（http://localhost:5555）

#### ステップ4: ルートディレクトリに戻る
```bash
cd ../..
```

---

## ✅ タスク 3: 環境変数の設定

### 結論
**各アプリケーション（Web、Mobile）の環境変数ファイルを作成し、必要な設定値を記入してください。**

### 理由
アプリケーションが正常に動作するために、以下の設定が必要です：
- API接続先URL
- データベース接続情報
- 外部サービス（GitHub、Slack）の認証情報

**エビデンス：**
- `apps/web/src/app/api/*`: 各APIエンドポイントで環境変数を参照
- `apps/mobile/app.config.js`: モバイルアプリの設定
- `apps/mobile/src/config/index.ts`: 環境変数の読み込みと検証

### 実行手順

#### A. Webアプリの環境変数設定

##### ステップ1: .envファイルを開く
プロジェクトルートの `apps/web/.env` ファイルをテキストエディタで開く

##### ステップ2: 以下の内容を記入

```env
# データベース接続（タスク2で設定済み）
DATABASE_URL="file:./dev.db"

# Next.js設定
NEXT_PUBLIC_API_URL=http://localhost:3000

# GitHub設定（タスク4で取得するトークンを後で記入）
GITHUB_ACCESS_TOKEN=

# Slack設定（タスク5で取得するURLを後で記入）
SLACK_WEBHOOK_URL=
SLACK_ACCESS_TOKEN=
SLACK_CHANNEL=#general
```

#### B. モバイルアプリの環境変数設定

##### ステップ1: .envファイルを作成
`apps/mobile/.env` ファイルを新規作成

##### ステップ2: 以下の内容を記入

```env
# API接続先（開発時はlocalhostのIPアドレス）
API_BASE_URL=http://192.168.1.100:3000
API_TIMEOUT=30000
APP_ENV=development
```

**重要:** `192.168.1.100` は**あなたのパソコンのローカルIPアドレス**に置き換えてください。

##### IPアドレスの確認方法:

**Windows:**
```bash
ipconfig
```
→ 「IPv4 アドレス」の値（例: 192.168.1.100）

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
→ 表示されたIPアドレス（例: 192.168.1.100）

**Linux:**
```bash
hostname -I
```
→ 最初に表示されたIPアドレス

---

## ✅ タスク 4: GitHub Personal Access Token の発行

### 結論
**GitHubの開発者設定ページで、Personal Access Token (Fine-grained)を発行し、`.env`ファイルに設定してください。**

### 理由
GitHub API連携機能を使用するために、GitHubへのアクセス権限が必要です。

**エビデンス：**
- `apps/web/src/lib/integrations/github.ts`: GitHubService クラスがトークンを使用
  - `getRepos()`: リポジトリ一覧取得
  - `createIssue()`: Issue作成
  - `updateIssue()`: Issue更新
- `apps/web/src/app/api/integrations/github/repos/route.ts`: トークンを環境変数から読み込み

### 実行手順

#### ステップ1: GitHubにログイン
ブラウザで https://github.com にアクセスし、ログイン

#### ステップ2: 設定ページを開く
1. 画面右上の**あなたのプロフィールアイコン**をクリック
2. **「Settings」**（設定）をクリック

#### ステップ3: Developer settings を開く
1. 左サイドバーを一番下までスクロール
2. **「Developer settings」**（開発者向け設定）をクリック

#### ステップ4: Personal Access Tokens を選択
1. 左サイドバーの **「Personal access tokens」** をクリック
2. **「Fine-grained tokens」**（推奨）または「Tokens (classic)」を選択

**Fine-grained tokens が推奨される理由:**
- より安全（リポジトリごとに権限を設定可能）
- 有効期限を設定可能
- 必要最小限の権限のみ付与

#### ステップ5: 新しいトークンを生成
1. **「Generate new token」**（新しいトークンを生成）ボタンをクリック
2. **「Generate new token (Fine-grained)」** を選択

#### ステップ6: トークンの詳細を設定

**Token name（トークン名）:**
```
Project-Management-App
```

**Expiration（有効期限）:**
```
90 days（90日間）
```
※テスト用なら短く、本番用なら長く設定

**Repository access（リポジトリアクセス）:**
- **「All repositories」**（すべてのリポジトリ）を選択
  または
- **「Only select repositories」**（特定のリポジトリのみ）→ 使用したいリポジトリを選択

**Permissions（権限設定）:**

必要な権限のみ有効化してください：
- **Repository permissions:**
  - **「Issues」** → **Read and write**（読み書き）
  - **「Metadata」** → **Read-only**（読み取り専用）※自動で選択される
  - **「Contents」** → **Read-only**（読み取り専用）

#### ステップ7: トークンを生成
1. 一番下までスクロール
2. **「Generate token」**（トークンを生成）ボタンをクリック

#### ステップ8: トークンをコピー
**重要:** トークンは1度しか表示されません！

1. 表示された `ghp_xxxxx...` という文字列を**全てコピー**
2. 安全な場所（パスワードマネージャーやメモ帳）に保存

#### ステップ9: .envファイルに設定
`apps/web/.env` ファイルを開き、以下の行を更新：

```env
GITHUB_ACCESS_TOKEN=ghp_あなたのトークンをここに貼り付け
```

**例:**
```env
GITHUB_ACCESS_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz123
```

**成功の確認方法:**
後でアプリを起動し、GitHub連携機能が正常に動作することを確認

---

## ✅ タスク 5: Slack Webhook URL の取得

### 結論
**Slack Appを作成し、Incoming Webhookを有効化して、Webhook URLを`.env`ファイルに設定してください。**

### 理由
プロジェクトやタスクの作成・更新時にSlackへ通知を送信するために必要です。

**エビデンス：**
- `apps/web/src/lib/integrations/slack.ts`: SlackService クラスがWebhook URLを使用
  - `sendProjectNotification()`: プロジェクト通知
  - `sendTaskNotification()`: タスク通知
  - `sendWebhookMessage()`: Webhook経由でメッセージ送信
- `apps/web/src/app/api/integrations/slack/route.ts`: Webhook URLを受け取る

### 実行手順

#### ステップ1: Slack Appの作成ページを開く
ブラウザで以下のURLにアクセス：
```
https://api.slack.com/apps
```

#### ステップ2: Slackにログイン
使用したいワークスペースでログイン

#### ステップ3: 新しいアプリを作成
1. **「Create New App」**（新しいアプリを作成）ボタンをクリック
2. **「From scratch」**（スクラッチから作成）を選択

#### ステップ4: アプリの詳細を入力

**App Name（アプリ名）:**
```
Project Management Notifications
```

**Pick a workspace to develop your app in（開発用ワークスペース）:**
- 通知を受け取りたいワークスペースを選択

**「Create App」**（アプリを作成）ボタンをクリック

#### ステップ5: Incoming Webhooksを有効化
1. 左サイドバーの **「Features」** セクション内の **「Incoming Webhooks」** をクリック
2. 右上の **「Activate Incoming Webhooks」** トグルを **ON** に切り替え

#### ステップ6: Webhook URLを作成
1. ページ下部の **「Add New Webhook to Workspace」**（ワークスペースに新しいWebhookを追加）ボタンをクリック
2. **通知を投稿するチャンネルを選択**
   - 例: `#general`, `#project-updates`, `#notifications` など
3. **「許可する」**（Allow）ボタンをクリック

#### ステップ7: Webhook URLをコピー
1. 画面に表示された **Webhook URL** をコピー
   - 形式: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

#### ステップ8: .envファイルに設定
`apps/web/.env` ファイルを開き、以下の行を更新：

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/あなたのWebhookURL
SLACK_CHANNEL=#general
```

**チャンネル名の変更:**
`#general` を別のチャンネルに変更したい場合は、`SLACK_CHANNEL` の値を変更してください。

**成功の確認方法:**
ステップ9でテスト通知を送信して確認

#### ステップ9: テスト通知を送信（オプション）

ターミナルで以下のコマンドを実行：

```bash
curl -X POST https://hooks.slack.com/services/あなたのWebhookURL \
  -H 'Content-Type: application/json' \
  -d '{"text":"テスト通知：プロジェクト管理アプリが接続されました！"}'
```

**Windows PowerShellの場合:**
```powershell
Invoke-WebRequest -Uri "https://hooks.slack.com/services/あなたのWebhookURL" -Method POST -Body '{"text":"テスト通知：プロジェクト管理アプリが接続されました！"}' -ContentType "application/json"
```

Slackのチャンネルに通知が届けば成功です！

---

## ✅ タスク 6: アプリケーションの起動と動作確認

### 結論
**Webアプリとモバイルアプリを起動し、すべての機能が正常に動作することを確認してください。**

### 理由
実装した全機能が正しく動作することを確認する必要があります。

**エビデンス:**
実装済みの機能：
- プロジェクトCRUD（作成・読取・更新・削除）
- タスクCRUD
- GitHub API連携
- Slack通知
- オフライン対応（モバイル）

### 実行手順

#### A. Webアプリの起動

##### ステップ1: ターミナルを開く（新しいタブ）

##### ステップ2: Webアプリのディレクトリに移動
```bash
cd apps/web
```

##### ステップ3: 開発サーバーを起動
```bash
pnpm dev
```

##### ステップ4: ブラウザで確認
自動的にブラウザが開くか、以下のURLにアクセス：
```
http://localhost:3000
```

##### ステップ5: 動作確認チェックリスト

1. **ダッシュボード**
   - [ ] プロジェクト数が表示される
   - [ ] タスク数が表示される

2. **プロジェクト管理**
   - [ ] プロジェクト一覧が表示される
   - [ ] 「新規プロジェクト」ボタンをクリックして作成フォームが開く
   - [ ] プロジェクトを作成できる
   - [ ] プロジェクト詳細ページが表示される
   - [ ] プロジェクトを編集できる
   - [ ] プロジェクトを削除できる

3. **タスク管理**
   - [ ] タスク一覧が表示される
   - [ ] フィルター（未着手/進行中/完了）が動作する
   - [ ] タスクを作成できる
   - [ ] タスク詳細ページが表示される
   - [ ] タスクを編集できる
   - [ ] ステータスをワンクリックで変更できる
   - [ ] タスクを削除できる

4. **GitHub連携**（GitHub Tokenを設定済みの場合）
   - ブラウザのコンソールを開く（F12キー）
   - 以下のコードを実行：
   ```javascript
   fetch('/api/integrations/github/repos', {
     headers: { 'x-github-token': 'あなたのトークン' }
   }).then(r => r.json()).then(console.log)
   ```
   - [ ] リポジトリ一覧が表示される

5. **Slack連携**（Webhook URLを設定済みの場合）
   - ブラウザのコンソールで実行：
   ```javascript
   fetch('/api/integrations/slack', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       webhookUrl: 'あなたのWebhook URL',
       text: 'テスト通知'
     })
   }).then(r => r.json()).then(console.log)
   ```
   - [ ] Slackに通知が届く

#### B. モバイルアプリの起動

##### ステップ1: 新しいターミナルタブを開く

##### ステップ2: モバイルアプリのディレクトリに移動
```bash
cd apps/mobile
```

##### ステップ3: Expo開発サーバーを起動
```bash
pnpm start
```

##### ステップ4: アプリを実機またはエミュレータで起動

**実機の場合（推奨）:**
1. スマートフォンに **Expo Go** アプリをインストール
   - iOS: App Store で「Expo Go」を検索
   - Android: Google Play で「Expo Go」を検索
2. ターミナルに表示された **QRコード** をスキャン
   - iOS: カメラアプリでスキャン
   - Android: Expo Go アプリ内のスキャナーを使用

**エミュレータの場合:**
- iOS: ターミナルで `i` キーを押す（Xcodeが必要）
- Android: ターミナルで `a` キーを押す（Android Studioが必要）

##### ステップ5: 動作確認チェックリスト

1. **ダッシュボード**
   - [ ] プロジェクト数とタスク数が表示される
   - [ ] 高優先度タスクアラートが表示される（該当する場合）
   - [ ] 最近のプロジェクトが表示される

2. **プロジェクト管理**
   - [ ] プロジェクト一覧が表示される
   - [ ] Pull-to-refreshで更新できる
   - [ ] プロジェクトをタップして詳細表示
   - [ ] 新規プロジェクトを作成できる
   - [ ] プロジェクトを編集できる
   - [ ] プロジェクトを削除できる

3. **タスク管理**
   - [ ] タスク一覧が表示される
   - [ ] ステータス別統計が表示される
   - [ ] タスクをタップして詳細表示
   - [ ] 新規タスクを作成できる
   - [ ] タスクを編集できる
   - [ ] タスクのステータスを変更できる
   - [ ] タスクを削除できる

4. **オフライン機能**
   - [ ] 機内モードをONにする
   - [ ] アプリを再起動
   - [ ] 画面上部に「オフライン」警告が表示される
   - [ ] キャッシュされたデータが表示される
   - [ ] 機内モードをOFFにすると通常通り動作する

5. **エラーハンドリング**
   - [ ] 存在しないページにアクセスしても�ラッシュしない
   - [ ] ネットワークエラー時にエラーメッセージが表示される

---

## ✅ タスク 7: 本番環境へのデプロイ（オプション）

### 結論
**Vercel（Webアプリ）とEAS（モバイルアプリ）を使用して本番環境にデプロイできます。これは任意のタスクです。**

### 理由
実際のユーザーに公開したい場合や、外部からアクセスしたい場合に必要です。

### A. Webアプリのデプロイ（Vercel）

#### ステップ1: Vercelアカウント作成
https://vercel.com にアクセスして無料アカウントを作成

#### ステップ2: GitHubリポジトリと連携
1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクトルートを `apps/web` に設定

#### ステップ3: 環境変数を設定
Vercelのプロジェクト設定で以下を追加：
- `DATABASE_URL`
- `GITHUB_ACCESS_TOKEN`
- `SLACK_WEBHOOK_URL`
- `SLACK_CHANNEL`

#### ステップ4: デプロイ
「Deploy」ボタンをクリック

**デプロイ完了までの時間:** 約3〜5分

### B. モバイルアプリのビルド（EAS Build）

#### ステップ1: EASアカウント作成
```bash
npm install -g eas-cli
eas login
```

#### ステップ2: プロジェクトを設定
```bash
cd apps/mobile
eas build:configure
```

#### ステップ3: ビルドを実行
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

**ビルド完了までの時間:** 約15〜30分

---

## 🎯 すべてのタスク完了後の確認事項

### 最終チェックリスト

- [ ] すべての依存関係がインストールされている
- [ ] データベースが作成され、マイグレーションが完了している
- [ ] 環境変数ファイル（.env）が正しく設定されている
- [ ] GitHub Personal Access Tokenが発行され、設定されている
- [ ] Slack Webhook URLが取得され、設定されている
- [ ] Webアプリが http://localhost:3000 で起動している
- [ ] モバイルアプリがExpo Goで起動している
- [ ] プロジェクトとタスクのCRUD操作が正常に動作する
- [ ] GitHub連携が動作する（トークン設定済みの場合）
- [ ] Slack通知が届く（Webhook URL設定済みの場合）
- [ ] オフライン機能が動作する（モバイル）
- [ ] エラーが発生してもアプリがクラッシュしない

---

## 🆘 トラブルシューティング

### よくあるエラーと解決方法

#### 1. `pnpm: command not found`
**原因:** pnpmがインストールされていない
**解決方法:**
```bash
npm install -g pnpm
```

#### 2. `DATABASE_URL environment variable is not set`
**原因:** .envファイルが作成されていない
**解決方法:** タスク2、3を再度実行

#### 3. `Port 3000 is already in use`
**原因:** すでに別のアプリがポート3000を使用している
**解決方法:**
```bash
# 別のポートで起動
PORT=3001 pnpm dev
```

#### 4. モバイルアプリで「Network Error」
**原因:** API_BASE_URLが正しく設定されていない
**解決方法:**
- `apps/mobile/.env` の `API_BASE_URL` をあなたのPCのIPアドレスに変更
- ファイアウォールでポート3000を許可

#### 5. GitHub APIで401エラー
**原因:** トークンが無効または期限切れ
**解決方法:**
- GitHubで新しいトークンを発行
- `.env` ファイルを更新

#### 6. Slack通知が届かない
**原因:** Webhook URLが無効
**解決方法:**
- Slack App設定でWebhook URLを再確認
- テスト通知を送信して確認

---

## 📚 参考資料

### 公式ドキュメント
- **pnpm**: https://pnpm.io/
- **Next.js**: https://nextjs.org/docs
- **Expo**: https://docs.expo.dev/
- **Prisma**: https://www.prisma.io/docs
- **GitHub API**: https://docs.github.com/en/rest
- **Slack API**: https://api.slack.com/

### プロジェクト内ドキュメント
- `README.md`: プロジェクト概要
- `MOBILE_SETUP_GUIDE.md`: モバイルアプリ詳細セットアップ
- `OFFLINE_STORAGE.md`: オフライン機能の詳細
- `apps/web/README.md`: Webアプリの詳細
- `apps/mobile/README.md`: モバイルアプリの詳細

---

## ✅ 完了！

すべてのタスクが完了したら、プロジェクト管理アプリを使い始めることができます。

何か問題が発生した場合は、上記のトラブルシューティングセクションを参照するか、各ツールの公式ドキュメントを確認してください。

開発を楽しんでください！ 🎉
