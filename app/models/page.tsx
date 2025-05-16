"use client";

import { useState, useEffect } from "react";

export default function ModelListPage() {
  const [models, setModels] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    philosophy: "",
    evaluationFocus: "",
    languageFocus: "",
    childFocus: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("styleModels");
    if (stored) setModels(JSON.parse(stored));
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (model: any) => {
    setEditId(model.id);
    setForm({
      name: model.name,
      philosophy: model.philosophy,
      evaluationFocus: model.evaluationFocus,
      languageFocus: model.languageFocus,
      childFocus: model.childFocus,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({
      name: "",
      philosophy: "",
      evaluationFocus: "",
      languageFocus: "",
      childFocus: "",
    });
  };

  const handleSave = () => {
    if (!form.name || !form.philosophy || !form.evaluationFocus || !form.languageFocus || !form.childFocus) {
      alert("すべての項目を入力してください。");
      return;
    }

    let updatedModels;
    if (editId) {
      updatedModels = models.map((m) =>
        m.id === editId ? { ...m, ...form } : m
      );
    } else {
      const { v4: uuidv4 } = require("uuid");
      const newModel = { id: uuidv4(), ...form };
      updatedModels = [newModel, ...models];
    }

    setModels(updatedModels);
    localStorage.setItem("styleModels", JSON.stringify(updatedModels));
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    const updated = models.filter((m) => m.id !== id);
    setModels(updated);
    localStorage.setItem("styleModels", JSON.stringify(updated));
    if (editId === id) cancelEdit();
  };

  const navBarStyle = {
    display: "flex",
    gap: "1rem",
    overflowX: "auto",
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    marginBottom: "2rem",
    whiteSpace: "nowrap" as const,
  };

  const navLinkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#1976d2",
    color: "white",
    fontWeight: "bold",
    borderRadius: "6px",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
  };

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1.5rem",
    backgroundColor: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    marginBottom: "0.8rem",
    fontSize: "1.1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box" as const,
  };

  const buttonPrimary = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "0.5rem",
  };

  const buttonDanger = {
    backgroundColor: "#e53935",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      {/* 横並びナビゲーション */}
      <nav style={navBarStyle}>
        <a href="/" style={navLinkStyle}>🏠 ホーム</a>
        <a href="/plan" style={navLinkStyle}>📋 授業作成</a>
        <a href="/plan/history" style={navLinkStyle}>📖 計画履歴</a>
        <a href="/practice/history" style={navLinkStyle}>📷 実践履歴</a>
        <a href="/models/create" style={navLinkStyle}>✏️ 教育観作成</a>
        <a href="/models" style={navLinkStyle}>📚 教育観一覧</a>
      </nav>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>教育観モデル一覧・編集</h1>

      {/* 編集フォーム */}
      {editId && (
        <section style={cardStyle}>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>編集モード</h2>
          <input
            placeholder="モデル名"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="教育観"
            rows={2}
            value={form.philosophy}
            onChange={(e) => handleChange("philosophy", e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="評価観点の重視点"
            rows={2}
            value={form.evaluationFocus}
            onChange={(e) => handleChange("evaluationFocus", e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="言語活動の重視点"
            rows={2}
            value={form.languageFocus}
            onChange={(e) => handleChange("languageFocus", e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="育てたい子ども像"
            rows={2}
            value={form.childFocus}
            onChange={(e) => handleChange("childFocus", e.target.value)}
            style={inputStyle}
          />
          <div>
            <button onClick={handleSave} style={buttonPrimary}>
              保存
            </button>
            <button onClick={cancelEdit} style={{ ...buttonPrimary, backgroundColor: "#757575" }}>
              キャンセル
            </button>
          </div>
        </section>
      )}

      {/* モデル一覧カード */}
      <section>
        {models.length === 0 ? (
          <p>まだ登録された教育観モデルはありません。</p>
        ) : (
          models.map((model) => (
            <div key={model.id} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{model.name}</h3>
              <p><strong>教育観：</strong> {model.philosophy}</p>
              <p><strong>評価観点の重視点：</strong> {model.evaluationFocus}</p>
              <p><strong>言語活動の重視点：</strong> {model.languageFocus}</p>
              <p><strong>育てたい子ども像：</strong> {model.childFocus}</p>

              <div style={{ marginTop: "1rem" }}>
                <button onClick={() => startEdit(model)} style={buttonPrimary}>
                  編集
                </button>
                <button onClick={() => handleDelete(model.id)} style={buttonDanger}>
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
