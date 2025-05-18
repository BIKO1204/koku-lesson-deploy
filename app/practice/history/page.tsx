// app/practice/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PracticeRecord = {
  id: string;
  timestamp: string;
  lessonId: string;
  practiceDate?: string;
  reflection?: string;
  boardImages?: string[];
};

type LessonPlan = {
  id: string;
  unit: string;
};

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "practiceDate" | "lessonTitle">("timestamp");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPracticeRecords(JSON.parse(localStorage.getItem("practiceRecords") || "[]"));
    setLessonPlans(JSON.parse(localStorage.getItem("lessonPlans") || "[]"));
  }, []);

  const getLesson = (id: string) => lessonPlans.find((lp) => lp.id === id);

  const sortedRecords = [...practiceRecords].sort((a, b) => {
    if (sortKey === "practiceDate") {
      const aD = a.practiceDate ? new Date(a.practiceDate).getTime() : 0;
      const bD = b.practiceDate ? new Date(b.practiceDate).getTime() : 0;
      return bD - aD;
    }
    if (sortKey === "lessonTitle") {
      const aT = getLesson(a.lessonId)?.unit || "";
      const bT = getLesson(b.lessonId)?.unit || "";
      return aT.localeCompare(bT);
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleBulkDelete = () => {
    if (!confirm("選択した実践記録を本当に削除しますか？")) return;
    const remaining = practiceRecords.filter((r) => !selectedIds.has(r.id));
    localStorage.setItem("practiceRecords", JSON.stringify(remaining));
    setPracticeRecords(remaining);
    setSelectedIds(new Set());
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto" }}>
      {/* 横一列ナビ */}
      <nav style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 24, justifyContent: "center" }}>
        <button onClick={() => router.push("/")} style={navLinkStyle}>🏠 ホーム</button>
        <Link href="/plan" style={navLinkStyle}>📋 授業作成</Link>
        <Link href="/plan/history" style={navLinkStyle}>📖 計画履歴</Link>
        <Link href="/practice/history" style={navLinkStyle}>📷 実践履歴</Link>
        <Link href="/models/create" style={navLinkStyle}>✏️ 教育観作成</Link>
        <Link href="/models" style={navLinkStyle}>📚 教育観一覧</Link>
        <Link href="/models/history" style={navLinkStyle}>🕒 教育観履歴</Link>
      </nav>

      <h2 style={{ fontSize: "1.8rem", marginBottom: 16 }}>実践履歴一覧</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <label>
          並び替え：
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            style={{ marginLeft: 8, padding: 6, fontSize: "1rem" }}
          >
            <option value="timestamp">登録順</option>
            <option value="practiceDate">実施日順</option>
            <option value="lessonTitle">授業タイトル順</option>
          </select>
        </label>
        <button onClick={handleBulkDelete} style={deleteButtonStyle}>
          🗑 選択削除 ({selectedIds.size})
        </button>
      </div>

      {sortedRecords.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>まだ実践記録がありません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sortedRecords.map((rec) => {
            const lesson = getLesson(rec.lessonId);
            return (
              <article key={rec.id} style={cardStyle}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(rec.id)}
                  onChange={() => toggleSelect(rec.id)}
                  style={{ marginRight: 16, transform: "scale(1.2)" }}
                />

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem" }}>{lesson?.unit || "（不明）"}</h3>
                  <p style={{ margin: "4px 0" }}>
                    <strong>実施日：</strong>{rec.practiceDate || "未記入"}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>振り返り：</strong>{rec.reflection?.slice(0, 100) || "未記入"}…
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>板書写真：</strong>{rec.boardImages?.length || 0}枚
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => router.push(`/practice/add/${rec.lessonId}`)}
                    style={actionButtonStyle}
                  >
                    ✍️ 編集
                  </button>
                  <button onClick={() => {/* PDFロジック */}} style={pdfButtonStyle}>
                    📄 PDF
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

// --- 共通スタイル ---
const navLinkStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "#1976d2",
  color: "white",
  borderRadius: 6,
  textDecoration: "none",
  fontSize: "1rem",
  cursor: "pointer",
  border: "none",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  backgroundColor: "#f9f9fc",
  border: "2px solid #e0e0e0",
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

const pdfButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  backgroundColor: "#2196F3",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  cursor: "pointer",
};
