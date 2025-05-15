// app/practice/history/page.tsx（授業実践履歴の表示ページ）
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PracticeHistoryPage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('lessonPlans');
    if (stored) setPlans(JSON.parse(stored));
  }, []);

  const practicePlans = plans.filter((plan) => plan.executionDate || plan.reflection || (plan.boardImages?.length ?? 0) > 0);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href="/plan">📋 授業作成</Link>
        <Link href="/plan/history" style={{ marginLeft: '1rem' }}>📄 計画履歴</Link>
      </nav>

      <h1 style={{ marginBottom: '1rem' }}>保存された授業実践一覧</h1>

      {practicePlans.length === 0 ? (
        <p>実践記録が見つかりません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {practicePlans.map((plan) => (
            <li key={plan.id} style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1rem', padding: '1rem' }}>
              <h2>{plan.unit}</h2>
              <p>🗓 実施日: {plan.executionDate || '未設定'}</p>
              <p>📝 ふりかえり: {plan.reflection || '（なし）'}</p>
              <p>📷 板書写真: {(plan.boardImages?.length || 0)}枚</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {plan.boardImages?.map((src: string, i: number) => (
                  <img key={i} src={src} alt={`写真${i + 1}`} style={{ width: '100px', borderRadius: '4px' }} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
