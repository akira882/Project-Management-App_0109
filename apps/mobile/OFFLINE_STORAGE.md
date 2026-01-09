# オフラインストレージ機能

## 概要

このアプリは、AsyncStorageを使用してオフライン時でもデータにアクセスできる機能を実装しています。

## 機能

### 1. 自動キャッシュ
- APIから取得したデータを自動的にローカルストレージに保存
- プロジェクト一覧とタスク一覧をキャッシュ

### 2. オフライン時の動作
- ネットワーク接続がない場合、自動的にキャッシュデータを表示
- オフライン状態を画面上部に表示

### 3. 同期管理
- 最終同期時刻を記録
- キャッシュの有効期限管理（デフォルト: 5分）

## 使用方法

### StorageService

```typescript
import StorageService from '@/services/storage';

// プロジェクトを保存
await StorageService.saveProjects(projects);

// プロジェクトを取得
const projects = await StorageService.getProjects();

// タスクを保存
await StorageService.saveTasks(tasks);

// タスクを取得
const tasks = await StorageService.getTasks();

// キャッシュが有効かチェック
const isValid = await StorageService.isCacheValid('projects', 5);

// 最終同期時刻を取得
const lastSync = await StorageService.getLastSyncTime('projects');
```

### オフライン対応フック

```typescript
import { useOfflineProjects, useOfflineTasks } from '@/hooks/useOfflineData';

function MyComponent() {
  // 自動的にオフライン対応
  const { data: projects } = useOfflineProjects();
  const { data: tasks } = useOfflineTasks();

  return (
    // ...
  );
}
```

### ネットワークステータス表示

```typescript
import { NetworkStatus } from '@/components/ui';

function App() {
  return (
    <>
      <NetworkStatus />
      {/* その他のコンテンツ */}
    </>
  );
}
```

## データフロー

1. **オンライン時:**
   - API → データ取得
   - StorageService → データ保存
   - 画面表示

2. **オフライン時:**
   - StorageService → キャッシュデータ取得
   - 画面表示（オフライン警告表示）

3. **再接続時:**
   - API → 最新データ取得
   - StorageService → データ更新
   - 画面更新

## キャッシュストラテジー

### Cache-First with Network Fallback
1. まずキャッシュを確認
2. キャッシュがあれば即座に表示
3. バックグラウンドでAPIから最新データ取得
4. 最新データでUIを更新

### Network-First with Cache Fallback
1. まずAPIにリクエスト
2. 成功したらデータを表示＆キャッシュ
3. 失敗したらキャッシュから取得
4. キャッシュもなければエラー表示

現在の実装は **Network-First with Cache Fallback** を採用しています。

## セキュリティ考慮事項

### 保存するデータ
- ✅ プロジェクト一覧
- ✅ タスク一覧
- ✅ ユーザー設定（UIの表示設定など）

### 保存しないデータ
- ❌ APIキー、トークン
- ❌ パスワード
- ❌ 個人を特定できる機密情報

### データの暗号化
現在の実装では平文で保存していますが、必要に応じて以下のライブラリで暗号化できます：
- `expo-secure-store`: iOS Keychainとの連携
- `react-native-encrypted-storage`: 暗号化ストレージ

## デバッグ

### AsyncStorageの内容を確認

React Native Debuggerや以下のコマンドで確認できます：

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// すべてのキーを取得
const keys = await AsyncStorage.getAllKeys();
console.log('Stored keys:', keys);

// すべてのデータを取得
const items = await AsyncStorage.multiGet(keys);
console.log('Stored items:', items);
```

### キャッシュをクリア

```typescript
import StorageService from '@/services/storage';

// すべてのキャッシュをクリア
await StorageService.clear();
```

## 今後の拡張案

1. **オフライン時の書き込み対応**
   - 変更をキューに保存
   - 再接続時に自動同期

2. **選択的同期**
   - ユーザーが必要なデータのみダウンロード
   - ストレージ容量の最適化

3. **差分同期**
   - 変更分のみ送受信
   - 通信量の削減

4. **コンフリクト解決**
   - オフライン時の変更とサーバーの変更が競合した場合の処理
   - Last-Write-Wins または Manual Resolution

## パフォーマンス

### ストレージ容量
- AsyncStorageの推奨上限: 6MB
- 現在の使用量目安:
  - プロジェクト100件: ~100KB
  - タスク1000件: ~500KB
  - 十分な余裕あり

### 読み書き速度
- 読み込み: ~10ms（1000件のデータ）
- 書き込み: ~20ms（1000件のデータ）
- UIブロックなし（非同期処理）

## トラブルシューティング

### キャッシュが更新されない
- React QueryのstaleTimeを確認
- ネットワーク接続を確認
- 手動でrefetchを実行

### データが古い
- キャッシュの有効期限を短くする
- Pull-to-refreshで手動更新

### ストレージエラー
- ストレージ容量を確認
- キャッシュをクリアして再試行
