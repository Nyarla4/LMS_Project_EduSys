// app/check/teachers/page.tsx
"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useUser } from "@/app/userContext";

interface Teacher {
  tid: number;
  user: {
    username: string;
    loginId: string;
  };
  approved: boolean;
  approveString: string;
}

export default function checkTeacher() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [unapprovedTeachers, setUnapprovedTeachers] = useState<Teacher[]>([]);
  
  useEffect(() => {
    const fetchTeachersData = async () => {
      const uid = localStorage.getItem("loginId");

      // 1. 로그인 정보가 없으면 로딩 종료 후 null 상태 유지 (흐름 제어)
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        // 2. 데이터 페칭 시작
        const teacherRes = await fetch(`http://localhost:8080/api/teachers/unApproved`, {
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!teacherRes.ok) throw new Error("인증 실패");

        const detailedData = await teacherRes.json();
        
        setUnapprovedTeachers(detailedData);
      } catch (err) {

        setUnapprovedTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersData();
  }, []);

  const handleApprove = async (tid: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/teachers/approve/${tid}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error("승인 실패");

      const updatedTeacher = await res.json();
      setUnapprovedTeachers(prev => prev.filter(t => t.tid !== tid));
    } catch (err) {
      console.error("승인 실패:", err);
    }
  };

  if (!user) return <div>사용자 정보를 불러오는 중...</div>;
  if (user.usertype !== "A") return <div>관리자 권한이 필요한 페이지입니다.</div>; // 권한 체크

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

        <div className="flex flex-col gap-2 mb-6">
          <p className="text-4xl font-bold text-center bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
            교사 승인 관리
          </p>
          <p className="text-right text-sm font-bold text-[#b89b7a] px-6">
            관리자: {user.user?.username || user.username}
          </p>
        </div>

        {loading ? (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-20 text-center shadow-sm">
            <p className="text-xl font-bold animate-pulse text-[#b89b7a]">확인 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex px-8 py-2 font-bold text-[#8b5e3c] border-b-2 border-[#b89b7a]">
              <span className="flex-1">교사 성함 (ID)</span>
              <span className="w-40 text-center">현재 상태</span>
              <span className="w-24 text-center">관리</span>
            </div>

            <ul className="flex flex-col gap-3">
              {unapprovedTeachers.length > 0 ? (
                unapprovedTeachers.map((teacher) => (
                  <li
                    key={teacher.tid}
                    className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg px-8 py-5 shadow-sm flex justify-between items-center transition-all hover:bg-[#f5eee4]"
                  >
                    <div className="flex-1 flex flex-col">
                      <span className="text-xl font-bold text-[#5c4033]">
                        {teacher.user?.username || teacher.user?.loginId}
                      </span>
                      <span className="text-sm text-[#b89b7a]">Teacher ID: {teacher.tid}</span>
                    </div>

                    <div className="w-40 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${teacher.approved
                          ? "bg-[#8b5e3c] text-white border-[#8b5e3c]"
                          : "bg-[#dbc7b1] text-[#5c4033] border-[#b89b7a]"
                        }`}>
                        {teacher.approveString || (teacher.approved ? "승인 완료" : "승인 대기")}
                      </span>
                    </div>

                    <div className="w-24 flex justify-end">
                      {!teacher.approved && (
                        <button
                          onClick={() => handleApprove(teacher.tid)}
                          className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-4 py-1.5 rounded font-bold text-sm shadow-md transition-all active:scale-95"
                        >
                          승인
                        </button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-16 text-center">
                  <p className="font-bold text-[#b89b7a]">승인 대기 중인 교사가 없습니다.</p>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}