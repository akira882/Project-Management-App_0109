# 要件定義書

**プロジェクト名**: 中小FA電気工事会社向け 現場業務支援モバイルアプリケーション
**サブタイトル**: Project-Management-App_0109 / FA Mobile Edition
**版**: 2.0
**作成日**: 2026-06-07
**最終更新**: 2026-06-07
**対象読者**: プロダクトオーナー、開発リード、QA、UXデザイナー、現場責任者、経営層

---

## 0. 改訂履歴

| 版 | 日付 | 変更内容 | 作成者 |
|----|------|----------|--------|
| 0.1 | 2026-06-07 | 初版骨子 | — |
| 1.0 | 2026-06-07 | レビュー反映、確定版 | — |
| 2.0 | 2026-06-07 | ユーザーストーリー(§15)・API 設計(§16)・データモデル詳細(§17)・画面仕様(§18)・テスト戦略(§19)・体制(§20)・詳細リスクレジスタ(§21) を追加 | — |

---

## 1. プロジェクト概要

### 1.1 背景
本リポジトリには既に Next.js 14（Web）と Expo / React Native（モバイル）によるプロジェクト管理アプリが存在し、`apps/mobile/src/app/electrical-mobile/` および `apps/web/src/app/electrical/` 配下に「電気工事案件管理」の MVP（案件 CRUD・ステータス変更・施工写真のローカル保管）が実装済みである。一方で、当社の主要顧客である**中小製造業向け FA（ファクトリーオートメーション）電気工事**特有の業務 — 制御盤製作・現地配線・PLC 結線・試運転・引渡 — は未対応であり、紙日報・個人スマホ撮影・Excel 二重入力により以下が発生している。

- 施工写真の散在・案件への紐付け漏れ（証跡管理リスク）
- 紙日報の事務所再入力（推定 1 人月／年）
- 紙図面と現場の差分（後戻り工事の発生）
- 工数・原価の遅延把握による低採算案件の見落とし
- KY・安全記録の保管漏れ（労安法対応リスク）

### 1.2 目的
**現場・事務所・顧客を一気通貫でつなぐモバイル中心の業務基盤を構築し、(1) 二重入力ゼロ、(2) 証跡の自動収集、(3) 原価のリアルタイム可視化、(4) 安全・品質コンプライアンス強化を実現する。**

### 1.3 ゴール（KGI）
| # | 指標 | 現状 | 1 年後目標 |
|---|------|------|-----------|
| G1 | 日報作成にかかる平均時間／人日 | 25 分 | 5 分 |
| G2 | 施工写真の案件紐付け率 | 60% | 99% |
| G3 | 月次原価確定までのリードタイム | 翌月 15 営業日 | 翌月 3 営業日 |
| G4 | KY・安全記録の電子化率 | 0% | 100% |
| G5 | 現場からの問合せ対応時間（事務所往復） | 平均 90 分 | 平均 15 分 |

### 1.4 スコープ
**対象**: FA 電気工事案件の見積〜現調〜施工〜試運転〜引渡〜保守の各工程を支える社員向け業務アプリ（モバイル中心、Web は管理者用）。
**対象外（v1.0）**: 顧客ポータル、見積積算ロジック（既存 Excel 帳票継続利用）、給与計算、会計仕訳（既存会計 SaaS と CSV/API 連携のみ）、設計 CAD 機能。

---

## 2. 対象ユーザー・ペルソナ

| ID | ペルソナ | 主端末 | 主要利用機能 | 特徴 |
|----|----------|--------|--------------|------|
| P1 | 現場技術者（第一種電気工事士、30〜50 代） | iPhone / Android 個人持込 or 貸与 | 日報、写真、KY、図面閲覧、入退場 | 革手袋・騒音・脚立上での操作 |
| P2 | ベテラン現場責任者（60〜70 代） | iPhone（個人）／7" タブレット | 案件一覧、状態変更、承認 | 老眼・操作に不慣れ。既存 `70代向け_モバイルアプリ操作ガイド.md` 準拠 |
| P3 | 現場監督・施工管理（40 代） | iPad + iPhone | 工程・原価・人員配置、引渡書類 | 顧客打合せに同席。Web 併用 |
| P4 | 内勤事務（事務所） | PC（Web）| 日報集計、請求準備、社保・勤怠連携 | モバイル使用は補助 |
| P5 | 経営層 | iPad / PC | KPI ダッシュボード | 月次・週次レビュー |

**アクセシビリティ要件**: P2 を考慮し、本文 18pt 以上、ボタン 44×44dp 以上、コントラスト比 7:1（WCAG AAA 相当）、色のみに依存しないステータス表現、漢字に振り仮名オプション、誤操作防止（削除は二段確認）を全画面で必須化する。

---

## 3. 業務要件

### 3.1 業務フロー（To-Be）
```
[受注] → [現地調査] → [設計補助] → [部材手配] → [施工(配線・盤据付・結線)]
       → [試運転・検査] → [引渡] → [保守]
```
各工程で本アプリが扱う情報・成果物を §4 機能要件にマッピングする。

### 3.2 業務上の主要シナリオ
- **S1 朝礼〜現場入り**: KY 記録 → 工場入構申請 PDF 表示 → 入場 QR/位置打刻
- **S2 現調**: 既存盤の写真撮影（自動で案件・場所タグ付け）→ 寸法・電源容量メモ → 設計者へ即時共有
- **S3 施工中の発見**: 現場で図面差異を発見 → 図面に赤入れ・写真添付 → 設計者にチャット通知
- **S4 試運転**: I/O リストにチェック → 異常時写真と共に「不具合」として記録 → ダッシュボードへ即時反映
- **S5 引渡**: 検査成績書 PDF を電子署名 → 顧客サインを画面で取得 → クラウドに保存
- **S6 緊急対応**: 顧客から障害連絡 → 過去案件・図面・引渡履歴をオフラインでも検索

---

## 4. 機能要件

凡例: **MUST** = v1.0 必須 / **SHOULD** = v1.0 推奨 / **COULD** = v1.x 候補

### 4.1 案件管理（拡張）
- **F-PJ-01 (MUST)** 既存 `Project` モデルに FA 業務属性を追加（§7 データ要件）。既存 `electrical-mobile` 画面を後方互換で拡張する。
- **F-PJ-02 (MUST)** 案件種別: 新設盤製作 / 現地配線 / 改造 / 保守点検 / トラブル対応 の 5 区分。
- **F-PJ-03 (MUST)** 顧客情報（顧客企業／工場／担当者／入構ルール）を別エンティティ化し、案件と多対 1 で紐付け。
- **F-PJ-04 (SHOULD)** 案件カレンダー・ガントの簡易表示（Web 管理者）。
- **F-PJ-05 (COULD)** Backlog／Microsoft Project からの工程インポート。

### 4.2 作業日報・工数管理
- **F-RP-01 (MUST)** 1 タップ開始／停止のタイマー型工数記録。GPS 取得（取得不可時は手入力）。
- **F-RP-02 (MUST)** 日報テンプレ（午前／午後の作業内容、使用部材、所感、明日の予定）。音声入力対応。
- **F-RP-03 (MUST)** 日報の事務所自動集計（CSV 出力、勤怠 SaaS 連携 v1.1）。
- **F-RP-04 (SHOULD)** 案件・社員別の予実差異ダッシュボード。

### 4.3 施工写真・証跡
- **F-PH-01 (MUST)** 既存 `apps/mobile/src/services/photos.ts` を拡張し、撮影時に案件 ID・GPS・タイムスタンプ・撮影者・カテゴリ（着手前／中間／完成／不具合）を自動メタ付与。
- **F-PH-02 (MUST)** 写真のサーバ同期（現状はローカルのみ）。差分アップロード、回線復帰時の自動再送（§4.10 オフライン）。
- **F-PH-03 (MUST)** **撮影禁止モード**: 顧客機密区域では撮影 UI 自体を無効化（顧客設定で案件単位ロック）。
- **F-PH-04 (SHOULD)** 画像内 EXIF からの位置情報除去オプション（個人情報保護法・顧客機密対応）。
- **F-PH-05 (COULD)** 写真への手書き赤入れ（指 / Apple Pencil）。

