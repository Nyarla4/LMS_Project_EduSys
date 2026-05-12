"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        loginid: "", username: "", password: "", passwordConfirm: "",
        email: "", phonenum: "", usertype: "S"
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }

    function validate(): boolean {
        const newErrors: Record<string, string> = {};

        if (!form.loginid) newErrors.loginid = "로그인 ID는 필수 항목입니다.";
        else if (form.loginid.length < 3 || form.loginid.length > 50)
            newErrors.loginid = "로그인 ID는 3자 이상 50자 이하여야 합니다.";

        if (!form.username) newErrors.username = "사용자 이름은 필수 항목입니다.";
        else if (form.username.length < 2 || form.username.length > 50)
            newErrors.username = "사용자 이름은 2자 이상 50자 이하여야 합니다.";

        if (!form.password) newErrors.password = "비밀번호는 필수 항목입니다.";

        if (!form.passwordConfirm) newErrors.passwordConfirm = "비밀번호 확인은 필수 항목입니다.";
        else if (form.password !== form.passwordConfirm)
            newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";

        if (!form.email) newErrors.email = "이메일은 필수 항목입니다.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "올바른 이메일 형식이 아닙니다.";

        if (!form.phonenum) newErrors.phonenum = "전화번호는 필수 항목입니다.";

        if (!form.usertype) newErrors.usertype = "회원 유형은 필수 선택입니다.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!validate()) return;

        try {
            const res = await fetch("http://localhost:8080/user/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                alert("회원가입이 완료되었습니다.");
                router.push("/login");
            } else {
                if (Array.isArray(data)) {
                    const backendErrors: Record<string, string> = {};
                    data.forEach((err: any) => {
                        if (err.field) {
                            backendErrors[err.field] = err.defaultMessage;
                        }
                    });
                    setErrors(backendErrors);
                } else if (data.message) {
                    setErrors({ global: data.message });
                } else {
                    setErrors({ global: "회원가입에 실패했습니다." });
                }
            }
        } catch (err) {
            setErrors({ global: "서버와 연결할 수 없습니다. 백엔드 서버가 켜져있는지 확인해주세요." });
        }
    }

    return (
        <div>
            <div className="my-3 border-bottom">
                <h4>회원가입</h4>
            </div>

            {errors.global && <div className="alert alert-danger">{errors.global}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">로그인 ID</label>
                    <input type="text" name="loginid" className={`form-control ${errors.loginid ? "is-invalid" : ""}`}
                        placeholder="사용할 아이디를 입력하세요" onChange={handleChange} />
                    {errors.loginid && <div className="invalid-feedback">{errors.loginid}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">사용자 이름</label>
                    <input type="text" name="username" className={`form-control ${errors.username ? "is-invalid" : ""}`}
                        placeholder="홍길동" onChange={handleChange} />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">비밀번호</label>
                    <input type="password" name="password" className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        onChange={handleChange} />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">비밀번호 확인</label>
                    <input type="password" name="passwordConfirm" className={`form-control ${errors.passwordConfirm ? "is-invalid" : ""}`}
                        onChange={handleChange} />
                    {errors.passwordConfirm && <div className="invalid-feedback">{errors.passwordConfirm}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">이메일</label>
                    <input type="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        placeholder="example@email.com" onChange={handleChange} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">전화번호</label>
                    <input type="text" name="phonenum" className={`form-control ${errors.phonenum ? "is-invalid" : ""}`}
                        placeholder="010-0000-0000" onChange={handleChange} />
                    {errors.phonenum && <div className="invalid-feedback">{errors.phonenum}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label d-block">회원 유형</label>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                            name="usertype" value="S" defaultChecked onChange={handleChange} />
                        <label className="form-check-label">학생</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio"
                            name="usertype" value="T" onChange={handleChange} />
                        <label className="form-check-label">교사</label>
                    </div>
                    {errors.usertype && <div className="text-danger small">{errors.usertype}</div>}
                </div>

                <button type="submit" className="btn btn-primary">회원 가입</button>
            </form>
        </div>
    );
}