// app/plan/page.tsx（Googleログイン完全削除・全コード復元版）
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function PlanPage() {
  const correctPassword = "92kofb";

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("東京書籍");
  const [grade, setGrade] = useState("1年");
  const [genre, setGenre] = useState("物語文");
  const [unit, setUnit] = useState("");
  const [hours, setHours] = useState("");
  const [unitGoal, setUnitGoal] = useState("");
  const [evaluationPoints, setEvaluationPoints] = useState({ knowledge: "", thinking: "", attitude: "" });
  const [childImage, setChildImage] = useState("");
  const [lessonPlanList, setLessonPlanList] = useState<string[]>([]);
  const [languageActivities, setLanguageActivities] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const num = parseInt(hours);
    if (!isNaN(num) && num > 0) {
      const newList = Array.from({ length: num }, (_, i) => lessonPlanList[i] || "");
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

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById("result-content");
    if (element) {
      const html2pdf = (await import("html2pdf.js")).default;
      const today = new Date().toISOString().slice(0, 10);
      html2pdf().set({
        margin: 0.5,
        filename: `${grade}_${unit}_${today}_授業案.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }).from(element).save();
    }
  };

  const handleSavePlan = () => {
    const timestamp = new Date().toISOString();
    const id = uuidv4();
    const newEntry = {
      id, timestamp, subject, grade, genre, unit, hours,
      unitGoal, evaluationPoints, childImage, lessonPlanList,
      languageActivities, result,
    };
    const existing = JSON.parse(localStorage.getItem("lessonPlans") || "[]");
    const updated = [newEntry, ...existing];
    localStorage.setItem("lessonPlans", JSON.stringify(updated));
    setSaved(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    const lessonPlanText = lessonPlanList.map((text, i) => `${i + 1}時間目：${text}`).join("\n");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        grade,
        genre,
        unit,
        hours,
        unitGoal: `■ 単元の目標：
${unitGoal}`,
        evaluationPoints: `
① 知識・技能：
${evaluationPoints.knowledge}
② 思考・判断・表現：
${evaluationPoints.thinking}
③ 主体的に学習に取り組む態度：
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

  const cardStyle = {
    backgroundColor: "#fff8e1",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem"
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "0.5rem"
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.8rem",
    fontSize: "1.1rem",
    color: "white",
    border: "none",
    borderRadius: "8px",
    marginTop: "1rem",
    cursor: "pointer"
  };

  return (
    <main style={{ padding: "1rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <nav style={{ marginBottom: '1.5rem', fontSize: "1.1rem", display: "flex", justifyContent: "space-between" }}>
        <Link href="/plan">📋 授業作成</Link>
        <Link href="/plan/history">📖 履歴を見る</Link>
      </nav>

      {!authenticated ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>パスワードを入力してください</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            style={{ ...inputStyle, maxWidth: "300px" }}
          />
          <button
            onClick={() => password === correctPassword ? setAuthenticated(true) : alert("パスワードが違います")}
            style={{ ...buttonStyle, backgroundColor: "#4CAF50", width: "auto", padding: "0.6rem 1.5rem" }}
          >
            確認
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", textAlign: "center" }}>授業プラン入力フォーム</h2>
          <div style={cardStyle}>
            <label>教科書名：<br />
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                <option>光村図書</option>
                <option>東京書籍</option>
                <option>教育出版</option>
              </select>
            </label>
          </div>
          <div style={cardStyle}>
            <label>学年：<br />
              <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
                <option>1年</option>
                <option>2年</option>
                <option>3年</option>
                <option>4年</option>
                <option>5年</option>
                <option>6年</option>
              </select>
            </label>
          </div>
          <div style={cardStyle}>
            <label>ジャンル：<br />
              <select value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle}>
                <option>物語文</option>
                <option>説明文</option>
                <option>詩</option>
              </select>
            </label>
          </div>
          <div style={cardStyle}>
            <label>単元名：<br />
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required style={inputStyle} />
            </label>
          </div>
          <div style={cardStyle}>
            <label>授業時間数：<br />
              <input type="number" min="1" step="1" value={hours} onChange={(e) => setHours(e.target.value)} style={inputStyle} />
            </label>
          </div>
          <div style={cardStyle}>
            <label>■ 単元の目標：<br />
              <textarea value={unitGoal} onChange={(e) => setUnitGoal(e.target.value)} rows={3} style={inputStyle} />
            </label>
          </div>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>■ 評価</h3>
            <label>① 知識・技能：<br />
              <textarea value={evaluationPoints.knowledge} onChange={(e) => setEvaluationPoints({ ...evaluationPoints, knowledge: e.target.value })} rows={2} style={inputStyle} />
            </label>
            <label>② 思考・判断・表現：<br />
              <textarea value={evaluationPoints.thinking} onChange={(e) => setEvaluationPoints({ ...evaluationPoints, thinking: e.target.value })} rows={2} style={inputStyle} />
            </label>
            <label>③ 主体的に学習に取り組む態度：<br />
              <textarea value={evaluationPoints.attitude} onChange={(e) => setEvaluationPoints({ ...evaluationPoints, attitude: e.target.value })} rows={2} style={inputStyle} />
            </label>
          </div>
          <div style={cardStyle}>
            <label>■ 育てたい子どもの姿：<br />
              <textarea value={childImage} onChange={(e) => setChildImage(e.target.value)} rows={3} style={inputStyle} />
            </label>
          </div>
          {lessonPlanList.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>■ 授業の展開</h3>
              {lessonPlanList.map((text, i) => (
                <div key={i} style={{ marginBottom: "1rem" }}>
                  <label>{i + 1}時間目：<br />
                    <textarea value={text} onChange={(e) => handleLessonChange(i, e.target.value)} rows={2} style={inputStyle} />
                  </label>
                </div>
              ))}
            </div>
          )}
          <div style={cardStyle}>
            <label>■ 言語活動の工夫：<br />
              <textarea value={languageActivities} onChange={(e) => setLanguageActivities(e.target.value)} rows={3} style={inputStyle} />
            </label>
          </div>
          <button type="submit" style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}>授業案を生成する</button>
          {loading && <p>生成中です…</p>}
          {result && (
            <>
              <button type="button" onClick={handleDownloadPDF} style={{ ...buttonStyle, backgroundColor: "#2196F3" }}>
                PDFとして保存する
              </button>
              <button type="button" onClick={handleSavePlan} style={{ ...buttonStyle, backgroundColor: "#FF9800" }}>
                この授業案を保存する
              </button>
              {saved && <p style={{ color: "green" }}>保存しました！</p>}
              <div id="result-content" style={{ whiteSpace: "pre-wrap", padding: "1rem", border: "1px solid #ccc", marginTop: "1rem", borderRadius: "8px" }}>
                {result.split("\n").map((line, index) =>
                  line.trim() === "" ? <br key={index} /> : <p key={index}>{line}</p>
                )}
              </div>
            </>
          )}
        </form>
      )}
    </main>
  );
}