### 4.4 図面ビューア
- **F-DR-01 (MUST)** PDF（A1 相当・最大 50MB）の高速ピンチズーム表示、メモリ 200MB 以下で動作。
- **F-DR-02 (MUST)** 案件単位で図面バージョン管理。最新版バッジ。
- **F-DR-03 (SHOULD)** DXF の参照表示（読み取り専用、ライブラリは要技術選定）。
- **F-DR-04 (SHOULD)** 図面への赤入れ・コメントピン（座標保存）。
- **F-DR-05 (COULD)** I/O リスト（Excel）と図面記号の相互ジャンプ。

### 4.5 KY・安全管理
- **F-SF-01 (MUST)** 始業時 KY 入力（危険要因／対策／実施者サイン）。テンプレ＋自由記述。
- **F-SF-02 (MUST)** 高所作業・停電作業・活線作業・LOTO 実施の有無を必須項目として記録。
- **F-SF-03 (MUST)** ヒヤリハット報告（写真・位置・要因タグ）。
- **F-SF-04 (SHOULD)** 安全教育受講記録（特別教育修了証の写し添付）。

### 4.6 検査記録・引渡
- **F-IN-01 (MUST)** I/O リスト・絶縁抵抗測定値・耐電圧試験結果・シーケンス確認結果の電子チェックリスト。閾値外は赤表示・コメント必須。
- **F-IN-02 (MUST)** 検査成績書 PDF の自動生成（社印・担当押印画像差込）。
- **F-IN-03 (MUST)** 顧客電子サイン取得（画面手書き、ハッシュ＋タイムスタンプ保存）。
- **F-IN-04 (SHOULD)** FAT/SAT チェックリストのテンプレート機能。

### 4.7 部材・在庫
- **F-MT-01 (SHOULD)** 倉庫在庫の最低限管理（品番・数量・所在）。バーコード／QR スキャン入力。
- **F-MT-02 (SHOULD)** 案件への部材引当と差戻し。
- **F-MT-03 (COULD)** 発注点アラート、仕入先 CSV 発注。

### 4.8 顧客・コミュニケーション
- **F-CM-01 (MUST)** 案件単位のスレッドチャット（社内）。既存 Slack 連携（`apps/web/src/lib/integrations/slack`）を活用し、案件ごとのチャンネル自動作成。
- **F-CM-02 (SHOULD)** Chatwork、Microsoft Teams、LINE WORKS への通知 Webhook（顧客が指定するツールに合わせる）。
- **F-CM-03 (COULD)** 顧客との共有ビュー（限定公開 URL）。

### 4.9 ダッシュボード
- **F-DB-01 (MUST)** モバイル（現場責任者向け）: 今日の案件、KY 未提出、日報未提出、写真件数。
- **F-DB-02 (MUST)** Web（経営層向け）: 案件別予実、稼働率、安全指標、月次トレンド。

### 4.10 オフライン・同期
- **F-OF-01 (MUST)** 「現場モード」: 案件・図面・KY 帳票を事前ダウンロード。電波圏外でも全操作可能。
- **F-OF-02 (MUST)** 競合解決: 最終更新優先（LWW）を基本とし、写真・日報・KY は追記マージ。
- **F-OF-03 (MUST)** 同期ステータスの常時可視化（送信待ち N 件バッジ）。既存 `apps/mobile/src/hooks/useOfflineData` および `apps/mobile/OFFLINE_STORAGE.md` の方針を発展。

### 4.11 認証・権限
- **F-AU-01 (MUST)** NextAuth.js（既存 `apps/web` の v5-beta）を活用し、メール＋パスコード／生体認証によるログイン。
- **F-AU-02 (MUST)** ロール: 経営層 / 監督 / 現場責任者 / 技術者 / 事務（既存 `User.role` の `ADMIN/MANAGER/USER` を拡張）。
- **F-AU-03 (MUST)** 端末紛失時のリモートワイプ（モバイル）。

### 4.12 外部連携
- **F-EX-01 (SHOULD)** Google Drive / OneDrive への図面・PDF 同期。
- **F-EX-02 (SHOULD)** freee／マネーフォワードクラウドへの原価データ CSV／API 連携。
- **F-EX-03 (COULD)** ジョブカン勤怠／KING OF TIME 連携。
- **F-EX-04 (MUST)** 既存 GitHub 連携は社内システム保守タスク管理として残置。

---

## 5. 非機能要件

### 5.1 性能
| 項目 | 目標 |
|------|------|
| 起動時間（ホットスタート） | < 2.0 秒 |
| 起動時間（コールドスタート） | < 4.0 秒 |
| 写真撮影〜サムネ表示 | < 1.0 秒 |
| 図面 PDF（30MB）初回描画 | < 3.0 秒 |
| API レスポンス p95（オンライン時） | < 500ms |
| オフライン操作の応答 | < 200ms |

### 5.2 可用性・信頼性
- 月間稼働率 99.5%（Web API。モバイルはオフライン動作前提）
- データ損失 RPO ≤ 15 分（同期キュー二重化）／RTO ≤ 4 時間
- 同期キュー失敗時は最大 7 日間保持、UI で再送可能

### 5.3 セキュリティ
- 端末ローカルデータは AES-256 で暗号化（Expo SecureStore＋暗号化 SQLite を検討。現行 `OFFLINE_STORAGE.md` は「暗号化なし」明記のため要更新）。
- 通信は TLS1.3、証明書ピンニング（モバイル）。
- パスワードは Argon2id（NextAuth プロバイダ拡張）。
- 監査ログ: 認証・権限変更・案件削除・写真削除を Append-only で保持（最低 1 年）。
- 個人情報保護法・APPI ガイドライン遵守。EXIF GPS の取り扱いは F-PH-04 のオプションで制御。

### 5.4 端末・OS
- iOS 16 以上、Android 11 以上（API 30+）。
- タブレット縦横両対応。`react-native` 0.73 / Expo 50 ベース（既存に合わせる）。

### 5.5 ユーザビリティ
- WCAG 2.1 AA 準拠。本要件 §2 で定義した P2 制約を反映し、AAA 相当を既定とする。
- ローカライズ: 日本語（既定）。英語は v1.x。
- 手袋装着想定: 主要操作の最小タップ領域 56×56dp。

### 5.6 運用・保守
- ログ集約: クライアントは Sentry、サーバは Vercel Logs ＋ 外部 SIEM 転送（要選定）。
- リリース: OTA（Expo Updates）でホットフィックス対応。バックエンドはブランチデプロイ（既存 `vercel.json`）。
- DB マイグレーションは `pnpm db:generate && pnpm db:push`（dev）と Prisma Migrate（prod、要追加）で実施。

### 5.7 法令・規格遵守
- 電気事業法、電気工事士法、労働安全衛生法
- 個人情報保護法、APPI
- JIS C 0617（電気図記号）に基づくアイコン採用
- JIS B 9960-1 / IEC 60204-1 の検査項目をチェックリストの初期テンプレートとする
- ISO 9001 対応（証跡保管）
- ※建設業許可（電気工事業）の登録区分は会社方針に従い記入欄を提供 — 要確認

---

## 6. UI / UX 要件

- **デザイン原則**: 「片手・手袋・暗所・騒音」を 4 大制約として全画面で検証する。
- **配色**: 既存ブランド色（青 #1E40AF、黄 #F59E0B、緑 #10B981）を踏襲。安全色は JIS Z 9103（赤＝禁止／黄＝警告／緑＝安全）に合わせる。
- **タイポグラフィ**: 既定 18pt、見出し 24pt、強調 32pt。Dynamic Type 対応。
- **ナビゲーション**: タブ 3〜4 個に抑え、`電気工事業務操作ガイド` の構成を踏襲。
- **フィードバック**: 重要操作は触覚（Haptic）＋視覚＋音（オプション）の 3 種。

---

## 7. データ要件

### 7.1 既存スキーマ拡張方針
`prisma/schema.prisma` の `Project` / `Task` / `User` を維持しつつ、FA 業務テーブルを追加する。MVP では文字列フィールド `description` に構造化テキストを書き込んでいた現行実装（`apps/web/src/app/electrical/` 参照）を、正規化テーブルへ段階移行する。

