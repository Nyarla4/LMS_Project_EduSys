"use client";

import { useState, useEffect, useRef } from "react";

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

interface Lesson {
  lid: number;
  name: string;
  date: string;
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
  sessionBaseProgress,
  currentSessionSeconds,
  onVideoSelect 
}: { 
  activeTab: Tab; 
  lessons: Lesson[];
  attendanceData: Attendance[];
  exams: Exam[];
  assignments: Assignment[];
  videoList: Video[];
  progressMap: Record<number, number>;
  activeVideoId?: number;
  sessionBaseProgress: number;
  currentSessionSeconds: number;
  onVideoSelect: (video: Video) => void;
}) {
  if (activeTab === "강의 계획서") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#3d2b1f]">강의 계획서 미리보기</h2>
            <p className="mt-2 text-sm text-[#7b6346]">과목별 수업 계획서를 내려받거나 바로 확인할 수 있습니다.</p>
          </div>
          <a 
            href="http://localhost:8080/api/files/syllabus.pdf" 
            className="inline-flex items-center rounded-full bg-[#8d6a44] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c5935]"
            download
          >
            파일 다운로드
          </a>
        </div>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-[#f1e1c4] bg-[#fbf1e8]">
          <iframe
            src="http://localhost:8080/api/files/syllabus.pdf"
            width="100%"
            height="100%"
            title="Syllabus PDF Viewer"
            className="h-full w-full"
          >
            이 브라우저는 iframe을 지원하지 않습니다.
          </iframe>
        </div>
      </section>
    );
  }

  if (activeTab === "출석 현황") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <h2 className="mb-4 text-2xl font-semibold text-[#3d2b1f]">출석 현황</h2>
        <div className="overflow-x-auto rounded-[28px] border border-[#f0debe] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e9d7b0] text-left text-sm text-[#5c4b38]">
            <thead className="bg-[#f7ecd9] text-[#6d5b46]">
              <tr>
                <th className="px-4 py-4">날짜</th>
                <th className="px-4 py-4">상태</th>
                <th className="px-4 py-4">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9d7b0] bg-white">
              {attendanceData.map((item) => (
                <tr key={item.aid} className="hover:bg-[#fff6eb]">
                  <td className="px-4 py-4">{item.date}</td>
                  <td className="px-4 py-4">{item.whether ? "출석" : "결석"}</td>
                  <td className="px-4 py-4">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (activeTab === "동영상 강의") {
    return (
      <section className="rounded-[32px] border border-[#e6d1a7] bg-[#fff4e6] p-6 shadow-[0_20px_45px_rgba(95,69,34,0.08)]">
        <h2 className="mb-4 text-2xl font-semibold text-[#3d2b1f]">동영상 강의</h2>
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
                      <span className="rounded-full bg-[#e8d1a5] px-3 py-1 text-xs font-bold text-[#5c4326]">{percentage}%</span>
                    </div>
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
      <h2 className="mb-4 text-2xl font-semibold text-[#3d2b1f]">과제 목록</h2>
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
            {assignments.map((assignment) => (
              <tr key={assignment.wid} className="hover:bg-[#fff6eb]">
                <td className="px-4 py-4">{assignment.form}</td>
                <td className="px-4 py-4">{assignment.dueDate}</td>
                <td className="px-4 py-4">{assignment.grade || "제출전"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("강의 계획서");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [sessionBaseProgress, setSessionBaseProgress] = useState(0); // 현재 시청 세션 시작 시점의 DB 진도
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0); // 현재 세션 순수 시청 시간
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null); // 유튜브 플레이어 인스턴스 저장용
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  const [studentId, setStudentId] = useState<number | null>(null); 
  const API_BASE = "http://localhost:8080/api";

  // 1. 컴포넌트 로드 시 토큰에서 실제 학생 ID(sid) 추출
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        // 백엔드 토큰에 저장된 학생 고유 번호(예: sid)를 상태에 반영
        if (payload.sid) setStudentId(Number(payload.sid));
        else setStudentId(1); // 폴백용
      } catch (e) {
        setStudentId(1);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (studentId === null) return; // ID가 확인될 때까지 대기

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        // 중복되는 /lessons 호출을 제거하고 하나로 통합
        const [lessonRes, attRes, examRes, assignRes, progRes] = await Promise.all([
          fetch(`${API_BASE}/lessons`, { headers }),
          fetch(`${API_BASE}/attendances`, { headers }), 
          fetch(`${API_BASE}/exams`, { headers }),        
          fetch(`${API_BASE}/assignments`, { headers }),
          fetch(`${API_BASE}/progresses/student/${studentId}`, { headers })
        ]);
        
        if (!lessonRes.ok) {
          const errText = await lessonRes.text();
          throw new Error(`강의 로드 실패 (${lessonRes.status}): ${errText.substring(0, 50)}`);
        }

        const lessonData = await lessonRes.json();
        setLessons(lessonData);
        setVideoList(lessonData); // 통합된 Lesson 데이터를 비디오 리스트로도 사용

        if (attRes.ok) setAttendanceData(await attRes.json());
        if (examRes.ok) setExams(await examRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
        
        if (progRes.ok) {
          const progs = await progRes.json();
          const map: Record<number, number> = {};
          progs.forEach((p: any) => { 
            // ProgressController에서 "progress"라는 키로 데이터를 보내고 있으므로 이를 우선적으로 확인합니다.
            const lid = p.lesson?.lid || p.lid || p.videoId || p.lessonId;
            if (lid) {
              map[lid] = p.progress ?? p.progressed ?? 0;
            }
          });
          setProgressMap(map);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]); // studentId가 결정되면 데이터를 불러옴

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
    if (isPlaying && selectedVideo) {
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
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/progresses/student/${studentId}/video/${video.lid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      let resumeTime = 0;
      if (res.ok) {
        const data = await res.json();
        // 엔티티 직접 반환 시에는 progressed 필드를 사용합니다.
        const latestProgress = data.progressed ?? data.progress ?? 0;
        setSessionBaseProgress(latestProgress);
        // 개별 진도 조회 시에도 전체 맵을 최신화하여 리스트의 진행률 표시와 동기화합니다.
        setProgressMap(prev => ({ ...prev, [video.lid]: latestProgress }));
      }

      // 쿠키에서 실제 마지막으로 보던 물리적 위치 가져오기
      const cookieResume = getCookie(`video_resume_${video.lid}`);
      if (cookieResume) resumeTime = parseInt(cookieResume);

      // 이어보기 위치가 영상 길이를 초과하지 않도록 보정
      if (video.duration > 0 && resumeTime >= video.duration) {
        resumeTime = 0; 
      }

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
    } catch (e) {
      console.log("기존 진행 정보가 없습니다.");
    }
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
    
    if (selectedVideo && (currentSession > 0 || sessionTime === undefined)) {
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

      // 3. 쿠키에는 영상의 실제 물리적 재생 위치(Seek point) 저장 (이어보기용)
      let physicalTime = 0;
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        physicalTime = Math.floor(ytPlayerRef.current.getCurrentTime());
      } else if (videoRef.current) {
        physicalTime = Math.floor(videoRef.current.currentTime);
      }
      
      if (physicalTime > 0) {
        setCookie(`video_resume_${selectedVideo.lid}`, physicalTime.toString(), 7);
      }
    }
  };

// 쿠키 제어를 위한 헬퍼 함수
function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  if (typeof document !== "undefined") {
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
  return (
    <main className="min-h-screen bg-[#f3e9d6] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[40px] border border-[#dfc9a2] bg-[#fef7ec] p-8 shadow-[0_30px_70px_rgba(95,69,34,0.08)]">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#8d6a44]">학생 LMS</p>
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
            sessionBaseProgress={sessionBaseProgress}
            currentSessionSeconds={currentSessionSeconds}
            onVideoSelect={handleVideoSelect}
          />
        </section>

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
