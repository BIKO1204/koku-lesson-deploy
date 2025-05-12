'use client';

import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

export default function PlanPage() {
  const correctPassword = '92kofb';

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('光村図書');
  const [grade, setGrade] = useState('4年');
  const [genre, setGenre] = useState('物語文');
  const [unit, setUnit] = useState('');
  const [hours, setHours] = useState('');
  const [unitGoal, setUnitGoal] = useState('');
  const [evaluationPoints, setEvaluationPoints] = useState({
    knowledge: '',
    thinking: '',
    attitude: '',
  });
  const [childImage, setChildImage] = useState('');
  const [lessonPlanList, setLessonPlanList] = useState<string[]>([]);
  const [languageActivities, setLanguageActivities] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    const num = parseInt(hours);
    if (!isNaN(num) && num > 0) {
      const newList = Array.from({ length: num }, (_, i) => lessonPlanList[i] || '');
      setLessonPlanList(newList);
    } else {
      setLessonPlanList([]);
    }
  }, [hours]);

  const handleLessonChange = (index: number, value: string) => {
    const newList = [...lessonPlanList];
    newList[index] = value;
    setLessonPlanList(newList);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('result-content');
    if (element) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: '授業案.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    const lessonPlanText = lessonPlanList
      .map((text, i) => `${i + 1}時間目：${text}`)
      .join('\n');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        grade,
        genre,
        unit,
        hours,
        unitGoal,
        evaluationPoints: `
■ 知識・技能：
${evaluationPoints.knowledge}

■ 思考・判断・表現：
${evaluationPoints.thinking}

■ 主体的に学習に取り組む態度：
${evaluationPoints.attitude}
        `,
        childImage,
        lessonPlan: `■ 授業の展開：\n${lessonPlanText}`,
        languageActivities,
      }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {!authenticated ? (
        <>
          <h1>パスワードを入力してください</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => {
              if (password === correctPassword) {
                setAuthenticated(true);
              } else {
                alert('パスワードが違います');
              }
            }}
          >
            確認
          </button>
        </>
      ) : (
        <>
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
                  <option>1年</option><option>2年</option><option>3年</option>
                  <option>4年</option><option>5年</option><option>6年</option>
                </select>
              </label>
            </p>
            <p>
              <label>ジャンル：<br />
                <select value={genre} onChange={e => setGenre(e.target.value)}>
                  <option>物語文</option><option>説明文</option><option>詩</option>
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
                <input
                  type="number"
                  min="1"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  style={{ appearance: 'textfield' }}
                />
              </label>
            </p>
            <p>
              <label>■ 単元の目標：<br />
                <textarea
                  value={unitGoal}
                  onChange={(e) => setUnitGoal(e.target.value)}
                  rows={4}
                  cols={50}
                />
              </label>
            </p>
            <h3>■ 評価の観点（3観点）</h3>
            <p>
              <label>① 知識・技能：<br />
                <textarea
                  value={evaluationPoints.knowledge}
                  onChange={(e) =>
                    setEvaluationPoints({ ...evaluationPoints, knowledge: e.target.value })
                  }
                  rows={3}
                  cols={50}
                />
              </label>
            </p>
            <p>
              <label>② 思考・判断・表現：<br />
                <textarea
                  value={evaluationPoints.thinking}
                  onChange={(e) =>
                    setEvaluationPoints({ ...evaluationPoints, thinking: e.target.value })
                  }
                  rows={3}
                  cols={50}
                />
              </label>
            </p>
            <p>
              <label>③ 主体的に学習に取り組む態度：<br />
                <textarea
                  value={evaluationPoints.attitude}
                  onChange={(e) =>
                    setEvaluationPoints({ ...evaluationPoints, attitude: e.target.value })
                  }
                  rows={3}
                  cols={50}
                />
              </label>
            </p>
            <p>
              <label>■ 育てたい子どもの姿：<br />
                <textarea
                  value={childImage}
                  onChange={(e) => setChildImage(e.target.value)}
                  rows={4}
                  cols={50}
                />
              </label>
            </p>
            <h3>■ 授業の展開（各時間ごとに記入）</h3>
            {lessonPlanList.map((text, i) => (
              <p key={i}>
                <label>{i + 1}時間目：<br />
                  <textarea
                    value={text}
                    onChange={(e) => handleLessonChange(i, e.target.value)}
                    rows={3}
                    cols={50}
                  />
                </label>
              </p>
            ))}
            <p>
              <label>■ 言語活動の工夫：<br />
                <textarea
                  value={languageActivities}
                  onChange={(e) => setLanguageActivities(e.target.value)}
                  rows={4}
                  cols={50}
                />
              </label>
            </p>
            <button type="submit">この内容で授業案をつくる</button>
          </form>

          {loading && <p>生成中です…</p>}

          {result && (
            <>
              <button onClick={handleDownloadPDF} style={{ marginTop: '1rem' }}>
                PDFとして保存する
              </button>
              <section style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>【生成された授業案】</h2>
                <div id="result-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                  {result
                    .split('\n')
                    .map((line, index) => {
                      if (line.startsWith('■')) {
                        return (
                          <p key={index} style={{ fontWeight: 'bold', marginTop: '1.2em' }}>
                            {line}
                          </p>
                        );
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index}>{line}</p>;
                      }
                    })}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
