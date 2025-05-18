// app/models/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig.js";

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

export default function CreateModelPage() {
  const router = useRouter();

  const [models, setModels] = useState<EducationModel[]>([]);
  const [form, setForm] = useState({
    name: "",
    philosophy: "",
    evaluationFocus: "",
    languageFocus: "",
    childFocus: "",
    note: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // localStorage から既存モデルを読み込み
  useEffect(() => {
    const stored = localStorage.getItem("styleModels");
    if (stored) setModels(JSON.parse(stored));
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    // 必須項目チェック
    if (
      !form.name.trim() ||
      !form.philosophy.trim() ||
      !form.evaluationFocus.trim() ||
      !form.languageFocus.trim() ||
      !form.childFocus.trim()
    ) {
      setError("すべての必須項目を入力してください。");
      return;
    }

    const now = new Date().toISOString();
    let updatedModels: EducationModel[];

    if (editId) {
      // 編集
      updatedModels = models.map(m =>
        m.id === editId
          ? { ...m, ...form, updatedAt: now }
          : m
      );
    } else {
      // 新規
      updatedModels = [
        {
          id: uuidv4(),
          name: form.name.trim(),
          philosophy: form.philosophy.trim(),
          evaluationFocus: form.evaluationFocus.trim(),
          languageFocus: form.languageFocus.trim(),
          childFocus: form.childFocus.trim(),
          updatedAt: now,
        },
        ...models,
      ];
    }

    // 1) localStorage に保存
    localStorage.setItem("styleModels", JSON.stringify(updatedModels));
    setModels(updatedModels);

    // 2) Firestore の education_models コレクションへ保存
    try {
      if (editId) {
        // 既存ドキュメントを上書き
        await setDoc(doc(db, "education_models", editId), {
          id: editId,
          name: form.name.trim(),
          philosophy: form.philosophy.trim(),
          evaluationFocus: form.evaluationFocus.trim(),
          languageFocus: form.languageFocus.trim(),
          childFocus: form.childFocus.trim(),
          updatedAt: now,
          updatedBy: auth.currentUser?.uid || null,
        });
      } else {
        // 新規ドキュメント作成
        await addDoc(collection(db, "education_models"), {
          id: updatedModels[0].id,
          name: form.name.trim(),
          philosophy: form.philosophy.trim(),
          evaluationFocus: form.evaluationFocus.trim(),
          languageFocus: form.languageFocus.trim(),
          childFocus: form.childFocus.trim(),
          updatedAt: now,
          createdBy: auth.currentUser?.uid || null,
        });
      }
      alert("✅ Firestore にモデル情報を保存しました！");
    } catch (e) {
      console.error("Firestore 保存エラー", e);
      alert("⚠️ Firestore への保存に失敗しました。");
    }

    // 3) 履歴データを localStorage に追加
    const newHistoryEntry: EducationHistory = {
      id: editId || updatedModels[0].id,
      name: form.name.trim(),
      philosophy: form.philosophy.trim(),
      evaluationFocus: form.evaluationFocus.trim(),
      languageFocus: form.languageFocus.trim(),
      childFocus: form.childFocus.trim(),
      updatedAt: now,
      note: form.note.trim() || "（更新時にメモなし）",
    };
    const prevHistory = JSON.parse(
      localStorage.getItem("educationStylesHistory") || "[]"
    ) as EducationHistory[];
    const updatedHistory = [newHistoryEntry, ...prevHistory];
    localStorage.setItem(
      "educationStylesHistory",
      JSON.stringify(updatedHistory)
    );

    // 4) Firestore の education_styles_history コレクションへ履歴保存
    try {
      await addDoc(collection(db, "education_styles_history"), {
        ...newHistoryEntry,
        recordedBy: auth.currentUser?.uid || null,
        recordedAt: now,
      });
      alert("✅ Firestore に履歴を記録しました！");
    } catch (e) {
      console.error("Firestore 履歴保存エラー", e);
      alert("⚠️ Firestore への履歴保存に失敗しました。");
    }

    // 完了したら **履歴ページ** へ戻るように変更
    router.push("/models/history");
  };

  return (
    <main
      style={{
        padding: "2rem 4rem",
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* ナビゲーション */}
      <nav
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {[
          ["/", "🏠 ホーム"],
          ["/plan", "📋 授業作成"],
          ["/plan/history", "📖 計画履歴"],
          ["/practice/history", "📷 実践履歴"],
          ["/models/create", "✏️ 教育観作成"],
          ["/models", "📚 教育観一覧"],
          ["/models/history", "🕒 教育観履歴"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: "8px 12px",
              backgroundColor:
                href === "/models/create" ? "#4CAF50" : "#1976d2",
              color: "white",
              borderRadius: 6,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        {editId ? "✏️ 教育観モデルを編集" : "✏️ 新しい教育観モデルを作成"}
      </h1>

      {error && (
        <p
          style={{
            color: "red",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      <section
        style={{
          backgroundColor: "#f9f9f9",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <label style={{ display: "block", marginBottom: 12 }}>
          モデル名（必須）：
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          教育観（必須）：
          <textarea
            rows={2}
            value={form.philosophy}
            onChange={e => handleChange("philosophy", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          評価観点の重視点（必須）：
          <textarea
            rows={2}
            value={form.evaluationFocus}
            onChange={e => handleChange("evaluationFocus", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          言語活動の重視点（必須）：
          <textarea
            rows={2}
            value={form.languageFocus}
            onChange={e => handleChange("languageFocus", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          育てたい子どもの姿（必須）：
          <textarea
            rows={2}
            value={form.childFocus}
            onChange={e => handleChange("childFocus", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 24 }}>
          更新メモ（任意）：
          <textarea
            rows={2}
            value={form.note}
            onChange={e => handleChange("note", e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "1.1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 4,
              fontStyle: "italic",
            }}
          />
        </label>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "0.8rem 2rem",
              fontSize: "1.1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {editId ? "更新して保存" : "作成して保存"}
          </button>
        </div>
      </section>
    </main>
  );
}
