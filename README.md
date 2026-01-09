# プロジェクト管理アプリケーション

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**CRUD機能と外部連携を備えたプロフェッショナルなプロジェクト管理アプリケーション**

即戦力として採用されるレベルの高品質なポートフォリオとして開発されたフルスタックアプリケーションです。

---

## 🎯 プロジェクト概要

このアプリケーションは、以下の要件を満たすプロフェッショナルなプロジェクト管理ツールです：

- ✅ **完全なCRUD機能**（作成・読み取り・更新・削除）
- 🔗 **外部API連携**（GitHub、Slack）
- 📱 **マルチプラットフォーム対応**（Web + Mobile）
- 🏗️ **モノレポ構成**（効率的なコード管理）
- 🔐 **型安全性**（TypeScript完全対応）

---

## ✨ 主な機能

### コア機能
- **プロジェクト管理**: プロジェクトの作成、編集、削除、ステータス管理
- **タスク管理**: タスクの作成、編集、削除、優先度管理、期限設定
- **ダッシュボード**: プロジェクトとタスクの統計情報を視覚化
- **フィルタリング**: ステータス、優先度、担当者による絞り込み
- **検索機能**: プロジェクトとタスクの全文検索

### 外部連携機能
- **GitHub API統合**
  - リポジトリ情報の取得
  - Issueの同期
  - タスクとIssueの連携

- **Slack通知統合**
  - プロジェクト作成/更新の通知
  - タスク完了の通知
  - カスタムWebhook対応

---

## 🛠 技術スタック

### フロントエンド（Web）
- **Next.js 14** - App Router、Server Actions
- **React 18** - 最新のフック、サスペンス
- **TypeScript 5.3** - 完全な型安全性
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Query** - サーバー状態管理
- **Zustand** - クライアント状態管理

### フロントエンド（Mobile）
- **React Native** - クロスプラットフォームモバイル開発
- **Expo** - 開発環境とビルドツール
- **React Navigation** - ネイティブナビゲーション

### バックエンド
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - タイプセーフなデータベースアクセス
- **SQLite** - 開発環境（PostgreSQL対応済み）
- **Zod** - バリデーションスキーマ

### 開発ツール
- **pnpm** - パッケージマネージャー（モノレポ対応）
- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマット
- **TypeScript** - 型チェック

---

## 📁 プロジェクト構成

```
project-management-app/
├── apps/
│   ├── web/                    # Next.js Webアプリケーション
│   │   ├── src/
│   │   │   ├── app/           # App Routerページ
│   │   │   ├── components/    # UIコンポーネント
│   │   │   └── lib/           # ユーティリティ、API
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── mobile/                 # React Nativeアプリケーション
│       ├── src/
│       │   └── app/           # Expoルーティング
│       ├── app.json
│       └── package.json
│
├── packages/
│   └── shared/                 # 共有パッケージ
│       └── src/
│           ├── types/         # 型定義
│           └── utils/         # 共通ユーティリティ
│
├── prisma/
│   └── schema.prisma          # データベーススキーマ
│
├── package.json               # ルートpackage.json
├── pnpm-workspace.yaml        # ワークスペース設定
└── README.md
```

---

## 🚀 セットアップガイド

### 必要な環境

- **Node.js**: 18.x 以上
- **pnpm**: 8.x 以上
- **Git**: 最新版

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/project-management-app.git
cd project-management-app
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<opensslで生成したランダム文字列>"

# GitHub OAuth（オプション）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_PERSONAL_ACCESS_TOKEN="your-personal-access-token"

# Slack OAuth（オプション）
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
```

**NEXTAUTH_SECRETの生成方法：**
```bash
openssl rand -base64 32
```

### 4. データベースのセットアップ

```bash
# Prismaクライアントの生成
pnpm db:generate

# データベースのマイグレーション
pnpm db:push
```

### 5. 開発サーバーの起動

#### Webアプリケーション
```bash
pnpm dev
```
→ http://localhost:3000 でアクセス

#### モバイルアプリケーション
```bash
pnpm dev:mobile
```

---

## 🎨 主要ページ

### Web版

| ページ | URL | 説明 |
|--------|-----|------|
| ホーム | `/` | アプリケーションの紹介 |
| ダッシュボード | `/dashboard` | 統計情報とクイックアクセス |
| プロジェクト一覧 | `/projects` | すべてのプロジェクト |
| プロジェクト詳細 | `/projects/[id]` | プロジェクトとタスクの詳細 |
| タスク一覧 | `/tasks` | すべてのタスク |

---

## 🔌 API エンドポイント

### プロジェクトAPI

```typescript
GET    /api/projects          // プロジェクト一覧取得
POST   /api/projects          // プロジェクト作成
GET    /api/projects/[id]     // プロジェクト詳細取得
PATCH  /api/projects/[id]     // プロジェクト更新
DELETE /api/projects/[id]     // プロジェクト削除
```

### タスクAPI

```typescript
GET    /api/tasks             // タスク一覧取得
POST   /api/tasks             // タスク作成
GET    /api/tasks/[id]        // タスク詳細取得
PATCH  /api/tasks/[id]        // タスク更新
DELETE /api/tasks/[id]        // タスク削除
```

### 外部連携API

```typescript
// GitHub
GET    /api/integrations/github/repos          // リポジトリ一覧
GET    /api/integrations/github/issues         // Issue一覧
POST   /api/integrations/github/issues         // Issue作成

