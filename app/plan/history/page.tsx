'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [gradeFilter, setGradeFilter] = useState('すべて');
  const [genreFilter, setGenreFilter] = useState('すべて');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
    setPlans(saved);
    setFiltered(saved);
  }, []);

  useEffect(() => {
    const result = plans.filter(plan => {
      const matchGrade = gradeFilter === 'すべて' || plan.grade === gradeFilter;
      const matchGenre = genreFilter === 'すべて' || plan.genre === genreFilter;
      const matchKeyword = keyword === '' || plan.unit.includes(keyword);
      return matchGrade && matchGenre && matchKeyword;
    });
    setFiltered(result);
  }, [gradeFilter, genreFilter, keyword, plans]);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href="/plan" style={{ marginRight: '1rem' }}>📋 授業案作成</Link>
        <Link href="/plan/history">📖 履歴を見る</Link>
      </nav>

      <h1>保存された授業案一覧</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          学年：
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option>すべて</option>
            <option>1年</option>
            <option>2年</option>
            <option>3年</option>
            <option>4年</option>
            <option>5年</option>
            <option>6年</option>
          </select>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          ジャンル：
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
            <option>すべて</option>
            <option>物語文</option>
            <option>説明文</option>
            <option>詩</option>
          </select>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          キーワード：
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="単元名など"
          />
        </label>
      </div>

      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>単元名</th>
            <th>学年</th>
            <th>ジャンル</th>
            <th>日付</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.unit}</td>
              <td>{plan.grade}</td>
              <td>{plan.genre}</td>
              <td>{new Date(plan.timestamp).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => alert(plan.result)}
                  style={{ marginRight: '0.5rem' }}
                >表示</button>

                <button
                  onClick={() => {
                    const element = document.createElement('div');
                    element.innerText = plan.result;
                    element.style.position = 'absolute';
                    element.style.left = '-9999px';
                    document.body.appendChild(element);
                    import('html2pdf.js').then((html2pdf) => {
                      html2pdf.default().set({
                        margin: 0.5,
                        filename: `${plan.grade}_${plan.unit}_授業案.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                      }).from(element).save().then(() => {
                        document.body.removeChild(element);
                      });
                    });
                  }}
                  style={{ marginRight: '0.5rem' }}
                >PDF</button>

                <button
                  onClick={async () => {
                    if (!plan.result || !window.confirm("この授業案をGoogle Driveに保存しますか？")) return;
                    const session = JSON.parse(localStorage.getItem("next-auth.session") || "null");
                    const accessToken = session?.accessToken;
                    if (!accessToken) {
                      alert("Googleにログインしていない、またはアクセストークンが取得できませんでした。\n最初に/planページでログインしてください。");
                      return;
                    }
                    const today = new Date().toISOString().slice(0, 10);
                    const filename = `${plan.grade}_${plan.unit}_${today}_授業案.txt`;
                    const res = await fetch("/api/save-to-drive", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        accessToken,
                        content: plan.result,
                        filename,
                        mimeType: "text/plain",
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`Google Drive に保存成功！ファイルID: ${data.fileId}`);
                    } else {
                      alert(`保存失敗：${data.error}`);
                    }
                  }}
                >Drive</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p>該当する授業プランはありません。</p>}
    </main>
  );
}

