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
    <main style={{ padding: "2rem" }}>
      <h1>성적 관리</h1>
      {loading ? (
        <p>데이터를 불러오는 중...</p>
      ) : (
        <div>
          <h2>{subject ? `${subject.name} 과목 성적부` : "과목 정보 로드 중..."}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {scores.map((score: any) => (
              <li key={score.gid} style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: "15px"
              }}>
                <span style={{ width: "100px", fontWeight: "bold" }}>{score.studentName}</span>

                {editingId === score.gid ? (
                  // 수정 모드
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="점수 입력"
                      style={{ width: "80px", padding: "4px" }}
                    />
                    <button onClick={() => handleSave(score.gid)}>저장</button>
                    <button onClick={() => setEditingId(null)}>취소</button>
                  </div>
                ) : (
                  // 보기 모드
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ minWidth: "50px" }}>{score.score ?? "미입력"}</span>
                    <button onClick={() => handleEdit(score)}>성적 수정</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}