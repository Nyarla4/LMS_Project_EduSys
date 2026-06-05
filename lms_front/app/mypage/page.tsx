"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";
import Link from "next/link";

export default function MyPage() {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const [studentStats, setStudentStats] = useState({ 
    courseCount: 0, 
    gradeCount: 0,
    courses: [] as any[], 
    progressMap: {} as Record<number, number> 
  });
  const [teacherStats, setTeacherStats] = useState({ subjectCount: 0 });
  const [adminStats, setAdminStats] = useState({ waitTeachers: 0, waitSubjects: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchSummaryStats();
    }
  }, [user, loading]);

  const fetchSummaryStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const profile = user.user || user;
    const rawUsertype = profile?.usertype;
    
    setStatsLoading(true);
    try {
      if (rawUsertype === "S") {
        const sid = user.sid || user.user?.sid || profile?.userid || profile?.id;
        if (!sid) return;

        const [courseRes, gradeRes, progressRes] = await Promise.all([
          fetch(`http://localhost:8080/api/courses/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/grades/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/progresses/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const courses = courseRes.ok ? await courseRes.json() : [];
        const grades = gradeRes.ok ? await gradeRes.json() : [];
        const validGrades = grades.filter((g: any) => g.score !== null && g.score !== undefined);

        const dbProgressMap: Record<number, number> = {};
        if (progressRes.ok) {
          const progs = await progressRes.json();
          
          progs.forEach((p: any) => {
            const lid = p.lid || p.lesson?.lid || p.id || p.lesson?.id;
            const dbVal = p.progressed ?? p.progress ?? 0;
            
            if (lid) {
              const localVal = parseInt(localStorage.getItem(`video_progress_${lid}`) || "0", 10);
              dbProgressMap[lid] = Math.max(dbVal, localVal); 
            }
          });
        }

        const subjectProgressMap: Record<number, number> = {};

        for (const c of courses) {
          const subId = c.subject?.subid || c.subid || c.id;
          
          if (!subId) {
            continue;
          }

          try {
            const lessonsRes = await fetch(`http://localhost:8080/api/lessons/subject/${subId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!lessonsRes.ok) {
              subjectProgressMap[subId] = 0;
              continue;
            }

            const lessons: any[] = await lessonsRes.json();

            if (lessons.length === 0) {
              subjectProgressMap[subId] = 0; 
              continue;
            }

            let totalDuration = 0;
            let totalProgressed = 0;

            for (const lesson of lessons) {
              const lid = lesson.lid || lesson.id;
              const duration = lesson.duration || lesson.totalTime || 0;
              
              const savedTime = dbProgressMap[lid] || 0; 

              totalDuration += duration;
              totalProgressed += savedTime;
            }

            const subjectProgressPercent = totalDuration > 0 
              ? Math.min(100, Math.floor((totalProgressed / totalDuration) * 100)) 
              : 0;
            
            subjectProgressMap[subId] = subjectProgressPercent;

          } catch (err) {
            subjectProgressMap[subId] = 0;
          }
        }

        setStudentStats({
          courseCount: courses.length,
          gradeCount: validGrades.length,
          courses: courses,
          progressMap: subjectProgressMap 
        });
      } 
      else if (rawUsertype === "T") {
        const tid = user.tid || user.user?.tid;
        if (!tid) return;
        const res = await fetch(`http://localhost:8080/api/subjects/teacher/${tid}`, { headers: { Authorization: `Bearer ${token}` } });
        const subjects = res.ok ? await res.json() : [];
        setTeacherStats({ subjectCount: subjects.length });
      } 
      else if (rawUsertype === "A") {
        const [teacherRes, subjectRes] = await Promise.all([
          fetch(`http://localhost:8080/api/teachers/unApproved`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/subjects/wait`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const teachers = teacherRes.ok ? await teacherRes.json() : [];
        const subjects = subjectRes.ok ? await subjectRes.json() : [];
        setAdminStats({ waitTeachers: teachers.length, waitSubjects: subjects.length });
      }
    } catch (err) {
      console.error("통계 데이터를 가져오는 중 실패:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  async function handleDeleteAccount() {
    if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 수강 이력 및 성적 정보를 포함한 모든 데이터가 완전히 소멸됩니다.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/user/withdraw", {
        method: "DELETE",
        headers: { ...(token && { "Authorization": `Bearer ${token}` }) },
      });
      if (res.ok) {
        alert("회원 탈퇴가 안전하게 처리되었습니다. 이용해 주셔서 감사합니다.");
        localStorage.removeItem("token");
        localStorage.removeItem("loginId");
        window.location.href = "/login";
      } else {
        alert("탈퇴 처리 도중 에러가 발생했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      alert("백엔드 서버와 통신에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex flex-col items-center justify-center font-sans text-[#5c4033]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#d6c2a8] border-t-[#8b5e3c] mb-4"></div>
        <p className="text-sm font-medium text-[#8b5e3c]">인증 확인 중...</p>
      </div>
    );
  }

  if (!user) return null;

  const profile = user.user || user;
  const username = profile?.username;
  const loginid = profile?.loginid;
  const email = profile?.email || "등록된 이메일이 없습니다.";
  const phonenum = profile?.phonenum || "등록된 번호가 없습니다.";
  const rawUsertype = profile?.usertype;
  
  let usertypeKorean = "일반 회원";
  let dynamicSummaryCard = null;

  if (rawUsertype === "S") {
    usertypeKorean = "학생";
    dynamicSummaryCard = (
      <div className="bg-[#8b5e3c]/5 border border-[#8b5e3c]/20 rounded-xl p-5 space-y-4">
        <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-wider text-center border-b border-[#d6c2a8]/60 pb-1">
          나의 학업 및 진도율 현황
        </p>
        
        {statsLoading ? (
          <p className="text-center text-xs text-gray-400 animate-pulse py-4">학업 정보 및 진도율 로딩 중...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white/80 p-3 rounded-lg border border-[#d6c2a8]/40 shadow-sm">
                <p className="text-xs text-[#b89b7a] font-bold">수강 신청 과목</p>
                <p className="text-xl font-black text-[#5c4033] mt-1">
                  {studentStats.courseCount}<span className="text-xs font-normal"> 건</span>
                </p>
              </div>
              <div className="text-center bg-white/80 p-3 rounded-lg border border-[#d6c2a8]/40 shadow-sm">
                <p className="text-xs text-[#b89b7a] font-bold">성적 확정 과목</p>
                <p className="text-xl font-black text-[#8b5e3c] mt-1">
                  {studentStats.gradeCount}<span className="text-xs font-normal"> 건</span>
                </p>
              </div>
            </div>

            <div className="bg-white/90 border border-[#d6c2a8]/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-[#5c4033] mb-1">과목별 온라인 진도율</p>
              
              {studentStats.courses.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {studentStats.courses.map((course: any, index: number) => {
                    const subId = course.subject?.subid || course.subid || course.id;
                    const percentage = studentStats.progressMap[subId] || 0;

                    const displaySubjectName = 
                      course.subject?.name || 
                      course.subject?.subjectName || 
                      course.subjectName || 
                      course.name || 
                      `미지정 과목(ID: ${subId || index})`;

                    return (
                      <div key={subId || index} className="space-y-1 text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[#3d2b1f] truncate max-w-[70%]" title={displaySubjectName}>
                            {displaySubjectName}
                          </span>
                          <span className="text-xs font-bold text-[#8b5e3c]">{percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#eedfc2]/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#8b5e3c] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-gray-400 py-2">현재 진행 중인 수강 과목이 없습니다.</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  } 
  else if (rawUsertype === "T") {
    usertypeKorean = "교사";
    dynamicSummaryCard = (
      <div className="bg-[#8b5e3c]/5 border border-[#8b5e3c]/20 rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-wider text-center border-b border-[#d6c2a8]/60 pb-1">나의 강의 현황 요약</p>
        {statsLoading ? (
          <p className="text-center text-xs text-gray-400 animate-pulse py-2">강의 정보 로딩 중...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-1">
            <div className="text-center bg-white/80 p-3 rounded-lg border border-[#d6c2a8]/40 shadow-sm">
              <p className="text-xs text-[#b89b7a] font-bold">현재 담당 중인 과목</p>
              <p className="text-xl font-black text-[#8b5e3c] mt-1">{teacherStats.subjectCount}<span className="text-xs font-normal"> 개 과목</span></p>
            </div>
          </div>
        )}
      </div>
    );
  } 
  else if (rawUsertype === "A") {
    usertypeKorean = "관리자";
    dynamicSummaryCard = (
      <div className="bg-red-50/60 border border-red-200/60 rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-red-700 uppercase tracking-wider text-center border-b border-red-200 pb-1">시스템 미결재 업무 요약</p>
        {statsLoading ? (
          <p className="text-center text-xs text-gray-400 animate-pulse py-2">대기 업무 조회 중...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="text-center bg-white/80 p-3 rounded-lg border border-red-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold">교사 승인 대기</p>
              <p className="text-xl font-black text-red-600 mt-1">{adminStats.waitTeachers}<span className="text-xs font-normal"> 건</span></p>
            </div>
            <div className="text-center bg-white/80 p-3 rounded-lg border border-red-100 shadow-sm">
              <p className="text-xs text-gray-500 font-bold">과목 승인 대기</p>
              <p className="text-xl font-black text-red-600 mt-1">{adminStats.waitSubjects}<span className="text-xs font-normal"> 건</span></p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-2xl flex flex-col gap-6 mt-10 px-6 sm:px-10">
        
        <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
          마이페이지
        </p>

        {dynamicSummaryCard}

        {rawUsertype === "T" && !user?.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed shadow-sm">
            상태 안내: 현재 관리자의 승인을 기다리고 있습니다.
          </div>
        )}

        <div className="bg-[#fcf7f0] border-[#b89b7a] border-2 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">이름</span>
            <span className="text-base font-semibold text-[#3d2b1f]">{username}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">사용자 ID</span>
            <span className="text-base font-medium text-gray-700">{loginid}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">이메일 주소</span>
            <span className="text-sm font-medium text-gray-700">{email}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">휴대폰 번호</span>
            <span className="text-sm font-medium text-gray-700">{phonenum}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#8b5e3c]">회원 유형</span>
            <div className="flex gap-2 items-center">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#dbc7b1] border border-[#b89b7a] text-[#5c4033]">
                {usertypeKorean}
              </span>
              {rawUsertype === "T" && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user?.approved 
                    ? "bg-green-100 text-green-700 border-green-300" 
                    : "bg-amber-100 text-amber-700 border-amber-300"
                }`}>
                  {user?.approved ? "승인 완료" : "승인 대기"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/change-password" 
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#8b5e3c] hover:bg-[#6f4a2f] transition-all text-center shadow-md active:scale-[0.98]"
          >
            회원정보 수정하기
          </Link>
        </div>

        <div className="text-center pt-4 border-t border-[#d6c2a8]/30">
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="text-xs text-gray-400 hover:text-red-500 hover:underline transition-colors font-medium disabled:opacity-50"
          >
            {isDeleting ? "탈퇴 처리 진행 중..." : "서비스 탈퇴하기"}
          </button>
        </div>

      </div>
    </div>
  );
}