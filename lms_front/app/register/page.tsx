"use client";
import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function Page() {

    const { user, loading } = useUser();
    const [teacherName, setTeacherName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [subject, setSubject] = useState("");
    const [detailSubject, setDetailSubject] = useState("");
    const [major, setMajor] = useState("");
    const [capacity, setCapacity] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [planFile, setPlanFile] = useState("");


    const subjectOptions = {
        국어: ["화법과 작문", "독서", "언어와매체", "문학"],
        수학: ["수학I", "수학II", "미적분", "확률과 통계"],
        영어: ["영어I", "영어II", "영어회화", "영어 독해와 작문"],
        통합사회: ["한국지리", "세계지리", "동아시아사", "세계사", "정치와 법", "경제", "사회문화", "윤리와 사상", "생활과 윤리"],
        통합과학: ["물리I", "화학I", "생명과학I", "지구과학I"],
    };

    // 강사명 자동 입력
    useEffect(() => {
        if (!loading && user) {
            // 이름이 존재하지 않으면 빈값
            setTeacherName(user.user?.name || user.username || "");
        }
    }, [loading, user]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = {
            major, subName: subject, lessonName: detailSubject,
            startDate, endDate, capacity: Number(capacity), planFile, fileUrl
        };

        const res = await fetch("http://localhost:8080/api/subjects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            }
        ); console.log(await res.text()); // 응답 텍스트 확인용
        if (!res.ok) {
            alert("등록 실패하였습니다.");
            return;
        }
        alert("등록 완료되었습니다.");
    };

    return (
        // 전체 페이지 영역 
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
            {/* 내부 div 전체 영역 */}
            <div className="w-full max-w-6xl flex gap-6 mt-10 px-10">

                {/* 강의등록 영역 */}
                <div className="flex-1 bg-[#fffaf3] border-[#d6c2a8] border-2 rounded-2xl shadow-md p-4">
                    <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">강의등록</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* 강사명, 전공 */}
                        <div className="flex gap-6">
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">강사명</label>
                                <input type="text" value={teacherName} readOnly className="border-[#b89b7a] border-1 rounded px-3 py-2" />
                            </div>
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">전공</label>
                                <select value={major} onChange={(e) => setMajor(e.target.value)}
                                    className="border-[#b89b7a] border-1 rounded px-3 py-2">
                                    <option value="">전공 선택</option>
                                    <option value="science">이과</option>
                                    <option value="arts">문과</option>
                                </select>
                            </div>
                        </div>

                        {/* 과목 및 세부 과목 선택 */}
                        <div className="flex gap-6">
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">과목 선택</label>
                                <select
                                    value={subject}
                                    onChange={(e) => {
                                        setSubject(e.target.value);
                                        // 과목 바꾸면 세부과목 초기화
                                        setDetailSubject("");
                                    }}
                                    className="border-[#b89b7a] border-1 rounded px-3 py-2"
                                >
                                    <option value="">과목 선택</option>
                                    {Object.keys(subjectOptions).map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">세부 과목 선택</label>
                                <select
                                    value={detailSubject}
                                    onChange={(e) => setDetailSubject(e.target.value)}
                                    disabled={!subject}
                                    className="border-[#b89b7a] border-1 rounded px-3 py-2 disabled:bg-gray-100"
                                >
                                    <option value="">세부 과목 선택</option>

                                    {subject &&
                                        subjectOptions[subject as keyof typeof subjectOptions].map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* 강의 개설 기간, 신청 최대 인원 */}
                        <div className="flex gap-6">
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">강의 개설 기간</label>
                                <div className="flex gap-2">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="border-[#b89b7a] border-1 rounded px-3 py-2" />
                                    <span>~</span>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                        className="border-[#b89b7a] border-1 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">신청 최대 인원(최대 32명)</label>
                                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                                    max={32} min={1} className="border-[#b89b7a] border-1 rounded px-3 py-2" />
                            </div>
                        </div>

                        <label className="text-xl font-bold">강의 계획서</label>
                        <input type="text" value={planFile} onChange={(e) => setPlanFile(e.target.value)}
                            className="border-[#b89b7a] border-1 rounded px-3 py-30" />

                        <label className="text-xl font-bold">강의 영상 주소</label>
                        <input type="url" value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://xxx.com"
                            className="border-[#b89b7a] border-1 rounded px-3 py-2"
                        />

                        <label className="text-xl font-bold">강의자료(예시:pdf, doc, docx)</label>
                        <input type="file" accept=".pdf,.doc,.docx" className="border-[#b89b7a] border-1 rounded px-3 py-2" />

                        <button type="submit" className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-lg">등록</button>
                    </form>
                </div>
            </div>
        </div>
    );
}