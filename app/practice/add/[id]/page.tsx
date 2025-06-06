"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type BoardImage = { name: string; src: string }; // srcはFirebase StorageのURL
type PracticeRecord = {
  lessonId: string;
  practiceDate: string;
  reflection: string;
  boardImages: BoardImage[];
  lessonTitle: string;
};
type LessonPlan = {
  id: string;
  result?: string | object;
};

// オブジェクトや配列を文字列化するヘルパー
function safeRender(value: any): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default function PracticeAddPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [practiceDate, setPracticeDate] = useState("");
  const [reflection, setReflection] = useState("");
  const [boardImages, setBoardImages] = useState<BoardImage[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [uploading, setUploading] = useState(false);

  const storage = getStorage();

  useEffect(() => {
    // 授業案取得
    const plansJson = localStorage.getItem("lessonPlans") || "[]";
    let plans: LessonPlan[];
    try {
      plans = JSON.parse(plansJson) as LessonPlan[];
    } catch {
      plans = [];
    }
    const plan = plans.find((p) => p.id === id) || null;
    setLessonPlan(plan);

    if (plan && plan.result) {
      if (typeof plan.result === "string") {
        const firstLine = plan.result.split("\n")[0].replace(/^【単元名】\s*/, "");
        setLessonTitle(firstLine);
      } else if (typeof plan.result === "object") {
        const unitName = (plan.result as any)["単元名"];
        setLessonTitle(typeof unitName === "string" ? unitName : "");
      } else {
        setLessonTitle("");
      }
    } else {
      setLessonTitle("");
    }

    // 実践記録取得
    const recsJson = localStorage.getItem("practiceRecords") || "[]";
    let recs: PracticeRecord[];
    try {
      recs = JSON.parse(recsJson) as PracticeRecord[];
    } catch {
      recs = [];
    }
    const existing = recs.find((r) => r.lessonId === id) || null;
    if (existing) {
      setPracticeDate(existing.practiceDate);
      setReflection(existing.reflection);
      setBoardImages(existing.boardImages);
      setRecord({ ...existing, lessonTitle: existing.lessonTitle || "" });
    }
  }, [id]);

  // 画像アップロード Firebase Storageに保存してURL取得
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadedImages: BoardImage[] = [];

    try {
      for (const file of files) {
        const storageRef = ref(storage, `practiceImages/${id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedImages.push({ name: file.name, src: url });
      }
      setBoardImages((prev) => [...prev, ...uploadedImages]);
    } catch (error) {
      alert("画像のアップロードに失敗しました。");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (i: number) =>
    setBoardImages((prev) => prev.filter((_, idx) => idx !== i));

  const handlePreview = (e: FormEvent) => {
    e.preventDefault();
    setRecord({
      lessonId: id,
      practiceDate,
      reflection,
      boardImages,
      lessonTitle,
    });
  };

  const handlePdfDownload = async () => {
    if (!record || !lessonPlan) {
      alert("プレビューを作成してください");
      return;
    }
    const { default: html2pdf } = await import("html2pdf.js");
    const el = document.getElementById("practice-preview");
    if (!el) return;
    await html2pdf()
      .from(el)
      .set({
        margin: 10,
        filename: `${lessonTitle}_実践記録.pdf`,
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        html2canvas: { scale: 2 },
        pagebreak: { mode: ["avoid-all"] },
      })
      .save();
  };

  // 一括保存：localStorage保存＋Firestore保存＋Driveアップロード
  const handleSaveAll = async () => {
    if (!record || !lessonPlan) {
      alert("プレビューを作成してください");
      return;
    }

    // localStorage保存（画像はURLなので容量問題なし）
    const recsJson = localStorage.getItem("practiceRecords") || "[]";
    let recs: PracticeRecord[];
    try {
      recs = JSON.parse(recsJson) as PracticeRecord[];
    } catch {
      recs = [];
    }
    const idx = recs.findIndex((r) => r.lessonId === id);
    if (idx >= 0) recs[idx] = record;
    else recs.push(record);

    try {
      localStorage.setItem("practiceRecords", JSON.stringify(recs));
    } catch (e) {
      alert("localStorageへの保存に失敗しました。容量オーバーかもしれません。");
      console.error(e);
      return;
    }

    // Firestoreに保存
    try {
      await setDoc(doc(db, "practice_records", id), record);
    } catch (e) {
      alert("Firestoreへの保存に失敗しました。");
      console.error(e);
      return;
    }

    // PDF生成
    const { default: html2pdf } = await import("html2pdf.js");
    const el = document.getElementById("practice-preview");
    if (!el) {
      alert("プレビューエリアが見つかりません。");
      return;
    }
    let pdfBlob: Blob;
    try {
      pdfBlob = await html2pdf()
        .from(el)
        .set({
          margin: 10,
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          html2canvas: { scale: 2 },
          pagebreak: { mode: ["avoid-all"] },
        })
        .outputPdf("blob");
    } catch (e) {
      alert("PDF生成に失敗しました。");
      console.error(e);
      return;
    }

    // Driveアップロード
    try {
      const { uploadToDrive } = await import("../../../../lib/drive");
      const folderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) {
        alert("DriveフォルダIDが未設定です");
        return;
      }
      await uploadToDrive(pdfBlob, `${lessonTitle}_実践記録.pdf`, "application/pdf", folderId);
    } catch (e) {
      alert("Driveへのアップロードに失敗しました。");
      console.error(e);
      return;
    }

    alert("保存＋PDF生成＋Drive保存が完了しました！");
    router.push("/practice/history");
  };

  const navBtn: React.CSSProperties = {
    padding: "8px 12px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    whiteSpace: "nowrap",
    marginRight: 8,
  };
  const sectionStyle: React.CSSProperties = {
    border: "2px solid #1976d2",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  };
  const imgBox: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #ccc",
    padding: 8,
    borderRadius: 6,
  };
  const rmBtn: React.CSSProperties = {
    marginTop: 4,
    padding: 4,
    backgroundColor: "#e53935",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  };
  const actionBtn: React.CSSProperties = {
    padding: 12,
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    width: "100%",
    cursor: "pointer",
    marginBottom: 8,
  };
  const pdfBtn: React.CSSProperties = { ...actionBtn, backgroundColor: "#607D8B" };

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "auto", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", overflowX: "auto", marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={navBtn}>
          🏠 ホーム
        </button>
        <button onClick={() => router.push("/plan")} style={navBtn}>
          📋 授業作成
        </button>
        <button onClick={() => router.push("/plan/history")} style={navBtn}>
          📖 計画履歴
        </button>
        <button onClick={() => router.push("/practice/history")} style={navBtn}>
          📷 実践履歴
        </button>
        <button onClick={() => router.push("/models/create")} style={navBtn}>
          ✏️ 教育観作成
        </button>
        <button onClick={() => router.push("/models")} style={navBtn}>
          📚 教育観一覧
        </button>
        <button onClick={() => router.push("/models")} style={navBtn}>
          🕒 教育観履歴
        </button>
      </nav>

      <h2>実践記録作成・編集</h2>

      <form onSubmit={handlePreview}>
        <div style={sectionStyle}>
          <label>
            実施日：
            <br />
            <input
              type="date"
              value={practiceDate}
              required
              onChange={(e) => setPracticeDate(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={sectionStyle}>
          <label>
            振り返り：
            <br />
            <textarea
              value={record?.reflection ?? reflection}
              required
              onChange={(e) => setReflection(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <label style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
          <span style={{ ...navBtn, width: "100%", textAlign: "center" }}>📷 板書写真をアップロード</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {boardImages.map((img, i) => (
            <div key={img.name + i} style={imgBox}>
              <img
                src={img.src}
                alt={img.name}
                style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 4 }}
              />
              <button onClick={() => handleRemoveImage(i)} style={rmBtn}>
                🗑
              </button>
            </div>
          ))}
        </div>

        <button type="submit" style={{ ...actionBtn, marginBottom: 16 }} disabled={uploading}>
          {uploading ? "アップロード中..." : "プレビューを作成"}
        </button>
      </form>

      {record && (
        <>
          <section
            id="practice-preview"
            style={{
              marginBottom: 16,
              padding: 24,
              border: "1px solid #ccc",
              borderRadius: 6,
              backgroundColor: "#fff",
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: "'Hiragino Kaku Gothic ProN', sans-serif",
            }}
          >
            <h2>
              {lessonPlan?.result && typeof lessonPlan.result === "object"
                ? safeRender((lessonPlan.result as any)["単元名"])
                : lessonTitle}
            </h2>

            {lessonPlan?.result && typeof lessonPlan.result === "object" && (
              <>
                <section style={{ marginBottom: 16 }}>
                  <h3>授業の概要</h3>
                  <p>
                    <strong>教科書名：</strong>
                    {safeRender((lessonPlan.result as any)["教科書名"])}
                  </p>
                  <p>
                    <strong>学年：</strong>
                    {safeRender((lessonPlan.result as any)["学年"])}
                  </p>
                  <p>
                    <strong>ジャンル：</strong>
                    {safeRender((lessonPlan.result as any)["ジャンル"])}
                  </p>
                  <p>
                    <strong>授業時間数：</strong>
                    {safeRender((lessonPlan.result as any)["授業時間数"])}時間
                  </p>
                  <p>
                    <strong>育てたい子どもの姿：</strong>
                    {safeRender((lessonPlan.result as any)["育てたい子どもの姿"])}
                  </p>
                </section>

                <section style={{ marginBottom: 16 }}>
                  <h3>単元の目標</h3>
                  <p>{safeRender((lessonPlan.result as any)["単元の目標"])}</p>
                </section>

                {(lessonPlan.result as any)["評価の観点"] && (
                  <section style={{ marginBottom: 16 }}>
                    <h3>評価の観点</h3>
                    {Object.entries((lessonPlan.result as any)["評価の観点"]).map(([k, v]) => (
                      <div key={k}>
                        <strong>{k}</strong>
                        <ul>
                          {(Array.isArray(v) ? v : []).map((item, i) => (
                            <li key={i}>{safeRender(item)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                )}

                {(lessonPlan.result as any)["言語活動の工夫"] && (
                  <section style={{ marginBottom: 16 }}>
                    <h3>言語活動の工夫</h3>
                    <p>{safeRender((lessonPlan.result as any)["言語活動の工夫"])}</p>
                  </section>
                )}

                {(lessonPlan.result as any)["授業の流れ"] && (
                  <section style={{ marginBottom: 16 }}>
                    <h3>授業の流れ</h3>
                    <ul>
                      {Object.entries((lessonPlan.result as any)["授業の流れ"]).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}：</strong>
                          {typeof value === "string" ? value : safeRender(value)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            <section style={{ marginTop: 24 }}>
              <h3>実施記録</h3>
              <p>
                <strong>実施日：</strong> {record.practiceDate}
              </p>
              <p>
                <strong>振り返り：</strong>
              </p>
              <p>{record.reflection}</p>
              {record.boardImages.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong>板書写真：</strong>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {record.boardImages.map((img, i) => (
                      <img
                        key={img.name + i}
                        src={img.src}
                        alt={img.name}
                        style={{
                          width: 160,
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleSaveAll} style={actionBtn}>
              💾 一括保存（ローカル・Firestore・Drive）
            </button>
            <button onClick={handlePdfDownload} style={pdfBtn}>
              📄 PDFをダウンロード
            </button>
          </div>
        </>
      )}
    </main>
  );
}
