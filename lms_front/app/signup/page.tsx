"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    
    const [form, setForm] = useState({
        loginid: "",
        username: "",
        password: "",
        passwordConfirm: "",
        email: "",
        phonenum: "",
        usertype: "S"
    });

    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrors(prev => ({ ...prev, proofFile: "" }));
        }
    }

    function validate(): boolean {
        const newErrors: Record<string, string> = {};

        if (!form.loginid) {
            newErrors.loginid = "로그인 ID는 필수 항목입니다.";
        } else if (form.loginid.length < 4) {
            newErrors.loginid = "아이디는 최소 4자 이상이어야 합니다.";
        }

        if (!form.username) {
            newErrors.username = "사용자 이름은 필수 항목입니다.";
        }

        if (!form.password) {
            newErrors.password = "비밀번호는 필수 항목입니다.";
        } else if (form.password.length < 4 || form.password.length > 16) {
            newErrors.password = "비밀번호는 4자 이상 16자 이하로 입력해주세요.";
        }

        if (form.password !== form.passwordConfirm) {
            newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            newErrors.email = "이메일은 필수 항목입니다.";
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        if (!form.phonenum) {
            newErrors.phonenum = "전화번호는 필수 항목입니다.";
        }

        if (!file) {
            newErrors.proofFile = "증빙서류를 첨부해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!validate()) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("loginid", form.loginid);
            formData.append("username", form.username);
            formData.append("password", form.password);
            formData.append("passwordConfirm", form.passwordConfirm);
            formData.append("email", form.email);
            formData.append("phonenum", form.phonenum);
            formData.append("usertype", form.usertype);
            if (file) formData.append("proofFile", file);

            const res = await fetch("http://localhost:8080/user/signup", {
                method: "POST",
                body: formData,
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            }

            if (res.ok) {
                alert("회원가입이 완료되었습니다!");
                router.push("/login");
            } else {
                if (data && Array.isArray(data)) {
                    const backendErrors: Record<string, string> = {};
                    data.forEach((err: any) => {
                        if (err.field) backendErrors[err.field] = err.defaultMessage;
                    });
                    setErrors(backendErrors);
                } else {
                    setErrors({ global: data?.message || "회원가입 중 오류가 발생했습니다." });
                }
            }
        } catch (err) {
            setErrors({ global: "서버와 연결할 수 없습니다. 네트워크를 확인해주세요." });
        } finally {
            setLoading(false);
        }
    }

    const inputStyle = (fieldName: string) => `
        w-full px-4 py-2 rounded-lg border focus:outline-none transition-all
        ${errors[fieldName] 
            ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400" 
            : "border-[#d6c2a8] bg-white focus:border-[#8b5e3c] focus:ring-1 focus:ring-[#8b5e3c]"}
    `;

    return (
        <div className="min-h-screen bg-[#f5f1e8] flex justify-center py-10 font-sans text-[#5c4033]">
            <div className="w-full max-w-2xl bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-xl p-8 shadow-sm h-fit">
                
                <div className="mb-8 border-b border-[#d6c2a8] pb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-2 h-7 bg-[#8b5e3c] rounded-full"></span>
                        회원가입
                    </h2>
                    <p className="text-sm mt-2 text-[#8b5e3c]">EduSys와 함께 학습 관리를 시작하세요.</p>
                </div>

                {errors.global && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
                        {errors.global}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">로그인 ID</label>
                            <input type="text" name="loginid" className={inputStyle("loginid")} onChange={handleChange} placeholder="아이디 입력" />
                            {errors.loginid && <p className="text-red-500 text-xs mt-1 ml-1">{errors.loginid}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">사용자 이름</label>
                            <input type="text" name="username" className={inputStyle("username")} onChange={handleChange} placeholder="실명 입력" />
                            {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">비밀번호</label>
                            <input type="password" name="password" className={inputStyle("password")} onChange={handleChange} placeholder="비밀번호" />
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">비밀번호 확인</label>
                            <input type="password" name="passwordConfirm" className={inputStyle("passwordConfirm")} onChange={handleChange} placeholder="비밀번호 확인" />
                            {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1 ml-1">{errors.passwordConfirm}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">이메일</label>
                            <input type="email" name="email" className={inputStyle("email")} onChange={handleChange} placeholder="example@test.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 ml-1">전화번호</label>
                            <input type="text" name="phonenum" className={inputStyle("phonenum")} onChange={handleChange} placeholder="010-0000-0000" />
                            {errors.phonenum && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phonenum}</p>}
                        </div>
                    </div>

                    <div className="bg-[#e7d7c1] p-4 rounded-xl border border-[#d6c2a8]">
                        <label className="block text-sm font-bold mb-3">회원 유형</label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer gap-2 group">
                                <input type="radio" name="usertype" value="S" checked={form.usertype === "S"} onChange={handleChange} className="w-4 h-4 accent-[#8b5e3c]" />
                                <span className="font-medium group-hover:text-[#8b5e3c]">학생</span>
                            </label>
                            <label className="flex items-center cursor-pointer gap-2 group">
                                <input type="radio" name="usertype" value="T" checked={form.usertype === "T"} onChange={handleChange} className="w-4 h-4 accent-[#8b5e3c]" />
                                <span className="font-medium group-hover:text-[#8b5e3c]">교사</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-[#b89b7a] p-5 rounded-xl bg-[#f5f1e8]/50">
                        <label className="block text-sm font-bold mb-2 text-[#8b5e3c]">
                            {form.usertype === "S" ? "학생증 첨부" : "증명서 첨부"}
                        </label>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8b5e3c] file:text-white hover:file:bg-[#6f4a2f] cursor-pointer"
                            accept="image/*,.pdf" 
                        />
                        {errors.proofFile && <p className="text-red-500 text-xs mt-2">{errors.proofFile}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full ${loading ? 'bg-[#b89b7a] cursor-not-allowed' : 'bg-[#8b5e3c] hover:bg-[#6f4a2f]'} text-white py-4 rounded-xl text-lg font-bold transition-all shadow-md active:scale-[0.98] mt-4`}
                    >
                        {loading ? "회원 가입 중..." : "회원 가입 완료"}
                    </button>
                    
                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-[#8b5e3c] hover:underline font-medium">
                            이미 계정이 있으신가요? 로그인하기
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}