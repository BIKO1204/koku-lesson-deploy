"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [gradeFilter, setGradeFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lessonPlans');
    if (stored) setPlans(JSON.parse(stored));
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('この実践記録を削除してもよいですか？')) return;
    const updated = plans.filter((p) => p.id !== id);
    localStorage.setItem('lessonPlans', JSON.stringify(updated));
    setPlans(updated);
  };

  const handleDownloadPDF = async (plan: any) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const today = new Date().toISOString().slice(0, 10);
    const container = document.createElement('div');
    container.style.whiteSpace = 'pre-wrap';
    container.style.padding = '1rem';
    container.innerHTML = `
      <p><strong>■ 単元名：</strong>${plan.unit}</p>
      <p><strong>■ 実施日：</strong>${plan.executionDate || '未設定'}</p>
      <p><strong>■ ふりかえり：</strong>${plan.reflection || '（なし）'}</p>
      <p><strong>■ 板書写真：</strong>${(plan.boardImages?.length || 0)}枚</p>
      ${plan.boardImages?.map((src: string) => `<img src="${src}" style="max-width:100%; margin-top:10px;" />`).join('') || ''}
      <hr />
      ${plan.result?.replace(/\n/g, '<br>')}
    `;
    html2pdf().set({
      margin: 0.5,
      filename: `${plan.grade}_${plan.unit}_${today}_授業案.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }).from(container).save();
  };

  const filteredPlans = plans.filter((plan) => {
    const matchGrade = !gradeFilter || plan.grade === gradeFilter;
    const matchGenre = !genreFilter || plan.genre === genreFilter;
    const matchKeyword = !keywordFilter || plan.unit.includes(keywordFilter);
    return matchGrade && matchGenre && matchKeyword;
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href="/plan">📋 授業作成</Link>
      </nav>

      <h1 style={{ marginBottom: '1rem' }}>保存された授業実践一覧</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <label>
          学年：
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="">すべて</option>
            <option>1年</option>
            <option>2年</option>
            <option>3年</option>
            <option>4年</option>
            <option>5年</option>
            <option>6年</option>
          </select>
        </label>

        <label>
          ジャンル：
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
            <option value="">すべて</option>
            <option>物語文</option>
            <option>説明文</option>
            <option>詩</option>
          </select>
        </label>

        <label>
          キーワード：
          <input
            type="text"
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            placeholder="単元名など"
          />
        </label>
      </div>

      {filteredPlans.length === 0 ? (
        <p>該当する授業案がありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredPlans.map((plan) => (
            <li key={plan.id} style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1rem', padding: '1rem' }}>
              <h2>{plan.unit}</h2>
              <p>📚 {plan.grade} / {plan.genre}</p>
              <p>🗓 実施日: {plan.executionDate || '未設定'}</p>
              <p>📝 ふりかえり: {plan.reflection || '（なし）'}</p>
              <p>📷 板書写真: {plan.boardImages?.length || 0}枚</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {plan.boardImages?.map((src: string, i: number) => (
                  <img key={i} src={src} alt={`写真${i + 1}`} style={{ width: '100px', borderRadius: '4px' }} />
                ))}
              </div>

              {/* ✅ 実践追加リンク */}
              <p style={{ marginTop: '0.5rem' }}>
                <Link href={`/practice/add/${plan.id}`} style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                  📷 実践を追加する
                </Link>
              </p>

              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer' }}>📄 授業案を表示</summary>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '1rem', borderRadius: '6px' }}>
                  {plan.result}
                </pre>
              </details>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleDownloadPDF(plan)} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                  📄 PDF出力
                </button>
                <button onClick={() => handleDelete(plan.id)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                  🗑 削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
