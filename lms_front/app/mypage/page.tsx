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
    grades: [] as any[],
    courses: [] as any[],
    progressMap: {} as Record<number, number>,
  });

  const [teacherStats, setTeacherStats] = useState({
    subjectCount: 0,
    subjects: [] as any[],
  });

  const [adminStats, setAdminStats] = useState({
    waitTeachers: 0,
    waitSubjects: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const profile = user?.user || user;
  const username = profile?.username;
  const loginid = profile?.loginid;
  const email = profile?.email || "등록된 이메일이 없습니다.";
  const phonenum = profile?.phonenum || "등록된 번호가 없습니다.";
  const rawUsertype = profile?.usertype;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchSummaryStats();
  }, [user, loading]);

  const fetchSummaryStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setStatsLoading(true);
    try {
      if (rawUsertype === "S") {
        const sid = user.sid || user.user?.sid || profile?.userid || profile?.id;
        if (!sid) return;

        const [courseRes, gradeRes, progressRes] = await Promise.all([
          fetch(`http://localhost:8080/api/courses/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/grades/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/progresses/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
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
          if (!subId) continue;
          try {
            const lessonsRes = await fetch(`http://localhost:8080/api/lessons/subject/${subId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!lessonsRes.ok) { subjectProgressMap[subId] = 0; continue; }
            const lessons: any[] = await lessonsRes.json();
            if (lessons.length === 0) { subjectProgressMap[subId] = 0; continue; }
            let totalDuration = 0, totalProgressed = 0;
            for (const lesson of lessons) {
              const lid = lesson.lid || lesson.id;
              const duration = lesson.duration || lesson.totalTime || 0;
              const savedTime = dbProgressMap[lid] || 0;
              totalDuration += duration;
              totalProgressed += savedTime;
            }
            subjectProgressMap[subId] = totalDuration > 0
              ? Math.min(100, Math.floor((totalProgressed / totalDuration) * 100))
              : 0;
          } catch {
            subjectProgressMap[subId] = 0;
          }
        }

        setStudentStats({
          courseCount: courses.length,
          gradeCount: validGrades.length,
          grades: validGrades,
          courses,
          progressMap: subjectProgressMap,
        });
      } else if (rawUsertype === "T") {
        const tid = user.tid || user.user?.tid;
        if (!tid) return;
        const res = await fetch(`http://localhost:8080/api/subjects/teacher/${tid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subjects = res.ok ? await res.json() : [];
        setTeacherStats({ subjectCount: subjects.length, subjects });
      } else if (rawUsertype === "A") {
        const [teacherRes, subjectRes] = await Promise.all([
          fetch(`http://localhost:8080/api/teachers/unApproved`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:8080/api/subjects/wait`, { headers: { Authorization: `Bearer ${token}` } }),
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
    if (rawUsertype === "T" && teacherStats.subjectCount > 0) {
      alert(`현재 담당 중인 과목이 ${teacherStats.subjectCount}개 있습니다.\n과목 담당을 해제하거나 삭제한 후 탈퇴를 진행해 주세요.`);
      return;
    }
    if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 수강 이력 및 성적 정보를 포함한 모든 데이터가 완전히 소멸됩니다.")) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/user/withdraw", {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (res.ok) {
        alert("회원 탈퇴가 안전하게 처리되었습니다. 이용해 주셔서 감사합니다.");
        localStorage.removeItem("token");
        localStorage.removeItem("loginId");
        window.location.href = "/login";
      } else {
        const errorData = await res.json();
        alert(errorData.message || "탈퇴 처리 도중 에러가 발생했습니다. 다시 시도해 주세요.");
      }
    } catch {
      alert("백엔드 서버와 통신에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#d6c2a8] border-t-[#8b5e3c]" />
          <p className="text-xs text-[#8b5e3c] font-medium tracking-wide">인증 확인 중</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  let usertypeKorean = "일반 회원";
  if (rawUsertype === "S") usertypeKorean = "학생";
  if (rawUsertype === "T") usertypeKorean = "교사";
  if (rawUsertype === "A") usertypeKorean = "관리자";

  return (
    <div className="min-h-screen bg-[#f5f1e8] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#5c4033]">
      <div className="max-w-7xl mx-auto space-y-10">

        <div>
          <p className="text-xs font-bold tracking-widest text-[#b89b7a] uppercase mb-1">대시보드</p>
          <h1 className="text-2xl font-black text-[#3d2b1f]">마이페이지</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-[#e2d4c0] rounded-2xl overflow-hidden shadow-sm">

              <div className="bg-[#f5f1e8] px-6 py-8 flex flex-col items-center gap-3 border-b border-[#e2d4c0]">
                <div className="w-14 h-14 rounded-full bg-[#8b5e3c] flex items-center justify-center">
                  <span className="text-xl font-black text-white">{username?.charAt(0)}</span>
                </div>
                <div className="text-center">
                  <h2 className="text-base font-black text-[#3d2b1f]">{username}</h2>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e7d7c1] text-[#8b5e3c]">
                    {usertypeKorean}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {[
                  { label: "아이디", value: loginid },
                  { label: "이메일", value: email },
                  { label: "휴대폰", value: phonenum },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-[#b89b7a] uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-[#3d2b1f] break-all">{value}</p>
                  </div>
                ))}

                {rawUsertype === "T" && (
                  <div>
                    <p className="text-[10px] font-bold text-[#b89b7a] uppercase tracking-widest mb-0.5">계정 승인</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      user?.approved
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {user?.approved ? "승인 완료" : "승인 대기"}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 pt-2 space-y-2.5 border-t border-[#e2d4c0]">
                <Link
                  href="/change-password"
                  className="block w-full text-center py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-[#8b5e3c] hover:bg-[#6f4a2f] transition-colors shadow-sm mt-5"
                >
                  회원정보 수정
                </Link>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="block w-full text-center text-xs text-[#b89b7a] hover:text-red-500 transition-colors font-medium disabled:opacity-40 pt-1"
                >
                  {isDeleting ? "처리 중..." : "서비스 탈퇴"}
                </button>
              </div>
            </div>

            {rawUsertype === "T" && !user?.approved && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 text-xs text-amber-800 leading-relaxed">
                관리자 승인을 기다리는 중입니다. 승인 완료 후 강좌 관리가 활성화됩니다.
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">

            {statsLoading ? (
              <div className="bg-white border border-[#e2d4c0] rounded-2xl p-16 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#d6c2a8] border-t-[#8b5e3c] mx-auto mb-3" />
                <p className="text-xs text-[#b89b7a]">데이터를 불러오는 중입니다</p>
              </div>
            ) : (
              <>
                {rawUsertype === "S" && (
                  <div className="space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-[#e2d4c0] rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-[#b89b7a] uppercase tracking-widest">수강 과목</p>
                        <p className="text-3xl font-black text-[#3d2b1f] mt-2">{studentStats.courseCount}</p>
                        <p className="text-xs text-[#b89b7a] mt-0.5">건</p>
                      </div>
                      <div className="bg-white border border-[#e2d4c0] rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-[#b89b7a] uppercase tracking-widest">성적 확정</p>
                        <p className="text-3xl font-black text-[#8b5e3c] mt-2">{studentStats.gradeCount}</p>
                        <p className="text-xs text-[#b89b7a] mt-0.5">건</p>
                      </div>
                    </div>

                    <div className="bg-white border border-[#e2d4c0] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0e8dc]">
                        <h3 className="text-sm font-black text-[#3d2b1f]">과목별 진도 현황</h3>
                        <span className="text-xs text-[#b89b7a]">{studentStats.courses.length}개 과목</span>
                      </div>
                      {studentStats.courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentStats.courses.map((course: any, index: number) => {
                            const subId = course.subject?.subid || course.subid || course.id;
                            const percentage = studentStats.progressMap[subId] || 0;
                            const displaySubjectName =
                              course.subject?.name ||
                              course.subject?.subjectName ||
                              course.subjectName ||
                              course.name ||
                              "미지정 과목";

                            return (
                              <div key={subId || index} className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-bold text-[#5c4033] truncate pr-2" title={displaySubjectName}>
                                    {displaySubjectName}
                                  </span>
                                  <span className="text-xs font-black text-[#8b5e3c] shrink-0 tabular-nums">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-[#f0e8dc] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#8b5e3c] rounded-full transition-all duration-700"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-[#b89b7a] py-8">수강 중인 과목이 없습니다.</p>
                      )}
                    </div>
                    <div className="bg-white border border-[#e2d4c0] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0e8dc]">
                        <h3 className="text-sm font-black text-[#3d2b1f]">시험 성적</h3>
                        <span className="text-xs text-[#b89b7a]">{studentStats.gradeCount}건 확정</span>
                      </div>
                      {studentStats.grades.length > 0 ? (
                        <div className="divide-y divide-[#f0e8dc]">
                          {studentStats.grades.map((g: any) => {
                            const scoreNum = Number(g.score);
                            const grade =
                              scoreNum >= 90 ? "A" :
                              scoreNum >= 80 ? "B" :
                              scoreNum >= 70 ? "C" :
                              scoreNum >= 60 ? "D" : "F";
                            const gradeColor =
                              grade === "A" ? "text-green-600" :
                              grade === "B" ? "text-blue-600" :
                              grade === "C" ? "text-amber-600" :
                              "text-red-500";

                            return (
                              <div key={g.gid} className="flex items-center justify-between py-3">
                                <span className="text-sm font-bold text-[#5c4033]">{g.subjectName}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black text-[#3d2b1f] tabular-nums">{g.score}점</span>
                                  <span className={`text-xs font-black w-6 text-center ${gradeColor}`}>{grade}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-[#b89b7a] py-8">확정된 성적이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}

                {rawUsertype === "T" && (
                  <div className="space-y-5">

                    <div className="bg-white border border-[#e2d4c0] rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold text-[#b89b7a] uppercase tracking-widest">담당 강좌</p>
                      <p className="text-3xl font-black text-[#8b5e3c] mt-2">{teacherStats.subjectCount}</p>
                      <p className="text-xs text-[#b89b7a] mt-0.5">개 강좌</p>
                    </div>

                    <div className="bg-white border border-[#e2d4c0] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0e8dc]">
                        <h3 className="text-sm font-black text-[#3d2b1f]">담당 과목 목록</h3>
                        <span className="text-xs text-[#b89b7a]">{teacherStats.subjects.length}건</span>
                      </div>
                      {teacherStats.subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teacherStats.subjects.map((sub: any) => {
                            const isApproved = sub.subStatus === "OKAY";
                            return (
                              <div
                                key={sub.subid}
                                className="border border-[#e2d4c0] rounded-xl p-4 space-y-3 hover:border-[#b89b7a] transition-colors bg-[#fdfaf6]"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#8b5e3c] bg-[#f5ede2] px-2 py-0.5 rounded">
                                    {sub.major || "전공 미지정"}
                                  </span>
                                  <span className={`text-[11px] font-bold ${isApproved ? "text-green-600" : "text-amber-600"}`}>
                                    {isApproved ? "승인 완료" : "승인 대기"}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-black text-[#3d2b1f] text-sm">{sub.name}</h4>
                                  <p className="text-xs text-[#b89b7a] mt-1">정원 {sub.capacity}명</p>
                                </div>
                                <div className="pt-2 border-t border-[#f0e8dc] flex justify-between text-[11px] text-[#b89b7a]">
                                  <span>운영 기간</span>
                                  <span className="font-medium text-[#5c4033]">{sub.startDate} ~ {sub.endDate}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-[#b89b7a] py-8">개설 중인 과목이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}

                {rawUsertype === "A" && (
                  <div className="space-y-5">
                    <div className="bg-[#3d2b1f] text-white rounded-2xl px-5 py-4">
                      <p className="text-xs font-bold tracking-widest opacity-60 uppercase">권한</p>
                      <p className="text-sm font-bold mt-0.5">시스템 최고 관리자</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">교사 승인 대기</p>
                        <p className="text-3xl font-black text-red-600 mt-2">{adminStats.waitTeachers}</p>
                        <p className="text-xs text-red-300 mt-0.5">건</p>
                      </div>
                      <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">과목 승인 대기</p>
                        <p className="text-3xl font-black text-red-600 mt-2">{adminStats.waitSubjects}</p>
                        <p className="text-xs text-red-300 mt-0.5">건</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
