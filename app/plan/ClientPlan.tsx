"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";

export default function PlanPage() {
  const correctPassword = "92kofb";
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  const [styleModels, setStyleModels] = useState<any[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<any>(null);

  const [subject, setSubject] = useState("東京書籍");
  const [grade, setGrade] = useState("1年");
  const [genre, setGenre] = useState("物語文");
  const [unit, setUnit] = useState("");
  const [hours, setHours] = useState("");
  const [unitGoal, setUnitGoal] = useState("");
  const [evaluationPoints, setEvaluationPoints] = useState({
    knowledge: [""],
    thinking: [""],
    attitude: [""],
  });
  const [childImage, setChildImage] = useState("");
  const [lessonPlanList, setLessonPlanList] = useState<string[]>([]);
  const [languageActivities, setLanguageActivities] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState(false);

  const searchParams = useSearchParams() as unknown as URLSearchParams;

  useEffect(() => {
    const stored = localStorage.getItem("styleModels");
    if (stored) {
      const parsed = JSON.parse(stored);
      setStyleModels(parsed);
      const styleIdFromURL = searchParams.get("styleId");
      if (styleIdFromURL) {
        const found = parsed.find((m: any) => m.id === styleIdFromURL);
        if (found) {
          setSelectedStyleId(styleIdFromURL);
          setSelectedStyle(found);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/templates.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true }).data as any[];
        const matched = parsed.filter((row) => row.学年 === grade && row.ジャンル === genre);
        const grouped = {
          knowledge: matched.filter((r) => r.観点 === "knowledge").map((r) => r.内容),
          thinking: matched.filter((r) => r.観点 === "thinking").map((r) => r.内容),
          attitude: matched.filter((r) => r.観点 === "attitude").map((r) => r.内容),
        };
        if (grouped.knowledge.length || grouped.thinking.length || grouped.attitude.length) {
          setEvaluationPoints(grouped);
        }
      });
  }, [grade, genre]);

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStyleId(id);
    const found = styleModels.find((m) => m.id === id);
    setSelectedStyle(found || null);
  };

  const handleLessonChange = (index: number, value: string) => {
    const newList = [...lessonPlanList];
    newList[index] = value;
    setLessonPlanList(newList);
  };

  const handleAddPoint = (field: keyof typeof evaluationPoints) => {
    setEvaluationPoints((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemovePoint = (field: keyof typeof evaluationPoints, index: number) => {
    setEvaluationPoints((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleChangePoint = (field: keyof typeof evaluationPoints, index: number, value: string) => {
    const updated = [...evaluationPoints[field]];
    updated[index] = value;
    setEvaluationPoints((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const lessonPlanText = lessonPlanList.map((text, i) => `${i + 1}時間目：${text}`).join("\n");
    const evaluationText = `① 知識・技能：
${evaluationPoints.knowledge.map((p) => `・${p}`).join("\n")}
② 思考・判断・表現：
${evaluationPoints.thinking.map((p) => `・${p}`).join("\n")}
③ 主体的に学習に取り組む態度：
${evaluationPoints.attitude.map((p) => `・${p}`).join("\n")}`.trim();

    if (mode === "manual") {
      const manualResult = `【単元名】${unit}
【単元の目標】
${unitGoal}
【評価の観点】
${evaluationText}
【育てたい子どもの姿】
${childImage}
【授業の展開】
${lessonPlanText}
【言語活動の工夫】
${languageActivities}`.trim();
      setResult(manualResult);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptHeader: selectedStyle
            ? `【教育観】
${selectedStyle.philosophy}
【評価観点の重視】
${selectedStyle.evaluationFocus}
【言語活動の重視】
${selectedStyle.languageFocus}
【育てたい子どもの姿】
${selectedStyle.childFocus}
`
            : "",
          subject,
          grade,
          genre,
          unit,
          hours,
          unitGoal,
          evaluationPoints: evaluationText,
          childImage,
          lessonPlan: lessonPlanText,
          languageActivities,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error response:", errorText);
        throw new Error("API returned error");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      alert("授業案の生成に失敗しました。APIかネットワークの問題です。");
      console.error("Fetch error:", error);
    }

    setLoading(false);
  };

  const handleSavePlan = () => {
    try {
      const timestamp = new Date().toISOString();
      const id = uuidv4();
      const newEntry = {
        id,
        timestamp,
        subject,
        grade,
        genre,
        unit,
        hours,
        unitGoal,
        evaluationPoints,
        childImage,
        lessonPlanList,
        languageActivities,
        result,
        usedStyleName: selectedStyle?.name || null,
      };
      const existing = JSON.parse(localStorage.getItem("lessonPlans") || "[]");
      const updated = [newEntry, ...existing];
      localStorage.setItem("lessonPlans", JSON.stringify(updated));
      setSaved(true);
      alert("授業案を保存しました！");
    } catch (error) {
      console.error("保存エラー:", error);
      alert("授業案の保存に失敗しました。");
    }
  };

  const handlePdfDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("result-content");
    if (!element) return;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${unit}_授業案.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.8rem",
    fontSize: "1.1rem",
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: "1rem",
  };

  const navBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    overflowX: "auto",
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: "2rem",
    whiteSpace: "nowrap",
  };

  const navLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#1976d2",
    color: "white",
    fontWeight: "bold",
    borderRadius: 6,
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  return (
    <main style={{ padding: "1.5rem", fontFamily: "sans-serif", maxWidth: "90vw", margin: "0 auto" }}>
      {/* 横並びナビバー */}
      <nav style={navBarStyle}>
        <Link href="/" style={navLinkStyle}>
          🏠 ホーム
        </Link>
        <Link href="/plan" style={navLinkStyle}>
          📋 授業作成
        </Link>
        <Link href="/plan/history" style={navLinkStyle}>
          📖 計画履歴
        </Link>
        <Link href="/practice/history" style={navLinkStyle}>
          📷 実践履歴
        </Link>
        <Link href="/models/create" style={navLinkStyle}>
          ✏️ 教育観作成
        </Link>
        <Link href="/models" style={navLinkStyle}>
          📚 教育観一覧
        </Link>
        <Link href="/models" style={navLinkStyle}>
          🕒 教育観履歴
        </Link>

      </nav>

      {/* ここから既存フォーム部分 */}
      {!authenticated ? (
        <div style={{ textAlign: "center" }}>
          <h2>パスワードを入力してください</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="パスワードを入力"
          />
          <button
            onClick={() => (password === correctPassword ? setAuthenticated(true) : alert("パスワードが違います"))}
            style={{ ...inputStyle, backgroundColor: "#4CAF50", color: "white" }}
          >
            確認
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            【スタイル選択】
            <br />
            <select value={selectedStyleId} onChange={handleStyleChange} style={inputStyle}>
              <option value="">（未選択）</option>
              {styleModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>

          {selectedStyle && (
            <div
              style={{
                background: "#f9f9f9",
                padding: "1rem",
                borderRadius: 8,
                marginBottom: "1rem",
                fontSize: "0.95rem",
              }}
            >
              <p>
                <strong>教育観：</strong>
                {selectedStyle.philosophy}
              </p>
              <p>
                <strong>評価観点の重視：</strong>
                {selectedStyle.evaluationFocus}
              </p>
              <p>
                <strong>言語活動の重視：</strong>
                {selectedStyle.languageFocus}
              </p>
              <p>
                <strong>育てたい子どもの姿：</strong>
                {selectedStyle.childFocus}
              </p>
            </div>
          )}

          <label>
            【作成モード】
            <br />
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <input type="radio" value="ai" checked={mode === "ai"} onChange={() => setMode("ai")} /> AIで作成
              </label>
              <br />
              <label>
                <input type="radio" value="manual" checked={mode === "manual"} onChange={() => setMode("manual")} /> 自分の入力を使う
              </label>
            </div>
          </label>

          <label>
            教科書名：
            <br />
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
              <option>東京書籍</option>
              <option>光村図書</option>
              <option>教育出版</option>
            </select>
          </label>

          <label>
            学年：
            <br />
            <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
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
            <br />
            <select value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle}>
              <option>物語文</option>
              <option>説明文</option>
              <option>詩</option>
            </select>
          </label>

          <label>
            単元名：
            <br />
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required style={inputStyle} />
          </label>

          <label>
            授業時間数：
            <br />
            <input type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} style={inputStyle} />
          </label>

          <label>
            ■ 単元の目標：
            <br />
            <textarea value={unitGoal} onChange={(e) => setUnitGoal(e.target.value)} rows={2} style={inputStyle} />
          </label>

          {(["knowledge", "thinking", "attitude"] as const).map((field) => (
            <div key={field}>
              <label>
                {field === "knowledge" && "① 知識・技能："}
                {field === "thinking" && "② 思考・判断・表現："}
                {field === "attitude" && "③ 主体的に学習に取り組む態度："}
              </label>
              {evaluationPoints[field].map((val, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <textarea value={val} onChange={(e) => handleChangePoint(field, i, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => handleRemovePoint(field, i)}>
                    🗑
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => handleAddPoint(field)}>
                ＋ 追加
              </button>
            </div>
          ))}

          <label>
            育てたい子どもの姿：
            <br />
            <textarea value={childImage} onChange={(e) => setChildImage(e.target.value)} rows={2} style={inputStyle} />
          </label>

          {hours && lessonPlanList.length !== Number(hours) && (
            <button
              type="button"
              onClick={() => {
                const count = Number(hours);
                setLessonPlanList(Array.from({ length: count }, (_, i) => lessonPlanList[i] || ""));
              }}
              style={{ ...inputStyle, backgroundColor: "#03A9F4", color: "white" }}
            >
              ⏱ 授業時間にあわせて展開欄を生成する
            </button>
          )}

          {lessonPlanList.length > 0 &&
            lessonPlanList.map((text, i) => (
              <label key={i}>
                {i + 1}時間目：
                <br />
                <textarea value={text} onChange={(e) => handleLessonChange(i, e.target.value)} rows={2} style={inputStyle} />
              </label>
            ))}

          <label>
            言語活動の工夫：
            <br />
            <textarea value={languageActivities} onChange={(e) => setLanguageActivities(e.target.value)} rows={2} style={inputStyle} />
          </label>

          <button type="submit" style={{ ...inputStyle, backgroundColor: "#4CAF50", color: "white" }}>
            授業案を{mode === "manual" ? "表示する" : "生成する"}
          </button>

          {loading && <p>生成中...</p>}

          {result && (
            <>
              <button onClick={handleSavePlan} type="button" style={{ ...inputStyle, backgroundColor: "#FF9800", color: "white" }}>
                この授業案を保存する
              </button>

              <button onClick={handlePdfDownload} type="button" style={{ ...inputStyle, backgroundColor: "#2196F3", color: "white" }}>
                📄 PDFとして保存
              </button>

              <div id="result-content" style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
                {result}
              </div>
            </>
          )}
        </form>
      )}
    </main>
  );
}
