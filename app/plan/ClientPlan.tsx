// app/plan/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import { db } from "../firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

export default function PlanPage() {
  // モード設定
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  // 教育観スタイル
  const [styleModels, setStyleModels]         = useState<any[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const [selectedStyle, setSelectedStyle]     = useState<any>(null);

  // フォーム入力状態
  const [subject, setSubject]                 = useState("東京書籍");
  const [grade, setGrade]                     = useState("1年");
  const [genre, setGenre]                     = useState("物語文");
  const [unit, setUnit]                       = useState("");
  const [hours, setHours]                     = useState("");
  const [unitGoal, setUnitGoal]               = useState("");
  const [evaluationPoints, setEvaluationPoints] = useState({
    knowledge: [""],
    thinking:  [""],
    attitude:  [""],
  });
  const [childImage, setChildImage]           = useState("");
  const [lessonPlanList, setLessonPlanList]   = useState<string[]>([]);
  const [languageActivities, setLanguageActivities] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [result, setResult]                   = useState("");

  const searchParams = useSearchParams() as URLSearchParams;

  // localStorage からスタイル読み込み
  useEffect(() => {
    const stored = localStorage.getItem("styleModels");
    if (stored) {
      const parsed = JSON.parse(stored);
      setStyleModels(parsed);
      const styleId = searchParams.get("styleId");
      if (styleId) {
        const found = parsed.find((m: any) => m.id === styleId);
        if (found) {
          setSelectedStyleId(styleId);
          setSelectedStyle(found);
        }
      }
    }
  }, [searchParams]);

  // CSV から評価観点テンプレートを読み込み
  useEffect(() => {
    fetch("/templates.csv")
      .then(res => res.text())
      .then(csvText => {
        const parsed = Papa.parse(csvText, { header: true }).data as any[];
        const matched = parsed.filter(
          row => row.学年 === grade && row.ジャンル === genre
        );
        const grouped = {
          knowledge: matched.filter(r => r.観点 === "knowledge").map(r => r.内容),
          thinking:  matched.filter(r => r.観点 === "thinking").map(r => r.内容),
          attitude:  matched.filter(r => r.観点 === "attitude").map(r => r.内容),
        };
        if (
          grouped.knowledge.length ||
          grouped.thinking.length ||
          grouped.attitude.length
        ) {
          setEvaluationPoints(grouped);
        }
      });
  }, [grade, genre]);

  // ハンドラー群
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStyleId(id);
    const found = styleModels.find(m => m.id === id);
    setSelectedStyle(found || null);
  };
  const handleLessonChange = (i: number, v: string) => {
    const copy = [...lessonPlanList];
    copy[i] = v;
    setLessonPlanList(copy);
  };
  const handleAddPoint = (f: keyof typeof evaluationPoints) => {
    setEvaluationPoints(p => ({ ...p, [f]: [...p[f], ""] }));
  };
  const handleRemovePoint = (f: keyof typeof evaluationPoints, i: number) => {
    setEvaluationPoints(p => ({
      ...p,
      [f]: p[f].filter((_, idx) => idx !== i),
    }));
  };
  const handleChangePoint = (f: keyof typeof evaluationPoints, i: number, v: string) => {
    const updated = [...evaluationPoints[f]];
    updated[i] = v;
    setEvaluationPoints(p => ({ ...p, [f]: updated }));
  };

  // 授業案生成／表示
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const lessonText = lessonPlanList.map((t,i) => `${i+1}時間目：${t}`).join("\n");
    const evalText = `① 知識・技能：\n${evaluationPoints.knowledge.map(p=>`・${p}`).join("\n")}\n② 思考・判断・表現：\n${evaluationPoints.thinking.map(p=>`・${p}`).join("\n")}\n③ 主体的に学習に取り組む態度：\n${evaluationPoints.attitude.map(p=>`・${p}`).join("\n")}`.trim();

    if (mode === "manual") {
      const manual = `【単元名】${unit}\n【単元の目標】\n${unitGoal}\n【評価の観点】\n${evalText}\n【育てたい子どもの姿】\n${childImage}\n【授業の展開】\n${lessonText}\n【言語活動の工夫】\n${languageActivities}`;
      setResult(manual.replace(/生徒/g,"児童"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          promptHeader: selectedStyle
            ? `【教育観】\n${selectedStyle.philosophy}\n【評価観点の重視】\n${selectedStyle.evaluationFocus}\n【言語活動の重視】\n${selectedStyle.languageFocus}\n【育てたい子どもの姿】\n${selectedStyle.childFocus}\n`
            : "",
          subject, grade, genre, unit, hours, unitGoal,
          evaluationPoints: evalText,
          childImage, lessonPlan: lessonText, languageActivities
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data.result.replace(/生徒/g,"児童"));
    } catch (err) {
      console.error(err);
      alert("生成に失敗しました。");
    }
    setLoading(false);
  };

  // Firestore + localStorage に保存
  const handleSaveBoth = async () => {
    if (!result) { alert("まず生成してください"); return; }
    const replaced = result.replace(/生徒/g,"児童");
    const timestamp = new Date().toISOString();
    const id = uuidv4();
    const entry = {
      id, timestamp,
      subject, grade, genre, unit, hours, unitGoal,
      evaluationPoints, childImage, lessonPlanList, languageActivities,
      result: replaced, usedStyleName: selectedStyle?.name||null
    };
    try {
      await addDoc(collection(db,"lesson_plans"), entry);
      const existing = JSON.parse(localStorage.getItem("lessonPlans")||"[]");
      localStorage.setItem("lessonPlans", JSON.stringify([entry, ...existing]));
      alert("✅ 保存しました");
    } catch (e) {
      console.error(e);
      alert("❌ 保存失敗");
    }
  };

  // PDF 出力
  const handlePdfDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = document.getElementById("result-content");
    if (!el) return;
    html2pdf().from(`<pre>${el.textContent}</pre>`).set({
      margin:10,
      filename:`${unit}_授業案.pdf`,
      html2canvas:{scale:2}
    }).save();
  };

  // スタイル定義
  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"0.8rem", fontSize:"1.1rem",
    borderRadius:8, border:"1px solid #ccc", marginBottom:"1rem"
  };
  const navBarStyle: React.CSSProperties = {
    display:"flex", gap:"1rem", overflowX:"auto",
    padding:"1rem", backgroundColor:"#f0f0f0",
    borderRadius:8, marginBottom:"2rem", whiteSpace:"nowrap"
  };
  const navLinkStyle: React.CSSProperties = {
    display:"flex", alignItems:"center", gap:"0.5rem",
    padding:"0.5rem 1rem", backgroundColor:"#1976d2",
    color:"white", fontWeight:"bold", borderRadius:6,
    textDecoration:"none"
  };

  return (
    <main style={{ padding:"1.5rem", fontFamily:"sans-serif", maxWidth:"90vw", margin:"0 auto" }}>
      <nav style={navBarStyle}>
        <Link href="/"             style={navLinkStyle}>🏠 ホーム</Link>
        <Link href="/plan"         style={navLinkStyle}>📋 授業作成</Link>
        <Link href="/plan/history" style={navLinkStyle}>📖 計画履歴</Link>
        <Link href="/practice/history" style={navLinkStyle}>📷 実践履歴</Link>
        <Link href="/models/create"    style={navLinkStyle}>✏️ 教育観作成</Link>
        <Link href="/models"           style={navLinkStyle}>📚 教育観一覧</Link>
        <Link href="/models/history"   style={navLinkStyle}>🕒 教育観履歴</Link>
      </nav>

      <form onSubmit={handleSubmit}>
        {/* スタイル選択 */}
        <label>
          【スタイル選択】<br/>
          <select value={selectedStyleId} onChange={handleStyleChange} style={inputStyle}>
            <option value="">（未選択）</option>
            {styleModels.map(m=>(
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        {/* 選択スタイルの詳細 */}
        {selectedStyle && (
          <div style={{
            background:"#f9f9f9", padding:"1rem", borderRadius:8, margin:"1rem 0", fontSize:"0.95rem"
          }}>
            <p><strong>教育観：</strong>{selectedStyle.philosophy}</p>
            <p><strong>評価観点：</strong>{selectedStyle.evaluationFocus}</p>
            <p><strong>言語活動：</strong>{selectedStyle.languageFocus}</p>
            <p><strong>育てたい子どもの姿：</strong>{selectedStyle.childFocus}</p>
          </div>
        )}

        {/* モード選択 */}
        <div style={{ marginBottom:"1rem" }}>
          <label><input type="radio" value="ai" checked={mode==="ai"} onChange={()=>setMode("ai")} /> AIで作成</label><br/>
          <label><input type="radio" value="manual" checked={mode==="manual"} onChange={()=>setMode("manual")} /> 自分入力</label>
        </div>

        {/* 教科書・学年・ジャンル */}
        <label>教科書名：<br/>
          <select value={subject} onChange={e=>setSubject(e.target.value)} style={inputStyle}>
            <option>東京書籍</option>
            <option>光村図書</option>
            <option>教育出版</option>
          </select>
        </label>
        <label>学年：<br/>
          <select value={grade} onChange={e=>setGrade(e.target.value)} style={inputStyle}>
            <option>1年</option><option>2年</option><option>3年</option>
            <option>4年</option><option>5年</option><option>6年</option>
          </select>
        </label>
        <label>ジャンル：<br/>
          <select value={genre} onChange={e=>setGenre(e.target.value)} style={inputStyle}>
            <option>物語文</option><option>説明文</option><option>詩</option>
          </select>
        </label>

        {/* 単元名・時間数 */}
        <label>単元名：<br/>
          <input type="text" value={unit} onChange={e=>setUnit(e.target.value)} required style={inputStyle}/>
        </label>
        <label>授業時間数：<br/>
          <input type="number" min="1" value={hours} onChange={e=>setHours(e.target.value)} style={inputStyle}/>
        </label>

        {/* 単元の目標 */}
        <label>■ 単元の目標：<br/>
          <textarea value={unitGoal} onChange={e=>setUnitGoal(e.target.value)} rows={2} style={inputStyle}/>
        </label>

        {/* 評価観点 */}
        {(["knowledge","thinking","attitude"] as const).map(f=>(
          <div key={f}>
            <label>{
              f==="knowledge"?"① 知識・技能：" :
              f==="thinking"?"② 思考・判断・表現：" :
              "③ 主体的に学習に取り組む態度："
            }</label>
            {evaluationPoints[f].map((v,i)=>(
              <div key={i} style={{ display:"flex", gap:"0.5rem", marginBottom:"0.5rem" }}>
                <textarea value={v} onChange={e=>handleChangePoint(f,i,e.target.value)} style={{ ...inputStyle, flex:1 }}/>
                <button type="button" onClick={()=>handleRemovePoint(f,i)}>🗑</button>
              </div>
            ))}
            <button type="button" onClick={()=>handleAddPoint(f)}>＋ 追加</button>
          </div>
        ))}

        {/* 育てたい子どもの姿 */}
        <label>育てたい子どもの姿：<br/>
          <textarea value={childImage} onChange={e=>setChildImage(e.target.value)} rows={2} style={inputStyle}/>
        </label>

        {/* 展開欄生成 */}
        {hours && lessonPlanList.length !== Number(hours) && (
          <button type="button" onClick={()=>{
            const cnt = Number(hours);
            setLessonPlanList(Array.from({ length:cnt},(_,i)=>lessonPlanList[i]||""));
          }} style={{ ...inputStyle, backgroundColor:"#03A9F4", color:"white" }}>
            ⏱ 展開欄生成
          </button>
        )}

        {/* 展開欄 */}
        {lessonPlanList.map((t,i)=>(
          <label key={i}>{i+1}時間目：<br/>
            <textarea value={t} onChange={e=>handleLessonChange(i,e.target.value)} rows={2} style={inputStyle}/>
          </label>
        ))}

        {/* 言語活動 */}
        <label>言語活動の工夫：<br/>
          <textarea value={languageActivities} onChange={e=>setLanguageActivities(e.target.value)} rows={2} style={inputStyle}/>
        </label>

        {/* 生成・表示ボタン */}
        <button type="submit" style={{ ...inputStyle, backgroundColor:"#4CAF50", color:"white" }}>
          授業案を{mode==="manual"?"表示する":"生成する"}
        </button>
      </form>

      {loading && <p>生成中…</p>}

      {result && (
        <>
          <button onClick={handleSaveBoth} style={{ ...inputStyle, backgroundColor:"#8E44AD", color:"white" }}>
            保存
          </button>
          <button onClick={handlePdfDownload} style={{ ...inputStyle, backgroundColor:"#2196F3", color:"white" }}>
            📄 PDFとして保存
          </button>
          <div id="result-content" style={{ whiteSpace:"pre-wrap", border:"1px solid #ccc", padding:"1rem", marginTop:"1rem" }}>
            {result}
          </div>
        </>
      )}
    </main>
  );
}
