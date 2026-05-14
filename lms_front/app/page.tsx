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
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">

        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#8b5e3c] rounded-full"></span>
            최근 공지사항
          </h2>
          <ul className="space-y-3">
            {notices.map((notice: any) => (
              <li key={notice.nid} className="border-b border-[#e7d7c1] pb-2 last:border-0">
                <Link
                  href={`/notices/${notice.nid}`}
                  className="hover:text-[#8b5e3c] transition-colors font-medium"
                >
                  • {notice.title}
                </Link>
              </li>
            ))}
          </ul>
          {notices.length > 0 && (
            <div className="flex justify-end mt-4">
              <Link href="/notices" className="text-sm font-bold text-[#8b5e3c] hover:underline">
                더보기 +
              </Link>
            </div>
          )}
        </div>

        {/* 사용자 타입별 대시보드 */}
        {user && user.user && user.user.usertype === 'S' && (
          <main className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-10 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
                <span className="bg-[#dbc7b1] text-[#5c4033] px-4 py-1 rounded-full text-sm font-bold border border-[#b89b7a]">학생용</span>
              </div>
              <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
                EduSys 학생 LMS
              </p>

              <p className="max-w-3xl text-lg leading-8 text-[#5c4033] text-center mx-auto">
                학생용 학습 대시보드를 만들었습니다. 강의 계획서, 출석, 동영상 강의, 시험, 과제 탭을 통해 수업 정보를 확인하세요.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Link
                href="/student"
                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-5 rounded-xl text-lg font-bold text-center transition-colors shadow-md flex items-center justify-center"
              >
                학생 LMS 페이지로 이동
              </Link>

              <div className="bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[#5c4033]">학생용 주요 탭</h2>
                <ul className="mt-4 space-y-2 text-[#5c4033] font-medium">
                  <li>• 강의 계획서 (Syllabus)</li>
                  <li>• 출석 관리 (Attendance)</li>
                  <li>• 동영상 강의 (Video Lectures)</li>
                  <li>• 시험 정보 (Exam)</li>
                  <li>• 과제 목록 (Assignments)</li>
                </ul>
              </div>
            </div>
          </main>
        )}

        {user && user.user && user.user.usertype === 'T' && (
          <main className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-10 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
                <span className="bg-[#dbc7b1] text-[#5c4033] px-4 py-1 rounded-full text-sm font-bold border border-[#b89b7a]">교사용</span>
              </div>
              <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
                EduSys 교사 LMS
              </p>
              <p className="max-w-3xl text-lg leading-8 text-[#5c4033] text-center mx-auto">
                교사용 학습 대시보드입니다. 강의 관리 및 학생 성적을 관리할 수 있습니다.
              </p>
            </div>

            <Link
              href="/myClasses"
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-5 rounded-xl text-lg font-bold text-center transition-colors shadow-md max-w-md mx-auto w-full"
            >
              강의 관리 페이지로 이동
            </Link>
          </main>
        )}

        {user && user.usertype === 'A' && (
          <main className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-10 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={80} height={16} priority />
                <span className="bg-[#8b5e3c] text-white px-4 py-1 rounded-full text-sm font-bold">관리자용</span>
              </div>
              <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
                EduSys 관리자 LMS
              </p>
              <p className="max-w-3xl text-lg leading-8 text-[#5c4033] text-center mx-auto">
                시스템 전체 사용자 및 데이터를 관리하는 대시보드입니다.
              </p>
            </div>

            <Link
              href="/users"
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-5 rounded-xl text-lg font-bold text-center transition-colors shadow-md max-w-md mx-auto w-full"
            >
              사용자 관리 페이지로 이동
            </Link>
          </main>
        )}
      </div>
    </div>
  );
}