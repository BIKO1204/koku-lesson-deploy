// app/plan/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../firebaseConfig.js";  // Firestore 参照

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
        setPlans(JSON.parse(stored));
      } catch {
        setPlans([]);
      }
    }
  }, []);

  const sortedPlans = [...plans].sort((a, b) => {
    if (sortKey === "grade") return a.grade.localeCompare(b.grade);
    if (sortKey === "subject") return a.subject.localeCompare(b.subject);
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleDeleteBoth = async (id: string) => {
    if (!confirm("この授業案を本当に削除しますか？")) return;
    try {
      await db.collection("lesson_plans").doc(id).delete();
    } catch {
      alert("Firestore上の削除に失敗しました。");
      return;
    }
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    localStorage.setItem("lessonPlans", JSON.stringify(updated));
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto" }}>
      <nav style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 24, justifyContent: "center" }}>
        <button onClick={() => router.push("/")} style={navLinkStyle}>🏠 ホーム</button>
        <Link href="/plan" style={navLinkStyle}>📋 授業作成</Link>
        <Link href="/plan/history" style={navLinkStyle}>📖 計画履歴</Link>
        <Link href="/practice/history" style={navLinkStyle}>📷 実践履歴</Link>
        <Link href="/models/create" style={navLinkStyle}>✏️ 教育観作成</Link>
        <Link href="/models" style={navLinkStyle}>📚 教育観一覧</Link>
        <Link href="/models/history" style={navLinkStyle}>🕒 教育観履歴</Link>
      </nav>

      <h2 style={{ fontSize: "1.8rem", marginBottom: 16 }}>保存された授業案一覧</h2>

      <label style={{ display: "block", textAlign: "right", marginBottom: 16 }}>
        並び替え：
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          style={{ marginLeft: 8, padding: 6, fontSize: "1rem" }}
        >
          <option value="timestamp">新着順</option>
          <option value="grade">学年順</option>
          <option value="subject">教材名順</option>
        </select>
      </label>

      {sortedPlans.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>まだ授業案が保存されていません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sortedPlans.map((plan) => (
            <article key={plan.id} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.4rem" }}>{plan.unit}</h3>
                <p style={{ margin: "4px 0" }}>
                  <strong>学年・ジャンル：</strong>{plan.grade}・{plan.genre}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>スタイル：</strong>{plan.usedStyleName || "（未設定）"}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>時間数：</strong>{plan.hours}時間
                </p>
                <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "#555" }}>
                  {new Date(plan.timestamp).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Link href={`/practice/add/${plan.id}`}>
                  <button style={actionButtonStyle}>✍️ 実践記録</button>
                </Link>
                <button onClick={() => handleDeleteBoth(plan.id)} style={deleteButtonStyle}>
                  🗑 削除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const navLinkStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  textDecoration: "none",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  backgroundColor: "#fdfdfd",         // 淡い背景色
  border: "2px solid #ddd",           // 柔らかなグレーの枠線
  borderRadius: 12,
  padding: "16px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const actionButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  backgroundColor: "#f44336",
};
