"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LessonPlan = {
  id: string;
  timestamp: string;
  subject: string;
  grade: string;
  genre: string;
  unit: string;
  hours: number | string;
  usedStyleName?: string | null;
};

export default function HistoryPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "grade" | "subject">("timestamp");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("lessonPlans");
    if (stored) {
      try {
        const parsed: LessonPlan[] = JSON.parse(stored);
        setPlans(parsed);
      } catch {
        setPlans([]);
      }
    }
  }, []);

  // 並び替え処理
  const sortedPlans = [...plans].sort((a, b) => {
    if (sortKey === "grade") {
      return a.grade.localeCompare(b.grade);
    }
    if (sortKey === "subject") {
      return a.subject.localeCompare(b.subject);
    }
    // timestampは降順（新着順）
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 削除処理
  const handleDelete = (id: string) => {
    if (!confirm("この授業案を本当に削除しますか？")) return;
    const updated = plans.filter((plan) => plan.id !== id);
    setPlans(updated);
    localStorage.setItem("lessonPlans", JSON.stringify(updated));
  };

  // ナビゲーションスタイル
  const navStyle = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    justifyContent: "center",
    flexWrap: "nowrap",
    overflowX: "auto",
    padding: "0 1rem",
  } as const;

  // ナビリンクスタイル（上下2段表示）
  const navLinkStyle = {
    minWidth: "60px",
    flexShrink: 0,
    padding: "0.4rem 0.6rem",
    fontSize: "1rem",
    borderRadius: "6px",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "pre-line",
    textAlign: "center",
    textDecoration: "none",
    userSelect: "none",
  } as const;

  // 授業案操作ボタンスタイル
  const actionButtonStyle = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as const;

  const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: "#f44336",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "90vw", margin: "0 auto" }}>
      {/* 横並びナビゲーション */}
      <nav style={navStyle}>
        <button onClick={() => router.push("/")} style={navLinkStyle}>
          🏠
          {"\n"}
          ホーム
        </button>
        <Link href="/plan" style={navLinkStyle}>
          📋
          {"\n"}
          授業作成
        </Link>
        <Link href="/plan/history" style={navLinkStyle}>
          📖
          {"\n"}
          計画履歴
        </Link>
        <Link href="/practice/history" style={navLinkStyle}>
          📷
          {"\n"}
          実践履歴
        </Link>
        <Link href="/models/create" style={navLinkStyle}>
          ✏️
          {"\n"}
          教育観作成
        </Link>
        <Link href="/models" style={navLinkStyle}>
          📚
          {"\n"}
          教育観一覧
        </Link>
         <Link href="/models" style={navLinkStyle}>
          🕒
          {"\n"}
          教育観履歴
        </Link>
      </nav>

      <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>保存された授業案一覧</h2>

      {/* 並び替えセレクト */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        並び替え：
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          style={{ marginLeft: "0.5rem", padding: "0.3rem", fontSize: "1rem" }}
        >
          <option value="timestamp">新着順</option>
          <option value="grade">学年順</option>
          <option value="subject">教材名順</option>
        </select>
      </label>

      {sortedPlans.length === 0 ? (
        <p>まだ授業案が保存されていません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sortedPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: "#fafafa",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <p>
                <strong>単元名：</strong>
                {plan.unit}
              </p>
              <p>
                <strong>学年・ジャンル：</strong>
                {plan.grade}・{plan.genre}
              </p>
              <p>
                <strong>スタイル：</strong>
                {plan.usedStyleName || "（未設定）"}
              </p>
              <p>
                <strong>時間数：</strong>
                {plan.hours}時間
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                <Link href={`/practice/add/${plan.id}`}>
                  <button style={actionButtonStyle}>✍️ 実践記録を作成・編集</button>
                </Link>

                <button
                  onClick={() => handleDelete(plan.id)}
                  style={deleteButtonStyle}
                >
                  🗑 削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
