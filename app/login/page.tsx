// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  // すでにログイン済みならダッシュボードへ
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // 読み込み中 or リダイレクト中は何も描画しない
  if (loading || user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || pw.length < 6) {
      setError("有効なメールアドレスと6文字以上のパスワードを入力してください。");
      return;
    }
    try {
      await login(email.trim(), pw);
      router.replace("/"); // ログイン成功後、ダッシュボードへ
    } catch (e: any) {
      console.error(e);
      setError("ログインに失敗しました。メールアドレスかパスワードを確認してください。");
    }
  };

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f2f2f5",
        padding: "2rem",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", textAlign: "center", margin: 0 }}>
          ログイン
        </h1>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.4rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.4rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.4rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ログイン
        </button>

        {error && (
          <p style={{ color: "red", textAlign: "center", fontSize: "1.2rem" }}>
            {error}
          </p>
        )}

        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            textAlign: "center",
            margin: 0,
          }}
        >
          招待コードで登録されていない方は{" "}
          <Link
            href="/register"
            style={{
              color: "#1976d2",
              textDecoration: "underline",
              fontSize: "1rem",
            }}
          >
            こちら
          </Link>
        </p>
      </form>
    </main>
  );
}
