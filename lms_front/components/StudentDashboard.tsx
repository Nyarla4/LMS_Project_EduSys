"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "../app/userContext";

// YouTube API 타입을 위한 전역 선언
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const tabs = [
  "강의 계획서",
  "출석 현황",
  "동영상 강의",
  "시험 정보",
  "과제 목록",
] as const;

type Tab = (typeof tabs)[number];

interface Subject {
  subid: number;
  name: string;
  planFile?: string; // 강의 계획서 PDF 경로 (DB 컬럼명 planFile 대응)
}

interface Lesson {
  lid: number;
  name: string;
  date: string;
  subject?: Subject;
}

interface Attendance {
  aid: number;
  date: string;
  whether: boolean;
}

interface Exam {
  eid: number;
  name: string;
  grade: string;
  date?: string; // 엔티티엔 없으나 UI용으로 유지
  status?: string;
}

interface Assignment {
  wid: number;
  form: string;
  dueDate: string;
  grade: string;
  status?: string; // UI용
}

interface Video {
  lid: number;
  name: string;
  fileUrl: string;
  duration: number;
  week: number;
}

function TabPanel({ 
  activeTab,
  lessons,
  attendanceData,
  exams,
  assignments,
  videoList,
  progressMap,
  activeVideoId,
  apiBase,
  sessionBaseProgress,
  currentSessionSeconds,
  onAssignmentSelect,
  onAddAssignmentClick,
  onVideoSelect,
  onSyllabusUploadClick,
  onAddVideoClick
}: { 
  activeTab: Tab; 
  lessons: Lesson[];
  attendanceData: Attendance[];
  exams: Exam[];
  assignments: Assignment[];
  videoList: Video[];
  progressMap: Record<number, number>;
  activeVideoId?: number;
  apiBase: string;
  sessionBaseProgress: number;
  currentSessionSeconds: number;
  onAssignmentSelect: (assignment: Assignment) => void;
  onAddAssignmentClick?: () => void;
  onVideoSelect: (video: Video) => void;
  onSyllabusUploadClick?: () => void;
  onAddVideoClick?: () => void;
}) {
  const { user } = useUser();
  // 데이터 구조를 변수로 뽑아 가독성 높임 (학생/교사 객체 내의 user 또는 관리자 객체 자체)
  const profile = user?.user || user;
  const isTeacher = profile?.usertype === 'T';
  const usertype = profile?.usertype;
  const isOnlyAdmin = usertype === 'A'; // 관리자인 경우

  if (activeTab === "강의 계획서") {
    // 첫 번째 강의의 과목 정보에서 planFile 파일명을 가져옵니다.
    const planFile = lessons.length > 0 ? lessons[0].subject?.planFile : null;
    
    // PDF 뷰어의 도구 모음을 숨기고 가로 폭에 맞게 꽉 채우는 파라미터 추가
    // toolbar=0: 상단바 숨김, navpanes=0: 사이드바 숨김, view=FitH: 가로 맞춤
    const pdfParams = "#toolbar=0&navpanes=0&view=FitH";
    
    const baseSyllabusUrl = planFile 
      ? `${apiBase}/files/pdf/${encodeURIComponent(planFile)}` 
      : `${apiBase}/files/syllabus.pdf`;

    const syllabusViewUrl = baseSyllabusUrl + "?download=false" + pdfParams;
    const syllabusDownloadUrl = baseSyllabusUrl + "?download=true";

    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#3d2b1f]">강의 계획서 미리보기</h2>
            <p className="mt-2 text-sm text-[#7b6346]">과목별 수업 계획서를 내려받거나 바로 확인할 수 있습니다.</p>
          </div>
          <a 
            href={syllabusDownloadUrl}
            target="_blank" // 새 탭에서 열기
            className="inline-flex items-center rounded-full bg-[#8d6a44] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c5935]"
            download
          >
            파일 다운로드
          </a>
        </div>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-[#f1e1c4] bg-[#fbf1e8]">
          <iframe
            src={syllabusViewUrl}
            width="100%"
            height="100%"
            title="Syllabus PDF Viewer"
            className="h-full w-full"
          >
            이 브라우저는 iframe을 지원하지 않습니다.
          </iframe>
        </div>
        
        {/* 교사 전용 관리 영역 */}
        {isTeacher && (
          <div className="mt-6 flex justify-end gap-3 border-t border-[#e6d1a7] pt-6">
            <button 
              onClick={onSyllabusUploadClick}
              className="rounded-full bg-[#3d2b1f] px-6 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              계획서 파일 교체
            </button>
          </div>
        )}
      </section>
    );
  }

  if (activeTab === "출석 현황") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3d2b1f]">출석 현황</h2>
          {isTeacher && (
            <button className="rounded-full bg-[#8d6a44] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c5935]">
              출석부 일괄 수정
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-[28px] border border-[#f0debe] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e9d7b0] text-left text-sm text-[#5c4b38]">
            <thead className="bg-[#f7ecd9] text-[#6d5b46]">
              <tr>
                 <th className="px-4 py-4">기간</th>
                <th className="px-4 py-4">강의명</th>
                <th className="px-4 py-4">상태</th>
                <th className="px-4 py-4">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9d7b0] bg-white">
              {lessons.map((lesson) => {
                // 강의 시작 날짜로부터 일주일(7일) 기간 계산
                const startDate = new Date(lesson.date);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                
                const formattedEndDate = endDate.toISOString().split('T')[0];
                const dateRange = `${lesson.date} ~ ${formattedEndDate}`;

                // 강의 날짜와 일치하는 출석 데이터를 찾습니다.
                const att = attendanceData.find(a => a.date === lesson.date);

                // 동영상 시청 진도율 확인 (90% 이상이면 출석 인정)
                const video = videoList.find(v => v.lid === lesson.lid);
                const savedTime = progressMap[lesson.lid] || 0;
                // 현재 시청 중인 영상이라면 실시간 세션 시간 합산
                const totalProgress = (activeVideoId === lesson.lid && sessionBaseProgress !== undefined)
                  ? (sessionBaseProgress + currentSessionSeconds)
                  : savedTime;
                const isPresentByVideo = video && video.duration > 0 && (totalProgress / video.duration) >= 0.9;

                return (
                <tr key={lesson.lid} className="hover:bg-[#fff6eb]">
                  <td className="px-4 py-4">{dateRange}</td>
                  <td className="px-4 py-4">{lesson.name}</td>
                  <td className="px-4 py-4">
                    {isTeacher ? (
                      <span className="text-gray-400 italic text-xs">수강생 전용 정보</span>
                    ) : (
                      <span className={(isPresentByVideo || (att && att.whether)) ? "text-blue-600 font-bold" : "text-red-600 font-bold"}>
                      {isPresentByVideo || (att && att.whether) ? "출석" : "결석"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">-</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (activeTab === "동영상 강의") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3d2b1f]">동영상 강의</h2>
          {isTeacher && (
            <button 
              onClick={onAddVideoClick}
              className="rounded-full bg-[#8d6a44] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c5935]"
            >
              + 영상 추가 업로드
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {videoList.length > 0 ? (
            videoList.map((video) => {
              // 현재 재생 중인 영상은 (세션 시작 시점의 진도 + 현재 세션 시청 시간)으로 실시간 계산
              // 그 외 영상은 저장된 누적 시청 시간(progressMap)을 그대로 사용
              const savedTime = progressMap[video.lid] || 0;
              const totalProgress = (activeVideoId === video.lid && sessionBaseProgress !== undefined)
                ? (sessionBaseProgress + currentSessionSeconds)
                : savedTime;
              
              const percentage = video.duration > 0 
                ? Math.min(100, Math.floor((totalProgress / video.duration) * 100)) 
                : 0;

              return (
                <article 
                  key={video.lid} 
                  className="cursor-pointer rounded-[28px] border border-[#f0debe] bg-[#fff8ef] p-5 transition duration-200 hover:border-[#d6b77a] hover:bg-[#f6e8d6]"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#3d2b1f]">{video.name}</h3>
                        <p className="mt-2 text-sm text-[#7b6346]">{video.week}주차 학습 영상</p>
                      </div>
                      {!isTeacher && <span className="rounded-full bg-[#e8d1a5] px-3 py-1 text-xs font-bold text-[#5c4326]">{percentage}%</span>}
                    </div>
                    {!isTeacher && (
                      <div className="space-y-2">
                        <div className="h-3 overflow-hidden rounded-full bg-[#eedfc2]">
                          <div className="h-full rounded-full bg-[#8d6a44] transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <p className="text-xs text-[#7b6346]">
                          {Math.floor(video.duration / 60)}분 {video.duration % 60}초 중{" "}
                          {Math.floor(totalProgress / 60)}분 {totalProgress % 60}초 시청
                          ({percentage}%)
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="col-span-2 py-8 text-center text-[#7b6346]">
              현재 등록된 동영상 강의가 없습니다.
            </p>
          )}
        </div>
      </section>
    );
  }

  if (activeTab === "시험 정보") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <h2 className="mb-4 text-2xl font-semibold text-[#3d2b1f]">시험 정보</h2>
        <div className="overflow-x-auto rounded-[28px] border border-[#f0debe] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e9d7b0] text-left text-sm text-[#5c4b38]">
            <thead className="bg-[#f7ecd9] text-[#6d5b46]">
              <tr>
                <th className="px-4 py-4">시험명</th>
                <th className="px-4 py-4">일정</th>
                <th className="px-4 py-4">상태</th>
                <th className="px-4 py-4">점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9d7b0] bg-white">
              {exams.map((exam) => (
                <tr key={exam.eid} className="hover:bg-[#fff6eb]">
                  <td className="px-4 py-4">{exam.name}</td>
                  <td className="px-4 py-4">{exam.date || "-"}</td>
                  <td className="px-4 py-4">{exam.status || "완료"}</td>
                  <td className="px-4 py-4">{exam.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#3d2b1f]">과제 목록</h2>
        {isTeacher && (
          <button 
            onClick={onAddAssignmentClick}
            className="rounded-full bg-[#8d6a44] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c5935]"
          >
            + 새 과제 생성
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-[28px] border border-[#f0debe] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[#e9d7b0] text-left text-sm text-[#5c4b38]">
          <thead className="bg-[#f7ecd9] text-[#6d5b46]">
            <tr>
              <th className="px-4 py-4">과제명</th>
              <th className="px-4 py-4">마감일</th>
              <th className="px-4 py-4">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9d7b0] bg-white">
            {assignments.length > 0 ? assignments.map((assignment) => (
              <tr key={assignment.wid} className="hover:bg-[#fff6eb] cursor-pointer" onClick={() => onAssignmentSelect(assignment)}>
                <td className="px-4 py-4">{assignment.form}</td>
                <td className="px-4 py-4">{assignment.dueDate}</td>
                <td className="px-4 py-4">
                  {isTeacher ? <span className="text-[#8d6a44] font-bold">현황 보기</span> : (assignment.grade || "제출전")}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[#7b6346]">등록된 과제가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentDashboard({ subjectId }: { subjectId?: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("강의 계획서");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [sessionBaseProgress, setSessionBaseProgress] = useState(0); // 현재 시청 세션 시작 시점의 DB 진도
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0); // 현재 세션 순수 시청 시간
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ form: '', dueDate: '' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({ name: '', date: '', url: '' });

  const ytPlayerRef = useRef<any>(null); // 유튜브 플레이어 인스턴스 저장용
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  const { user, loading: userLoading } = useUser();

  // 컴포넌트 메인 로직에서도 동일하게 단순화된 변수 사용
  const profile = user?.user || user;
  const usertype = profile?.usertype;
  // 학생일 경우에만 studentId를 가져오고, 교사일 경우 null로 설정하여 학생 전용 API 호출 방지
  const studentId = usertype === 'S' ? (user?.sid || profile?.userid || profile?.id) : null;
  // 교사일 경우 teacherId를 가져옴 (현재는 사용되지 않지만 확장성을 위해 유지)
  const teacherId = usertype === 'T' ? (user?.tid || profile?.userid || profile?.id) : null;

  const API_BASE = "http://localhost:8080/api";
  const isTeacher = usertype === 'T';

  useEffect(() => {
    const fetchData = async () => {
      // 유저 정보 로딩 대기 및 권한별 ID 확인
      if (userLoading || !user) return;
      if (usertype === 'S' && !studentId) return;

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        // 토큰이 없더라도 기본 데이터는 가져올 수 있도록 headers를 유연하게 설정
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 강의 목록 API: 과목 ID가 있으면 해당 과목의 강의를, 없으면 사용자 권한에 따른 전체 강의를 가져옵니다.
        const lessonUrl = subjectId 
          ? `${API_BASE}/lessons/subject/${subjectId}` 
          : (isTeacher && teacherId 
              ? `${API_BASE}/lessons/teacher/${teacherId}` 
              : `${API_BASE}/lessons`);

        const fetches: Promise<Response>[] = [fetch(lessonUrl, { headers })];
        let attRes: Response | null = null;
        let examRes: Response | null = null;
        let assignRes: Response | null = null;
        let progRes: Response | null = null;

        // 학생일 경우에만 학생 관련 데이터 페칭을 추가
        if (!isTeacher && studentId) {
          const attUrl = subjectId ? `${API_BASE}/attendances/subject/${subjectId}` : `${API_BASE}/attendances`;
          const examUrl = subjectId ? `${API_BASE}/exams/subject/${subjectId}` : `${API_BASE}/exams`;
          const assignUrl = subjectId ? `${API_BASE}/works/subject/${subjectId}` : `${API_BASE}/works`;

          fetches.push(fetch(attUrl, { headers }));
          fetches.push(fetch(examUrl, { headers }));
          fetches.push(fetch(assignUrl, { headers }));
          fetches.push(fetch(`${API_BASE}/progresses/student/${studentId}`, { headers }));
        }

        const responses = await Promise.all(fetches);
        const lessonRes = responses[0];

        if (!lessonRes.ok) {
          const errText = await lessonRes.text();
          throw new Error(`강의 로드 실패 (${lessonRes.status}): ${errText.substring(0, 50)}`);
        }

        const lessonData = await lessonRes.json();
        setLessons(lessonData);
        setVideoList(lessonData); // 통합된 Lesson 데이터를 비디오 리스트로도 사용

        // 학생일 경우에만 나머지 데이터 파싱
        if (!isTeacher && studentId) {
          attRes = responses[1];
          examRes = responses[2];
          assignRes = responses[3];
          progRes = responses[4];

          if (attRes?.ok) setAttendanceData(await attRes.json());
          if (examRes?.ok) setExams(await examRes.json());
          if (assignRes?.ok) setAssignments(await assignRes.json());
          if (progRes?.ok) {
            const progs = await progRes.json();
            const map: Record<number, number> = {};
            progs.forEach((p: any) => {
              const lid = p.lesson?.lid || p.lid || p.videoId || p.lessonId;
              if (lid) {
                map[lid] = p.progress ?? p.progressed ?? 0;
              }
            });
            setProgressMap(map);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, studentId, teacherId, isTeacher, userLoading, user]); // teacherId 의존성 추가

  // YouTube IFrame API 스크립트 로드
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 실시간 시청 시간 누적 스탑워치 (1초마다)
  useEffect(() => {
    if (isPlaying && selectedVideo && !isTeacher) {
      trackingInterval.current = setInterval(() => {
        setCurrentSessionSeconds((prev) => {
          const next = prev + 1;
          if (next > 0 && next % 15 === 0) {
            saveVideoProgress(next); // 15초마다 자동 누적 저장
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, [isPlaying, selectedVideo]);

  const handleVideoSelect = async (video: Video) => {
    setSessionBaseProgress(progressMap[video.lid] || 0); // 초기 진도는 DB 값 사용
    setCurrentSessionSeconds(0); 
    setSelectedVideo(video);

    // 유튜브 영상인 경우 플레이어 초기화 대기
    const isYoutube = video.fileUrl.includes('youtube.com') || video.fileUrl.includes('youtu.be');
    
    let resumeTime = 0;

    if (!isTeacher && studentId) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${API_BASE}/progresses/student/${studentId}/video/${video.lid}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // 엔티티 직접 반환 시에는 progressed 필드를 사용합니다.
          const latestProgress = data.progressed ?? data.progress ?? 0;
          setSessionBaseProgress(latestProgress);
          // 개별 진도 조회 시에도 전체 맵을 최신화하여 리스트의 진행률 표시와 동기화합니다.
          setProgressMap(prev => ({ ...prev, [video.lid]: latestProgress }));
        }
      } catch (e) {
        console.log("기존 진행 정보가 없습니다.");
      }

      // localStorage에서 실제 마지막으로 보던 물리적 위치 가져오기
      const storedResume = typeof window !== "undefined" ? localStorage.getItem(`video_resume_${video.lid}`) : null;
      if (storedResume) resumeTime = parseInt(storedResume);

      // 이어보기 위치가 영상 길이를 초과하지 않도록 보정
      if (video.duration > 0 && resumeTime >= video.duration) {
        resumeTime = 0; 
      }
    }

    // 강사 계정으로 로그인했을 때도 영상은 재생되어야 하므로 플레이어 초기화 로직을 if문 밖으로 이동했습니다.
    if (isYoutube) {
      // API 준비 상태 확인 후 초기화
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initYoutubePlayer(extractYouTubeId(video.fileUrl) || "", resumeTime);
          clearInterval(checkYT);
        }
      }, 100);
    } else {
      if (videoRef.current) videoRef.current.currentTime = resumeTime;
    }
  };

  // 과제 생성 처리
  const handleAddAssignmentSubmit = async () => {
    if (!newAssignment.form || !newAssignment.dueDate || !subjectId) {
      alert("과제 제목과 마감일을 입력해주세요.");
      return;
    }

    const payload = {
      form: newAssignment.form,
      dueDate: newAssignment.dueDate,
      subject: { subid: Number(subjectId) }
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/works`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("과제가 등록되었습니다.");
        setIsAddAssignmentModalOpen(false);
        window.location.reload();
      } else {
        alert("과제 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 학생용 과제 파일 업로드 처리
  const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAssignment) return;

    if (!confirm(`'${file.name}' 파일을 제출하시겠습니까?`)) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("wid", selectedAssignment.wid.toString());
    formData.append("sid", studentId?.toString() || "");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/works/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) alert("과제 파일이 제출되었습니다.");
      else alert("제출에 실패했습니다.");
    } catch (err) { console.error(err); }
  };

  const initYoutubePlayer = (videoId: string, startSeconds: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
    }

    ytPlayerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        start: startSeconds,
        enablejsapi: 1,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          }
          else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            saveVideoProgress(); 
          }
          else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            saveVideoProgress();
          }
        },
      },
    });
  };

  const saveVideoProgress = async (sessionTime?: number) => {
    const currentSession = sessionTime ?? currentSessionSeconds;
    
    if (selectedVideo && !isTeacher && (currentSession > 0 || sessionTime === undefined)) {
      const newTotalTime = sessionBaseProgress + currentSession;
      
      // 1. 즉시 로컬 UI 상태를 업데이트하여 목록에서의 '점프' 현상 방지
      setProgressMap(prev => ({
        ...prev,
        [selectedVideo.lid]: newTotalTime
      }));

      // 2. DB에는 실시간으로 흐른 누적 시간(Stopwatch) 저장 (출결용)
      if (currentSession > 0) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const url = `${API_BASE}/progresses/update?studentId=${studentId}&videoId=${selectedVideo.lid}&lastTime=${newTotalTime}`;

        // DB 저장은 비동기로 처리하되 에러 로그만 남깁니다.
        fetch(url, {
          method: 'POST',
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }).catch(err => console.error("진도 저장 실패:", err));
      }

      // 3. localStorage에는 영상의 실제 물리적 재생 위치(Seek point) 저장 (이어보기용)
      let physicalTime = 0;
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        physicalTime = Math.floor(ytPlayerRef.current.getCurrentTime());
      } else if (videoRef.current) {
        physicalTime = Math.floor(videoRef.current.currentTime);
      }
      
      if (physicalTime > 0 && typeof window !== "undefined") {
        localStorage.setItem(`video_resume_${selectedVideo.lid}`, physicalTime.toString());
      }
    }
  };

  // 강의 계획서 업로드 처리
  const handleSyllabusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!subjectId) {
      alert("과목 정보(ID)를 찾을 수 없습니다.");
      return;
    }

    // register/page.tsx의 방식을 활용한 PDF 형식 검증
    if (file.type !== "application/pdf") {
      alert("PDF 파일만 등록 가능");
      e.target.value = ""; // 선택된 파일 초기화
      return;
    }

    // register/page.tsx의 등록 확인(confirm) 방식 활용
    if (!confirm(`선택한 파일('${file.name}')로 강의 계획서를 교체하시겠습니까?`)) {
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/subjects/${subjectId}/upload-syllabus`, {
        method: "POST", // 파일 저장 및 DB 수정을 함께 처리하는 엔드포인트
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("강의 계획서가 성공적으로 변경되었습니다.");
        window.location.reload();
      } else {
        const errorText = await res.text();
        alert(`업로드에 실패했습니다. (상태 코드: ${res.status})\n${errorText}`);
      }
    } catch (err) {
      console.error("Syllabus upload error:", err);
      alert("서버 연결 중 오류가 발생했습니다.");
    }
  };

  // 동영상 강의 추가 처리
  const handleAddVideoSubmit = async () => {
    if (!newVideo.name || !newVideo.date || !newVideo.url || !subjectId) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const payload = {
      name: newVideo.name,
      date: newVideo.date,
      fileUrl: newVideo.url,
      subject: { subid: Number(subjectId) } // 엔티티 구조와 동일하게 객체로 전달
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("새로운 강의가 등록되었습니다.");
        setIsAddVideoModalOpen(false);
        window.location.reload();
      } else {
        const errorText = await res.text();
        alert(`강의 등록 실패: ${errorText}`);
      }
    } catch (err) {
      console.error("Add lesson error:", err);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f3e9d6] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[40px] border border-[#dfc9a2] bg-[#fef7ec] p-8 shadow-[0_30px_70px_rgba(95,69,34,0.08)]">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#8d6a44]">
                {isTeacher ? "강사 LMS" : "학생 LMS"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#3d2b1f]">강의 학습 대시보드</h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[#6d5b46]">
                수강 현황, 출석, 동영상 강의, 시험, 과제를 한 곳에서 확인하고 학습 흐름을 관리하세요.
              </p>
              {error && (
                <p className="mt-4 rounded-3xl bg-[#ffe6e1] px-4 py-3 text-sm text-[#9f2b2b] shadow-sm">
                  백엔드 연결 오류: {error}
                </p>
              )}
            </div>
            <div className="rounded-[30px] border border-[#ecd6b7] bg-[#fff5e4] px-5 py-4 text-sm leading-6 text-[#7c6445] shadow-sm">
              탭을 눌러 학습 요소를 빠르게 전환할 수 있습니다.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ${
                  activeTab === tab
                    ? "bg-[#8d6a44] text-white shadow-[0_10px_25px_rgba(141,106,68,0.24)]"
                    : "bg-[#f3e1bf] text-[#5c4326] hover:bg-[#e7cd9f]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[40px] border border-[#dfc9a2] bg-[#fff7ec] p-7 shadow-[0_30px_60px_rgba(95,69,34,0.08)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#8d6a44]">대시보드</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#3d2b1f]">학습 정보</h2>
            </div>
            <div className="rounded-full bg-[#f3e1bf] px-4 py-2 text-sm font-medium text-[#5c4326]">
              현재 선택된 탭: {activeTab}
            </div>
          </div>
          <TabPanel 
            activeTab={activeTab} 
            lessons={lessons}
            attendanceData={attendanceData}
            exams={exams}
            assignments={assignments}
            videoList={videoList}
            progressMap={progressMap}
            activeVideoId={selectedVideo?.lid}
            apiBase={API_BASE}
            sessionBaseProgress={sessionBaseProgress}
            currentSessionSeconds={currentSessionSeconds}
            onAssignmentSelect={(assignment) => setSelectedAssignment(assignment)}
            onAddAssignmentClick={() => setIsAddAssignmentModalOpen(true)}
            onVideoSelect={handleVideoSelect}
            onSyllabusUploadClick={() => syllabusInputRef.current?.click()}
            onAddVideoClick={() => setIsAddVideoModalOpen(true)}
          />
        </section>

        {/* 숨겨진 파일 입력 필드 (강의 계획서용) */}
        <input 
          type="file" 
          ref={syllabusInputRef} 
          className="hidden"
          accept="application/pdf,.pdf" // regist 페이지와 동일한 accept 설정
          onChange={handleSyllabusChange}
        />

        {/* 과제 상세 보기 (선택 시 하단에 표시) */}
        {selectedAssignment && (
          <section className="mt-6 rounded-[36px] border border-[#d7c2a1] bg-[#fff8ed] p-8 shadow-[0_30px_60px_rgba(95,69,34,0.12)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#8d6a44]">과제 상세 정보</p>
                <h2 className="mt-2 text-3xl font-bold text-[#3d2b1f]">{selectedAssignment.form}</h2>
                <p className="mt-1 text-red-600 font-semibold">마감기한: {selectedAssignment.dueDate}</p>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="rounded-full bg-[#8d6a44] px-6 py-2 text-sm font-bold text-white hover:bg-[#7c5935]"
              >
                목록으로
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-[#e6d1a7]">
              {isTeacher ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#3d2b1f] border-b pb-2">학생 제출 현황</h3>
                  <p className="text-sm text-[#7b6346] italic">* 실제 제출된 파일 목록과 점수 입력 기능은 DB 연동 후 활성화됩니다.</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-[#fcf7f0]">
                        <tr>
                          <th className="p-3">학생명</th>
                          <th className="p-3">제출 파일</th>
                          <th className="p-3">점수</th>
                          <th className="p-3">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">예시 학생</td>
                          <td className="p-3 text-blue-600 underline cursor-pointer">assignment_v1.pdf</td>
                          <td className="p-3"><input type="text" placeholder="점수" className="w-16 border rounded p-1" /></td>
                          <td className="p-3"><button className="text-xs bg-[#3d2b1f] text-white px-2 py-1 rounded">저장</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#3d2b1f]">내 과제 제출</h3>
                  <div className="flex flex-col gap-4 p-6 bg-[#fcf7f0] rounded-xl border-2 border-dashed border-[#d6c2a8] items-center">
                    <p className="text-[#7b6346]">Word, PDF 등 문서 파일을 선택해주세요.</p>
                    <input 
                      type="file" 
                      className="text-sm text-[#8d6a44] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8d6a44] file:text-white hover:file:bg-[#7c5935]"
                      onChange={handleAssignmentFileUpload}
                      accept=".doc,.docx,.pdf"
                    />
                  </div>
                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <p className="text-sm">현재 점수: <span className="font-bold text-[#8d6a44]">{selectedAssignment.grade || "평가 전"}</span></p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 과제 추가 모달 */}
        {isAddAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[32px] bg-[#fff4e6] p-8 shadow-2xl border-2 border-[#e6d1a7] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">새 과제 생성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">과제 제목</label>
                  <input 
                    type="text" 
                    placeholder="과제 제목을 입력하세요"
                    className="w-full rounded-xl border border-[#e6d1a7] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d6a44]"
                    value={newAssignment.form}
                    onChange={(e) => setNewAssignment({ ...newAssignment, form: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">마감 일자</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-[#e6d1a7] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d6a44]"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#f1e1c4]"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddAssignmentSubmit}
                  className="rounded-full bg-[#8d6a44] px-6 py-2 text-sm font-bold text-white hover:bg-[#7c5935] shadow-md"
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 동영상 추가 모달 */}
        {isAddVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[32px] bg-[#fff4e6] p-8 shadow-2xl border-2 border-[#e6d1a7] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">동영상 강의 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의명</label>
                  <input 
                    type="text" 
                    placeholder="강의 제목을 입력하세요"
                    className="w-full rounded-xl border border-[#e6d1a7] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d6a44]"
                    value={newVideo.name}
                    onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의 일자</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-[#e6d1a7] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d6a44]"
                    value={newVideo.date}
                    onChange={(e) => setNewVideo({ ...newVideo, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">유튜브 URL</label>
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-[#e6d1a7] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8d6a44]"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#f1e1c4]"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddVideoSubmit}
                  className="rounded-full bg-[#8d6a44] px-6 py-2 text-sm font-bold text-white hover:bg-[#7c5935] shadow-md"
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedVideo && (
          <section className="mt-6 rounded-[36px] border border-[#d7c2a1] bg-[#fff8ed] p-6 shadow-[0_30px_60px_rgba(95,69,34,0.12)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#8c6f4d]">재생 중</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#3d2b1f]">{selectedVideo.name}</h2>
              </div>
              <button
                onClick={async () => { 
                  setIsPlaying(false); // 인터벌 중단
                  await saveVideoProgress(); // 진행도 계산 및 맵 업데이트 대기
                  setSelectedVideo(null); // 비디오 닫기
                }}
                className="rounded-full bg-[#8d6a44] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[#7c5935]"
              >
                닫기
              </button>
            </div>
            {selectedVideo.fileUrl.includes('youtube.com') || selectedVideo.fileUrl.includes('youtu.be') ? (
              <div className="aspect-video w-full overflow-hidden rounded-[24px] bg-black">
                <div id="youtube-player" className="h-full w-full"></div>
              </div>
            ) : (
              <video
                ref={videoRef}
                controls
                className="w-full rounded-[24px] bg-black"
                onPlay={() => setIsPlaying(true)}
                onPause={() => {
                  setIsPlaying(false);
                  saveVideoProgress();
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  saveVideoProgress();
                }}
                src={`${API_BASE.replace('/api', '')}${selectedVideo.fileUrl}`}
              >
                브라우저가 동영상을 지원하지 않습니다.
              </video>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

// 유튜브 ID 추출을 위한 헬퍼 함수
function extractYouTubeId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}
