"use client";

import { useState, useEffect, useRef } from "react";

const tabs = [
  "Syllabus",
  "Attendance",
  "Video Lectures",
  "Exam",
  "Assignments",
] as const;

type Tab = (typeof tabs)[number];

interface Lesson {
  id: number;
  title: string;
  description: string;
  instructor: string;
}

interface Attendance {
  date: string;
  status: string;
  note: string;
}

interface Exam {
  name: string;
  date: string;
  status: string;
  score: string;
}

interface Assignment {
  title: string;
  dueDate: string;
  status: string;
}

interface Video {
  id: number;
  title: string;
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
  currentSessionSeconds: number;
  onVideoSelect: (video: Video) => void;
}) {
  if (activeTab === "Syllabus") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">강의 계획서 미리보기</h2>
          <a 
            href="http://localhost:8080/api/files/syllabus.pdf" 
            className="text-sm font-medium text-blue-600 hover:underline"
            download
          >
            파일 다운로드
          </a>
        </div>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {/* 브라우저 내장 PDF 뷰어를 사용하여 PDF 파일 렌더링 */}
          <iframe
            src="http://localhost:8080/api/files/syllabus.pdf"
            width="100%"
            height="100%"
            title="Syllabus PDF Viewer"
          >
            이 브라우저는 iframe을 지원하지 않습니다.
          </iframe>
        </div>
      </section>
    );
  }

  if (activeTab === "Attendance") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">출석 현황</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">날짜</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {attendanceData.map((item) => (
                <tr key={item.date} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (activeTab === "Video Lectures") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">동영상 강의</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {videoList.length > 0 ? (
            videoList.map((video) => {
              // 기존 저장된 시간 + 현재 세션에서 시청 중인 시간 합산
              const savedTime = progressMap[video.id] || 0;
              const sessionTime = (activeVideoId === video.id) ? currentSessionSeconds : 0;
              const totalWatched = savedTime + sessionTime;
              const percentage = video.duration > 0 
                ? Math.min(100, Math.floor((totalWatched / video.duration) * 100)) 
                : 0;

              return (
                <article 
                  key={video.id} 
                  className="cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{video.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{video.week}주차 학습 영상</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600">{percentage}%</span>
                    </div>
                    {/* 진행 바 UI */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="col-span-2 py-8 text-center text-slate-500">
              현재 등록된 동영상 강의가 없습니다. (백엔드 데이터를 확인해주세요)
            </p>
          )}
        </div>
      </section>
    );
  }

  if (activeTab === "Exam") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">시험 정보</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">시험명</th>
                <th className="px-4 py-3">일정</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {exams.map((exam) => (
                <tr key={exam.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{exam.name}</td>
                  <td className="px-4 py-3">{exam.date}</td>
                  <td className="px-4 py-3">{exam.status}</td>
                  <td className="px-4 py-3">{exam.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">과제 목록</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">과제명</th>
              <th className="px-4 py-3">마감일</th>
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {assignments.map((assignment) => (
              <tr key={assignment.title} className="hover:bg-slate-50">
                <td className="px-4 py-3">{assignment.title}</td>
                <td className="px-4 py-3">{assignment.dueDate}</td>
                <td className="px-4 py-3">{assignment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Syllabus");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [sessionWatched, setSessionWatched] = useState(0); // 스탑워치 상태
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [studentId, setStudentId] = useState<number>(1); // 실제 운영 시 로그인 정보에서 추출
  const API_BASE = "http://localhost:8080/api"; // 서버 포트가 8081이라면 여기를 8081로 수정하세요.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        const [lessonRes, vidRes, attRes, examRes, assignRes, progRes] = await Promise.all([
          fetch(`${API_BASE}/lessons`, { headers }),
          fetch(`${API_BASE}/lesson-videos`, { headers }),
          fetch(`${API_BASE}/attendances`, { headers }), 
          fetch(`${API_BASE}/exams`, { headers }),        
          fetch(`${API_BASE}/assignments`, { headers }),
          fetch(`${API_BASE}/progresses/student/${studentId}`, { headers })
        ]);
        
        if (!lessonRes.ok) throw new Error(`강의 목록 로드 실패 (상태 코드: ${lessonRes.status})`);
        if (!vidRes.ok) throw new Error(`비디오 목록 로드 실패 (상태 코드: ${vidRes.status})`);

        setLessons(await lessonRes.json());
        setVideoList(await vidRes.json());
        if (attRes.ok) setAttendanceData(await attRes.json());
        if (examRes.ok) setExams(await examRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
        
        if (progRes.ok) {
          const progs = await progRes.json();
          const map: Record<number, number> = {};
          progs.forEach((p: any) => { 
            // progress 필드를 '누적 시청 초'로 활용
            map[p.videoId] = p.progress; 
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
  }, []);

  // 스탑워치 로직: 영상이 재생 중일 때 1초마다 sessionWatched 증가
  useEffect(() => {
    let interval: NodeJS.Timeout | number;
    if (isPlaying && selectedVideo) {
      interval = setInterval(() => {
        setSessionWatched((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedVideo]);

  const handleVideoSelect = async (video: Video) => {
    setSessionWatched(0); // 새로운 영상 선택 시 스탑워치 초기화
    setSelectedVideo(video);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/progresses/student/${studentId}/video/${video.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // 위치 이동(Seek)은 필요 시 여기서 처리 (여기서는 시청량 계산에 집중)
      }
    } catch (e) {
      console.log("기존 진행 정보가 없습니다.");
    }
  };

  const saveVideoProgress = async () => {
    if (selectedVideo && sessionWatched > 0) {
      // 기존 누적 시간 + 이번에 본 시간
      const newTotalTime = (progressMap[selectedVideo.id] || 0) + sessionWatched;
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await fetch(`${API_BASE}/progresses/update?studentId=${studentId}&videoId=${selectedVideo.id}&lastTime=${newTotalTime}`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // 로컬 상태 업데이트
      setProgressMap(prev => ({
        ...prev,
        [selectedVideo.id]: newTotalTime
      }));
      setSessionWatched(0); // 저장 후 세션 시간 초기화
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">학생 LMS</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">강의 학습 관리</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                강의 계획서, 출석, 동영상 강의, 시험, 과제를 한 곳에서 확인할 수 있도록 구성된 학생용 학습 대시보드입니다.
              </p>
              {error && (
                <p className="mt-2 text-sm text-red-600">백엔드 연결 오류: {error}</p>
              )}
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 shadow-sm">
              아래 탭을 눌러 학습 요소를 전환하세요.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-slate-950 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {selectedVideo && (
          <section className="rounded-3xl border border-slate-200 bg-black p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between text-white">
              <h2 className="text-lg font-semibold">{selectedVideo.title} 재생 중</h2>
              <button onClick={() => { saveVideoProgress(); setSelectedVideo(null); }} className="text-sm opacity-80 hover:opacity-100">닫기</button>
            </div>
            <video
              ref={videoRef}
              controls
              className="w-full rounded-xl"
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
          </section>
        )}

        <TabPanel 
          activeTab={activeTab} 
          lessons={lessons}
          attendanceData={attendanceData}
          exams={exams}
          assignments={assignments}
          videoList={videoList}
          progressMap={progressMap}
          activeVideoId={selectedVideo?.id}
          currentSessionSeconds={sessionWatched}
          onVideoSelect={handleVideoSelect}
        />
      </div>
    </main>
  );
}
