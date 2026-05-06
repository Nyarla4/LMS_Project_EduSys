"use client";

import { useState, useEffect } from "react";

const tabs = [
  "Syllabus",
  "Attendance",
  "Video Lectures",
  "Exam",
  "Assignments",
] as const;

type Tab = (typeof tabs)[number];

interface Lecture {
  id: number;
  title: string;
  description: string;
  instructor: string;
}

const syllabusData = [
  { week: "1주차", topic: "LMS 소개 및 사용법", summary: "학습 플랫폼 구조와 기능을 이해합니다." },
  { week: "2주차", topic: "강의 콘텐츠 탐색", summary: "강의 계획서, 강의 영상, 과제 및 시험 탭을 확인합니다." },
  { week: "3주차", topic: "출석 관리 및 진도", summary: "출석 현황과 진도를 직접 확인합니다." },
  { week: "4주차", topic: "시험 준비", summary: "시험 일정과 성적 정보를 확인합니다." },
];

const attendanceData = [
  { date: "2026-04-01", status: "출석", note: "정상 참석" },
  { date: "2026-04-08", status: "출석", note: "온라인 출석" },
  { date: "2026-04-15", status: "결석", note: "유고결석" },
  { date: "2026-04-22", status: "출석", note: "지각" },
];

const videos = [
  { title: "LMS 시스템 개요", duration: "12:30", progress: "100%" },
  { title: "강의 계획서 활용하기", duration: "08:10", progress: "75%" },
  { title: "과제 제출 흐름", duration: "09:45", progress: "50%" },
  { title: "시험 응시 가이드", duration: "06:20", progress: "0%" },
];

const exams = [
  { name: "중간고사", date: "2026-05-12", status: "예정", score: "-" },
  { name: "퀴즈 1", date: "2026-04-28", status: "완료", score: "88" },
  { name: "기말고사", date: "2026-06-18", status: "예정", score: "-" },
];

const assignments = [
  { title: "강의 계획서 분석", dueDate: "2026-05-05", status: "제출 완료" },
  { title: "출석 체크 보고서", dueDate: "2026-05-10", status: "진행 중" },
  { title: "동영상 강의 요약", dueDate: "2026-05-17", status: "대기 중" },
];

function TabPanel({ activeTab, lectures }: { activeTab: Tab; lectures: Lecture[] }) {
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
          {videos.map((video) => (
            <article key={video.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{video.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">길이: {video.duration}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                  {video.progress}
                </span>
              </div>
            </article>
          ))}
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
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/lectures');
        if (!response.ok) {
          throw new Error('Failed to fetch lectures');
        }
        const data = await response.json();
        setLectures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching lectures:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

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

        <TabPanel activeTab={activeTab} lectures={lectures} />
      </div>
    </main>
  );
}
