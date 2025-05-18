"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { db } from "..//firebaseConfig.js";

type EducationModel = {
  id: string;
  name: string;
  philosophy: string;
  evaluationFocus: string;
  languageFocus: string;
  childFocus: string;
  updatedAt: string;
};

type EducationHistory = EducationModel & {
  note: string;
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

  // 読み込み：localStorage＋Firestore 両方、Firestore優先でマージ
  useEffect(() => {
    async function loadAll() {
      // 1) localStorage
      const localModels: EducationModel[] = JSON.parse(
        localStorage.getItem("styleModels") || "[]"
      );
      const localHistory: EducationHistory[] = JSON.parse(
        localStorage.getItem("educationStylesHistory") || "[]"
      );

      // 2) Firestore
      let fsModels: EducationModel[] = [];
      let fsHistory: EducationHistory[] = [];
      try {
        const mSnap = await db
          .collection("styleModels")
          .orderBy("updatedAt", "desc")
          .get();
        fsModels = mSnap.docs.map((d) => ({
          ...(d.data() as Omit<EducationModel, "id">),
          id: d.id,
        }));
      } catch (e) {
        console.error("Firestore(styleModels)読み込みエラー", e);
      }
      try {
        const hSnap = await db
          .collection("educationStylesHistory")
          .orderBy("updatedAt", "desc")
          .get();
        fsHistory = hSnap.docs.map((d) => ({
          ...(d.data() as Omit<EducationHistory, "id">),
          id: d.id,
        }));
      } catch (e) {
        console.error("Firestore(educationStylesHistory)読み込みエラー", e);
      }

      // マージ＆重複排除 (Firestore優先)
      const modelMap = new Map<string, EducationModel>();
      fsModels.concat(localModels).forEach((m) => modelMap.set(m.id, m));
      setModels(Array.from(modelMap.values()));

      const histMap = new Map<string, EducationHistory>();
      fsHistory.concat(localHistory).forEach((h) => histMap.set(h.id, h));
      setHistory(Array.from(histMap.values()));
    }
    loadAll();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (m: EducationModel) => {
    setEditId(m.id);
    setForm({
      name: m.name,
      philosophy: m.philosophy,
      evaluationFocus: m.evaluationFocus,
      languageFocus: m.languageFocus,
      childFocus: m.childFocus,
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

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.philosophy.trim() ||
      !form.evaluationFocus.trim() ||
      !form.languageFocus.trim() ||
      !form.childFocus.trim()
    ) {
      alert("必須項目を入力してください。");
      return;
    }
    const now = new Date().toISOString();
    let updatedModels: EducationModel[];
    let id = editId!;
    if (editId) {
      // 更新
      id = editId;
      try {
        await db
          .collection("styleModels")
          .doc(id)
          .update({ ...form, updatedAt: now });
      } catch (e) {
        console.error("Firestoreスタイル更新エラー", e);
      }
      updatedModels = models.map((m) =>
        m.id === id ? { id, ...form, updatedAt: now } : m
      );
    } else {
      // 新規
      id = uuidv4();
      const newModel: EducationModel = {
        id,
        name: form.name.trim(),
        philosophy: form.philosophy.trim(),
        evaluationFocus: form.evaluationFocus.trim(),
        languageFocus: form.languageFocus.trim(),
        childFocus: form.childFocus.trim(),
        updatedAt: now,
      };
      try {
        await db.collection("styleModels").doc(id).set(newModel);
      } catch (e) {
        console.error("Firestoreスタイル保存エラー", e);
      }
      updatedModels = [newModel, ...models];
    }
    setModels(updatedModels);
    localStorage.setItem("styleModels", JSON.stringify(updatedModels));

    // 履歴追加
    const newHistoryEntry: EducationHistory = {
      id,
      updatedAt: now,
      name: form.name.trim(),
      philosophy: form.philosophy.trim(),
      evaluationFocus: form.evaluationFocus.trim(),
      languageFocus: form.languageFocus.trim(),
      childFocus: form.childFocus.trim(),
      note: form.note.trim() || "（メモなし）",
    };
    try {
      await db
        .collection("educationStylesHistory")
        .add(newHistoryEntry);
    } catch (e) {
      console.error("Firestore履歴保存エラー", e);
    }
    const updatedHistory = [newHistoryEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(
      "educationStylesHistory",
      JSON.stringify(updatedHistory)
    );

    cancelEdit();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このモデルを削除しますか？")) return;
    try {
      await db.collection("styleModels").doc(id).delete();
    } catch (e) {
      console.error("Firestoreモデル削除エラー", e);
    }
    const remaining = models.filter((m) => m.id !== id);
    setModels(remaining);
    localStorage.setItem("styleModels", JSON.stringify(remaining));
  };

  const sortedModels = () => {
    const copy = [...models];
    if (sortOrder === "newest") {
      return copy.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  };

  // スタイル省略...

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      {/* ナビ */}
      <nav style={{ display: "flex", gap: 16, overflowX: "auto", padding: 16, backgroundColor: "#f0f0f0", borderRadius: 8, marginBottom: 24 }}>
        <Link href="/" style={navLinkStyle}>🏠 ホーム</Link>
        <Link href="/plan" style={navLinkStyle}>📋 授業作成</Link>
        <Link href="/plan/history" style={navLinkStyle}>📖 計画履歴</Link>
        <Link href="/practice/history" style={navLinkStyle}>📷 実践履歴</Link>
        <Link href="/models/create" style={navLinkStyle}>✏️ 教育観作成</Link>
        <Link href="/models" style={navLinkStyle}>📚 教育観一覧</Link>
        <Link href="/models/history" style={navLinkStyle}>🕒 教育観履歴</Link>
      </nav>

      <h1 style={{ fontSize: 24, marginBottom: 16 }}>教育観モデル一覧・編集</h1>

      {/* 並び替え */}
      <label style={{ display: "block", marginBottom: 16 }}>
        並び替え：
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          style={{ marginLeft: 8, padding: 4 }}
        >
          <option value="newest">新着順</option>
          <option value="nameAsc">名前順</option>
        </select>
      </label>

      {/* 編集フォーム */}
      {editId && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>編集モード</h2>
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
            placeholder="更新メモ"
            rows={2}
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
            style={{ ...inputStyle, fontStyle: "italic" }}
          />
          <div style={{ marginTop: 16 }}>
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
      {sortedModels().length === 0 ? (
        <p>まだモデルがありません。</p>
      ) : (
        sortedModels().map((m) => (
          <div key={m.id} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{m.name}</h3>
            <p><strong>教育観：</strong> {m.philosophy}</p>
            <p><strong>評価観点：</strong> {m.evaluationFocus}</p>
            <p><strong>言語活動：</strong> {m.languageFocus}</p>
            <p><strong>育てたい子ども：</strong> {m.childFocus}</p>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => startEdit(m)} style={buttonPrimary}>
                編集
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ ...buttonPrimary, backgroundColor: "#f44336" }}>
                削除
              </button>
            </div>
          </div>
        ))
      )}
    </main>
);
}

// --- スタイル定義 ---
const navLinkStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: "#1976d2",
  color: "white",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
  backgroundColor: "white",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  marginBottom: 12,
  fontSize: "1rem",
  borderRadius: 6,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const buttonPrimary: React.CSSProperties = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "8px 16px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: 8,
};