### 7.2 主要エンティティ（追加・拡張）
- **Customer**: 顧客企業（id, name, factories[], primaryContactId）
- **Factory**: 工場・拠点（id, customerId, address, entryRule, hazardousZoneFlags, contactPersons[]）
- **ProjectFA**（`Project` 拡張）: workType（NEW_PANEL / FIELD_WIRING / MODIFICATION / MAINTENANCE / TROUBLE）, factoryId, scheduledStart, scheduledEnd, contractAmount, estimatedCost, photoRestricted, hazardousZone
- **DailyReport**: id, projectId, userId, date, startedAt, endedAt, location（GPS）, contentMorning, contentAfternoon, materials[], note, status（DRAFT/SUBMITTED/APPROVED）
- **KYRecord**: id, projectId, date, hazards[], measures[], signers[]（電子サイン画像 URL）
- **Photo**（既存 client 構造を昇格）: id, projectId, takenById, takenAt, gps, category, fileUrl, hashSha256
- **Inspection**: id, projectId, type（INSULATION / DIELECTRIC / SEQUENCE / IO_CHECK / OTHER）, items[]（key, expected, actual, pass, comment, photoIds[]）
- **HandoverDocument**: id, projectId, pdfUrl, customerSignatureUrl, signedAt, signerName, signerHash
- **Drawing**: id, projectId, version, type（SINGLE_LINE / SEQUENCE / IO_LIST / LAYOUT / OTHER）, fileUrl, uploadedById
- **AuditLog**: actorId, action, entity, entityId, before, after, at

ER 関係は §11 付録に簡易図を添付する想定。

### 7.3 データ保持・削除
- 案件完了後 10 年保持（電気事業法・税法を上回る安全値）。
- 個人情報を含む写真は、顧客退会後 90 日で物理削除。

---

## 8. 外部システム連携

| 連携先 | 種別 | 方式 | 優先度 | 既存資産 |
|--------|------|------|--------|----------|
| Slack | 通知・チャット | Incoming Webhook | MUST | `apps/web/src/lib/integrations/slack` |
| GitHub | 社内保守タスク | API | SHOULD | `apps/web/src/lib/integrations/github` |
| Google Drive / OneDrive | 図面共有 | OAuth API | SHOULD | 新規 |
| Chatwork / Teams / LINE WORKS | 顧客通知 | Webhook | SHOULD | 新規 |
| freee / マネーフォワード | 原価連携 | CSV / API | SHOULD | 新規 |
| ジョブカン / KING OF TIME | 勤怠連携 | CSV | COULD | 新規 |

---

## 9. 制約・前提

- 既存モノレポ（pnpm workspace: `apps/web` / `apps/mobile` / `packages/shared`, Next.js 14 / Expo 50 / Prisma）の構成を踏襲する。
- DB は dev は SQLite、本番は PostgreSQL を必須とする（既存 README に準ずる）。
- `CLAUDE.md` に記載のコマンド体系（`pnpm dev` / `pnpm db:push` 等）と一致させる。
- 撮影禁止モードの判定は顧客マスタ設定の他、現場で責任者が一時的に有効化できること。
- 既存 `70代向け_*.md` のユーザ向け文体・配色を破壊しないこと。

---

## 10. リスクと対策

| ID | リスク | 影響 | 対策 |
|----|--------|------|------|
| R1 | 大判 PDF の描画パフォーマンス | 現場で使用不能 | 早期 PoC、ページ単位ストリーミング |
| R2 | オフライン同期競合 | データ破損 | エンティティ別の競合ポリシーを §4.10 で定義、UI で差分提示 |
| R3 | 撮影禁止区域での誤撮影 | 顧客信用失墜 | UI ロック＋端末カメラの利用ログを監査 |
| R4 | ベテランの IT 抵抗感 | 利用定着しない | P2 ペルソナ固有の現地トレーニング、操作ガイド継続更新 |
| R5 | ローカル DB の暗号化未対応（現状） | 端末紛失時の情報漏洩 | §5.3 対応を v1.0 必須化、`OFFLINE_STORAGE.md` 更新 |
| R6 | 法改正・JIS 改訂 | チェックリスト陳腐化 | テンプレートをデータ駆動化、年次レビュー |

---

## 11. リリース計画（フェーズ）

| フェーズ | 期間 | スコープ | 完了基準 |
|----------|------|----------|----------|
| **MVP+ (v1.0)** | 〜3 ヶ月 | 案件拡張、日報、写真サーバ同期、KY、オフライン強化、基本検査チェックリスト、Slack 連携、認証強化、暗号化 | 5 名のパイロット現場で 4 週間運用 → KGI G1/G2 中間達成 |
| **v1.1** | +2 ヶ月 | 図面 PDF ビューア＋赤入れ、引渡電子サイン、原価連携 (freee 等)、Chatwork/Teams 連携 | 全現場展開・経営ダッシュボード本格稼働 |
| **v1.2** | +3 ヶ月 | DXF 参照、部材在庫、勤怠連携、顧客共有ビュー | 売上原価管理の月次 3 営業日達成（G3） |
| **v2.0** | +6 ヶ月 | 顧客ポータル、AI による日報・KY 自動下書き、IoT 機器連携 | 全社 BPR 完了 |

---

## 12. 受入基準（v1.0 全体）
1. §4 の MUST 機能がすべて動作し、ユーザビリティテストで P1〜P4 ペルソナそれぞれが代表シナリオを単独で完遂できる。
2. §5.1 性能目標を実機（iPhone 12 相当・Android 中位機）で達成する。
3. §5.3 セキュリティ要件のうち、暗号化・監査ログ・TLS1.3 が本番で有効。
4. パイロット現場 5 名・4 週間運用で重大不具合 0 件、軽微 5 件以下。
5. KGI G1（日報時間 5 分以下）が中央値で達成。

---

## 13. 用語集

| 用語 | 説明 |
|------|------|
| FA | Factory Automation。製造業の生産設備の自動制御。 |
| 制御盤 | PLC・電源・リレー等を収めた電気盤。 |
| PLC / シーケンサ | Programmable Logic Controller。 |
| KY 活動 | 危険予知活動。 |
| LOTO | Lockout / Tagout。電源遮断確実化の安全手順。 |
| FAT / SAT | Factory / Site Acceptance Test。工場・現地立会検査。 |
| I/O リスト | 入出力点の一覧。配線・PLC 設定の根拠。 |
| 単線結線図 | 一線で系統を示す配電図。JIS C 0617 準拠の記号を用いる。 |
| 絶縁抵抗 | 配線・機器の絶縁性能。竣工時必須測定。 |
| OTA | Over The Air。アプリのコード更新を無線配信する仕組み。 |

---

## 14. 未確定事項（Open Issues）

- O1: 建設業許可区分（電気工事業／電気通信工事業）の実態（要確認）。
- O2: ECAD 図面の社内主流（EPLAN / 電匠 / ACAD-DENKI 等）（要確認）。
- O3: 勤怠 SaaS の社内採用状況（要確認）。
- O4: 個人スマホ持込（BYOD）／会社貸与（COPE）の方針決定。
- O5: 顧客の機密区域定義（撮影禁止）の運用責任者は誰か。
- O6: 検査記録の電子保存に関する顧客側 QMS の許容範囲。

---

## 15. ユーザーストーリーと受入基準

凡例: 優先度 **MUST** / **SHOULD** / **COULD**。受入基準は Given / When / Then で記述する。ストーリー ID は領域コード（AUTH/PJ/RP/SF/PH/DR/IN/HD/OF/DB/EX）＋連番。総数 25 件。

### 15.1 認証・端末管理
#### US-AUTH-01 生体認証＋PIN ログイン
- As a P1 現場技術者, I want 生体認証(指紋／顔)と社用 PIN でログインしたい, so that 軍手を外さず素早く現場入場記録ができる。
- Priority: MUST
- 受入基準:
  - Given 端末に指紋登録済み, When アプリ起動, Then 1.5 秒以内に生体認証ダイアログを表示し 3 回失敗で PIN フォールバック。
  - Given 軍手着用で顔認証, When マスク併用で失敗, Then 8 桁 PIN 入力画面に自動遷移しキーは 48dp 以上。
  - Given オフライン状態, When 生体認証成功, Then 直近キャッシュ済みトークンで 7 日間まで業務継続可。

