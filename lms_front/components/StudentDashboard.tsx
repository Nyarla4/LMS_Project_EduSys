"use client";

import { useState, useEffect, useRef } from "react";

const tabs = [
  "강의 계획서",
  "출석 현황",
  "동영상 강의",
  "시험 정보",
  "과제 목록",
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
                <tr key={item.date} className="hover:bg-[#fff6eb]">
                  <td className="px-4 py-4">{item.date}</td>
                  <td className="px-4 py-4">{item.status}</td>
                  <td className="px-4 py-4">{item.note}</td>
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
              const savedTime = progressMap[video.id] || 0;
              const sessionTime = (activeVideoId === video.id) ? currentSessionSeconds : 0;
              const totalWatched = savedTime + sessionTime;
              const percentage = video.duration > 0 
                ? Math.min(100, Math.floor((totalWatched / video.duration) * 100)) 
                : 0;

              return (
                <article 
                  key={video.id} 
                  className="cursor-pointer rounded-[28px] border border-[#f0debe] bg-[#fff8ef] p-5 transition duration-200 hover:border-[#d6b77a] hover:bg-[#f6e8d6]"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#3d2b1f]">{video.title}</h3>
                        <p className="mt-2 text-sm text-[#7b6346]">{video.week}주차 학습 영상</p>
                      </div>
                      <span className="rounded-full bg-[#e8d1a5] px-3 py-1 text-xs font-bold text-[#5c4326]">{percentage}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 overflow-hidden rounded-full bg-[#eedfc2]">
                        <div className="h-full rounded-full bg-[#8d6a44] transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-xs text-[#7b6346]">총 {video.duration}초 중 {Math.floor((totalWatched/60))}분 {totalWatched % 60}초 시청</p>
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
                <tr key={exam.name} className="hover:bg-[#fff6eb]">
                  <td className="px-4 py-4">{exam.name}</td>
                  <td className="px-4 py-4">{exam.date}</td>
                  <td className="px-4 py-4">{exam.status}</td>
                  <td className="px-4 py-4">{exam.score}</td>
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
              <tr key={assignment.title} className="hover:bg-[#fff6eb]">
                <td className="px-4 py-4">{assignment.title}</td>
                <td className="px-4 py-4">{assignment.dueDate}</td>
                <td className="px-4 py-4">{assignment.status}</td>
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
          fetch(`${API_BASE}/lessons`, { headers }), // LessonVideo가 통합되었으므로 lessons에서 가져옴
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
        if (data && videoRef.current) {
          videoRef.current.currentTime = data.progress; // 마지막 재생 위치로 이동
        }
      }
    } catch (e) {
      console.log("기존 진행 정보가 없습니다.");
    }
  };

  const saveVideoProgress = async () => {
    if (selectedVideo && sessionWatched > 0) {
      // 현재 재생 위치를 저장 (누적 시청 시간이 아닌 마지막 재생 위치)
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await fetch(`${API_BASE}/progresses/update?studentId=${studentId}&videoId=${selectedVideo.id}&lastTime=${currentTime}`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // 로컬 상태 업데이트
      setProgressMap(prev => ({
        ...prev,
        [selectedVideo.id]: currentTime // progressMap도 마지막 재생 위치로 업데이트
      }));
      setSessionWatched(0); // 저장 후 세션 시간 초기화
    }
  };

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
            activeVideoId={selectedVideo?.id}
            currentSessionSeconds={sessionWatched}
            onVideoSelect={handleVideoSelect}
          />
        </section>

        {selectedVideo && (
          <section className="mt-6 rounded-[36px] border border-[#d7c2a1] bg-[#fff8ed] p-6 shadow-[0_30px_60px_rgba(95,69,34,0.12)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#8c6f4d]">재생 중</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#3d2b1f]">{selectedVideo.title}</h2>
              </div>
              <button
                onClick={() => { saveVideoProgress(); setSelectedVideo(null); }}
                className="rounded-full bg-[#8d6a44] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[#7c5935]"
              >
                닫기
              </button>
            </div>
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
          </section>
        )}
      </div>
    </main>
  );
}
