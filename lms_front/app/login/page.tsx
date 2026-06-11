"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const form = e.currentTarget;
        const loginid = (form.elements.namedItem("loginid") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const res = await fetch("http://localhost:8080/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginid, password }),
            });

            const contentType = res.headers.get("content-type");
            
            let data = null;
            
            if (contentType?.includes("application/json")) {
                data = await res.json();
            }

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                localStorage.setItem("loginId", data.loginId);
                
                window.location.href = "/";
            } else {
                setError(data.message || "로그인 정보가 일치하지 않습니다.");
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
                    <h2 className="text-3xl font-extrabold tracking-tight">EduSys 로그인</h2>
                    <p className="mt-2 text-sm text-[#8b5e3c]">
                        학습 관리 시스템에 오신 것을 환영합니다
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md">
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

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="loginid" className="block text-sm font-bold mb-1 ml-1">사용자 ID</label>
                            <input
                                id="loginid"
                                name="loginid"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[#d6c2a8] placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:z-10 sm:text-sm transition-all"
                                placeholder="아이디를 입력하세요"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold mb-1 ml-1">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[#d6c2a8] placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-[#8b5e3c] focus:border-[#8b5e3c] focus:z-10 sm:text-sm transition-all"
                                placeholder="비밀번호를 입력하세요"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${loading ? 'bg-[#b89b7a]' : 'bg-[#8b5e3c] hover:bg-[#6f4a2f]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] transition-all shadow-md active:scale-[0.98]`}
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </button>
                    </div>
                </form>

                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm border-t border-[#d6c2a8] w-full pt-4 text-center">
                        <span className="text-gray-500">계정이 없으신가요?</span>
                        <Link href="/signup" className="ml-2 font-bold text-[#8b5e3c] hover:text-[#6f4a2f] hover:underline transition-colors">
                            회원가입 하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}