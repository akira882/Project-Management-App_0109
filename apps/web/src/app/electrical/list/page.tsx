'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface ElectricalProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export default function ElectricalListPage() {
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const projects: ElectricalProject[] = data?.data || [];

  // フィルター適用
  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.status === filter);

  // ステータスを日本語に変換
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PLANNING: '見積中',
      IN_PROGRESS: '工事中',
      COMPLETED: '完了',
      ON_HOLD: '保留',
    };
    return statusMap[status] || status;
  };

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
          <Link href="/electrical" className="text-2xl hover:underline mb-3 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-5xl font-bold mb-3">📁 案件一覧</h1>
          <p className="text-2xl opacity-90">全{projects.length}件の案件</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* フィルターボタン */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">絞り込み</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`py-4 px-6 text-xl font-bold rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('PLANNING')}
              className={`py-4 px-6 text-xl font-bold rounded-xl transition-all ${
                filter === 'PLANNING'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 見積中
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`py-4 px-6 text-xl font-bold rounded-xl transition-all ${
                filter === 'IN_PROGRESS'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔧 工事中
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`py-4 px-6 text-xl font-bold rounded-xl transition-all ${
                filter === 'COMPLETED'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ 完了
            </button>
            <button
              onClick={() => setFilter('ON_HOLD')}
              className={`py-4 px-6 text-xl font-bold rounded-xl transition-all ${
                filter === 'ON_HOLD'
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⏸️ 保留
            </button>
          </div>
        </div>

        {/* 案件リスト */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              該当する案件がありません
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              フィルターを変更するか、新しい案件を登録してください
            </p>
            <Link
              href="/electrical/new"
              className="inline-block bg-blue-600 text-white text-2xl font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors"
            >
              ➕ 新しい案件を登録
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              // 説明から情報を抽出
              const description = project.description || '';
              const phoneMatch = description.match(/【電話】([^\n]+)/);
              const addressMatch = description.match(/【住所】([^\n]+)/);
              const estimateMatch = description.match(/【見積金額】([^\n]+)/);

              return (
                <Link
                  key={project.id}
                  href={`/electrical/${project.id}`}
                  className="block bg-white hover:bg-blue-50 rounded-2xl p-6 border-4 border-gray-200 hover:border-blue-400 shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* お客様名 */}
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {project.name || '（お客様名未設定）'}
                      </h3>

                      {/* 詳細情報 */}
                      <div className="space-y-2 mb-4">
                        {addressMatch && (
                          <p className="text-xl text-gray-700">
                            📍 {addressMatch[1]}
                          </p>
                        )}
                        {phoneMatch && (
                          <p className="text-xl text-gray-700">
                            📞 {phoneMatch[1]}
                          </p>
                        )}
                        {estimateMatch && (
                          <p className="text-xl text-gray-700">
                            💰 {estimateMatch[1]}
                          </p>
                        )}
                      </div>

                      {/* フッター情報 */}
                      <div className="flex items-center gap-4 text-lg">
                        <span className="text-gray-500">
                          📅 {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span
                          className={`px-4 py-2 rounded-full font-bold text-lg ${
                            project.status === 'PLANNING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : project.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : project.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getStatusText(project.status)}
                        </span>
                      </div>
                    </div>

                    {/* 矢印アイコン */}
                    <div className="text-5xl ml-6 text-blue-600">→</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 新規登録ボタン */}
        <div className="mt-8 text-center">
          <Link
            href="/electrical/new"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            ➕ 新しい案件を登録
          </Link>
        </div>
      </div>
    </div>
  );
}
