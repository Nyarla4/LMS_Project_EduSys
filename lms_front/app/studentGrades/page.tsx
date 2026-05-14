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
  <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-['Noto_Sans_KR']">
    <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">      
      <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 text-[#5c4033]">
        성적 관리
      </p>
      {loading ? (
        <div className="text-center text-[#8b5e3c] font-bold py-10">데이터를 불러오는 중...</div>
      ) : !subject ? (
        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-12 shadow-sm text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-[#5c4033] mb-4">담당 과목이 없습니다</h2>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded text-lg font-bold transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      ) : (
        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-8 shadow-sm">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#333] mb-2">{subject.name}</h2>
            <div className="w-full h-[1px] bg-[#333] mx-auto"></div>
          </div>

          <div className="flex flex-col gap-4">
            {scores.map((score: any) => (
              <div
                key={score.gid}
                className="bg-white border-[#d6c2a8] border-1 rounded-xl p-4 flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#8b5e3c] text-xl">👤</span>
                  <span className="text-xl font-bold text-[#5c4033]">{score.studentName}</span>
                </div>

                <div className="flex items-center gap-6">
                  {editingId === score.gid ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 border-[#b89b7a] border-1 rounded px-3 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSave(score.gid)}
                        className="px-4 py-1 rounded text-sm border-[#b89b7a] border-1 font-bold bg-[#8b5e3c] text-white hover:bg-[#6f4a2f]"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1 rounded text-sm border-[#ff4d4d] border-1 font-bold bg-[#ff4d4d] text-white hover:bg-[#cc0000]"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-8">
                      <span className={`text-2xl font-bold ${score.score ? "text-[#333]" : "text-[#b89b7a]"}`}>
                        {score.score ?? "미입력"}
                      </span>
                      <button
                        onClick={() => handleEdit(score)}
                        className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-5 py-1.5 rounded text-base font-bold transition-colors"
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
}