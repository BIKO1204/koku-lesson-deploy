"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditStylePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const router = useRouter();

  const [style, setStyle] = useState<any>(null);
  const [name, setName] = useState("");
  const [philosophy, setPhilosophy] = useState("");
  const [evaluationFocus, setEvaluationFocus] = useState("");
  const [languageFocus, setLanguageFocus] = useState("");
  const [childFocus, setChildFocus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("styleModels");
    if (!stored) return;
    const models = JSON.parse(stored);
    const found = models.find((s: any) => s.id === id);
    if (found) {
      setStyle(found);
      setName(found.name);
      setPhilosophy(found.philosophy);
      setEvaluationFocus(found.evaluationFocus);
      setLanguageFocus(found.languageFocus);
      setChildFocus(found.childFocus);
    }
  }, [id]);

  const inputStyle = {
    width: "100%",
    padding: "1rem",
    fontSize: "1.1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "1.2rem",
  };

  const handleSave = () => {
    const stored = localStorage.getItem("styleModels");
    if (!stored) return;
    const models = JSON.parse(stored);
    const updated = models.map((s: any) =>
      s.id === id
        ? { ...s, name, philosophy, evaluationFocus, languageFocus, childFocus }
        : s
    );
    localStorage.setItem("styleModels", JSON.stringify(updated));
    setMessage("✅ スタイルを更新しました！");
    setTimeout(() => router.push("/models"), 1000);
  };

  const handleDelete = () => {
    if (!confirm("このスタイルを本当に削除してもよいですか？")) return;
    const stored = localStorage.getItem("styleModels");
    if (!stored) return;
    const models = JSON.parse(stored);
    const updated = models.filter((s: any) => s.id !== id);
    localStorage.setItem("styleModels", JSON.stringify(updated));
    router.push("/models");
  };

  if (!style) return <p style={{ padding: "2rem" }}>スタイルを読み込み中です...</p>;

  return (
    <main style={{ padding: "2rem", maxWidth: "90vw", margin: "0 auto", fontFamily: "sans-serif" }}>
      <nav style={{ marginBottom: "2rem" }}>
        <Link href="/models">← スタイル一覧へ戻る</Link>
      </nav>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>教育観スタイルの編集</h2>

      <label>スタイル名：<br />
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </label>

      <label>教育観：<br />
        <textarea value={philosophy} onChange={(e) => setPhilosophy(e.target.value)} rows={3} style={inputStyle} />
      </label>

      <label>評価観点の重視：<br />
        <textarea value={evaluationFocus} onChange={(e) => setEvaluationFocus(e.target.value)} rows={2} style={inputStyle} />
      </label>

      <label>言語活動の重視：<br />
        <textarea value={languageFocus} onChange={(e) => setLanguageFocus(e.target.value)} rows={2} style={inputStyle} />
      </label>

      <label>育てたい子ども像：<br />
        <textarea value={childFocus} onChange={(e) => setChildFocus(e.target.value)} rows={2} style={inputStyle} />
      </label>

      <button
        onClick={handleSave}
        style={{ ...inputStyle, backgroundColor: "#4CAF50", color: "white", fontWeight: "bold", cursor: "pointer" }}
      >
        💾 スタイルを保存する
      </button>

      <button
        onClick={handleDelete}
        style={{ ...inputStyle, backgroundColor: "#F44336", color: "white", fontWeight: "bold", cursor: "pointer" }}
      >
        🗑 このスタイルを削除する
      </button>

      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}
