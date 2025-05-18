// app/welcome/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 認証済みなら直接ダッシュボードへ
  if (!loading && user) {
    router.replace("/");
    return null;
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",    // ビューポート全体をカバー
        padding: 16,
        boxSizing: "border-box",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>ようこそ！</h1>

      <div
        style={{
          display: "flex",
          gap: 24,             // ボタン間隔を少し詰めつつタッチ領域を確保
          marginBottom: 32,    // 見出しとの間隔も広めに
        }}
      >
        {/* ログインボタン */}
        <Link
          href="/login"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 140,        // 少し大きめにしてタップしやすく
            height: 140,
            borderRadius: 16,
            backgroundColor: "#f0f0f0",
            textDecoration: "none",
            color: "black",
            fontSize: 18,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>🔑</div>
          <div>ログイン</div>
        </Link>

        {/* 招待登録ボタン */}
        <Link
          href="/register"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 16,
            backgroundColor: "#f0f0f0",
            textDecoration: "none",
            color: "black",
            fontSize: 18,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>✉️</div>
          <div>招待で登録</div>
        </Link>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#666",
          textAlign: "center",
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        ※ 事前に配布された招待コードをご利用ください。
      </p>
    </main>
  );
}