#### US-AUTH-02 リモートワイプ
- As a P5 経営層, I want 紛失端末を遠隔ワイプしたい, so that 現場図面・顧客情報の漏洩を即時止血できる。
- Priority: MUST
- 受入基準:
  - Given 管理コンソールで対象端末選択, When「リモートワイプ」実行, Then 端末次回起動時に図面／写真／レポートのアプリ内領域を完全削除し結果ログを管理側に返却。
  - Given 端末オフライン 7 日経過, When 自動失効ポリシー有効, Then ローカル DB を暗号化キー破棄により読み取り不能化。
  - Given ワイプ完了, When 管理者画面確認, Then 削除日時・対象データ件数・担当者を監査ログに残す。

#### US-AUTH-03 アクセシビリティ強化ログイン
- As a P2 ベテラン責任者, I want 大きな文字とシンプルなログイン画面を使いたい, so that 老眼でも迷わず入場できる。
- Priority: SHOULD
- 受入基準:
  - Given アクセシビリティ「特大」設定, When ログイン画面表示, Then 入力欄高さ 64dp・文字 22pt 以上・コントラスト比 4.5:1 以上。
  - Given パスワード入力欄, When 目玉アイコンタップ, Then 平文表示し 3 秒後に自動マスク。

### 15.2 案件・顧客・工場
#### US-PJ-01 4 階層案件作成
- As a P3 施工管理, I want 案件・顧客・工場・棟・盤単位の 4 階層で案件を作成したい, so that 後工程の写真や日報を正しい場所に紐付けられる。
- Priority: MUST
- 受入基準:
  - Given 顧客マスタ既登録, When 新規案件作成, Then 顧客→工場→建屋→盤の階層をプルダウンで選択し必須項目未入力時は保存不可。
  - Given 既存案件, When 工場座標を地図でピン設定, Then 緯度経度を保存し現場到着時の自動チェックインに利用可能。
  - Given 案件複製操作, When「前回類似案件を複製」, Then 工程・KY テンプレ・検査項目を引き継ぎ金額のみ未入力で生成。

#### US-PJ-02 CSV／Excel 一括取込
- As a P4 内勤事務, I want 案件一覧を CSV／Excel で一括取り込みしたい, so that 月次 100 件規模を捌ける。
- Priority: SHOULD
- 受入基準:
  - Given 規定フォーマット Excel, When インポート実行, Then エラー行を赤ハイライトし正常行のみコミット。
  - Given 重複案件番号, When インポート, Then 「上書き／スキップ／別番号付与」を選択可。

#### US-PJ-03 予実比較
- As a P3 施工管理, I want 案件ごとに予算と実績を比較したい, so that 赤字工事の兆候を早期発見できる。
- Priority: SHOULD
- 受入基準:
  - Given 予算工数入力済, When 日報工数が 80% 超過, Then 案件カードに黄ラベル・100% 超で赤ラベル表示。

### 15.3 日報・工数
#### US-RP-01 タイマー型工数記録
- As a P1 現場技術者, I want 開始／終了ボタンと休憩タイマーで工数を記録したい, so that 手書きせず分単位で正確に残せる。
- Priority: MUST
- 受入基準:
  - Given 案件選択済, When「作業開始」タップ, Then GPS 座標と開始時刻を記録しロック画面でも経過時間表示。
  - Given 昼休憩, When「休憩」タップ, Then 自動で 60 分計上・延長は再タップで補正。
  - Given 終了時, When「作業終了」, Then 工種・人員・備考の入力ダイアログを出し未入力は保存不可。
  - Given 端末バッテリー切れ, When 復帰, Then 最終取得位置と時刻から推定終了時刻を提案。

#### US-RP-02 音声入力対応
- As a P2 ベテラン責任者, I want 音声入力で日報コメントを残したい, so that キーボードを使わず済む。
- Priority: SHOULD
- 受入基準:
  - Given 騒音 80dB 環境, When マイクボタン長押し, Then ノイズ抑制 ON で音声認識し誤変換は赤下線でハイライト。
  - Given オフライン, When 録音, Then 音声ファイルを保存し復帰時にサーバ側で文字起こし。

#### US-RP-03 週次集計
- As a P4 内勤事務, I want 全現場の日報を週次で集計したい, so that 請求書・給与計算の基礎データとして使える。
- Priority: MUST
- 受入基準:
  - Given 期間指定, When 集計実行, Then 案件 × 作業者 × 工種のマトリクスを Excel 出力。
  - Given 承認フロー, When 責任者未承認の日報, Then 集計から除外しアラート表示。

### 15.4 KY・安全
#### US-SF-01 KY 3 タップ登録
- As a P1 現場技術者, I want 作業前 KY をテンプレから 3 タップで登録したい, so that 始業前ミーティングを 5 分以内で終わらせられる。
- Priority: MUST
- 受入基準:
  - Given 高所／活線／重量物テンプレ, When 該当項目をタップ, Then リスクと対策が自動入力され署名欄のみ手書き。
  - Given 参加者全員署名, When 送信, Then PDF 化し Slack 班チャンネルへ自動投稿。

#### US-SF-02 ヒヤリハット即時報告
- As a P3 施工管理, I want ヒヤリハットを写真＋一文で即時報告したい, so that 同種事故を翌日朝礼で水平展開できる。
- Priority: SHOULD
- 受入基準:
  - Given カメラ起動, When 撮影 +10 秒以内に位置・分類タグ付与, Then サーバへ即送信し未送信時はバナー警告。

#### US-SF-03 KY 未実施可視化
- As a P5 経営層, I want KY 未実施の現場をダッシュボードで把握したい, so that 安全管理体制の穴をリアルタイムで塞げる。
- Priority: SHOULD
- 受入基準:
  - Given 当日入場現場一覧, When 09:00 時点で KY 未登録, Then 現場名を赤表示し担当責任者へ Push 通知。

### 15.5 施工写真
#### US-PH-01 自動タグ付け撮影
- As a P1 現場技術者, I want 撮影写真に案件・盤名・工程・座標を自動タグ付けしたい, so that 後で 1000 枚から目的の 1 枚を探さずに済む。
- Priority: MUST
- 受入基準:
  - Given 案件選択中, When 撮影, Then EXIF と別に DB 側へ案件 ID／盤 ID／工程／作業者／撮影時刻を保存。
  - Given 暗所 (50lux 未満), When 撮影, Then ライト自動 ON＋手ブレ補正を強制有効化。
  - Given 連写モード, When 5 枚連続撮影, Then 全枚に同一タグを一括付与。

#### US-PH-02 撮影禁止モード
- As a P3 施工管理, I want 撮影禁止エリアでカメラ機能を無効化したい, so that 顧客工場の機密漏洩リスクを技術的に遮断できる。
- Priority: MUST
- 受入基準:
  - Given 工場マスタで「撮影禁止」設定, When 該当ジオフェンス内で起動, Then カメラタブをグレーアウトし OS カメラも警告表示。
  - Given 違反試行, When 撮影 API 呼び出し検知, Then 監査ログに記録し責任者へ通知。

#### US-PH-03 ZIP 一括書き出し
- As a P4 内勤事務, I want 写真を案件別 ZIP で顧客に提出したい, so that 竣工書類作成の時間を半減できる。
- Priority: SHOULD
- 受入基準:
  - Given 案件・期間・工程フィルタ, When「提出用書き出し」, Then タグ情報を表紙 PDF と共に ZIP 化しダウンロード URL 発行 (48 時間有効)。

### 15.6 図面ビューア
#### US-DR-01 赤入れ・指示
- As a P3 施工管理, I want 図面 PDF に赤ペンで指示を書き込みたい, so that 現場で職人へ即座に変更指示が出せる。
- Priority: MUST
- 受入基準:
  - Given PDF 表示中, When Apple Pencil で描画, Then 筆圧対応の赤線をレイヤ保存し原図は非破壊。
  - Given 注記追加, When ピンタップ＋テキスト入力, Then 担当者メンション可・通知送信。
  - Given 図面差し替え, When Rev 更新, Then 旧注記を新図面に座標補正で追従させ差異をハイライト。

#### US-DR-02 位置共有
- As a P1 現場技術者, I want 図面の特定箇所を拡大表示＋位置共有したい, so that 責任者と同じ場所を見ながら通話できる。
- Priority: SHOULD
- 受入基準:
  - Given ピンチズーム 500%, When 「ここを見て」ボタン, Then 表示座標 URL を生成し Chatwork へ送信。

