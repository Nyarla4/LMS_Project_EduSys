"use client";
import { useState } from "react";


export default function Page() {
    
    const [teacherName, setTeacherName] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const subjectOptions = {
        국어: ["화법과 작문", "독서", "언어와매체", "문학"],
        수학: ["수학I", "수학II", "미적분", "확률과 통계"],
        영어: ["영어I", "영어II", "영어회화", "영어 독해와 작문"],
        통합사회: ["한국지리", "세계지리", "동아시아사", "세계사", "정치와 법", "경제", "사회문화", "윤리와 사상", "생활과 윤리"],
        통합과학: ["물리I", "화학I", "생명과학I", "지구과학I"],
    };

    const [subject, setSubject] = useState("");
    const [detailSubject, setDetailSubject] = useState("");

    return (
    // 전체 페이지 영역 
    <div className="min-h-screen bg-zinc-100 flex justify-center py-4">
        {/* 내부 div 전체 영역 */}
        <div className="w-full max-w-6xl flex gap-6 mt-10 px-50">
            
            {/* 강의등록 영역 */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-10">
                <h1 className="text-3xl font-bold text-center mb-4 bg-gray-200 rounded-full py-2">강의등록</h1>
                <form className="flex flex-col gap-4">
                    <label className="text-xl font-bold">강사명</label>
                    <input type="text" value={teacherName} readOnly className="border rounded px-3 py-2" />
                    
                    <div className="flex flex-col gap-3">
                        <label className="font-semibold">과목 선택</label>
                        <select
                            value={subject}
                            onChange={(e) => {
                            setSubject(e.target.value);
                            // 과목 바꾸면 세부과목 초기화
                            setDetailSubject(""); 
                            }}
                            className="border rounded px-3 py-2"
                        >
                            <option value="">과목 선택</option>
                            {Object.keys(subjectOptions).map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                            ))}
                        </select>

                        <label className="font-semibold">세부 과목 선택</label>
                        <select
                            value={detailSubject}
                            onChange={(e) => setDetailSubject(e.target.value)}
                            disabled={!subject}
                            className="border rounded px-3 py-2 disabled:bg-gray-100"
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

                    <label className="text-xl font-bold">전공</label>
                    <select className="border rounded px-3 py-2">
                        <option value="">전공 선택</option>
                        <option value="science">이과</option>
                        <option value="arts">문과</option>
                    </select>

                    <label className="text-xl font-bold">신청 최대 인원(최대 32명)</label>
                    <input type="number" max={32} min={1} className="border rounded px-3 py-2" />

                    <label className="text-xl font-bold">강의 개설 기간</label>
                    <div className="flex gap-2">
                        <input type="date" className="border rounded px-3 py-2" />
                        <span>~</span>
                        <input type="date" className="border rounded px-3 py-2" />
                    </div>

                    <label className="text-xl font-bold">강의 계획서</label>
                    <input type="text" className="border rounded px-3 py-30" />
                    
                    <label className="text-xl font-bold">강의 영상</label>
                    <input type="file" accept="video/*"
                        onChange={(e) => {const file = e.target.files?.[0];
                        if (file) {
                            setVideoFile(file);}
                        }}
                        className="border rounded px-3 py-2" 
                    />

                    <label className="text-xl font-bold">강의자료(예시:pdf, doc, docx)</label>
                    <input type="file" accept=".pdf,.doc,.docx" className="border rounded px-3 py-2" />

                    <button type="submit" className="bg-black text-white px-4 py-2 rounded">등록</button>
                </form>
            </div>
        </div>
    </div>
);
}