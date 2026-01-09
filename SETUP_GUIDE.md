# セットアップガイド

このガイドでは、プロジェクト管理アプリケーションをローカル環境で動作させるための詳細な手順を説明します。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [初期セットアップ](#初期セットアップ)
3. [外部サービスの設定](#外部サービスの設定)
4. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必須ソフトウェア

以下のソフトウェアをインストールしてください：

1. **Node.js** (v18以上)
   - ダウンロード: https://nodejs.org/
   - インストール確認: `node --version`

2. **pnpm** (v8以上)
   ```bash
   npm install -g pnpm
   # または
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```
   - インストール確認: `pnpm --version`

3. **Git**
   - ダウンロード: https://git-scm.com/
   - インストール確認: `git --version`

---

## 初期セットアップ

### Step 1: リポジトリのクローン

```bash
git clone <repository-url>
cd project-management-app
```

### Step 2: 依存関係のインストール

```bash
pnpm install
```

このコマンドで以下が実行されます：
- すべてのワークスペースの依存関係をインストール
- `node_modules`の作成
- ロックファイルの生成

### Step 3: 環境変数の設定

1. **`.env`ファイルの作成**
   ```bash
   cp .env.example .env
   ```

2. **必須の環境変数を設定**

   `.env`ファイルを開き、以下を設定：

   ```env
   # Database（ローカル開発用）
   DATABASE_URL="file:./dev.db"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="<ここに生成したシークレット>"

   # その他はオプション
   ```

3. **NEXTAUTH_SECRETの生成**

   ターミナルで以下を実行：
   ```bash
   openssl rand -base64 32
   ```

   出力された文字列を`NEXTAUTH_SECRET`に設定します。

### Step 4: データベースのセットアップ

```bash
# Prismaクライアントの生成
pnpm db:generate

# データベースの初期化
pnpm db:push
```

これで`prisma/dev.db`ファイルが作成されます。

### Step 5: 開発サーバーの起動

```bash
# Webアプリケーションを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## 外部サービスの設定

### GitHub API連携（オプション）

GitHub APIを使用してIssueと連携する場合：

#### 1. Personal Access Tokenの作成

1. GitHubにログイン
2. 右上のアイコン → **Settings**
3. 左メニュー → **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token (classic)** をクリック
6. 必要なスコープを選択：
   - ✅ `repo` (フルアクセス)
   - ✅ `read:user`
7. **Generate token** をクリック
8. トークンをコピー（一度しか表示されません！）

#### 2. 環境変数に設定

`.env`ファイルに追加：
```env
GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxxxxxxxxxxx"
```

#### 3. 動作確認

1. Webアプリにアクセス
2. プロジェクトを作成
3. GitHubリポジトリURLを設定
4. タスクを作成して「GitHubと連携」ボタンをクリック

---

### Slack通知連携（オプション）

Slackに通知を送信する場合：

#### 1. Slack Appの作成

1. https://api.slack.com/apps にアクセス
2. **Create New App** → **From scratch**
3. App Nameとワークスペースを選択
4. **Create App** をクリック

#### 2. Incoming Webhooksの設定

1. 左メニュー → **Features** → **Incoming Webhooks**
2. **Activate Incoming Webhooks** をONに
3. **Add New Webhook to Workspace** をクリック
4. 通知を送信するチャンネルを選択
5. **Allow** をクリック
6. Webhook URLをコピー

#### 3. 環境変数に設定

`.env`ファイルに追加：
```env
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx/xxx/xxx"
```

#### 4. 動作確認

1. プロジェクトまたはタスクを作成/更新
2. Slackに通知が届くことを確認

---

## データベースの管理

### Prisma Studioの使用

GUIでデータベースを確認・編集できます：

```bash
pnpm db:studio
```

ブラウザで http://localhost:5555 が開きます。

### テストデータの作成

開発中にテストデータが必要な場合：

1. Prisma Studioを開く
2. `User`モデルを開き、ユーザーを作成
3. `Project`モデルを開き、プロジェクトを作成（userIdを設定）
4. `Task`モデルを開き、タスクを作成（projectIdを設定）

---

## トラブルシューティング

### エラー: `pnpm: command not found`

**原因**: pnpmがインストールされていない

**解決方法**:
```bash
npm install -g pnpm
```

---

### エラー: `Prisma Client could not find`

**原因**: Prismaクライアントが生成されていない

**解決方法**:
```bash
pnpm db:generate
```

---

### エラー: `EADDRINUSE: Port 3000 is already in use`

**原因**: ポート3000が既に使用されている

**解決方法**:
1. 別のアプリケーションを停止する
2. または、別のポートを使用：
   ```bash
   PORT=3001 pnpm dev
   ```

---

### エラー: データベース接続エラー

**原因**: DATABASE_URLが正しくない

**解決方法**:
1. `.env`ファイルを確認
2. `DATABASE_URL="file:./dev.db"` になっているか確認
3. データベースを再作成：
   ```bash
   rm prisma/dev.db
   pnpm db:push
   ```

---

### モバイルアプリが起動しない

**原因**: Expoの設定が不完全

**解決方法**:
1. Expo CLIをインストール：
   ```bash
   npm install -g expo-cli
   ```
2. モバイルディレクトリで依存関係を再インストール：
   ```bash
   cd apps/mobile
   pnpm install
   ```

---

## 次のステップ

セットアップが完了したら：

1. **機能を試す**: ダッシュボードでプロジェクトとタスクを作成
2. **コードを確認**: `apps/web/src/app/`のページコンポーネントを見る
3. **APIを確認**: `apps/web/src/app/api/`のエンドポイントを見る
4. **カスタマイズ**: UIや機能を自分好みに変更

---

## サポート

問題が解決しない場合：

1. エラーメッセージ全文をコピー
2. GitHubでIssueを作成
3. または、READMEの連絡先に問い合わせ

---

Good luck! 🚀
