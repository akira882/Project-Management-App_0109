'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface ElectricalProject {
  id: string;
  name: string; // お客様名
  description: string | null; // 工事内容
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export default function ElectricalDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const projects: ElectricalProject[] = data?.data || [];

  // ステータスを日本語に変換
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PLANNING': '見積中',
      'IN_PROGRESS': '工事中',
      'COMPLETED': '完了',
      'ON_HOLD': '保留',
    };
    return statusMap[status] || status;
  };

  // ステータス別に案件を分類
  const planningProjects = projects.filter(p => p.status === 'PLANNING');
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <p className="text-3xl font-bold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-bold mb-3">⚡ 電気工事業務管理</h1>
          <p className="text-2xl opacity-90">今日も安全第一で頑張りましょう！</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-yellow-400">
            <div className="text-xl text-gray-600 mb-3 font-semibold">📋 見積中</div>
            <div className="text-6xl font-bold text-yellow-600">{planningProjects.length}</div>
            <div className="text-lg text-gray-500 mt-2">件</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-blue-400">
            <div className="text-xl text-gray-600 mb-3 font-semibold">🔧 工事中</div>
            <div className="text-6xl font-bold text-blue-600">{inProgressProjects.length}</div>
            <div className="text-lg text-gray-500 mt-2">件</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-green-400">
            <div className="text-xl text-gray-600 mb-3 font-semibold">✅ 完了</div>
            <div className="text-6xl font-bold text-green-600">{completedProjects.length}</div>
            <div className="text-lg text-gray-500 mt-2">件</div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/electrical/new"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-8 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">➕</div>
              <div className="text-3xl font-bold">新しい案件を登録</div>
            </div>
          </Link>

          <Link
            href="/electrical/list"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-8 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <div className="text-3xl font-bold">案件一覧を見る</div>
            </div>
          </Link>
        </div>

        {/* 最近の案件 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">📌 最近の案件</h2>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-8xl mb-6">📝</div>
              <p className="text-2xl text-gray-600 mb-4">まだ案件が登録されていません</p>
              <p className="text-xl text-gray-500">「新しい案件を登録」から始めましょう</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/electrical/${project.id}`}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {project.name || '（お客様名未設定）'}
                      </h3>
                      <p className="text-xl text-gray-600 mb-3">
                        {project.description || '工事内容の記載なし'}
                      </p>
                      <div className="flex items-center gap-4 text-lg text-gray-500">
                        <span>📅 {new Date(project.createdAt).toLocaleDateString('ja-JP')}</span>
                        <span
                          className={`px-4 py-1 rounded-full font-semibold ${
                            project.status === 'PLANNING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : project.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {getStatusText(project.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-4xl ml-4">→</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-xl text-gray-600">
            データは自動的に保存されます
          </p>
        </div>
      </div>
    </div>
  );
}
