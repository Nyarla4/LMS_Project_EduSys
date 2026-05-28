"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/app/userContext";

interface Subject {
  subid: number;
  major: string;
  name: string;
  capacity: number;
  planFile: string;
}

export default function checkSubject() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [waitSubjects, setWaitSubjects] = useState<Subject[]>([]);

  const fetchSubjectsData = async () => {
    const uid = localStorage.getItem("loginId");

    // 1. 로그인 정보가 없으면 로딩 종료 후 null 상태 유지 (흐름 제어)
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      // 2. 데이터 페칭 시작
      const subjectDatas = await fetch(`http://localhost:8080/api/subjects/wait`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!subjectDatas.ok) throw new Error("인증 실패");

      const detailedData = await subjectDatas.json();

      setWaitSubjects(detailedData);
    } catch (err) {
      setWaitSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsData();
  }, []);

  const handleApprove = async (subid: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/subjects/${subid}/status?status=OKAY`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("승인 실패");

      fetchSubjectsData();
    } catch (err) {
      console.error("승인 실패:", err);
    }
  };

  const handleDisapprove = async (subid: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/subjects/${subid}/status?status=CANCEL`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("반려 실패");

      fetchSubjectsData();
    } catch (err) {
      console.error("반려 실패:", err);
    }
  };

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;
  if (user.usertype !== "A") return <div>관리자 권한이 필요한 페이지입니다.</div>; // 권한 체크

  return (
    /* 1. 전체 영역 */
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      
      <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">
        
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
            과목 승인 관리
          </p>
          <p className="text-right text-sm font-bold text-[#b89b7a] px-6">
            관리자: {user.user?.username || user.username}
          </p>
        </div>

        {loading ? (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-20 shadow-sm font-bold text-center">
            <p className="text-xl animate-pulse text-[#b89b7a]">확인 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex px-8 py-2 font-bold text-[#8b5e3c] border-b-2 border-[#b89b7a]">
              <span className="flex-1">과목 이름</span>
              <span className="w-32 text-center">관리</span>
            </div>

            <ul className="flex flex-col gap-3">
              {waitSubjects.length > 0 ? (
                waitSubjects.map((subject) => (
                  <li
                    key={subject.subid}
                    className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-3 shadow-sm font-bold flex justify-between items-center transition-all hover:bg-[#f5eee4]"
                  >
                    <div className="flex-1 flex flex-col px-5">
                      <span className="text-xl text-[#5c4033]">
                        {subject.name}
                      </span>
                    </div>

                    <div className="w-48 flex justify-end gap-2 pr-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(subject.subid)}
                        className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-sm transition-all active:scale-95"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisapprove(subject.subid)}
                        className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-sm transition-all active:scale-95"
                      >
                        반려
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                /* 3. 내부 영역 박스 (빈 상태) */
                <li className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-16 shadow-sm font-bold text-center">
                  <p className="text-[#b89b7a]">승인 대기 중인 과목이 없습니다.</p>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}