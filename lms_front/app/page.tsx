import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans text-slate-900 dark:bg-black">
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
    </div>
  );
}
