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
  const { user, loading: userLoading, logout } = useUser(); // logout 함수 추가
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

        // 유저 객체의 여러 가능성(top-level 혹은 nested)을 모두 체크하여 ID를 가져옵니다.
        const studentId = user.sid || user.id || user.user?.sid || user.user?.id;

        if (!studentId) {
          console.error("학생 ID를 찾을 수 없습니다:", user);
          return;
        }

        // 학생이 수강 신청한 과목 목록을 가져오는 API 호출
        const res = await fetch(`http://localhost:8080/api/courses/student/${studentId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const courses: Course[] = await res.json();
          console.log("불러온 수강 목록:", courses);
          // Course 리스트에서 Subject 정보만 추출하여 subjects 상태에 저장
          const enrolledSubjects = courses.map(course => course.subject);
          setSubjects(enrolledSubjects);
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

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
          전체 과목 목록
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"> {/* 3열은 대시보드 구조상 너무 좁을 수 있어 2열로 조정 */}
          {subjects.map((subject) => (
            <Link key={subject.subid} href={`/student/${subject.subid}`}>
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