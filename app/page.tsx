"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>🌟 国語授業プランナー トップページ</h1>
      <p style={{ fontSize: "1.2rem", textAlign: "center" }}>ようこそ！以下のメニューから機能を選んでください。</p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
        <Link href="/plan" style={{ display: "inline-block", background: "#2196F3", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>📋 授業案を作成する</Link>

        <Link href="/plan/history" style={{ display: "inline-block", background: "#3F51B5", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>📖 保存された授業案を見る</Link>

        <Link href="/practice/history" style={{ display: "inline-block", background: "#009688", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>📷 授業実践の記録を見る</Link>

        <Link href="/models/create" style={{ display: "inline-block", background: "#4CAF50", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>📝 新しい教育観スタイルを登録する</Link>

        <Link href="/models" style={{ display: "inline-block", background: "#8BC34A", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>🌱 教育観スタイルを一覧で見る</Link>

        {/* 追加部分 */}
        <Link href="/models/history" style={{ display: "inline-block", background: "#FF9800", color: "white", padding: "1rem 2rem", borderRadius: "12px", fontSize: "1.2rem", textAlign: "center", textDecoration: "none", minWidth: "250px" }}>🕒 教育観履歴を見る</Link>
      </div>

      <p style={{ marginTop: "3rem", fontSize: "1rem", color: "#666", textAlign: "center" }}>
        ※ 各機能はブラウザに保存されたデータ（localStorage）を使用します。
      </p>
    </main>
  );
}
