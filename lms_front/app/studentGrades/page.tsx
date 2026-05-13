// 성적 조회 페이지(교사)
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

interface Subject {
  subid: number;
  major: string;
  name: string;
  rate: number;
}

interface Score {
  gid: number;
  studentName: string;
  subjectName: string;
  score: number | null;
}

export default function ClassRequest() {
  const { user, loading: userLoading } = useUser(); 
  const [subject, setSubject] = useState<Subject | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    // 1. 유저 로딩 확인
    if (userLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        // 2. 먼저 tid로 과목(Subject) 조회
        const subRes = await fetch(`http://localhost:8080/api/subjects/teacher/${user.tid}`, { headers });

        // 과목이 없는 경우 처리 (404 등)
        if (!subRes.ok) {
          setScores([]);
          setLoading(false);
          return;
        }

        const subject = await subRes.json();

        console.log("Fetched subject for teacher:", subject);
        console.log("Subject ID:", subject.length);
        // 3. 과목이 존재하면 해당 subid로 성적(Grade) 조회
        if (subject.length > 0) {
          setSubject(subject[0]);
          const gradeRes = await fetch(`http://localhost:8080/api/grades/subject/${subject[0].subid}`, { headers });
          const gradeData = await gradeRes.json();
          setScores(gradeData);
        }
        else{
          setSubject(null);
          setScores([]);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading]);

  const handleEdit = (score: any) => {
    setEditingId(score.gid);
    setEditValue(score.score || "");
  };

  const handleSave = async (gid: number) => {
    const token = localStorage.getItem("token");

    try {
      // 컨트롤러 설정(@PostMapping, @RequestBody String)에 맞춘 요청
      const res = await fetch(`http://localhost:8080/api/grades/${gid}`, {
        method: "POST", // @PostMapping 대응
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain" // String 데이터를 직접 보내므로 text/plain 설정
        },
        body: editValue // JSON.stringify 없이 문자열 그대로 전송
      });

      if (res.ok) {
        // 로컬 상태 업데이트
        setScores(scores.map((s: any) =>
          s.gid === gid ? { ...s, score: editValue } : s
        ));
        setEditingId(null);
        alert("성적이 수정되었습니다.");
      } else {
        alert("성적 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("성적 통신 에러:", err);
    }
  };

  // 유저 정보 자체가 로딩 중일 때의 처리
  if (userLoading) return <p>사용자 확인 중...</p>;
  if (!user) return <p>로그인이 필요한 서비스입니다.</p>;

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "1.8rem", color: "#1e293b" }}>성적 관리</h1>

      {loading ? (
        <p>데이터를 불러오는 중...</p>
      ) : !subject ? (
        /* 과목 없음 스타일 (기존 유지) */
        <div style={{
          textAlign: "center", padding: "4rem", border: "1px dashed #cbd5e1",
          borderRadius: "16px", backgroundColor: "#f8fafc", color: "#64748b"
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📚</div>
          <h2 style={{ color: "#334155", marginBottom: "0.5rem" }}>담당 과목이 없습니다</h2>
          <p>현재 배정된 강의 정보를 찾을 수 없습니다.</p>
          <button onClick={() => window.location.href = "/"}
            style={{ marginTop: "1.5rem", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer" }}>
            대시보드로 돌아가기
          </button>
        </div>
      ) : (
        /* 과목 있음: 카드 형태의 구조 (Structure 추천) */
        <div style={{
          backgroundColor: "#fff", border: "1px solid #e2e8f0",
          borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden"
        }}>
          {/* 카드 헤더 */}
          <div style={{ padding: "1.5rem", borderBottom: "2px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>📖</span> {subject.name} 성적
            </h2>
          </div>

          {/* 성적 리스트 */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {scores.map((score: any) => (
              <li key={score.gid} style={{
                padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "background 0.2s"
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fdfdfd"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>

                {/* 학생 이름 영역 */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: "600", color: "#334155" }}>{score.studentName}</span>
                </div>

                {/* 성적 입력/수정 영역 */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {editingId === score.gid ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ width: "70px", padding: "6px", borderRadius: "6px", border: "1px solid #3b82f6", outline: "none" }}
                        autoFocus
                      />
                      <button onClick={() => handleSave(score.gid)}
                        style={{ padding: "6px 12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                        저장
                      </button>
                      <button onClick={() => setEditingId(null)}
                        style={{ padding: "6px 12px", backgroundColor: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                        취소
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <span style={{
                        minWidth: "60px", textAlign: "right", fontWeight: "700",
                        color: score.score ? "#2563eb" : "#94a3b8"
                      }}>
                        {score.score ?? "미입력"}
                      </span>
                      <button onClick={() => handleEdit(score)}
                        style={{ padding: "6px 12px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                        수정
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}