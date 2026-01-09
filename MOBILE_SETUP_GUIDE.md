# モバイルアプリ セットアップガイド

このガイドでは、React Nativeモバイルアプリケーションをローカル環境およ実機で動作させるための詳細な手順を説明します。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [初期セットアップ](#初期セットアップ)
3. [ローカル開発](#ローカル開発)
4. [実機でのテスト](#実機でのテスト)
5. [トラブルシューティング](#トラブルシューティング)
6. [ビルドとデプロイ](#ビルドとデプロイ)

---

## 前提条件

### 必須ソフトウェア

1. **Node.js** (v18以上)
2. **pnpm** (v8以上)
3. **Expo CLI** (自動的にインストールされます)

### オプション（ネイティブビルド用）

- **iOS開発**: Mac + Xcode
- **Android開発**: Android Studio + SDK

---

## 初期セットアップ

### Step 1: プロジェクトのクローンと依存関係インストール

```bash
# リポジトリをクローン済みの前提

# ルートディレクトリで全体の依存関係をインストール
pnpm install
```

### Step 2: モバイルアプリの環境変数設定

```bash
cd apps/mobile

# .envファイルを作成
cp .env.example .env
```

`.env`ファイルを開いて編集：

```env
# ローカル開発用
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000
APP_ENV=development
DEBUG_MODE=true
```

### Step 3: 設定の確認

`.env`ファイルが以下の条件を満たしていることを確認：

✅ `API_BASE_URL`が設定されている
✅ URLが`http://`または`https://`で始まる
✅ ファイルが`.gitignore`に含まれている（自動）

---

## ローカル開発

### Step 1: Web APIサーバーを起動

モバイルアプリはWeb APIに接続するため、最初にWeb APIを起動する必要があります。

**ターミナル1（ルートディレクトリ）**:
```bash
# Web APIサーバーを起動
pnpm dev
```

サーバーが起動したら、`http://localhost:3000`でアクセスできることを確認してください。

### Step 2: モバイルアプリを起動

**ターミナル2（apps/mobileディレクトリ）**:
```bash
cd apps/mobile
pnpm start
```

### Step 3: アプリを開く

Expoが起動したら、以下のオプションが表示されます：

```
› Press i │ open iOS simulator
› Press a │ open Android emulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands
```

**推奨**: 初回は`w`を押してWebブラウザで開き、動作を確認してください。

---

## 実機でのテスト

実機（iPhoneやAndroidスマートフォン）でテストするには、追加の手順が必要です。

### 前提条件

1. **Expo Goアプリ**をインストール
   - [iOS版](https://apps.apple.com/app/expo-go/id982107779)
   - [Android版](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **同じWi-Fiネットワーク**
   - 開発マシンとモバイルデバイスが同じネットワークに接続されている必要があります

### Step 1: 開発マシンのIPアドレスを確認

#### Mac/Linux:
```bash
# 方法1
ifconfig | grep "inet "

# 方法2
ipconfig getifaddr en0

# 出力例: 192.168.1.100
```

#### Windows:
```bash
ipconfig

# 「IPv4 アドレス」を確認
# 例: 192.168.1.100
```

**注意**: `127.0.0.1`や`localhost`ではなく、`192.168.x.x`のようなローカルネットワークIPを使用してください。

### Step 2: .envファイルを更新

取得したIPアドレスを使用して`.env`を更新：

```env
# 例: あなたのIPが192.168.1.100の場合
API_BASE_URL=http://192.168.1.100:3000
API_TIMEOUT=30000
APP_ENV=development
DEBUG_MODE=true
```

### Step 3: Web APIサーバーを再起動

設定を変更したら、Web APIサーバーを再起動：

```bash
# Ctrl+C で停止して再起動
pnpm dev
```

### Step 4: モバイルアプリを再起動

```bash
# Ctrl+C で停止して再起動
pnpm start
```

### Step 5: QRコードをスキャン

1. Expo Goアプリを開く
2. 「Scan QR Code」をタップ
3. ターミナルに表示されているQRコードをスキャン
4. アプリが起動します

### トラブルシューティング (実機)

#### エラー: "Unable to resolve host"

**原因**: デバイスがAPIサーバーに接続できない

**チェックリスト**:
1. 開発マシンとデバイスが同じWi-Fiに接続されているか
2. `.env`のIPアドレスが正しいか（`localhost`ではなくローカルIP）
3. ファイアウォールがポート3000をブロックしていないか
4. Web APIサーバーが起動しているか

**解決方法**:

**Mac**:
```bash
# ファイアウォールでポート3000を許可
# システム環境設定 > セキュリティとプライバシー > ファイアウォール
```

**Windows**:
```bash
# Windows Defenderファイアウォールでポート3000を許可
# コントロールパネル > システムとセキュリティ > Windows Defender ファイアウォール
```

#### エラー: "Network request failed"

**解決方法**:
1. ブラウザで`http://[あなたのIP]:3000/api/projects`にアクセスして確認
2. アクセスできない場合、ファイアウォール設定を確認
3. アクセスできる場合、モバイルアプリを再起動

---

## トラブルシューティング

### エラー: "Configuration errors"

**症状**: アプリ起動時にエラーログが表示される

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. `.env`ファイルが存在するか確認
2. `API_BASE_URL`が設定されているか確認
3. 以下のコマンドでアプリを再起動:
   ```bash
   # キャッシュをクリアして再起動
   pnpm start --clear
   ```

### エラー: "Unable to resolve module"

**原因**: 依存関係が正しくインストールされていない

**解決方法**:
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install

# Expoキャッシュをクリア
pnpm start --clear
```

### エラー: "Metro Bundler has encountered an error"

**解決方法**:
```bash
# Metroキャッシュをクリア
pnpm start --clear

# または
npx expo start -c
```

### iOS Simulatorが起動しない (Mac)

**原因**: Xcodeがインストールされていない、またはライセンスに同意していない

**解決方法**:
1. Xcodeをインストール
2. Xcodeを開いてライセンスに同意
3. 以下のコマンドを実行:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app
   sudo xcodebuild -license accept
   ```

### Android Emulatorが起動しない

**解決方法**:
1. Android Studioをインストール
2. AVD Manager でエミュレーターを作成
3. エミュレーターを手動で起動してから、Expoで`a`キーを押す

---

## ビルドとデプロイ

### EAS Buildのセットアップ

```bash
# EAS CLIをグローバルにインストール
npm install -g eas-cli

# Expoアカウントにログイン
eas login

# プロジェクトを設定
eas build:configure
```

### 開発ビルドの作成

```bash
# Android
pnpm build:android

# iOS (Macのみ)
pnpm build:ios
```

### App Store / Google Playへの提出

```bash
# 設定ファイル (eas.json) を作成
{
  "build": {
    "production": {
      "env": {
        "API_BASE_URL": "https://your-production-api.vercel.app"
      }
    }
  }
}

# ビルドして提出
pnpm submit:ios    # iOS
pnpm submit:android # Android
```

---

## 環境変数の管理

### 開発環境

`.env`:
```env
API_BASE_URL=http://localhost:3000  # または開発マシンのIP
APP_ENV=development
DEBUG_MODE=true
```

### ステージング環境

`.env.staging`:
```env
API_BASE_URL=https://staging-api.vercel.app
APP_ENV=staging
DEBUG_MODE=false
```

### 本番環境

`.env.production`:
```env
API_BASE_URL=https://api.vercel.app
APP_ENV=production
DEBUG_MODE=false
```

**重要**: これらのファイルは`.gitignore`に含まれており、コミットされません。

---

## 次のステップ

セットアップが完了したら:

1. **機能を試す**: ダッシュボードでプロジェクトとタスクを作成
2. **コードを確認**: `src/app/`のファイルを見る
3. **APIを確認**: `src/services/api/`のファイルを見る
4. **カスタマイズ**: UIや機能を自分好みに変更

---

## サポート

問題が解決しない場合:

1. このガイドのトラブルシューティングセクションを再確認
2. `apps/mobile/README.md`を確認
3. ルートディレクトリの`README.md`を確認
4. GitHubでIssueを作成

---

Good luck! 📱🚀
