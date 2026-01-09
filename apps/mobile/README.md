# プロジェクト管理アプリ - モバイル版（React Native）

React Native + Expoで構築されたプロフェッショナルなプロジェクト管理モバイルアプリケーションです。

---

## 🚀 特徴

- **クロスプラットフォーム**: iOS、Android、Web対応
- **型安全**: TypeScript完全対応
- **セキュア**: 環境変数の安全な管理
- **オフライン対応**: ローカルストレージを使用
- **モダンUI**: ネイティブコンポーネント使用
- **API統合**: WebアプリAPIと完全同期

---

## 📱 動作環境

- Node.js 18.x以上
- Expo CLI
- iOS Simulator (Mac) または Android Emulator
- 実機（Expo Goアプリ経由）

---

## 🛠 セットアップ手順

### 1. 依存関係のインストール

```bash
cd apps/mobile
pnpm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# ローカル開発（Web APIが localhost:3000 で動作している場合）
API_BASE_URL=http://localhost:3000

# 実機テスト（あなたのマシンのローカルIPアドレスを使用）
# API_BASE_URL=http://192.168.1.100:3000

# 本番環境
# API_BASE_URL=https://your-api.vercel.app
```

**重要**: 実機でテストする場合、`localhost`は使用できません。代わりに、開発マシンのローカルIPアドレスを使用してください。

### 3. Web APIサーバーの起動

モバイルアプリはWeb APIに接続するため、先にWebサーバーを起動する必要があります：

```bash
# ルートディレクトリで
pnpm dev
```

### 4. モバイルアプリの起動

```bash
# モバイルディレクトリで
pnpm start
```

その後、以下のいずれかを選択：
- `i` - iOS Simulatorで開く (Macのみ)
- `a` - Android Emulatorで開く
- `w` - Webブラウザで開く
- QRコードをスキャン - 実機で開く（Expo Go必要）

---

## 📦 プロジェクト構造

```
apps/mobile/
├── src/
│   ├── app/                 # Expoルーティング (画面)
│   │   ├── _layout.tsx     # ルートレイアウト
│   │   ├── index.tsx       # ダッシュボード
│   │   ├── projects/       # プロジェクト関連画面
│   │   └── tasks/          # タスク関連画面
│   │
│   ├── components/          # UIコンポーネント
│   │   └── ui/             # 再利用可能なUIコンポーネント
│   │
│   ├── services/           # APIサービス
│   │   └── api/            # API通信層
│   │
│   └── config/             # 設定
│       └── index.ts        # 環境変数管理
│
├── assets/                 # 画像、アイコン
├── app.json               # Expo設定
├── app.config.js          # 動的Expo設定
├── babel.config.js        # Babel設定
├── tsconfig.json          # TypeScript設定
├── package.json           # 依存関係
└── .env.example           # 環境変数サンプル
```

---

## 🔑 API接続設定

### ローカル開発

1. **Web APIを起動**:
   ```bash
   # ルートディレクトリで
   pnpm dev
   ```

2. **モバイルアプリの環境変数を設定**:
   ```env
   # Simulatorの場合
   API_BASE_URL=http://localhost:3000

   # 実機の場合（開発マシンのIPを使用）
   API_BASE_URL=http://192.168.1.100:3000
   ```

### 本番環境

1. WebアプリをVercelにデプロイ
2. デプロイされたURLを環境変数に設定:
   ```env
   API_BASE_URL=https://your-app.vercel.app
   ```

---

## 🌐 実機でのテスト方法

### ステップ1: 開発マシンのIPアドレスを確認

**Mac/Linux**:
```bash
ifconfig | grep "inet "
# または
ipconfig getifaddr en0
```

**Windows**:
```bash
ipconfig
```

### ステップ2: .envファイルを更新

```env
API_BASE_URL=http://[あなたのIP]:3000
# 例: API_BASE_URL=http://192.168.1.100:3000
```

### ステップ3: Web APIサーバーを起動

```bash
pnpm dev
```

### ステップ4: モバイルアプリを起動

```bash
pnpm start
```

### ステップ5: QRコードをスキャン

- Expo Goアプリ（iOS/Android）でQRコードをスキャン
- アプリが起動します

**注意**: 開発マシンとモバイルデバイスが同じWi-Fiネットワークに接続されている必要があります。

---

## 🔒 セキュリティ設定

### 環境変数の管理

- **絶対に`.env`ファイルをコミットしないでください**
- `.env.example`のみコミットしてください
- 機密情報（APIキー、トークン）は環境変数に保存
- `app.config.js`を通じて安全に公開

### .gitignoreの確認

以下が`.gitignore`に含まれていることを確認：

```
.env
.env.local
.env.*.local
```

---

## 📱 ビルドとリリース

### EAS Build（推奨）

```bash
# 初回のみ: EAS CLIをインストール
npm install -g eas-cli

# EASにログイン
eas login

# プロジェクトを設定
eas build:configure

# Androidビルド
pnpm build:android

# iOSビルド (Macのみ)
pnpm build:ios
```

### App Store / Google Playへの提出

```bash
# iOS
pnpm submit:ios

# Android
pnpm submit:android
```

---

## 🐛 トラブルシューティング

### エラー: "Network request failed"

**原因**: APIサーバーに接続できない

**解決方法**:
1. Web APIサーバーが起動しているか確認
2. `.env`のAPI_BASE_URLが正しいか確認
3. 実機の場合、開発マシンのIPアドレスを使用
4. ファイアウォールがポート3000をブロックしていないか確認

### エラー: "Configuration errors"

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. `.env`ファイルが存在するか確認
2. `API_BASE_URL`が設定されているか確認
3. アプリを再起動（Expo Goを完全に終了して再起動）

### iOS Simulatorでビルドエラー

**原因**: Podsが正しくインストールされていない

**解決方法**:
```bash
cd ios
pod install
cd ..
```

### Metro Bundlerがクラッシュする

**解決方法**:
```bash
# キャッシュをクリア
pnpm start --clear
```

---

## 🧪 開発ツール

### デバッグ

- **React Developer Tools**: Expoアプリ内で`d`キーを押す
- **Chrome DevTools**: `j`キーを押してデバッガーを開く
- **Expo DevTools**: ブラウザで自動的に開きます

### ホットリロード

- ファイルを保存すると自動的にリロードされます
- 手動リロード: Expoアプリで`r`キーを押す

---

## 📚 使用技術

- **React Native** 0.73 - モバイルフレームワーク
- **Expo** ~50.0 - 開発プラットフォーム
- **TypeScript** 5.3 - 型安全な開発
- **React Query** 5.14 - データフェッチング
- **Axios** 1.6 - HTTP クライアント
- **Expo Router** 3.4 - ファイルベースルーティング
- **Zustand** 4.4 - 状態管理

---

## 🎨 UIコンポーネント

カスタムUIコンポーネント:
- `Button` - ボタン（primary, secondary, danger, outline）
- `Card` - カード
- `Badge` - バッジ（ステータス、優先度）
- `Input` - テキスト入力
- `LoadingSpinner` - ローディング表示
- `ErrorView` - エラー表示

---

## 📞 サポート

問題が発生した場合:

1. このREADMEのトラブルシューティングセクションを確認
2. ルートディレクトリの`README.md`を確認
3. GitHubでIssueを作成

---

## 🎓 学習リソース

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## 📄 ライセンス

MIT License

---

**開発者へのメモ**: このアプリケーションは、実務レベルのReact Native開発スキルを示すために設計されています。セキュリティ、パフォーマンス、ユーザビリティに細心の注意を払って実装されています。
