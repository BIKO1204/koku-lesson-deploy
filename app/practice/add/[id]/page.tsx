"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function PracticeAddPage() {
  const [plan, setPlan] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [executionDate, setExecutionDate] = useState("");
  const [boardImages, setBoardImages] = useState<string[]>([]);

  const router = useRouter();
  const id = (useParams() as { id: string }).id; // ✅ 型を明示してエラー解消

  useEffect(() => {
    const saved = localStorage.getItem("lessonPlans");
    if (!saved || !id) return;
    const parsed = JSON.parse(saved);
    const found = parsed.find((p: any) => p.id === id);
    if (found) {
      setPlan(found);
      setReflection(found.reflection || "");
      setExecutionDate(found.executionDate || "");
      setBoardImages(found.boardImages || []);
    }
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((results) => {
      setBoardImages((prev) => [...prev, ...results]);
    });
  };

  const handleSave = () => {
    const saved = localStorage.getItem("lessonPlans");
    if (!saved) return;
    const parsed = JSON.parse(saved);
    const updated = parsed.map((p: any) =>
      p.id === id ? { ...p, reflection, executionDate, boardImages } : p
    );
    localStorage.setItem("lessonPlans", JSON.stringify(updated));
    alert("実践を保存しました");
    router.push("/practice/history");
  };

  if (!plan) return <p>読み込み中...</p>;

  const inputStyle = {
    width: "100%",
    padding: "1rem",
    fontSize: "1.1rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "1.5rem",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
    display: "block",
  };

  const buttonStyle = {
    width: "100%",
    padding: "1rem",
    fontSize: "1.2rem",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  };

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "sans-serif",
      maxWidth: "700px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    }}>
      <nav style={{ marginBottom: "1.5rem" }}>
        <Link href="/practice/history" style={{ textDecoration: "none", color: "#4CAF50", fontSize: "1rem" }}>
          ← 実践履歴にもどる
        </Link>
      </nav>

      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>📷 授業実践を追加：{plan.unit}</h1>

      <label style={labelStyle}>🗓 実施日：</label>
      <input
        type="date"
        value={executionDate}
        onChange={(e) => setExecutionDate(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>📝 ふりかえり：</label>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        rows={5}
        style={inputStyle}
      />

      <label style={labelStyle}>📷 板書写真を追加：</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        style={{ marginBottom: "1.5rem", fontSize: "1rem" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {boardImages.map((src, i) => (
          <img key={i} src={src} alt={`写真${i + 1}`} style={{ width: "100px", borderRadius: "6px" }} />
        ))}
      </div>

      <button
        onClick={handleSave}
        style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}
      >
        💾 保存する
      </button>
    </main>
  );
}