### 15.7 検査・引渡
#### US-IN-01 試験チェックリスト
- As a P1 現場技術者, I want 絶縁・耐圧・シーケンス試験のチェックリストを順に記入したい, so that 抜け漏れなく検査を完了できる。
- Priority: MUST
- 受入基準:
  - Given 検査テンプレ選択, When 数値入力, Then 規格値範囲外は赤背景＋再測定ボタン表示。
  - Given 必須項目未入力, When 完了ボタン, Then 保存不可・未入力箇所へジャンプ。
  - Given Bluetooth 絶縁計, When 測定ボタン, Then 値を自動取り込みし手入力誤りを排除。

#### US-IN-02 成績書自動生成
- As a P3 施工管理, I want 検査結果から成績書 PDF を自動生成したい, so that 表組み作業を撤廃できる。
- Priority: SHOULD
- 受入基準:
  - Given 全項目合格, When「成績書出力」, Then 会社印・担当者印・QR 真贋確認コード付 PDF を生成。

#### US-HD-01 顧客電子署名
- As a P3 施工管理, I want 引渡書に顧客の電子署名を取得したい, so that 紙の往復を撤廃し当日中に検収完了できる。
- Priority: MUST
- 受入基準:
  - Given 引渡書ドラフト, When 顧客タブレットで指サイン, Then タイムスタンプ＋IP＋署名画像をハッシュで封緘。
  - Given 署名後改ざん試行, When PDF 再保存, Then 検証時に「改ざん検知」表示。
  - Given 顧客メール送信, When 送信, Then 顧客側にも PDF と検証 URL が届く。

#### US-HD-02 引渡前 BIG チェックリスト
- As a P2 ベテラン責任者, I want 引渡前チェックリストを大文字で確認したい, so that 老眼でも見落とさず納品できる。
- Priority: SHOULD
- 受入基準:
  - Given 引渡前画面, When 表示, Then 各項目 24pt 以上・チェック完了率を上部に大表示。

### 15.8 オフライン同期
#### US-OF-01 圏外動作
- As a P1 現場技術者, I want 電波の無い地下／受電前現場でも全機能を使いたい, so that 圏外でも作業が止まらない。
- Priority: MUST
- 受入基準:
  - Given 圏外, When 日報／写真／検査／KY 登録, Then ローカル SQLite へ暗号化保存しキュー件数をバッジ表示。
  - Given 通信復帰, When バックグラウンド, Then 自動同期・写真は低速回線時 Wi-Fi 待機。
  - Given 同期競合, When 同一日報を PC 側も編集, Then 差分マージ UI で項目単位に採用選択。
  - Given 端末容量逼迫, When 残り 500MB, Then 同期済み写真から自動退避。

#### US-OF-02 同期キュー可視化
- As a P3 施工管理, I want 同期キューの状態を可視化したい, so that 未送信データの存在を見落とさない。
- Priority: SHOULD
- 受入基準:
  - Given 未同期データ有り, When ホーム画面, Then 件数・最古登録時刻・失敗理由を一覧表示し手動再送可能。

### 15.9 ダッシュボード
#### US-DB-01 経営 KPI ワンページ
- As a P5 経営層, I want 売上・粗利・稼働率・安全指標をワンページ KPI で見たい, so that 経営判断を日次で回せる。
- Priority: MUST
- 受入基準:
  - Given Web ダッシュボード, When 表示, Then 月次売上・案件別粗利率・人員稼働率・KY 実施率・ヒヤリハット件数を 4 秒以内に描画。
  - Given しきい値設定, When 粗利率 15% 未満, Then 該当案件カードを赤表示しドリルダウン可。
  - Given スマホ表示, When 縦持ち, Then カードを 1 列に再配置し主要 3 KPI をファーストビュー。

#### US-DB-02 担当現場フィルタ
- As a P3 施工管理, I want 自分の担当現場のみフィルタしたい, so that 他チーム情報のノイズを排除できる。
- Priority: SHOULD
- 受入基準:
  - Given ログインロール=施工管理, When ダッシュボード表示, Then 既定で自身担当案件のみ・トグルで全社表示切替。

### 15.10 外部連携
#### US-EX-01 チャット自動通知
- As a P3 施工管理, I want 重要イベントを Slack／Chatwork へ自動通知したい, so that アプリを開かないメンバーにも情報を届けられる。
- Priority: MUST
- 受入基準:
  - Given Webhook 設定済, When ヒヤリハット登録／検査不合格／引渡完了, Then 指定チャンネルへ案件名・担当・リンク付で投稿。
  - Given 通知失敗, When 3 回リトライ後も失敗, Then 管理者へメールフォールバック。
  - Given 通知種別, When 設定画面でトグル, Then 種別ごと ON/OFF と送信先チャンネル個別指定可。

#### US-EX-02 会計連携
- As a P4 内勤事務, I want 会計ソフト (freee／MF) へ仕訳データを連携したい, so that 月末締めの転記作業を撤廃できる。
- Priority: SHOULD
- 受入基準:
  - Given 承認済日報・経費, When 月次バッチ, Then 勘定科目マッピングに従い API 送信しエラーは未連携キューへ。

---

## 16. API 設計

総数 **46 エンドポイント**。全エンドポイントは Next.js App Router (`apps/web/src/app/api/...`) で実装し、レスポンスは共有の `ApiResponse<T>` 包絡（`success`／`error{message,code,details}`／`metadata`）に準ずる。

### 16.1 設計原則
- パスは複数形リソース。部分更新は PATCH。
- ページング: `?page`（既定 1）`?pageSize`（既定 20、上限 100）。`metadata: { page, pageSize, total, totalPages }` を返却。
- 全 POST に `Idempotency-Key` ヘッダ（UUIDv4）を許容。サーバは `(userId, key) → response` を 24h キャッシュし再送をリプレイ。
- ファイルアップロードは `multipart/form-data`、JSON パートに `clientId` と `hashSha256` を含めて重複排除。
- 認可ロール: `admin` / `manager`（施工管理・現場責任者）/ `worker`（技術者）/ `owner`（自分のリソース）。

### 16.2 エンドポイント一覧

