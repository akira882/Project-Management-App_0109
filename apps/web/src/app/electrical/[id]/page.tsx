'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ElectricalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['project', resolvedParams.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/projects/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('ステータスを変更しました');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('案件を削除しました');
      router.push('/electrical');
    },
  });

  const handleStatusChange = (status: string) => {
    const confirmMessages: Record<string, string> = {
      PLANNING: '見積中に変更しますか？',
      IN_PROGRESS: '工事中に変更しますか？',
      COMPLETED: '完了に変更しますか？\n（完了後は変更できません）',
      ON_HOLD: '保留に変更しますか？',
    };

    if (confirm(confirmMessages[status] || 'ステータスを変更しますか？')) {
      updateStatusMutation.mutate(status);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        '本当にこの案件を削除しますか？\nこの操作は取り消せません。\n\n削除する場合は「OK」を押してください。'
      )
    ) {
      deleteProjectMutation.mutate();
    }
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-3xl font-bold text-gray-700">案件が見つかりません</p>
          <Link
            href="/electrical"
            className="inline-block mt-6 bg-blue-600 text-white text-xl font-bold py-4 px-8 rounded-xl hover:bg-blue-700"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const project = data;
  const description = project.description || '';

  // 説明から情報を抽出
  const addressMatch = description.match(/【住所】([^\n]+)/);
  const phoneMatch = description.match(/【電話】([^\n]+)/);
  const workMatch = description.match(/【工事内容】([^\n]+)/);
  const estimateMatch = description.match(/【見積金額】([^\n]+)/);
  const dateMatch = description.match(/【希望日】([^\n]+)/);
  const memoMatch = description.match(/【メモ】([^\n]+)/);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/electrical/list" className="text-2xl hover:underline mb-3 inline-block">
            ← 一覧に戻る
          </Link>
          <h1 className="text-5xl font-bold mb-3">📋 案件詳細</h1>
          <p className="text-2xl opacity-90">{project.name}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* メイン情報カード */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* ステータスバッジ */}
          <div className="mb-6">
            <span
              className={`inline-block px-6 py-3 rounded-full font-bold text-2xl ${
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

          {/* お客様名 */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {project.name || '（お客様名未設定）'}
          </h2>

          {/* 詳細情報 */}
          <div className="space-y-4 mb-6">
            {addressMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">📍</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">住所</p>
                  <p className="text-2xl text-gray-900">{addressMatch[1]}</p>
                </div>
              </div>
            )}

            {phoneMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">📞</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">電話番号</p>
                  <p className="text-2xl text-gray-900">{phoneMatch[1]}</p>
                </div>
              </div>
            )}

            {workMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">🔧</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">工事内容</p>
                  <p className="text-2xl text-gray-900 whitespace-pre-wrap">{workMatch[1]}</p>
                </div>
              </div>
            )}

            {estimateMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">💰</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">見積金額</p>
                  <p className="text-2xl text-gray-900 font-bold">{estimateMatch[1]}</p>
                </div>
              </div>
            )}

            {dateMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">📅</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">工事希望日</p>
                  <p className="text-2xl text-gray-900">{dateMatch[1]}</p>
                </div>
              </div>
            )}

            {memoMatch && (
              <div className="flex items-start">
                <span className="text-3xl mr-4">📝</span>
                <div>
                  <p className="text-xl text-gray-600 font-semibold mb-1">メモ</p>
                  <p className="text-2xl text-gray-900 whitespace-pre-wrap">{memoMatch[1]}</p>
                </div>
              </div>
            )}
          </div>

          {/* 登録日・更新日 */}
          <div className="border-t-4 border-gray-200 pt-4 mt-6">
            <div className="grid grid-cols-2 gap-4 text-lg text-gray-600">
              <div>
                <span className="font-semibold">登録日:</span>{' '}
                {new Date(project.createdAt).toLocaleDateString('ja-JP')}
              </div>
              <div>
                <span className="font-semibold">更新日:</span>{' '}
                {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* ステータス変更ボタン */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">ステータス変更</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleStatusChange('PLANNING')}
              disabled={project.status === 'PLANNING'}
              className={`py-6 px-6 text-xl font-bold rounded-xl transition-all ${
                project.status === 'PLANNING'
                  ? 'bg-yellow-500 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'
              }`}
            >
              📋<br />見積中
            </button>

            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={project.status === 'IN_PROGRESS'}
              className={`py-6 px-6 text-xl font-bold rounded-xl transition-all ${
                project.status === 'IN_PROGRESS'
                  ? 'bg-blue-500 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
              }`}
            >
              🔧<br />工事中
            </button>

            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={project.status === 'COMPLETED'}
              className={`py-6 px-6 text-xl font-bold rounded-xl transition-all ${
                project.status === 'COMPLETED'
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
              }`}
            >
              ✅<br />完了
            </button>

            <button
              onClick={() => handleStatusChange('ON_HOLD')}
              disabled={project.status === 'ON_HOLD'}
              className={`py-6 px-6 text-xl font-bold rounded-xl transition-all ${
                project.status === 'ON_HOLD'
                  ? 'bg-gray-500 text-white cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⏸️<br />保留
            </button>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/projects/${project.id}`}
              className="bg-blue-600 text-white text-2xl font-bold py-6 px-8 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              📝 詳細編集
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleteProjectMutation.isPending}
              className="bg-red-600 text-white text-2xl font-bold py-6 px-8 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {deleteProjectMutation.isPending ? '削除中...' : '🗑️ 削除'}
            </button>
          </div>
        </div>

        {/* 注意書き */}
        <div className="mt-6 bg-blue-50 border-4 border-blue-200 rounded-2xl p-6">
          <p className="text-xl text-blue-800">
            💡 ステータスを変更すると、自動的に保存されます。<br />
            削除した案件は復元できませんのでご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
}
