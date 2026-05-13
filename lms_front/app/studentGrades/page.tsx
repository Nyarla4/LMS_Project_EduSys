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
        else {
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
    <main style={{
      padding: "2rem",
      maxWidth: "900px",
      margin: "0 auto",
      backgroundColor: "#f2ede3", // 이미지의 전체 배경색
      minHeight: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
      borderRadius: "12px",
      border: "1px solid #d6c2a8"
    }}>
      {loading ? (
        <p style={{ textAlign: "center", color: "#8b5e3c" }}>데이터를 불러오는 중...</p>
      ) : !subject ? (
        <div style={{
          textAlign: "center", padding: "4rem", border: "1px solid #d1c1a8",
          borderRadius: "16px", backgroundColor: "#fdfbf7", color: "#8b5e3c"
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📚</div>
          <h2 style={{ color: "#8b5e3c", marginBottom: "0.5rem" }}>담당 과목이 없습니다</h2>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              marginTop: "1.5rem", padding: "0.6rem 1.5rem", borderRadius: "10px",
              cursor: "pointer", backgroundColor: "#8b5e3c", color: "#fff", border: "none",
              fontWeight: "bold"
            }}>
            대시보드로 돌아가기
          </button>
        </div>
      ) : (
        /* 메인 카드 영역: 이미지의 큰 컨테이너 스타일 */
        <div style={{
          backgroundColor: "#fdfbf7",
          border: "1px solid #d1c1a8",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
        }}>
          <h1 style={{
            backgroundColor: "#e7d7c1",
            border: "1px solid #d1c1a8",
            borderRadius: "50px",
            padding: "0.8rem 2rem",
            width: "100%",
            margin: "0 auto 2.5rem",
            textAlign: "center", fontSize: "1.8rem", color: "#4a3a2e", fontWeight: "bold"
          }}>성적 관리</h1>
          {/* 과목명 헤더: 이미지의 카드 내부 과목명 스타일 */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.6rem", color: "#333", marginBottom: "0.5rem" }}>{subject.name}</h2>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#333", margin: "0 auto" }}></div>
          </div>

          {/* 성적 리스트 */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {scores.map((score: any) => (
              <li key={score.gid} style={{
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid #e7d7c1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "12px",
                marginBottom: "0.8rem",
                border: "1px solid #eee"
              }}>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#8b5e3c", fontSize: "1.1rem" }}>👤</span>
                  <span style={{ fontWeight: "600", color: "#4a3a2e", fontSize: "1.05rem" }}>{score.studentName}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  {editingId === score.gid ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          width: "80px", padding: "8px", borderRadius: "8px",
                          border: "1px solid #8b5e3c", textAlign: "center", outline: "none"
                        }}
                        autoFocus
                      />
                      <button onClick={() => handleSave(score.gid)}
                        style={{
                          padding: "8px 16px", backgroundColor: "#8b5e3c", color: "#fff",
                          border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                        }}>
                        저장
                      </button>
                      <button onClick={() => setEditingId(null)}
                        style={{
                          padding: "8px 16px", backgroundColor: "#ff4d4d", color: "#fff",
                          border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                        }}>
                        취소
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                      <span style={{
                        minWidth: "60px", textAlign: "right", fontWeight: "bold", fontSize: "1.2rem",
                        color: score.score ? "#333" : "#c4a484"
                      }}>
                        {score.score ?? "미입력"}
                      </span>
                      <button onClick={() => handleEdit(score)}
                        style={{
                          padding: "8px 20px",
                          backgroundColor: "#8b5e3c", // 이미지의 '신청하기' 버튼색
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
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