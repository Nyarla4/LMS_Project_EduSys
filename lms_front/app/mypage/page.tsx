"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";
import Link from "next/link";

export default function MyPage() {
  const { user, loading } = useUser(); // loading 상태를 같이 가져오세요.
  const router = useRouter();

  useEffect(() => {
    // 로딩이 끝났는데 유저가 없다면 로그인으로 강제 이동
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex flex-col items-center justify-center font-sans text-[#5c4033]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#d6c2a8] border-t-[#8b5e3c] mb-4"></div>
        <p className="text-sm font-medium text-[#8b5e3c]">인증 확인 중...</p>
      </div>
    );
  }

  if (!user) return null;  // 리다이렉트 중에는 아무것도 보여주지 않음

  const username = user.user?.username || user.username;
  const loginid = user.user?.loginid || user.loginid;
  
  const rawUsertype = user.user?.usertype || user.usertype;
  let usertypeKorean = "일반 회원";

  if (rawUsertype === "T") usertypeKorean = "교사";
  else if (rawUsertype === "S") usertypeKorean = "학생";
  else if (rawUsertype === "A") usertypeKorean = "관리자";
  else if (rawUsertype) usertypeKorean = rawUsertype;

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#5c4033]">
      <div className="max-w-md w-full space-y-8 bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-2xl p-10 shadow-sm">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">마이페이지</h2>
          <p className="mt-2 text-sm text-[#8b5e3c]">
            내 계정을 관리하세요
          </p>
        </div>

        <div className="mt-8 bg-white/60 border border-[#d6c2a8]/60 rounded-xl p-6 space-y-4 shadow-inner">
          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">이름</span>
            <span className="text-base font-medium text-gray-900">{username}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-[#d6c2a8]/40">
            <span className="text-sm font-bold text-[#8b5e3c]">사용자 ID</span>
            <span className="text-base font-medium text-gray-900">{loginid}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#8b5e3c]">회원 유형</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#edf2f7] border border-[#d6c2a8] text-[#8b5e3c]">
              {usertypeKorean}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-2">
          <Link
            href="/change-password" 
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#8b5e3c] hover:bg-[#6f4a2f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] transition-all text-center shadow-md active:scale-[0.98]"
          >
            비밀번호 변경하기
          </Link>
        </div>

      </div>
    </div>
  );
}