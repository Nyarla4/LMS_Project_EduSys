"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "./userContext";

export default function Home() {
  const { user } = useUser();
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeRes = await fetch("http://localhost:8080/api/notices");

        // 1. 204 No Content 응답 처리 (실행 흐름 분기)
        if (noticeRes.status === 204) {
          setNotices([]); // 빈 배열로 상태 초기화
          return; // 이후의 .json() 호출을 막음
        }

        // 2. 응답이 성공적(200 OK 등)인 경우에만 파싱 진행
        if (!noticeRes.ok) throw new Error("서버 응답 오류");

        const notices = await noticeRes.json();
        setNotices(notices);

      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };

    fetchNotices();
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans text-slate-900 dark:bg-black">
      <ul>
        {notices.map((notice: any) => (
          <li key={notice.nid}>
            <Link href={`/notices/${notice.nid}`} style={{ textDecoration: 'none', color: 'blue' }}>
              {notice.title}
            </Link>
          </li>
        ))}
      </ul>
      {notices.length > 0 && <a href="/notices">더보기</a>}
      {user && user.user && user.user.usertype === 'S' &&
        <main className="flex w-full max-w-4xl flex-col gap-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">EduSys 학생 LMS</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              학생용 학습 대시보드를 만들었습니다. 강의 계획서, 출석, 동영상 강의, 시험, 과제 탭을 통해 수업 정보를 확인하세요.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/student"
              className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-center text-white transition hover:bg-slate-800"
            >
              학생 LMS 페이지로 이동
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">학생용 주요 탭</h2>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li>• 강의 계획서 (Syllabus)</li>
                <li>• 출석 관리 (Attendance)</li>
                <li>• 동영상 강의 (Video Lectures)</li>
                <li>• 시험 정보 (Exam)</li>
                <li>• 과제 목록 (Assignments)</li>
              </ul>
            </div>
          </div>
        </main>
      }{user && user.user && user.user.usertype === 'T' &&
        <main className="flex w-full max-w-4xl flex-col gap-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">EduSys 교사 LMS</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              교사용 학습 대시보드입니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/myClasses"
              className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-center text-white transition hover:bg-slate-800"
            >
              강의 관리 페이지로 이동
            </Link>
          </div>
        </main>
      }
      {user && user.usertype === 'A' &&
        <main className="flex w-full max-w-4xl flex-col gap-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">EduSys 관리자 LMS</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              관리자용 대시보드입니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/users"
              className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-center text-white transition hover:bg-slate-800"
            >
              사용자 관리 페이지로 이동
            </Link>
          </div>
        </main>
      }
    </div>
  );
}