// Slack
POST   /api/integrations/slack/notify          // 通知送信
```

---

## 📊 データベーススキーマ

### 主要モデル

```prisma
model Project {
  id              String          @id @default(uuid())
  name            String
  description     String?
  status          ProjectStatus   // PLANNING, IN_PROGRESS, etc.
  priority        ProjectPriority // LOW, MEDIUM, HIGH, URGENT
  startDate       DateTime?
  endDate         DateTime?
  githubRepoUrl   String?
  slackChannelId  String?
  userId          String
  tasks           Task[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Task {
  id                String       @id @default(uuid())
  title             String
  description       String?
  status            TaskStatus   // TODO, IN_PROGRESS, etc.
  priority          TaskPriority
  dueDate           DateTime?
  estimatedHours    Float?
  actualHours       Float?
  githubIssueNumber Int?
  githubIssueUrl    String?
  projectId         String
  assigneeId        String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}
```

---

## 🔧 外部連携の設定

### GitHub API連携

1. **Personal Access Token の作成**
   - GitHub → Settings → Developer settings → Personal access tokens
   - 必要なスコープ: `repo`, `read:user`

2. **環境変数に設定**
   ```env
   GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxxxxxxxxxxx"
   ```

### Slack通知連携

1. **Slack Appの作成**
   - https://api.slack.com/apps にアクセス
   - 「Create New App」をクリック

2. **Incoming Webhooksの有効化**
   - Features → Incoming Webhooks → On
   - Webhook URLを取得

3. **環境変数に設定**
   ```env
   SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx/xxx/xxx"
   ```

---

## 🚢 デプロイ

### Vercelへのデプロイ（Web）

1. **Vercelにプッシュ**
   ```bash
   # Vercel CLIをインストール
   npm i -g vercel

   # デプロイ
   cd apps/web
   vercel
   ```

2. **環境変数の設定**
   - Vercel Dashboard → Settings → Environment Variables
   - `.env`の内容を追加

3. **データベースの設定**
   - 本番環境ではPostgreSQLを推奨（Vercel Postgres、Supabase等）

### Expoへのデプロイ（Mobile）

```bash
cd apps/mobile

# iOS
expo build:ios

# Android
expo build:android
```

---

## 📝 コマンド一覧

```bash
# 開発
pnpm dev              # Webアプリ起動
pnpm dev:mobile       # モバイルアプリ起動

# ビルド
pnpm build            # Webアプリビルド
pnpm build:mobile     # モバイルアプリビルド

# データベース
pnpm db:generate      # Prismaクライアント生成
pnpm db:push          # DBスキーマ同期
pnpm db:studio        # Prisma Studio起動

# コード品質
pnpm lint             # ESLint実行
pnpm type-check       # TypeScriptチェック
pnpm format           # Prettierフォーマット
```

---

## 🏆 ポートフォリオとしての強み

このプロジェクトは、システム開発会社の採用担当者が「即戦力」と評価するレベルの実装を目指しています：

### 技術的な強み
- ✅ **モダンな技術スタック** - 最新のベストプラクティスを採用
- ✅ **型安全性** - TypeScriptによる完全な型保護
- ✅ **スケーラブルなアーキテクチャ** - モノレポによる効率的な管理
- ✅ **外部API連携** - 実務で必須のスキルを実装
- ✅ **マルチプラットフォーム** - Web + Mobileの開発経験

### 実装品質
- ✅ **RESTful API設計** - 標準的なAPIパターン
- ✅ **エラーハンドリング** - 適切な例外処理とバリデーション
- ✅ **データベース設計** - 正規化された効率的なスキーマ
- ✅ **レスポンシブデザイン** - モバイルファーストUI
- ✅ **コード品質** - ESLint、Prettierによる一貫性

---

## 🎓 学習・参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Slack API Documentation](https://api.slack.com/)

---

## 📄 ライセンス

MIT License - 自由に使用、修正、配布できます。

---

## 👨‍💻 作者

**即戦力エンジニア候補**
- Portfolio: [このリポジトリ]
- GitHub: [@yourusername]

---

## 🙏 謝辞

このプロジェクトは、実際のWebアプリケーション開発業務での活用を想定し、業界標準の技術とベストプラクティスを組み合わせて開発されました。

採用担当者の皆様、ご覧いただきありがとうございます。