| Method | Path | 目的 | リクエスト | レスポンス | 認可 | 備考 |
|---|---|---|---|---|---|---|
| GET | `/api/customers` | 顧客一覧 | `?page,pageSize,q,active` | `ApiResponse<Customer[]>` | admin/manager/worker | |
| POST | `/api/customers` | 顧客作成 | `{code,name,...}` + IdK | `ApiResponse<Customer>` | admin/manager | `code` 一意 |
| GET | `/api/customers/:id` | 取得 | — | `ApiResponse<Customer>` | admin/manager/worker | |
| PATCH | `/api/customers/:id` | 更新 | `Partial<Customer>` | `ApiResponse<Customer>` | admin/manager | |
| DELETE | `/api/customers/:id` | 論理削除 | — | `ApiResponse<{id}>` | admin | `active=false` |
| GET | `/api/factories` | 工場一覧 | `?customerId,hazardousZone,...` | `ApiResponse<Factory[]>` | admin/manager/worker | |
| POST | `/api/factories` | 工場作成 | `{customerId,...,hazardousZone,photoRestricted}` + IdK | `ApiResponse<Factory>` | admin/manager | |
| GET | `/api/factories/:id` | 取得 | — | `ApiResponse<Factory>` | admin/manager/worker | |
| PATCH | `/api/factories/:id` | 更新 | `Partial<Factory>` | `ApiResponse<Factory>` | admin/manager | |
| DELETE | `/api/factories/:id` | 論理削除 | — | `ApiResponse<{id}>` | admin | |
| GET | `/api/projects` | 案件一覧 | `?status,workType,factoryId,customerId,scheduledFrom,scheduledTo,q` | `ApiResponse<ProjectFA[]>` | admin/manager/worker | 既存拡張 |
| POST | `/api/projects` | 案件作成 | 既存 + FA 拡張 + IdK | `ApiResponse<ProjectFA>` | admin/manager | |
| PATCH | `/api/projects/:id` | 更新 | `Partial<ProjectFA>` | `ApiResponse<ProjectFA>` | admin/manager | 金額は admin のみ |
| GET | `/api/daily-reports` | 日報一覧 | `?projectId,authorId,status,dateFrom,dateTo` | `ApiResponse<DailyReport[]>` | admin/manager/owner | |
| POST | `/api/daily-reports` | ドラフト作成 | `{projectId,workDate,...}` + IdK | `ApiResponse<DailyReport>` | worker/manager | DRAFT |
| GET | `/api/daily-reports/:id` | 取得 | — | `ApiResponse<DailyReport>` | admin/manager/owner | |
| PATCH | `/api/daily-reports/:id` | 更新 | `Partial<DailyReport>` | `ApiResponse<DailyReport>` | owner(draft)/manager | |
| POST | `/api/daily-reports/:id/timer` | タイマー開始／停止 | `{action,at,gps?}` + IdK | `ApiResponse<{segments,totalMin}>` | owner | |
| POST | `/api/daily-reports/:id/submit` | 提出 | — | `ApiResponse<DailyReport>` | owner | DRAFT→SUBMITTED |
| POST | `/api/daily-reports/:id/approve` | 承認 | `{decision,comment?}` | `ApiResponse<DailyReport>` | manager/admin | SUBMITTED→APPROVED |
| GET | `/api/ky-records` | KY 一覧 | `?projectId,dailyReportId,dateFrom,dateTo` | `ApiResponse<KYRecord[]>` | admin/manager/worker | |
| POST | `/api/ky-records` | KY 作成 | `{projectId,hazards[],measures[],signers[]}` + IdK | `ApiResponse<KYRecord>` | worker/manager | |
| GET | `/api/ky-records/:id` | 取得 | — | `ApiResponse<KYRecord>` | admin/manager/worker | |
| PATCH | `/api/ky-records/:id` | 更新 | `Partial<KYRecord>` | `ApiResponse<KYRecord>` | owner/manager | 全署名後ロック |
| POST | `/api/photos` | 写真アップロード | multipart + IdK | `ApiResponse<Photo>` | worker/manager | `photoRestricted` 違反は 403 |
| GET | `/api/photos` | 一覧 | `?projectId,category,takenFrom,takenTo` | `ApiResponse<Photo[]>` | admin/manager/worker | |
| GET | `/api/photos/:id` | メタ＋署名 URL | — | `ApiResponse<Photo & {url}>` | admin/manager/worker | |
| DELETE | `/api/photos/:id` | 削除 | — | `ApiResponse<{id}>` | admin/manager | 監査ログ |
| POST | `/api/photos/bulk-sync` | オフライン一括 | multipart N + `items[]` + IdK | `ApiResponse<{accepted,duplicates,conflicts}>` | worker/manager | hash + clientId で重複排除 |
| GET | `/api/inspections` | 検査一覧 | `?projectId,type,passed` | `ApiResponse<Inspection[]>` | admin/manager/worker | |
| POST | `/api/inspections` | 検査作成 | `{projectId,type,items[]}` + IdK | `ApiResponse<Inspection>` | worker/manager | |
| GET | `/api/inspections/:id` | 取得 | — | `ApiResponse<Inspection>` | admin/manager/worker | |
| PATCH | `/api/inspections/:id` | 更新 | `Partial<Inspection>` | `ApiResponse<Inspection>` | owner/manager | |
| GET | `/api/handover-documents` | 引渡書一覧 | `?projectId,signed` | `ApiResponse<HandoverDocument[]>` | admin/manager/worker | |
| POST | `/api/handover-documents` | 引渡書作成 | `{projectId,summary,signer}` + IdK | `ApiResponse<HandoverDocument>` | manager/worker | |
| GET | `/api/handover-documents/:id` | 取得 | — | `ApiResponse<HandoverDocument>` | admin/manager/worker | |
| PATCH | `/api/handover-documents/:id` | 更新 | `Partial<HandoverDocument>` | `ApiResponse<HandoverDocument>` | manager | 署名後ロック |
| GET | `/api/drawings` | 図面一覧 | `?projectId,type,version` | `ApiResponse<Drawing[]>` | admin/manager/worker | |
| POST | `/api/drawings` | 図面登録 | multipart + メタ + IdK | `ApiResponse<Drawing>` | manager/admin | 新版で改訂 |
| GET | `/api/drawings/:id` | メタ | — | `ApiResponse<Drawing>` | admin/manager/worker | |
| GET | `/api/drawings/:id/download` | 署名 URL | — | `ApiResponse<{url,expiresAt}>` | admin/manager/worker | 監査 |
| DELETE | `/api/drawings/:id` | 削除 | — | `ApiResponse<{id}>` | admin | |
| GET | `/api/audit-logs` | 監査ログ検索 | `?actorId,entityType,entityId,action,dateFrom,dateTo` | `ApiResponse<AuditLog[]>` | admin | 読み取り専用 |
| POST | `/api/sync` | クライアント一括同期 | `{operations:[{clientId,entity,op,payload,baseVersion?}]}` + IdK | `ApiResponse<{results:[…]}>` | worker/manager | 操作単位の競合返却 |
| POST | `/api/auth/refresh` | トークン更新 | `{refreshToken}` | `ApiResponse<{accessToken,expiresAt}>` | 認証済 | NextAuth |
| POST | `/api/auth/devices` | 端末登録 | `{deviceId,platform,pushToken?}` + IdK | `ApiResponse<Device>` | 認証済 | リモートワイプ対象 |
| GET | `/api/auth/devices` | 端末一覧 | — | `ApiResponse<Device[]>` | 認証済／admin は全社 | |
| DELETE | `/api/auth/devices/:id` | 解除／ワイプ | `?wipe=true` | `ApiResponse<{id,wipeQueued}>` | owner/admin | |

### 16.3 エラーコード（`ApiResponse.error.code`）
`UNAUTHENTICATED`(401) / `FORBIDDEN`(403) / `VALIDATION_ERROR`(400, `details[]`) / `NOT_FOUND`(404) / `CONFLICT`(409, server `version` 同梱) / `GONE`(410) / `IDEMPOTENCY_REPLAY`(200, キャッシュ返却) / `PHOTO_RESTRICTED`(403) / `HAZARDOUS_ZONE_RULES_UNMET`(422) / `LOCKED`(423, 署名済) / `PAYLOAD_TOO_LARGE`(413) / `UNSUPPORTED_MEDIA_TYPE`(415) / `RATE_LIMITED`(429) / `INTERNAL_ERROR`(500)。

---

## 17. データモデル詳細（Prisma スキーマ追加案）

§7 のエンティティ概要を Prisma DSL レベルまで具体化する。**既存の `User` / `Project` モデルへの追加フィールド**と**新規モデル**を分けて記述する。マイグレーションは Prisma Migrate を新たに導入し（現状 `db:push` のみ）、`prisma migrate dev` で diff を発行する。

### 17.1 既存モデル拡張
`Project` モデルに以下を追加。すべて nullable または default 値ありで後方互換を保つ。

```prisma
// Project に追加
workType         WorkType?
factoryId        String?
factory          Factory?  @relation(fields: [factoryId], references: [id])
scheduledStart   DateTime?
scheduledEnd     DateTime?
contractAmount   Decimal?
estimatedCost    Decimal?
photoRestricted  Boolean   @default(false)
hazardousZone    Boolean   @default(false)
dailyReports      DailyReport[]
kyRecords         KYRecord[]
photos            Photo[]
inspections       Inspection[]
handoverDocuments HandoverDocument[]
drawings          Drawing[]

@@index([factoryId])
@@index([scheduledStart])
```

`User.role` は既存 `ADMIN/MANAGER/USER` を残し、FA 業務向け `FIELD_TECH/FIELD_LEAD/SUPERVISOR/OFFICE/EXEC` を superset として追加。移行期は両系統を許容し、内部マッピング層で吸収する。

### 17.2 新規モデル

