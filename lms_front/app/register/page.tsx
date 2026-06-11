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
    const [planFile, setPlanFile] = useState<File | null>(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    // 선택파일 초기화
    const [fileInputKey, setFileInputKey] = useState(0);

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
            setTeacherName(user.user?.username || user.username || "");
        }
    }, [loading, user]);

    useEffect(() => {
        return () => {
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
        };
    }, [pdfPreviewUrl]);

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setPlanFile(null);
            setShowPdfPreview(false);

            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }

            setPdfPreviewUrl("");
            return;
        }

        if (file.type !== "application/pdf") {
            alert("PDF 파일만 등록 가능");
            e.target.value = "";
            setPlanFile(null);
            setShowPdfPreview(false);

            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }

            setPdfPreviewUrl("");
            return;
        }

        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
        }

        setPlanFile(file);
        setPdfPreviewUrl(URL.createObjectURL(file));
        setShowPdfPreview(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirm("강의를 등록하시겠습니까?")) {
            alert("등록이 취소되었습니다.");
            return;
        }

        const token = localStorage.getItem("token");
        let uploadedPlanFile = "";

        if (planFile) {
            if (!user?.tid) {
                alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
                return;
            }

            const uploadForm = new FormData();
            uploadForm.append("file", planFile);
            uploadForm.append("tid", String(user.tid));

            const uploadRes = await fetch("http://localhost:8080/api/subjects/upload-syllabus", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: uploadForm,
            });

            if (!uploadRes.ok) {
                alert("PDF 업로드에 실패하였습니다.");
                return;
            }

            uploadedPlanFile = await uploadRes.text();
        }

        const data = {
            tid: user?.tid,
            major,
            subName: subject,
            lessonName: detailSubject,
            startDate,
            endDate,
            capacity: Number(capacity),
            planFile: uploadedPlanFile,
            fileUrl
        };

        const res = await fetch("http://localhost:8080/api/subjects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            alert("등록 실패하였습니다.");
            return;
        }
        alert("등록 완료되었습니다.");

        // 폼 초기화
        setMajor("");
        setSubject("");
        setDetailSubject("");
        setStartDate("");
        setEndDate("");
        setCapacity("");
        setPlanFile(null);
        setShowPdfPreview(false);
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfPreviewUrl("");
        // 파일 입력 필드 리셋
        setFileInputKey((prev) => prev + 1); 
    };

    return (
        // 전체 페이지 영역
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
            {/* 내부 div 전체 영역 */}
            <div className="w-full max-w-6xl flex gap-6 mt-10 px-10">

                {/* 강의등록 영역 */}
                <div className="flex-1 bg-[#fffaf3] border-[#d6c2a8] border-2 rounded-2xl shadow-md p-4">
                    <p className="text-4xl font-bold text-center mb-4 text-[#5c4033] bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">강의 등록</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* 강사명, 전공 */}
                        <div className="flex gap-6">
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">강사명</label>
                                <input type="text" value={teacherName} readOnly className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40" />
                            </div>
                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">전공</label>
                                <select value={major} onChange={(e) => setMajor(e.target.value)}
                                    className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40">
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
                                    className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40"
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
                                    className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40"
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
                                        className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40" />
                                    <span>~</span>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                        className="font-bold border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40" />
                                </div>
                            </div>

                            <div className="w-1/2 flex flex-col gap-2">
                                <label className="text-xl font-bold">신청 최대 인원(최대 32명)</label>
                                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                                    max={32} min={1} className="border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40" />
                            </div>
                        </div>

                        <label className="text-xl font-bold">강의 계획서</label>
                        <input key={fileInputKey} type="file" accept="application/pdf,.pdf"
                            onChange={handlePdfChange}
                            className="border-[#b89b7a] border-[1px] rounded px-3 py-2" />
                        {planFile && (
                            <button
                                type="button"
                                onClick={() => setShowPdfPreview((prev) => !prev)}
                                className="w-fit text-lg text-[white] font-bold border-[#b89b7a] border-[1px] 
                                bg-[#8b5e3c] hover:bg-[#6f4a2f] rounded px-3 py-2"
                            >
                                선택한 파일 {showPdfPreview ? "미리보기 닫기" : "미리보기"}
                            </button>
                        )}
                        {pdfPreviewUrl && showPdfPreview && (
                            <div className="mt-2 border-[#b89b7a] border rounded-lg overflow-hidden">
                                <iframe title="PDF preview" src={pdfPreviewUrl} className="w-full h-[500px]" />
                            </div>
                        )}

                        <label className="text-xl font-bold">강의 영상 주소</label>
                        <input type="url" value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://xxx.com"
                            className="border-[#b89b7a] border-[1px] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6c2a8] focus:ring-opacity-40"
                        />
                        <button type="submit" className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-lg font-bold"
                        >등록하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
