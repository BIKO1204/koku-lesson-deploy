"use client";

import { useState, useEffect } from "react";

type EducationModel = {
  id: string;
  name: string;
  philosophy: string;
  evaluationFocus: string;
  languageFocus: string;
  childFocus: string;
  updatedAt: string; // 新着順ソートに使うため必須にします
};

type EducationHistory = EducationModel & {
  note?: string;
};

export default function ModelListPage() {
  const [models, setModels] = useState<EducationModel[]>([]);
  const [history, setHistory] = useState<EducationHistory[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    philosophy: "",
    evaluationFocus: "",
    languageFocus: "",
    childFocus: "",
    note: "",
  });
  const [sortOrder, setSortOrder] = useState<"newest" | "nameAsc">("newest");

  useEffect(() => {
    const storedModels = localStorage.getItem("styleModels");
    if (storedModels) setModels(JSON.parse(storedModels));
    const storedHistory = localStorage.getItem("educationStylesHistory");
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (model: EducationModel) => {
    setEditId(model.id);
    setForm({
      name: model.name,
      philosophy: model.philosophy,
      evaluationFocus: model.evaluationFocus,
      languageFocus: model.languageFocus,
      childFocus: model.childFocus,
      note: "",
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
      note: "",
    });
  };

  const handleSave = () => {
    if (
      !form.name.trim() ||
      !form.philosophy.trim() ||
      !form.evaluationFocus.trim() ||
      !form.languageFocus.trim() ||
      !form.childFocus.trim()
    ) {
      alert("すべての必須項目を入力してください。");
      return;
    }

    let updatedModels: EducationModel[];
    const nowISOString = new Date().toISOString();

    if (editId) {
      // 編集時はモデルを更新＋updatedAt更新
      updatedModels = models.map((m) =>
        m.id === editId ? { ...m, ...form, updatedAt: nowISOString } : m
      );
    } else {
      // 新規作成時はUUIDとupdatedAt追加
      const { v4: uuidv4 } = require("uuid");
      const newModel: EducationModel = {
        id: uuidv4(),
        name: form.name.trim(),
        philosophy: form.philosophy.trim(),
        evaluationFocus: form.evaluationFocus.trim(),
        languageFocus: form.languageFocus.trim(),
        childFocus: form.childFocus.trim(),
        updatedAt: nowISOString,
      };
      updatedModels = [newModel, ...models];
    }

    setModels(updatedModels);
    localStorage.setItem("styleModels", JSON.stringify(updatedModels));

    // 履歴の追加
    const newHistoryEntry: EducationHistory = {
      id: editId ? editId : updatedModels[0].id,
      updatedAt: nowISOString,
      name: form.name.trim(),
      philosophy: form.philosophy.trim(),
      evaluationFocus: form.evaluationFocus.trim(),
      languageFocus: form.languageFocus.trim(),
      childFocus: form.childFocus.trim(),
      note: form.note.trim() || "（更新時にメモなし）",
    };
    const updatedHistory = [newHistoryEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("educationStylesHistory", JSON.stringify(updatedHistory));

    cancelEdit();
  };

  // 削除ボタンは削除するため関数は残しません

  // 並び替え変更処理
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "newest" | "nameAsc");
  };

  // 並び替え済みモデル配列
  const sortedModels = () => {
    const copy = [...models];
    if (sortOrder === "newest") {
      return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortOrder === "nameAsc") {
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy;
  };

  // スタイル
  const navBarStyle = {
    display: "flex",
    gap: "1rem",
    overflowX: "auto" as const,
    padding: "1rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    marginBottom: "1rem",
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

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      {/* ナビバー */}
      <nav style={navBarStyle}>
        <a href="/" style={navLinkStyle}>🏠 ホーム</a>
        <a href="/plan" style={navLinkStyle}>📋 授業作成</a>
        <a href="/plan/history" style={navLinkStyle}>📖 計画履歴</a>
        <a href="/practice/history" style={navLinkStyle}>📷 実践履歴</a>
        <a href="/models/create" style={navLinkStyle}>✏️ 教育観作成</a>
        <a href="/models" style={navLinkStyle}>📚 教育観一覧</a>
        <a href="/models/history" style={navLinkStyle}>🕒 教育観履歴</a>
      </nav>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>教育観モデル一覧・編集</h1>

      {/* 並び替えセレクト */}
      <label style={{ marginBottom: "1rem", display: "block", fontWeight: "bold" }}>
        並び替え：
        <select value={sortOrder} onChange={handleSortChange} style={{ marginLeft: "0.5rem", padding: "0.4rem", fontSize: "1rem" }}>
          <option value="newest">新着順</option>
          <option value="nameAsc">名前順</option>
        </select>
      </label>

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
            placeholder="育てたい子どもの姿"
            rows={2}
            value={form.childFocus}
            onChange={(e) => handleChange("childFocus", e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="更新メモ（履歴に残ります）"
            rows={2}
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
            style={{ ...inputStyle, fontStyle: "italic" }}
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

      {/* モデル一覧 */}
      <section>
        {sortedModels().length === 0 ? (
          <p>まだ登録された教育観モデルはありません。</p>
        ) : (
          sortedModels().map((model) => (
            <div key={model.id} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{model.name}</h3>
              <p><strong>教育観：</strong> {model.philosophy}</p>
              <p><strong>評価観点の重視点：</strong> {model.evaluationFocus}</p>
              <p><strong>言語活動の重視点：</strong> {model.languageFocus}</p>
              <p><strong>育てたい子どもの姿：</strong> {model.childFocus}</p>

              <div style={{ marginTop: "1rem" }}>
                <button onClick={() => startEdit(model)} style={buttonPrimary}>
                  編集
                </button>
                {/* 削除ボタンは削除 */}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
