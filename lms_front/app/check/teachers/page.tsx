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
    <main style={{ padding: "2rem" }}>
      <h1>교사 인증 (관리자: {user.user?.username || user.username})</h1>
      {loading ? (
        <p>확인 목록을 불러오는 중...</p>
      ) : (
        <ul>
          {unapprovedTeachers.map((teacher) => (
            <li key={teacher.tid}>
              {teacher.user?.username || teacher.user?.loginId} - 
              {!teacher.approved && <button className="btn" onClick={() => handleApprove(teacher.tid)}>승인</button>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}