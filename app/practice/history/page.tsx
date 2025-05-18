// app/practice/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import html2pdf from "html2pdf.js";
import { db } from "../../firebaseConfig.js";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

type PracticeRecord = {
  id: string;
  lessonId: string;
  practiceDate?: string;
  reflection?: string;
  boardImages?: string[];
  lessonPlanList?: string[];
  unitGoal?: string;
  evaluationPoints?: {
    knowledge: string[];
    thinking: string[];
    attitude: string[];
  };
  languageActivities?: string;
  grade?: string;
  timestamp?: string;
};

type LessonPlan = {
  id: string;
  unit: string;
  grade?: string;
};

export default function PracticeHistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "practiceDate" | "lessonTitle">("timestamp");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("practiceRecords") || "[]") as PracticeRecord[];
    setPlans(JSON.parse(localStorage.getItem("lessonPlans") || "[]") as LessonPlan[]);

    (async () => {
      try {
        const q = query(collection(db, "practice_records"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const firestoreList = snap.docs.map(doc => doc.data() as PracticeRecord);
        // merge and dedupe by id
        const merged = [...local, ...firestoreList].filter((r, i, a) =>
          a.findIndex(x => x.id === r.id) === i
        );
        setRecords(merged);
      } catch (e) {
        console.error("Firestore読み込みエラー", e);
        setRecords(local);
      }
    })();
  }, []);

  const getPlan = (id: string) => plans.find(p => p.id === id);

  const sorted = [...records].sort((a, b) => {
    if (sortKey === "practiceDate") {
      const ad = a.practiceDate ? new Date(a.practiceDate).getTime() : 0;
      const bd = b.practiceDate ? new Date(b.practiceDate).getTime() : 0;
      return bd - ad;
    }
    if (sortKey === "lessonTitle") {
      const au = getPlan(a.lessonId)?.unit || "";
      const bu = getPlan(b.lessonId)?.unit || "";
      return au.localeCompare(bu);
    }
    return new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime();
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const c = new Set(prev);
      c.has(id) ? c.delete(id) : c.add(id);
      return c;
    });
  };

  const handleBulkDelete = () => {
    if (!confirm("選択した実践記録を本当に削除しますか？")) return;
    const rem = records.filter(r => !selectedIds.has(r.id));
    localStorage.setItem("practiceRecords", JSON.stringify(rem));
    setRecords(rem);
    setSelectedIds(new Set());
  };

  const exportPdf = (rec: PracticeRecord) => {
    const el = document.getElementById(`record-${rec.id}`);
    if (!el) return;
    html2pdf()
      .from(el)
      .set({
        margin: 10,
        filename: `実践記録_${rec.practiceDate || ""}_${rec.id}.pdf`,
      })
      .save();
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1024, margin: "0 auto" }}>
      <nav style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 24, justifyContent: "center" }}>
        {[
          ["/", "🏠 ホーム"],
          ["/plan", "📋 授業作成"],
          ["/plan/history", "📖 計画履歴"],
          ["/practice/history", "📷 実践履歴"],
          ["/models/create", "✏️ 教育観作成"],
          ["/models", "📚 教育観一覧"],
          ["/models/history", "🕒 教育観履歴"],
        ].map(([href, label]) => (
          <Link key={href} href={href} style={navLinkStyle}>{label}</Link>
        ))}
      </nav>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.8rem" }}>実践履歴一覧</h2>
        <label>
          並び替え：
          <select value={sortKey} onChange={e => setSortKey(e.target.value as any)} style={selectStyle}>
            <option value="timestamp">登録順</option>
            <option value="practiceDate">実施日順</option>
            <option value="lessonTitle">授業タイトル順</option>
          </select>
        </label>
        <button onClick={handleBulkDelete} style={deleteButtonStyle}>
          🗑 選択削除 ({selectedIds.size})
        </button>
      </div>

      {sorted.map((rec, idx) => {
        const plan = getPlan(rec.lessonId);
        return (
          <section
            key={`${rec.id}-${idx}`}       
            id={`record-${rec.id}`}
            style={cardStyle}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={selectedIds.has(rec.id)}
                onChange={() => toggleSelect(rec.id)}
                style={{ marginRight: 16, transform: "scale(1.2)" }}
              />
              <div style={{ flex: 1 }}>
                <strong>日時：</strong> {rec.practiceDate}<br/>
                <strong>単元名：</strong> {plan?.unit}<br/>
                <strong>学年：</strong> {plan?.grade}
              </div>
            </div>

            <div style={sectionBox}>
              <h3>■ 単元の目標</h3>
              <p>{rec.unitGoal}</p>
            </div>

            <div style={sectionBox}>
              <h3>■ 授業の展開</h3>
              {rec.lessonPlanList?.map((t, i) => (
                <p key={`${rec.id}-lesson-${i}`}>{`${i+1}時間目：${t}`}</p>
              ))}
            </div>

            <div style={sectionBox}>
              <h3>■ 評価観点</h3>
              <p>知識・技能：{rec.evaluationPoints?.knowledge.join(", ")}</p>
              <p>思考・判断・表現：{rec.evaluationPoints?.thinking.join(", ")}</p>
              <p>主体的態度：{rec.evaluationPoints?.attitude.join(", ")}</p>
            </div>

            <div style={sectionBox}>
              <h3>■ 言語活動の工夫</h3>
              <p>{rec.languageActivities}</p>
            </div>

            <div style={sectionBox}>
              <h3>■ 振り返り</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{rec.reflection}</p>
            </div>

            {rec.boardImages?.length ? (
              <div style={sectionBox}>
                <h3>■ 板書写真</h3>
                <div style={imgGridStyle}>
                  {rec.boardImages.map((url, i) => (
                    <img 
                      key={`${rec.id}-img-${i}`} 
                      src={url} 
                      alt="板書写真" 
                      style={thumbStyle} 
                      onClick={() => window.open(url, "_blank")} 
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={() => router.push(`/practice/add/${rec.lessonId}`)} style={actionButtonStyle}>
                ✍️ 編集
              </button>
              <button onClick={() => exportPdf(rec)} style={pdfButtonStyle}>
                📄 PDF出力
              </button>
            </div>
          </section>
        );
      })}
    </main>
  );
}

// --- Styles ---
const navLinkStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "#1976d2",
  color: "white",
  borderRadius: 6,
  textDecoration: "none",
  fontSize: "1rem",
  cursor: "pointer",
};
const selectStyle: React.CSSProperties = { marginLeft: 8, padding: 6, fontSize: "1rem" };
const deleteButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  cursor: "pointer",
};
const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  background: "#fff",
  marginBottom: 24,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};
const sectionBox: React.CSSProperties = { marginBottom: 16 };
const imgGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
  gap: 8,
};
const thumbStyle: React.CSSProperties = { width: "100%", borderRadius: 4, cursor: "pointer" };
const actionButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
const pdfButtonStyle: React.CSSProperties = { ...actionButtonStyle, backgroundColor: "#2196F3" };
