"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (newPassword.length < 4 || newPassword.length > 16) {
      setError("새 비밀번호는 4자 이상 16자 이하로 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch("http://localhost:8080/user/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const contentType = res.headers.get("content-type");
      let data = null;
      if (contentType?.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setSuccess("비밀번호가 성공적으로 변경되었습니다.");
        setTimeout(() => {
          router.push("/mypage");
        }, 1500);
      } else {
        setError(data?.message || "현재 비밀번호가 일치하지 않거나 변경에 실패했습니다.");
      }
    } catch (err) {
      setError("서버 연결 오류입니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#5c4033]">
      <div className="max-w-md w-full space-y-8 bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-2xl p-10 shadow-sm">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">비밀번호 변경</h2>
          <p className="mt-2 text-sm text-[#8b5e3c]">
            안전한 정보 보호를 위해 비밀번호를 수정합니다
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-bold mb-1 ml-1">현재 비밀번호</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={loading}
                className="appearance-none relative block w-full px-4 py-3 border border-[#d6c2a8] placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:z-10 sm:text-sm transition-all bg-white/50"
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold mb-1 ml-1">새 비밀번호</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                disabled={loading}
                minLength={4}
                maxLength={16}
                className="appearance-none relative block w-full px-4 py-3 border border-[#d6c2a8] placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:z-10 sm:text-sm transition-all bg-white/50"
                placeholder="새 비밀번호를 입력하세요 (4~16자)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold mb-1 ml-1">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={loading}
                minLength={4}
                maxLength={16}
                className="appearance-none relative block w-full px-4 py-3 border border-[#d6c2a8] placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:z-10 sm:text-sm transition-all bg-white/50"
                placeholder="새 비밀번호를 다시 한번 입력하세요"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${loading ? 'bg-[#b89b7a]' : 'bg-[#8b5e3c] hover:bg-[#6f4a2f]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] transition-all shadow-md active:scale-[0.98]`}
            >
              {loading ? "변경 중..." : "비밀번호 변경 완료"}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm border-t border-[#d6c2a8] w-full pt-4 text-center">
            <Link href="/mypage" className="font-bold text-[#8b5e3c] hover:text-[#6f4a2f] hover:underline transition-colors">
              마이페이지로 돌아가기
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}