```prisma
// Role: 既存 ADMIN/MANAGER/USER のスーパーセットとして FA 業務向け値を追加。
// 移行期間中は両系統を維持し、内部で正規化する。
enum Role {
  ADMIN
  MANAGER
  USER
  FIELD_TECH
  FIELD_LEAD
  SUPERVISOR
  OFFICE
  EXEC
}

enum WorkType {
  NEW_INSTALL
  RETROFIT
  MAINTENANCE
  INSPECTION
  EMERGENCY
  OTHER
}

enum PhotoCategory {
  PRE
  PROGRESS
  POST
  DEFECT
  OTHER
}

enum DrawingType {
  SINGLE_LINE
  SEQUENCE
  IO_LIST
  LAYOUT
  OTHER
}

enum DevicePlatform {
  iOS
  Android
}

enum SyncOperation {
  CREATE
  UPDATE
  DELETE
}

enum SyncStatus {
  PENDING
  PROCESSED
  FAILED
}

model Customer {
  id          String    @id @default(uuid())
  name        String
  nameKana    String?
  address     String?
  phone       String?
  email       String?
  notes       String?
  factories   Factory[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([name])
}

model Factory {
  id                    String          @id @default(uuid())
  customerId            String
  customer              Customer        @relation(fields: [customerId], references: [id], onDelete: Cascade)
  name                  String
  address               String?
  entryRules            String?
  hasHazardousZone      Boolean         @default(false)
  hasCleanRoom          Boolean         @default(false)
  hasExplosionProofZone Boolean         @default(false)
  contacts              ContactPerson[]
  projects              Project[]
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([customerId])
}

model ContactPerson {
  id         String   @id @default(uuid())
  factoryId  String
  factory    Factory  @relation(fields: [factoryId], references: [id], onDelete: Cascade)
  name       String
  role       String?
  phone      String?
  email      String?
  isPrimary  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([factoryId])
}

model DailyReport {
  id          String                @id @default(uuid())
  projectId   String
  project     Project               @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorId    String
  author      User                  @relation("DailyReportAuthor", fields: [authorId], references: [id])
  date        DateTime
  weather     String?
  temperature Float?
  workSummary String
  workHours   Float?
  headcount   Int?
  issues      String?
  nextDayPlan String?
  materials   DailyReportMaterial[]
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  @@index([projectId, date])
  @@index([authorId, date])
}

model DailyReportMaterial {
  id            String      @id @default(uuid())
  dailyReportId String
  dailyReport   DailyReport @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)
  name          String
  spec          String?
  quantity      Float
  unit          String
  unitPrice     Decimal?
  note          String?

  @@index([dailyReportId])
}

model KYRecord {
  id          String        @id @default(uuid())
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  leaderId    String
  leader      User          @relation("KYLeader", fields: [leaderId], references: [id])
  date        DateTime
  location    String?
  workContent String
  remarks     String?
  hazards     KYHazard[]
  signatures  KYSignature[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([projectId, date])
}

model KYHazard {
  id          String   @id @default(uuid())
  kyRecordId  String
  kyRecord    KYRecord @relation(fields: [kyRecordId], references: [id], onDelete: Cascade)
  description String
  riskLevel   Int
  measure     String
  assigneeId  String?
  assignee    User?    @relation("KYHazardAssignee", fields: [assigneeId], references: [id])

  @@index([kyRecordId])
}

model KYSignature {
  id           String   @id @default(uuid())
  kyRecordId   String
  kyRecord     KYRecord @relation(fields: [kyRecordId], references: [id], onDelete: Cascade)
  userId       String
  user         User     @relation("KYSigner", fields: [userId], references: [id])
  signedAt     DateTime @default(now())
  signatureUrl String?

  @@unique([kyRecordId, userId])
  @@index([kyRecordId])
}

model Photo {
  id              String                @id @default(uuid())
  projectId       String
  project         Project               @relation(fields: [projectId], references: [id], onDelete: Cascade)
  takenById       String
  takenBy         User                  @relation("PhotoTakenBy", fields: [takenById], references: [id])
  takenAt         DateTime
  latitude        Float?
  longitude       Float?
  category        PhotoCategory
  fileUrl         String
  thumbnailUrl    String?
  hashSha256      String
  exifStripped    Boolean               @default(false)
  caption         String?
  inspectionItems InspectionItemPhoto[]
  createdAt       DateTime              @default(now())

  @@index([projectId, takenAt])
  @@index([category])
  @@index([hashSha256])
}

model Inspection {
  id          String           @id @default(uuid())
  projectId   String
  project     Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  inspectorId String
  inspector   User             @relation("InspectionInspector", fields: [inspectorId], references: [id])
  performedAt DateTime
  type        String
  overallPass Boolean?
  summary     String?
  items       InspectionItem[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([projectId, performedAt])
}

model InspectionItem {
  id           String                @id @default(uuid())
  inspectionId String
  inspection   Inspection            @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  key          String
  expected     String?
  actual       String?
  pass         Boolean?
  comment      String?
  photos       InspectionItemPhoto[]

  @@index([inspectionId])
}

model InspectionItemPhoto {
  inspectionItemId String
  inspectionItem   InspectionItem @relation(fields: [inspectionItemId], references: [id], onDelete: Cascade)
  photoId          String
  photo            Photo          @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@id([inspectionItemId, photoId])
  @@index([photoId])
}

model HandoverDocument {
  id                   String    @id @default(uuid())
  projectId            String
  project              Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  pdfUrl               String
  customerSignatureUrl String?
  signedAt             DateTime?
  signerName           String?
  signerHash           String?
  ip                   String?
  createdById          String
  createdBy            User      @relation("HandoverCreator", fields: [createdById], references: [id])
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([projectId])
}

model Drawing {
  id           String      @id @default(uuid())
  projectId    String
  project      Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  version      Int
  type         DrawingType
  fileUrl      String
  mimeType     String
  uploadedById String
  uploadedBy   User        @relation("DrawingUploader", fields: [uploadedById], references: [id])
  supersedesId String?
  supersedes   Drawing?    @relation("DrawingSupersedes", fields: [supersedesId], references: [id])
  supersededBy Drawing[]   @relation("DrawingSupersedes")
  createdAt    DateTime    @default(now())

  @@index([projectId, type])
  @@index([projectId, version])
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String?
  actor     User?    @relation("AuditActor", fields: [actorId], references: [id])
  action    String
  entity    String
  entityId  String
  before    Json?
  after     Json?
  at        DateTime @default(now())
  ip        String?
  userAgent String?

  @@index([entity, entityId])
  @@index([actorId, at])
  @@index([at])
}

model DeviceRegistration {
  id            String         @id @default(uuid())
  userId        String
  user          User           @relation("UserDevices", fields: [userId], references: [id], onDelete: Cascade)
  deviceId      String
  platform      DevicePlatform
  pushToken     String?
  lastSeenAt    DateTime?
  wipeRequested Boolean        @default(false)
  registeredAt  DateTime       @default(now())

  @@unique([userId, deviceId])
  @@index([userId])
  @@index([pushToken])
}

model SyncQueueItem {
  id             String        @id @default(uuid())
  userId         String
  user           User          @relation("SyncQueueUser", fields: [userId], references: [id])
  deviceId       String
  idempotencyKey String        @unique
  payload        Json
  entityType     String
  operation      SyncOperation
  status         SyncStatus    @default(PENDING)
  error          String?
  createdAt      DateTime      @default(now())
  processedAt    DateTime?

  @@index([status, createdAt])
  @@index([userId, deviceId])
  @@index([entityType])
}
```

### 17.3 移行ステップ
1. `prisma/schema.prisma` に上記を追記し、`pnpm db:generate`。
2. SQLite dev: `pnpm db:push`、PostgreSQL prod: `prisma migrate dev --name fa-extension`。
3. 既存 `electrical-mobile`／`electrical` 画面の文字列 `description` を新フィールドへバックフィル（マイグレーション後の one-off スクリプト）。
4. 既存 `User.role` 値はそのまま、新規ユーザは新ロールで作成。アプリ側のロール判定は両方を受理。

---

## 18. 画面仕様（主要画面）

各画面に共通の制約: §6 のアクセシビリティ（44dp、AAA）と、§4.10 の同期状態バッジ（右上ピル、件数とアイコン）。モバイルは BottomTab、Web は SideNav。

