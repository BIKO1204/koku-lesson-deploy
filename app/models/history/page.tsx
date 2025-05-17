"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("educationStylesHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const selectedVersion = history.find((v) => v.id === selectedId) || null;

  const handleCreateNew = () => {
    router.push("/models/create"); // 新規作成ページへ遷移
  };

  const handleSelect = (id: string) => {
    router.push(`/models/edit/${id}`); // 編集ページへ遷移
  };

  // ナビゲーションバー用スタイル
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

  // 縦並びスクロール対応の履歴一覧スタイル
  const listStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    overflowY: "auto" as const,
    maxHeight: "400px",
    marginBottom: 16,
  };
  const itemStyle = (selected: boolean) => ({
    padding: "12px 20px",
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: selected ? "#1976d2" : "#e0e0e0",
    color: selected ? "white" : "black",
    fontSize: 18,
    userSelect: "none" as const,
    textAlign: "center" as const,
    boxShadow: selected ? "0 0 10px rgba(25, 118, 210, 0.6)" : "none",
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

      <button onClick={handleCreateNew} style={buttonStyle}>
        新しい教育観モデルを作成
      </button>

      <div style={listStyle} role="list">
        {history.map((v) => (
          <div
            role="listitem"
            key={v.updatedAt + v.id} // key重複対策でidに更新日時も付加
            onClick={() => handleSelect(v.id)}
            style={itemStyle(v.id === selectedId)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(v.id);
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
            <h3 style={{ marginTop: 0 }}>教育理念</h3>
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
