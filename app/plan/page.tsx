'use client';

import { useState } from 'react';

export default function PlanPage() {
  const [subject, setSubject] = useState('光村図書');
  const [grade, setGrade] = useState('4年');
  const [unit, setUnit] = useState('');
  const [hours, setHours] = useState('');
  const [genre, setGenre] = useState('物語文');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, unit, hours, genre }),
      });

      const data = await res.json();
      setResult(data.result || '授業案の生成に失敗しました。');
    } catch (error) {
      console.error('送信エラー:', error);
      setResult('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>授業プラン入力フォーム</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>教科書名：<br />
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              <option>光村図書</option>
              <option>東京書籍</option>
              <option>教育出版</option>
            </select>
          </label>
        </p>
        <p>
          <label>学年：<br />
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option>1年</option>
              <option>2年</option>
              <option>3年</option>
              <option>4年</option>
              <option>5年</option>
              <option>6年</option>
            </select>
          </label>
        </p>
        <p>
          <label>単元名：<br />
            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} required />
          </label>
        </p>
        <p>
          <label>授業時間数：<br />
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} required />
          </label>
        </p>
        <p>
          <label>ジャンル：<br />
            <select value={genre} onChange={e => setGenre(e.target.value)}>
              <option>物語文</option>
              <option>説明文</option>
              <option>詩</option>
              <option>実用文</option>
            </select>
          </label>
        </p>
        <button type="submit">この内容で授業案をつくる</button>
      </form>

      {loading && <p>生成中です…少々お待ちください。</p>}
      {result && (
        <section style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
          <h2>【生成された授業案】</h2>
          <p>{result}</p>
        </section>
      )}
    </main>
  );
}

