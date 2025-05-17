"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import UpdateApprovalUI from "@/components/UpdateApprovalUI";

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
  const [showUpdateUI, setShowUpdateUI] = useState(false);

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

  // ステップ２API呼び出し関数をUpdateApprovalUIに渡す用
  const fetchUpdateProposal = async (feedbackText: string, currentModel: any) => {
    const res = await fetch("/api/updateEducationModel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackText, currentModel }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.result;
  };

  // UpdateApprovalUIから更新されたモデル受け取り処理
  const handleUpdate = (newVersion: any) => {
    const stored = localStorage.getItem("styleModels");
    const models = stored ? JSON.parse(stored) : [];
    // 新規バージョンとしてIDを振って追加
    const newModel = {
      id: uuidv4(),
      name,
      philosophy: newVersion.philosophy,
      evaluationFocus: newVersion.evaluationFocus,
      languageFocus: newVersion.languageFocus,
      childFocus: newVersion.childFocus,
      note: newVersion.note || "AI提案による更新",
    };
    models.push(newModel);
    localStorage.setItem("styleModels", JSON.stringify(models));
    alert("✅ AI提案で教育観モデルを更新しました！");
    router.push("/models");
  };

  if (!style)
    return <p style={{ padding: "2rem" }}>スタイルを読み込み中です...</p>;

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "90vw",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <nav style={{ marginBottom: "2rem" }}>
        <Link href="/models">← スタイル一覧へ戻る</Link>
      </nav>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        教育観スタイルの編集
      </h2>

      <label>
        スタイル名：
        <br />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label>
        教育観：
        <br />
        <textarea
          value={philosophy}
          onChange={(e) => setPhilosophy(e.target.value)}
          rows={3}
          style={inputStyle}
        />
      </label>

      <label>
        評価観点の重視：
        <br />
        <textarea
          value={evaluationFocus}
          onChange={(e) => setEvaluationFocus(e.target.value)}
          rows={2}
          style={inputStyle}
        />
      </label>

      <label>
        言語活動の重視：
        <br />
        <textarea
          value={languageFocus}
          onChange={(e) => setLanguageFocus(e.target.value)}
          rows={2}
          style={inputStyle}
        />
      </label>

      <label>
        育てたい子ども像：
        <br />
        <textarea
          value={childFocus}
          onChange={(e) => setChildFocus(e.target.value)}
          rows={2}
          style={inputStyle}
        />
      </label>

      <button
        onClick={handleSave}
        style={{
          ...inputStyle,
          backgroundColor: "#4CAF50",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        💾 スタイルを保存する
      </button>

      <button
        onClick={handleDelete}
        style={{
          ...inputStyle,
          backgroundColor: "#F44336",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🗑 このスタイルを削除する
      </button>

      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}

      <hr style={{ margin: "2rem 0" }} />

      {/* 振り返りAI更新UIの表示切り替えボタン */}
      <button
        onClick={() => setShowUpdateUI((v) => !v)}
        style={{
          ...inputStyle,
          backgroundColor: showUpdateUI ? "#1976d2" : "#03A9F4",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        {showUpdateUI ? "AI更新提案を閉じる" : "振り返りからAI更新提案を取得する"}
      </button>

      {showUpdateUI && (
        <UpdateApprovalUI
          currentModel={{ philosophy, evaluationFocus, languageFocus, childFocus }}
          onUpdate={handleUpdate}
          onCancel={() => setShowUpdateUI(false)}
          fetchUpdateProposal={fetchUpdateProposal}
        />
      )}
    </main>
  );
}
