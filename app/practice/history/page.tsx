"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [practiceRecords, setPracticeRecords] = useState<any[]>([]);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "practiceDate" | "lessonTitle">("timestamp");

  useEffect(() => {
    setPracticeRecords(JSON.parse(localStorage.getItem("practiceRecords") || "[]"));
    setLessonPlans(JSON.parse(localStorage.getItem("lessonPlans") || "[]"));
  }, []);

  const getLessonById = (lessonId: string) => lessonPlans.find((p) => p.id === lessonId);

  // 並び替えた配列
  const sortedRecords = [...practiceRecords].sort((a, b) => {
    if (sortKey === "practiceDate") {
      const aDate = a.practiceDate ? new Date(a.practiceDate).getTime() : 0;
      const bDate = b.practiceDate ? new Date(b.practiceDate).getTime() : 0;
      return bDate - aDate;
    }
    if (sortKey === "lessonTitle") {
      const aTitle = getLessonById(a.lessonId)?.unit || "";
      const bTitle = getLessonById(b.lessonId)?.unit || "";
      return aTitle.localeCompare(bTitle);
    }
    // timestamp 新着順（降順）
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return bTime - aTime;
  });

  // PDF保存関数は省略（元のコードからコピーしてください）

  const navButtonStyle = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    cursor: "pointer",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "90vw", margin: "0 auto" }}>
      {/* ナビゲーション */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button onClick={() => router.push("/")} style={navButtonStyle}>
          🏠 ホーム
        </button>
        <button onClick={() => router.push("/plan")} style={navButtonStyle}>
          📋 授業作成
        </button>
        <button onClick={() => router.push("/plan/history")} style={navButtonStyle}>
          📖 計画履歴
        </button>
        <button onClick={() => router.push("/practice/history")} style={navButtonStyle}>
          📷 実践履歴
        </button>
        <button onClick={() => router.push("/models/create")} style={navButtonStyle}>
          ✏️ 教育観作成
        </button>
        <button onClick={() => router.push("/models")} style={navButtonStyle}>
          📚 教育観一覧
        </button>
        <button onClick={() => router.push("/models")} style={navButtonStyle}>
          🕒 教育観履歴
        </button>
      </nav>

      <h2>実践履歴一覧</h2>

      {/* 並び替えセレクト */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        並び替え：
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          style={{ marginLeft: "0.5rem", padding: "0.3rem", fontSize: "1rem" }}
        >
          <option value="timestamp">登録順（新着順）</option>
          <option value="practiceDate">実施日順</option>
          <option value="lessonTitle">授業タイトル順</option>
        </select>
      </label>

      {sortedRecords.length === 0 ? (
        <p>まだ実践記録がありません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {sortedRecords.map((rec) => {
            const lesson = getLessonById(rec.lessonId);
            return (
              <div
                key={rec.lessonId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  padding: "1rem",
                  backgroundColor: "#fafafa",
                  boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <p>
                  <strong>授業案タイトル：</strong>
                  {lesson ? lesson.unit : "（不明）"}
                </p>
                <p>
                  <strong>実施日：</strong>
                  {rec.practiceDate || "未記入"}
                </p>
                <p>
                  <strong>振り返り：</strong>
                  {rec.reflection
                    ? rec.reflection.length > 150
                      ? rec.reflection.slice(0, 150) + "…"
                      : rec.reflection
                    : "未記入"}
                </p>
                <p>
                  <strong>板書写真枚数：</strong>
                  {rec.boardImages ? rec.boardImages.length : 0}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    marginTop: "0.75rem",
                    justifyContent: "start",
                  }}
                >
                  {rec.boardImages && rec.boardImages.length > 0 ? (
                    rec.boardImages.map((src: string, i: number) => (
                      <img
                        key={i}
                        src={src}
                        alt={`板書写真${i + 1}`}
                        style={{
                          width: 180,
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      />
                    ))
                  ) : (
                    <p>板書写真はありません</p>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => router.push(`/practice/add/${rec.lessonId}`)}
                    style={{
                      padding: "0.6rem 1rem",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✍️ 実践記録を編集・追加
                  </button>

                  <button
                    onClick={() => {
                      /* PDFダウンロード関数呼び出し */
                    }}
                    style={{
                      padding: "0.6rem 1rem",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    📄 この実践記録をPDF保存
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
