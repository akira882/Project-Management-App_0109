'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewElectricalProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',        // お客様名
    address: '',            // 住所
    phone: '',              // 電話番号
    workDescription: '',    // 工事内容
    estimateAmount: '',     // 見積金額
    scheduledDate: '',      // 希望日
    memo: '',              // メモ
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'お客様名を入力してください';
    }

    if (!formData.workDescription.trim()) {
      newErrors.workDescription = '工事内容を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      // APIに送信するデータを準備
      const projectData = {
        name: formData.customerName,
        description: `【住所】${formData.address}\n【電話】${formData.phone}\n【工事内容】${formData.workDescription}\n【見積金額】${formData.estimateAmount}円\n【希望日】${formData.scheduledDate}\n【メモ】${formData.memo}`,
        status: 'PLANNING', // 見積中
        priority: 'MEDIUM',
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const result = await response.json();

      // 成功したら一覧ページに戻る
      alert('案件を登録しました！');
      router.push('/electrical');
    } catch (error) {
      alert('エラーが発生しました。もう一度お試しください。');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/electrical" className="text-2xl hover:underline mb-3 inline-block">
            ← 戻る
          </Link>
          <h1 className="text-5xl font-bold">➕ 新しい案件を登録</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* お客様名 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              お客様名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="例: 山田太郎"
            />
            {errors.customerName && (
              <p className="text-red-500 text-xl mt-2">{errors.customerName}</p>
            )}
          </div>

          {/* 住所 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              住所
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="例: 東京都〇〇区〇〇 1-2-3"
            />
          </div>

          {/* 電話番号 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              電話番号
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="例: 03-1234-5678"
            />
          </div>

          {/* 工事内容 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              工事内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.workDescription}
              onChange={(e) =>
                setFormData({ ...formData, workDescription: e.target.value })
              }
              rows={4}
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="例: エアコン取り付け工事&#10;室外機設置&#10;配管工事"
            />
            {errors.workDescription && (
              <p className="text-red-500 text-xl mt-2">{errors.workDescription}</p>
            )}
          </div>

          {/* 見積金額 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              見積金額（円）
            </label>
            <input
              type="number"
              value={formData.estimateAmount}
              onChange={(e) =>
                setFormData({ ...formData, estimateAmount: e.target.value })
              }
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="例: 50000"
            />
          </div>

          {/* 希望日 */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              工事希望日
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* メモ */}
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-700 mb-3">
              メモ
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              rows={3}
              className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="その他気づいたことなど"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <Link
              href="/electrical"
              className="flex-1 bg-gray-300 text-gray-700 text-2xl font-bold py-6 px-8 rounded-xl hover:bg-gray-400 transition-colors text-center"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white text-2xl font-bold py-6 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>

        {/* ヘルプメッセージ */}
        <div className="mt-6 bg-blue-50 border-4 border-blue-200 rounded-2xl p-6">
          <p className="text-xl text-blue-800">
            💡 <span className="font-bold">*</span> がついている項目は必須です。<br />
            その他の項目は後から追加できます。
          </p>
        </div>
      </div>
    </div>
  );
}
