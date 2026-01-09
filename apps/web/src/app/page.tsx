import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          プロジェクト管理アプリケーション
        </h1>
        <p className="text-xl text-center mb-8 text-muted-foreground">
          CRUD機能と外部連携を備えたプロフェッショナルなプロジェクト管理ツール
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">✨ 主な機能</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• プロジェクト・タスクの完全なCRUD操作</li>
              <li>• GitHub API統合（Issue同期）</li>
              <li>• Slack通知機能</li>
              <li>• リアルタイム更新</li>
              <li>• レスポンシブデザイン</li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">🛠 技術スタック</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Next.js 14 (App Router)</li>
              <li>• TypeScript</li>
              <li>• Prisma ORM</li>
              <li>• Tailwind CSS</li>
              <li>• NextAuth.js</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 mt-12 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            ダッシュボード
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 border rounded-lg hover:bg-secondary transition-colors"
          >
            プロジェクト一覧
          </Link>
        </div>
      </div>
    </div>
  );
}
