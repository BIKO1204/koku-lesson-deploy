// app/practice/add/[id]/page.tsx
"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";

type BoardImage = {
  name: string;
  src: string;
};

export default function PracticeAddPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [practiceDate, setPracticeDate] = useState("");
  const [reflection, setReflection] = useState("");
  const [boardImages, setBoardImages] = useState<BoardImage[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");

  useEffect(() => {
    const lessonPlans = JSON.parse(localStorage.getItem("lessonPlans") || "[]");
    const targetPlan = lessonPlans.find((p: any) => p.id === id);
    if (targetPlan) setLessonTitle(targetPlan.unit);

    const practiceRecords = JSON.parse(localStorage.getItem("practiceRecords") || "[]");
    const record = practiceRecords.find((r: any) => r.lessonId === id);
    if (record) {
      setPracticeDate(record.practiceDate);
      setReflection(record.reflection);
      setBoardImages(record.boardImages || []);
    }
  }, [id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const dateTag = new Date().toISOString().slice(0, 10);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setBoardImages((prev) => [
            ...prev,
            { name: `${dateTag}-${file.name}`, src: result },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setBoardImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const practiceRecords = JSON.parse(localStorage.getItem("practiceRecords") || "[]");
    const existingIndex = practiceRecords.findIndex((r: any) => r.lessonId === id);
    const newRecord = { lessonId: id, practiceDate, reflection, boardImages };

    if (existingIndex >= 0) practiceRecords[existingIndex] = newRecord;
    else practiceRecords.push(newRecord);

    try {
      localStorage.setItem("practiceRecords", JSON.stringify(practiceRecords));
    } catch (e: any) {
      console.error("LocalStorage QuotaExceeded", e);
      const truncated = practiceRecords.slice(0, 10);
      localStorage.setItem("practiceRecords", JSON.stringify(truncated));
      alert(
        "ローカルストレージの容量がいっぱいです。\n" +
        "古い実践記録を削除し、最新 10 件のみ保存しました。"
      );
    }

    alert("実践記録を保存しました！");
    router.push("/practice/history");
  };

  // スタイル
  const containerStyle: React.CSSProperties = {
    padding: "1.5rem",
    fontFamily: "sans-serif",
    maxWidth: "100vw",
    width: "100%",
    margin: "0 auto",
  };
  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "nowrap",
    justifyContent: "center",
    overflowX: "auto",
  };
  const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
  const sectionBoxStyle: React.CSSProperties = {
    border: "2px solid #1976d2",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    backgroundColor: "#f5faff",
  };
  const uploadLabelStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "1rem 2rem",
    backgroundColor: "#2196F3",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 4px 8px rgba(33,150,243,0.6)",
    marginBottom: "1rem",
    textAlign: "center",
    width: "100%",
  };
  const removeButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem",
    fontSize: "1.1rem",
    backgroundColor: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
    transition: "background-color 0.3s",
  };

  return (
    <main style={containerStyle}>
      <nav style={navStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 ホーム</button>
        <button onClick={() => router.push("/plan")} style={buttonStyle}>📋 授業作成</button>
        <button onClick={() => router.push("/plan/history")} style={buttonStyle}>📖 計画履歴</button>
        <button onClick={() => router.push("/practice/history")} style={buttonStyle}>📷 実践履歴</button>
        <button onClick={() => router.push("/models/create")} style={buttonStyle}>✏️ 教育観作成</button>
        <button onClick={() => router.push("/models")} style={buttonStyle}>📚 教育観一覧</button>
      </nav>

      <h2>実践記録作成・編集</h2>
      <p><strong>授業案タイトル：</strong> {lessonTitle}</p>

      <div style={sectionBoxStyle}>
        <label>
          実施日：<br />
          <input
            type="date"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", fontSize: "1.1rem" }}
          />
        </label>
      </div>

      <div style={sectionBoxStyle}>
        <label>
          振り返り：<br />
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={8}
            style={{ width: "100%", padding: "0.6rem", fontSize: "1.1rem", minHeight: 200 }}
          />
        </label>
      </div>

      <label htmlFor="boardImageUpload" style={uploadLabelStyle}>
        📷 板書写真をアップロード（複数選択OK）
      </label>
      <input
        id="boardImageUpload"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", justifyContent: "center" }}>
        {boardImages.map((img, i) => (
          <div
            key={`${img.name}-${i}`}
            style={{
              width: 200, display: "flex", flexDirection: "column", alignItems: "center",
              border: "1px solid #ccc", borderRadius: "12px", padding: "0.75rem",
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)", backgroundColor: "white",
            }}
          >
            <img
              src={img.src}
              alt={img.name}
              style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "10px", marginBottom: "0.75rem" }}
            />
            <button
              onClick={() => handleRemoveImage(i)}
              style={removeButtonStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e53935")}
              aria-label={`${img.name} を削除`}
            >
              🗑 写真を削除
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: "1rem", width: "100%", backgroundColor: "#4CAF50",
          color: "white", border: "none", borderRadius: "10px",
          cursor: "pointer", fontSize: "1.2rem",
        }}
      >
        保存する
      </button>
    </main>
  );
}
