"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("lessonPlans");
    if (stored) {
      setPlans(JSON.parse(stored));
    }
  }, []);

  // 横並びのアイコン風ナビスタイル
  const navStyle = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    justifyContent: "center",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    fontSize: "1.2rem",
    borderRadius: "8px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "90vw", margin: "0 auto" }}>
      {/* 横並びナビゲーション */}
      <nav style={navStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 ホーム</button>
        <Link href="/plan" passHref>
          <button style={buttonStyle}>📋 授業作成</button>
        </Link>
        <Link href="/plan/history" passHref>
          <button style={buttonStyle}>📖 計画履歴</button>
        </Link>
        <Link href="/practice/history" passHref>
          <button style={buttonStyle}>📷 実践履歴</button>
        </Link>
        <Link href="/models/create" passHref>
          <button style={buttonStyle}>✏️ 教育観作成</button>
        </Link>
        <Link href="/models" passHref>
          <button style={buttonStyle}>📚 教育観一覧</button>
        </Link>
      </nav>

      <h2 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>保存された授業案一覧</h2>

      {plans.length === 0 ? (
        <p>まだ授業案が保存されていません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: "#fafafa",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              <p><strong>単元名：</strong>{plan.unit}</p>
              <p><strong>学年・ジャンル：</strong>{plan.grade}・{plan.genre}</p>
              <p><strong>スタイル：</strong>{plan.usedStyleName || "（未設定）"}</p>
              <p><strong>時間数：</strong>{plan.hours}時間</p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                <Link href={`/practice/add/${plan.id}`} passHref>
                  <button style={{
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                  }}>
                    ✍️ 実践記録を作成・編集
                  </button>
                </Link>

                <Link href={`/compare/${encodeURIComponent(plan.unit)}`} passHref>
                  <button style={{
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                  }}>
                    📊 この単元の比較を見る
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