| 画面 ID | 画面名 | 主要ユーザー | 主な操作 | 主なコンポーネント |
|---------|--------|-------------|----------|-------------------|
| SCR-HOME | ホーム（モバイル） | P1, P2 | 今日の案件カードから日報・KY・写真へ遷移 | 案件カード × 3、同期バッジ、KY 未提出警告 |
| SCR-LOGIN | ログイン | 全員 | 生体／PIN／メール | 生体ボタン、PIN パッド（48dp）、目玉トグル |
| SCR-PROJECTS | 案件一覧 | 全員 | フィルタ・検索 | フィルタチップ、無限スクロール、状態バッジ |
| SCR-PROJECT-DETAIL | 案件詳細 | P1, P3 | 工程切替、写真起動、日報起動、図面起動、KY起動 | 大ボタン 5 個、最新写真サムネ、未提出ピル |
| SCR-DAILY-REPORT | 日報入力 | P1, P2 | タイマー開始/停止、音声入力 | 大型開始ボタン、休憩ボタン、テキスト入力（音声併用） |
| SCR-DAILY-LIST | 日報一覧（Web） | P3, P4 | 期間集計、承認 | テーブル＋一括承認＋Excel エクスポート |
| SCR-KY-NEW | KY 新規 | P1 | テンプレ選択、署名 | テンプレチップ、危険要因リスト、署名キャンバス |
| SCR-PHOTO-CAPTURE | 写真撮影 | P1 | 撮影、カテゴリ、連写 | カテゴリピル、フラッシュ自動、5 枚一括タグ |
| SCR-PHOTO-GALLERY | 写真ギャラリー | 全員 | 案件・カテゴリ・期間フィルタ | グリッド、案件 ZIP 書き出し |
| SCR-DRAWING | 図面ビューア | P1, P3 | ピンチズーム、赤入れ、位置共有 | PDF レイヤ、ペンツール、Rev セレクタ |
| SCR-INSPECTION | 検査チェックリスト | P1 | 数値入力、BT 自動取込 | 規格範囲インジケータ、未入力ジャンプ |
| SCR-HANDOVER | 引渡 | P3 | 顧客署名、PDF 確認 | 署名キャンバス、ハッシュ表示、メール送信 |
| SCR-SYNC | 同期キュー | 全員 | 手動再送、失敗確認 | 件数・最古時刻・失敗理由、再送ボタン |
| SCR-SETTINGS | 設定 | 全員 | アクセシビリティ、通知、ログアウト | 文字サイズスライダ、ハプティクストグル |
| SCR-DASHBOARD-MB | ダッシュボード（モバイル） | P3, P5 | 担当案件のサマリ | 3 KPI カード、担当案件リスト |
| SCR-DASHBOARD-WEB | KPI ダッシュボード（Web） | P5 | 月次・案件別ドリルダウン | 売上／粗利／稼働／KY／ヒヤリのカード＋グラフ |
| SCR-ADMIN-CUSTOMER | 顧客マスタ | admin/manager | CRUD、撮影禁止指定 | フォーム、工場ネスト |
| SCR-ADMIN-USER | ユーザ・端末管理 | admin | 端末登録、リモートワイプ | 端末リスト、ワイプボタン、監査ログリンク |
| SCR-AUDIT | 監査ログ（Web） | admin | 検索 | フィルタ＋テーブル、CSV 出力 |
| SCR-NOTIF-SETTINGS | 通知設定 | P3, admin | Webhook、種別 ON/OFF | チャンネルピッカー、テスト送信 |

各画面のワイヤフレームは別資料（Figma ファイル URL は別途決定）。

---

## 19. テスト戦略

### 19.1 テストピラミッド
| 層 | フレームワーク | カバレッジ目標 | 主対象 |
|----|---------------|----------------|--------|
| ユニット | Vitest（Web）／Jest（Mobile） | 80% 行 / 70% 分岐 | shared utils、Zod スキーマ、ロール判定、料金計算 |
| 統合 | Vitest + Prisma test client | 主要 API ハンドラ 100% | API ルート、認可、トランザクション |
| E2E | Playwright（Web）／Detox or Maestro（Mobile） | 主要シナリオ 25 件 | §15 ユーザーストーリーから抽出 |
| Visual / アクセシビリティ | Storybook + Chromatic + axe-core | コンポーネント 100% | UI 回帰、AAA 達成 |
| 負荷 | k6 | API p95 < 500ms（同時 200 ユーザ） | 同期エンドポイント、写真アップロード |
| セキュリティ | npm audit / Snyk / OWASP ZAP | High 0、Medium 5 以下 | 認証、認可、API |

現状リポジトリにはテスト基盤未導入。v1.0 のスプリント 1 でユニットと統合の基盤を整備する。

### 19.2 受入テスト（UAT）
- パイロット現場 5 名 × 4 週間。週次フィードバック反映。
- §15 のうち MUST ストーリーをすべて UAT 対象とする。
- 70 代責任者（P2）の単独完遂率 100% を条件に v1.0 リリース判定。

### 19.3 オフライン／同期テスト
- 専用シナリオ: 機内モード切替・電波減衰シミュレータ・同時編集 3 種の競合パターンを Detox で自動化。

---

## 20. 工数・体制見積（v1.0 = 3 ヶ月）

| 役割 | 人月 | 主担当 |
|------|------|--------|
| プロダクトオーナー | 0.5 | 要件取りまとめ、UAT 統括 |
| UX デザイナー | 1.5 | 画面設計、Figma、UAT 観察 |
| モバイルエンジニア | 3 | Expo / RN、オフライン、写真、撮影禁止 |
| Web / バックエンド | 3 | Next.js API、Prisma、認証、外部連携 |
| QA エンジニア | 1.5 | テスト基盤、E2E、UAT 補助 |
| インフラ／SRE | 0.5 | Vercel + PostgreSQL、Sentry、SIEM |
| **合計** | **10 人月** | |

参考: 1 スプリント = 2 週間、計 6 スプリント。マイルストーン M0=キックオフ／M1=API & スキーマ凍結／M2=モバイル α／M3=パイロット投入／M4=UAT 完了／M5=v1.0 リリース。

---

## 21. 詳細リスクレジスタ

確率 / 影響を 1〜5 で評価し、スコア = 確率 × 影響。スコア 12 以上は赤、6〜11 黄、5 以下緑。

| ID | リスク | 確率 | 影響 | スコア | 主オーナー | 対策 | 状態 |
|----|--------|------|------|--------|------------|------|------|
| R1 | 大判 PDF（A1, 50MB）描画失敗 | 4 | 4 | **16** | モバイル | スプリント 1 で PoC、ページストリーミング、メモリ計測 | Open |
| R2 | オフライン同期競合によるデータ破損 | 3 | 5 | **15** | バックエンド | エンティティ別ポリシー、UI 差分提示、E2E カバレッジ | Open |
| R3 | 撮影禁止区域での誤撮影 | 3 | 5 | **15** | プロダクト | ジオフェンス＋顧客設定＋監査、現場運用ルール明文化 | Open |
| R4 | 70 代責任者の操作定着失敗 | 3 | 4 | 12 | UX | パイロット同行、現地トレーニング、操作ガイド連携 | Open |
| R5 | ローカル DB 暗号化未対応のまま端末紛失 | 2 | 5 | 10 | セキュリティ | v1.0 必須化、`OFFLINE_STORAGE.md` 改訂、リモートワイプ | In progress |
| R6 | 法令・JIS 改訂によるチェックリスト陳腐化 | 2 | 3 | 6 | プロダクト | テンプレートのデータ駆動化、年次レビュー | Open |
| R7 | 外部 SaaS（freee／Slack）の API 変更 | 3 | 2 | 6 | バックエンド | アダプタ層で隔離、契約テスト | Open |
| R8 | Expo SDK アップデートに伴う互換性破壊 | 2 | 3 | 6 | モバイル | LTS 採用、四半期評価、OTA で段階配信 | Open |
| R9 | パイロット同意取得に時間がかかる | 3 | 2 | 6 | プロダクト | M1 完了前に現場長へ事前打診 | Open |
| R10 | 顧客 QMS が電子記録を許容しない | 2 | 4 | 8 | プロダクト | 顧客ヒアリングと紙併用オプション残置 | Open |

スコア 12 以上のリスクは週次レビュー、6〜11 は隔週レビュー対象。

---

## 22. 参照ドキュメント
- `README.md`（プロジェクト全体）
- `CLAUDE.md`（アーキテクチャ・コマンド）
- `apps/mobile/OFFLINE_STORAGE.md`（オフライン方針 — 暗号化方針を本要件で更新）
- `70代向け_モバイルアプリ操作ガイド.md`（P2 ペルソナ UX 基準）
- `MOBILE_SETUP_GUIDE.md`、`SIMPLE_SETUP_GUIDE.md`
- `prisma/schema.prisma`（データモデル拡張のベース）
- `apps/mobile/src/app/electrical-mobile/`、`apps/web/src/app/electrical/`（既存 MVP）
- 厚生労働省 KY 活動指針、JIS C 0617、JIS B 9960-1 / IEC 60204-1、WCAG 2.1
