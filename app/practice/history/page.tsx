"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [practiceRecords, setPracticeRecords] = useState<any[]>([]);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);

  useEffect(() => {
    setPracticeRecords(JSON.parse(localStorage.getItem("practiceRecords") || "[]"));
    setLessonPlans(JSON.parse(localStorage.getItem("lessonPlans") || "[]"));
  }, []);

  const getLessonById = (lessonId: string) => lessonPlans.find((p) => p.id === lessonId);

  // 個別PDF保存関数
  const handleSinglePdfDownload = async (record: any) => {
    const html2pdf = (await import("html2pdf.js")).default;

    // PDF用の一時的DOM作成
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "1rem";
    pdfContent.style.fontFamily = "sans-serif";
    pdfContent.style.maxWidth = "700px";

    const lesson = getLessonById(record.lessonId);

    pdfContent.innerHTML = `
      <h2>実践記録レポート</h2>
      <h3>授業案：${lesson ? lesson.unit : "不明"}</h3>
      <p><strong>単元の目標：</strong> ${lesson ? lesson.unitGoal : "未設定"}</p>
      <p><strong>評価の観点：</strong></p>
      <ul>
        ${lesson ? lesson.evaluationPoints.knowledge.map((p: string) => `<li>知識・技能: ${p}</li>`).join("") : ""}
        ${lesson ? lesson.evaluationPoints.thinking.map((p: string) => `<li>思考・判断・表現: ${p}</li>`).join("") : ""}
        ${lesson ? lesson.evaluationPoints.attitude.map((p: string) => `<li>主体的に学習に取り組む態度: ${p}</li>`).join("") : ""}
      </ul>
      <p><strong>授業の展開：</strong> ${lesson ? lesson.lessonPlanList.map((s: string, i: number) => `${i + 1}時間目: ${s}`).join("<br/>") : "未設定"}</p>

      <h3>実践記録</h3>
      <p><strong>実施日：</strong> ${record.practiceDate || "未記入"}</p>
      <p><strong>振り返り：</strong><br/> ${record.reflection ? record.reflection.replace(/\n/g, "<br/>") : "未記入"}</p>
      <h4>板書写真</h4>
    `;

    if (record.boardImages && record.boardImages.length > 0) {
      record.boardImages.forEach((src: string) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.width = "400px";
        img.style.marginBottom = "10px";
        img.style.border = "1px solid #ccc";
        img.style.borderRadius = "6px";
        pdfContent.appendChild(img);
      });
    } else {
      const noImg = document.createElement("p");
      noImg.textContent = "板書写真はありません";
      pdfContent.appendChild(noImg);
    }

    document.body.appendChild(pdfContent);

    await html2pdf()
      .from(pdfContent)
      .set({
        margin: 10,
        filename: `実践記録_${lesson ? lesson.unit : "不明"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();

    document.body.removeChild(pdfContent);
  };

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
      {/* 横並びナビゲーション */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button onClick={() => router.push("/")} style={navButtonStyle}>🏠 ホーム</button>
        <button onClick={() => router.push("/plan")} style={navButtonStyle}>📋 授業作成</button>
        <button onClick={() => router.push("/plan/history")} style={navButtonStyle}>📖 計画履歴</button>
        <button onClick={() => router.push("/practice/history")} style={navButtonStyle}>📷 実践履歴</button>
        <button onClick={() => router.push("/models/create")} style={navButtonStyle}>✏️ 教育観作成</button>
        <button onClick={() => router.push("/models")} style={navButtonStyle}>📚 教育観一覧</button>
      </nav>

      <h2>実践履歴一覧</h2>

      {practiceRecords.length === 0 ? (
        <p>まだ実践記録がありません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {practiceRecords.map((rec) => {
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
                <p><strong>授業案タイトル：</strong>{lesson ? lesson.unit : "（不明）"}</p>
                <p><strong>実施日：</strong>{rec.practiceDate || "未記入"}</p>
                <p><strong>振り返り：</strong>
                  {rec.reflection
                    ? rec.reflection.length > 150
                      ? rec.reflection.slice(0, 150) + "…"
                      : rec.reflection
                    : "未記入"}
                </p>
                <p><strong>板書写真枚数：</strong>{rec.boardImages ? rec.boardImages.length : 0}</p>

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

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                    onClick={() => handleSinglePdfDownload(rec)}
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
