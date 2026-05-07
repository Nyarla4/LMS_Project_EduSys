"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const loginid = (form.elements.namedItem("loginid") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        try {
            const res = await fetch("http://localhost:8686/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginid, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                
                window.location.href = "/";
            } else {
                setError(data.message || "로그인 실패");
            }
        } catch (err) {
            setError("서버 연결 오류입니다.");
        }
    }

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
            <div className="card shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-center mb-4">로그인</h3>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger p-2 small">{error}</div>}
                        <div className="mb-3">
                            <label htmlFor="loginid" className="form-label">사용자 ID</label>
                            <input 
                                type="text" 
                                name="loginid" 
                                id="loginid" 
                                className="form-control" 
                                placeholder="아이디를 입력하세요"
                                autoFocus 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">비밀번호</label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                className="form-control" 
                                placeholder="비밀번호를 입력하세요"
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2">로그인</button>
                    </form>
                </div>
            </div>
        </div>
    );
}