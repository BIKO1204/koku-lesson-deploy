"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type EducationStyleVersion = {
  id: string;
  updatedAt: string;
  philosophy: string;
  evaluationFocus: string;
  languageFocus: string;
  childFocus: string;
  note?: string;
};

export default function EducationStyleHistoryPage() {
  const [history, setHistory] = useState<EducationStyleVersion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("educationStylesHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const selectedVersion = history.find((v) => v.id === selectedId) || null;

  // 新規追加例（初回のみの追加などに使う）
  const addInitialVersion = () => {
    if (history.length === 0) {
      const initial: EducationStyleVersion = {
        id: crypto.randomUUID ? crypto.randomUUID() : "init-id", // uuidv4 ない場合の代替
        updatedAt: new Date().toISOString(),
        philosophy: "ここに教育哲学を入力してください。",
        evaluationFocus: "ここに評価観点の重点を入力してください。",
        languageFocus: "ここに言語活動の重点を入力してください。",
        childFocus: "ここに育てたい子どもの姿を入力してください。",
        note: "初期バージョン",
      };
      const newHistory = [initial];
      setHistory(newHistory);
      localStorage.setItem("educationStylesHistory", JSON.stringify(newHistory));
      setSelectedId(initial.id);
    }
  };

  // スタイル（ナビバー）
  const navBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: "2rem",
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

  // 履歴タブ風スタイル
  const listStyle = {
    flex: "0 0 auto",
    overflowX: "auto" as const,
    whiteSpace: "nowrap" as const,
    marginBottom: 16,
  };
  const itemStyle = (selected: boolean) => ({
    display: "inline-block",
    padding: "12px 20px",
    marginRight: 12,
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: selected ? "#1976d2" : "#e0e0e0",
    color: selected ? "white" : "black",
    fontSize: 18,
    userSelect: "none" as const,
    minWidth: 220,
    textAlign: "center" as const,
  });

  const detailStyle = {
    flex: "1 1 auto",
    overflowY: "auto" as const,
    padding: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: "#fafafa",
    fontSize: 18,
    whiteSpace: "pre-wrap" as const,
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    height: "90vh",
    padding: 16,
    fontFamily: "sans-serif",
  };

  const buttonStyle = {
    padding: "0.8rem 1.2rem",
    fontSize: 18,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    cursor: "pointer",
    userSelect: "none" as const,
  };

  return (
    <div style={containerStyle}>
      {/* 全ページ遷移ナビバー */}
      <nav style={navBarStyle}>
        <Link href="/" style={navLinkStyle}>🏠 ホーム</Link>
        <Link href="/plan" style={navLinkStyle}>📋 授業作成</Link>
        <Link href="/plan/history" style={navLinkStyle}>📖 計画履歴</Link>
        <Link href="/practice/history" style={navLinkStyle}>📷 実践履歴</Link>
        <Link href="/models/create" style={navLinkStyle}>✏️ 教育観作成</Link>
        <Link href="/models" style={navLinkStyle}>📚 教育観一覧</Link>
        <Link href="/models/history" style={navLinkStyle}>🕒 教育観履歴</Link>
      </nav>

      <h2 style={{ fontSize: 26, marginBottom: 12, textAlign: "center" }}>
        教育観モデル履歴
      </h2>

      <button onClick={addInitialVersion} style={buttonStyle}>
        新しい教育観モデルを作成
      </button>

      <div style={listStyle} role="list">
        {history.map((v) => (
          <div
            role="listitem"
            key={v.id}
            onClick={() => setSelectedId(v.id)}
            style={itemStyle(v.id === selectedId)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelectedId(v.id);
            }}
            aria-selected={v.id === selectedId}
          >
            {new Date(v.updatedAt).toLocaleString()}
            {v.note ? `\n${v.note}` : ""}
          </div>
        ))}
      </div>

      <section
        aria-live="polite"
        aria-atomic="true"
        style={detailStyle}
        tabIndex={-1}
      >
        {selectedVersion ? (
          <>
            <h3 style={{ marginTop: 0 }}>教育哲学</h3>
            <p>{selectedVersion.philosophy}</p>

            <h3>評価観点の重点</h3>
            <p>{selectedVersion.evaluationFocus}</p>

            <h3>言語活動の重点</h3>
            <p>{selectedVersion.languageFocus}</p>

            <h3>育てたい子どもの姿</h3>
            <p>{selectedVersion.childFocus}</p>

            <h4>更新メモ</h4>
            <p>{selectedVersion.note || "なし"}</p>
          </>
        ) : (
          <p>履歴から教育観モデルを選択してください。</p>
        )}
      </section>
    </div>
  );
}
