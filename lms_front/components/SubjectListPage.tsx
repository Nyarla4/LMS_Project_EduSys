"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // useRouter import 추가
import Link from "next/link";
import { useUser } from "../app/userContext"; // 경로 수정: components에서 app은 한 단계 위입니다.

interface Course {
  cid: number;
  student: { sid: number; user: { username: string } };
  subject: Subject; // Course 엔티티에 Subject가 포함되어 있다고 가정
}

interface Subject {
  subid: number;
  name: string;
  major: string;
  capacity: number;
  planFile?: string;
  startDate: string;
  endDate: string;
}

export default function SubjectListPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading, logout } = useUser();
  const router = useRouter(); // useRouter 훅 사용

  useEffect(() => {
    // 유저 정보를 불러오는 중이라면 대기합니다.
    if (userLoading) return;
    
    // 유저 로딩은 끝났는데 유저 정보가 없다면 로딩 상태를 해제합니다.
    // 또는 로그인 페이지로 리다이렉트
    if (!user) {
      setLoading(false);
      alert("로그인이 필요합니다.");
      router.push("/login"); // 로그인 페이지로 리다이렉트
      return;
    }

    const fetchSubjects = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
          logout(); // 로그아웃 처리
          router.push("/login");
          return;
        }

        // 데이터 구조 파악 (Student/Teacher 상세 객체 내의 user 또는 관리자 객체 자체)
        const profile = user?.user || user;
        const userRole = profile?.usertype;

        let url = "";
        if (userRole === "S") {
          const studentId = user.sid || user.user?.sid;
          url = `http://localhost:8080/api/courses/student/${studentId}`;
        } else if (userRole === "T") {
          const teacherId = user.tid || user.user?.tid;
          url = `http://localhost:8080/api/subjects/teacher/${teacherId}`;
        } else {
          // 관리자 등은 전체 목록 조회 또는 리다이렉트
          url = `http://localhost:8080/api/subjects`;
        }

        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          // 학생은 Course[] 형태이므로 subject만 추출, 교사는 Subject[] 형태 그대로 사용
          const resultSubjects = userRole === "S" 
            ? data.map((c: Course) => c.subject) 
            : data;
          setSubjects(resultSubjects);
        }
      } catch (error) {
        console.error("과목 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user, userLoading, router, logout]); // user, userLoading, router, logout 의존성 추가

  if (userLoading || (loading && subjects.length === 0)) {
    return <div className="p-10 text-center text-[#5c4033]">과목 정보를 불러오는 중입니다...</div>;
  }

  const profile = user?.user || user;
  const userRole = profile?.usertype;
  const basePath = userRole === 'T' ? '/myClasses' : '/student';

  // 교사인데 승인이 안 된 경우 처리 (기존 myClasses/page.tsx 로직 통합)
  if (userRole === "T" && !user?.approved) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-10 font-sans">
        <div className="bg-white border-2 border-[#d6c2a8] rounded-3xl p-10 shadow-xl text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[#3d2b1f] mb-4">교사 승인 대기 중</h2>
          <p className="text-[#7b6346] leading-relaxed">
            관리자의 승인이 완료된 후에 담당 과목 관리 및 강의 등록이 가능합니다. 잠시만 기다려 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
          {userRole === 'T' ? '담당 과목 관리' : '수강 중인 과목 목록'}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"> {/* 3열은 대시보드 구조상 너무 좁을 수 있어 2열로 조정 */}
          {subjects.map((subject) => (
            <Link key={subject.subid} href={`${basePath}/${subject.subid}`} style = {{ textDecoration: 'none', color: 'inherit' }}>
              <div className="bg-[#fcf7f0] border-[#b89b7a] border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between hover:border-[#8b5e3c] hover:-translate-y-1">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#dbc7b1] text-[#5c4033] px-3 py-1 rounded-full text-xs font-bold border border-[#b89b7a]">
                      {subject.major === 'science' ? '이과' : '문과'}
                    </span>
                    <span className="text-xs text-[#7b6346]">정원: {subject.capacity}명</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-[#3d2b1f]">{subject.name}</h2>
                  <p className="text-sm text-[#7b6346]">
                    학습 기간: {subject.startDate} ~ {subject.endDate}
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <span className="text-[#8b5e3c] font-bold text-sm flex items-center gap-1">
                    학습하러 가기 <span className="text-lg">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-10 text-center shadow-sm">
            <p className="text-lg font-medium text-[#7b6346]">현재 등록된 과목이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}