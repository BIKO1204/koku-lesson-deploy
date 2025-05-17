"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function CreateStylePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [philosophy, setPhilosophy] = useState("");
  const [languageFocus, setLanguageFocus] = useState("");
  const [evaluationFocus, setEvaluationFocus] = useState("");
  const [childFocus, setChildFocus] = useState("");

  const handleSave = () => {
    if (!name || !philosophy || !languageFocus || !evaluationFocus || !childFocus) {
      alert("すべての項目を入力してください。");
      return;
    }

    const newId = uuidv4();

    const newStyle = {
      id: newId,
      name,
      philosophy,
      languageFocus,
      evaluationFocus,
      childFocus,
    };

    // 既存スタイル取得
    const existing = JSON.parse(localStorage.getItem("styleModels") || "[]");
    const updated = [newStyle, ...existing];
    localStorage.setItem("styleModels", JSON.stringify(updated));

    // 履歴データにも追加
    const existingHistory = JSON.parse(localStorage.getItem("educationStylesHistory") || "[]");
    const newHistoryEntry = {
      id: newId,
      updatedAt: new Date().toISOString(),
      name,
      philosophy,
      languageFocus,
      evaluationFocus,
      childFocus,
      note: "新規作成",
    };
    const updatedHistory = [newHistoryEntry, ...existingHistory];
    localStorage.setItem("educationStylesHistory", JSON.stringify(updatedHistory));

    alert("スタイルを保存しました！");
    router.push("/models"); // 登録後、一覧ページへ遷移
  };

  const inputStyle = {
    width: "100%",
    padding: "1.2rem",
    fontSize: "1.4rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "1.5rem",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: "1.3rem",
    marginBottom: "0.3rem",
    display: "block",
  };

  const buttonStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "1rem",
    fontSize: "1.4rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    minHeight: "48px",
  };

  const navLinkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#1976d2",
    color: "white",
    fontWeight: "bold",
    borderRadius: "6px",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto" }}>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
        <a href="/" style={navLinkStyle}>🏠 ホーム</a>
        <a href="/plan" style={navLinkStyle}>📋 授業作成</a>
        <a href="/plan/history" style={navLinkStyle}>📖 計画履歴</a>
        <a href="/practice/history" style={navLinkStyle}>📷 実践履歴</a>
        <a href="/models/create" style={navLinkStyle}>✏️ 教育観作成</a>
        <a href="/models" style={navLinkStyle}>📚 教育観一覧</a>
        <a href="/models/history" style={navLinkStyle}>🕒 教育観履歴</a>
      </nav>

      <h2 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>教育観モデルの登録</h2>

      <label style={labelStyle}>スタイル名：</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        aria-label="スタイル名"
      />

      <label style={labelStyle}>教育理念（どんな授業観・教育観か）：</label>
      <textarea
        value={philosophy}
        onChange={(e) => setPhilosophy(e.target.value)}
        rows={3}
        style={inputStyle}
        aria-label="教育理念"
      />

      <label style={labelStyle}>言語活動の重視点：</label>
      <textarea
        value={languageFocus}
        onChange={(e) => setLanguageFocus(e.target.value)}
        rows={2}
        style={inputStyle}
        aria-label="言語活動の重視点"
      />

      <label style={labelStyle}>評価観点の重視点：</label>
      <textarea
        value={evaluationFocus}
        onChange={(e) => setEvaluationFocus(e.target.value)}
        rows={2}
        style={inputStyle}
        aria-label="評価観点の重視点"
      />

      <label style={labelStyle}>育てたい子ども像：</label>
      <textarea
        value={childFocus}
        onChange={(e) => setChildFocus(e.target.value)}
        rows={2}
        style={inputStyle}
        aria-label="育てたい子ども像"
      />

      <button onClick={handleSave} style={buttonStyle}>
        登録する
      </button>
    </main>
  );
}
