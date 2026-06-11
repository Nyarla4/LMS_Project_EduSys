// 시험 문제 조회 및 수정
"use client"

import { useUser } from "@/app/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Exam {
    eid: number;
    question: string;
    answer: string;
    objectiveOption1 : string;
    objectiveOption2 : string;
    objectiveOption3 : string;
    objectiveOption4 : string;
}

export default function Exam() {
    const router = useRouter();
    const params = useParams();
    const eid = params.eid;
    const subid = params.subid;
    const esid = params.esid;
    const { user, loading: userLoading } = useUser();
    
    const [exam, setExam] = useState<Exam>();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Exam | null>(null);
    const [isObjective, setIsObjective] = useState(false);
    const [isExamSetCompleted, setIsExamSetCompleted] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showIncorrectNote, setShowIncorrectNote] = useState(false);
    const [incorrectNote, setIncorrectNote] = useState("");
    const [submittedGrade, setSubmittedGrade] = useState<{answer: string, score: string} | null>(null);

    const profile = user?.user || user;
    const userRole = profile?.usertype;
    const isTeacher = userRole === "T";
    const basePath = isTeacher ? "myClasses" : "student";
    const studentId = userRole === "S" ? (user?.sid || profile?.userid || profile?.id) : null;

    useEffect(() => {
        if (userLoading || !user) return;

        const url = `http://localhost:8080/api/exams/${eid}`;
        fetch(url, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {

                fetch(`http://localhost:8080/api/examsets/${data.esid}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                .then((res) => res.json())
                .then((examSetData) => {
                    if(examSetData.status === "종료") {
                        setIsExamSetCompleted(true);
                    }
                });

                setExam(data);
                // 학생인 경우 답안란을 비워서 초기화합니다.
                setFormData(isTeacher ? data : { ...data, answer: "" });
                setIsObjective(data.objectiveOption1 !== "");

                // 학생인 경우 본인이 제출한 답안이 있는지 확인
                if (!isTeacher && studentId) {
                    fetch(`http://localhost:8080/api/exams/grade/${eid}/student/${studentId}`, {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    })
                    .then(res => res.ok ? res.json() : null)
                    .then(gradeData => {
                        if (gradeData) {
                            setSubmittedGrade(gradeData);
                            // 이미 제출한 답안이 있으면 폼에 채워넣음
                            setFormData(prev => prev ? { ...prev, answer: gradeData.answer } : null);
                        }
                    })
                    .catch(err => console.error("제출 정보 로드 실패:", err));
                }
            })
            .catch((err) => console.error("로드 실패:", err));
    }, [user, userLoading, eid, isTeacher, studentId]);

    // 흐름: 문제 유형 변경 제어 (주관식/객관식)
    const handleTypeChange = (objective: boolean) => {
        setIsObjective(objective);
        setFormData(prev => prev ? {
            ...prev,
            objectiveOption1: objective ? prev.objectiveOption1 : "",
            objectiveOption2: objective ? prev.objectiveOption2 : "",
            objectiveOption3: objective ? prev.objectiveOption3 : "",
            objectiveOption4: objective ? prev.objectiveOption4 : "",
            answer: objective ? prev.answer : ""
        } : null);
    };

    // 흐름: 수정 취소 처리
    const handleCancel = () => {
        setFormData(exam || null);
        if (exam) {
            setIsObjective(exam.objectiveOption1 !== "");
        }
        setIsEditing(false);
    };

    // 흐름: 수정 데이터 서버 저장 요청
    const handleSave = () => {
        if (!formData) return;

        const url = `http://localhost:8080/api/exams`;
        fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("수정 실패");
            })
            .then((data) => {
                setExam(data);
                setFormData(data);
                setIsEditing(false);
            })
            .catch((err) => console.error("저장 실패:", err));
    };

    // 학생: 시험 답안 제출 처리
    const handleSubmit = () => {
        if (!formData?.answer) {
            alert("답안을 입력해주세요.");
            return;
        }

        // 실제로는 ExamGrade 엔티티에 저장하는 API를 호출해야 합니다.
        fetch(`http://localhost:8080/api/exams/submit-answer`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                eid: eid,
                sid: studentId,
                answer: formData.answer
            })
        })
        .then(res => {
            alert("답안이 제출되었습니다.");
            // 제출 후 상태 업데이트하여 UI에 즉시 반영
            if (formData?.answer) {
                setSubmittedGrade(prev => ({ answer: formData.answer, score: prev?.score || "" }));
            }
        })
        .catch(err => console.error("제출 실패:", err));
    };

    const aiIncorrectNote = async (eid: number) => {
        setIsAiLoading(true);
        const url = `http://localhost:8080/api/ai/incorrect-note/${eid}`;

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        answer: formData?.answer,
                        score: submittedGrade?.score
                    }
                )
            });

            // 1. HTTP 응답 상태가 정상(2xx)이 아닐 경우 예외 처리
            if (!res.ok) {
                throw new Error(`서버 응답 실패 (상태코드: ${res.status})`);
            }

            // 2. 비동기로 JSON 파싱 완료 후 데이터 확보
            const data = await res.json(); // 데이터 구조: { analysis: string, core_concept: string, tip: string }

            // alert(`AI가 오답 분석을 완료했습니다. \n\n[분석 결과]\n${data.analysis}`);
            setIncorrectNote(`[AI 오답 분석]\n분석: ${data.analysis}\n핵심 개념: ${data.core_concept}\n팁: ${data.tip}`);
            setShowIncorrectNote(true);
            console.log("AI 오답 분석 결과:", `분석: ${data.analysis}, 핵심 개념: ${data.core_concept}, 팁: ${data.tip}`);

        } catch (err) {
            // 4. 네트워크 에러 및 throw된 에러들을 이곳에서 한 번에 캐치
            console.error("로딩 실패 또는 채점 오류:", err);
            alert("AI 채점 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            // 5. 성공/실패 여부와 상관없이 무조건 로딩 상태 해제
            setIsAiLoading(false);
        }
    };

    if (userRole === "T" && !user?.approved) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-10 font-sans">
                <div className="bg-white border-2 border-[#d6c2a8] rounded-3xl p-10 shadow-xl text-center max-w-md">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-[#3d2b1f] mb-4">교사 승인 대기 중</h2>
                    <p className="text-[#7b6346] leading-relaxed">
                        관리자의 승인이 완료된 후에 담당 과목 관리 및 강의 등록이 가능합니다. 잠시만 기다려 주세요.
                    </p>
                </div>
            </div>
        );
    }

    if (exam == undefined || !formData) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-10 font-sans">
                <div className="bg-white border-2 border-[#d6c2a8] rounded-3xl p-10 shadow-xl text-center max-w-md">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-[#3d2b1f] mb-4">에러</h2>
                    <p className="text-[#7b6346] leading-relaxed">존재하지 않는 시험입니다.</p>
                </div>
            </div>
        );
    }

    return (
        /* 1. 전체 영역 */
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
            {/* 2. 내부 전체 영역 */}
            <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
                {/* 뒤로 가기 버튼 */}
                <button 
                    onClick={() => router.push(`/${basePath}/${subid}/${esid}`)}
                    className="flex items-center gap-2 text-[#8d6a44] font-bold hover:text-[#3d2b1f] transition-all group w-fit"
                >
                    <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> 
                    시험 목록으로 돌아가기
                </button>

                {/* 4. 큰 제목 */}
                <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
                    {isTeacher ? (isEditing ? "시험 문제 수정" : "시험 문제 상세 조회") : "시험 문제 응시"}
                </p>

                {/* 3. 내부 영역 박스 */}
                <div className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-8 shadow-sm flex flex-col gap-6">
                    
                    {/* 7. 라벨 폼 (시험 문제) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-bold">시험 문제</label>
                        <input
                            type="text"
                            placeholder="문제를 입력하세요"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            readOnly={!isEditing || !isTeacher}
                            className={`border-[#b89b7a] border rounded px-3 py-2 transition-all text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${!isTeacher || !isEditing ? "bg-[#f5f1e8]" : "bg-white"}`}
                        />
                    </div>

                    {/* 문제 유형 선택 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-bold">문제 유형</label>
                        <div className="flex gap-3">
                            {isTeacher ? (
                                // 교사는 두 유형을 모두 보되, 수정 모드에서만 클릭 가능
                                <>
                                    <button
                                        type="button"
                                        disabled={!isEditing}
                                        onClick={() => handleTypeChange(false)}
                                        className={`px-4 py-2 rounded text-sm border-[#b89b7a] border font-bold transition-colors ${
                                            !isObjective ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"
                                        } ${!isEditing ? "opacity-70 cursor-default" : "hover:opacity-90"}`}
                                    >
                                        주관식
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!isEditing}
                                        onClick={() => handleTypeChange(true)}
                                        className={`px-4 py-2 rounded text-sm border-[#b89b7a] border font-bold transition-colors ${
                                            isObjective ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"
                                        } ${!isEditing ? "opacity-70 cursor-default" : "hover:opacity-90"}`}
                                    >
                                        객관식
                                    </button>
                                </>
                            ) : (
                                // 학생은 현재 문제의 유형만 뱃지 형태로 표시
                                <div className="flex items-center justify-between w-full">
                                    <span className="px-4 py-2 rounded text-sm border-[#b89b7a] border font-bold bg-[#8b5e3c] text-white">
                                        {isObjective ? "객관식" : "주관식"}
                                    </span>
                                    {isExamSetCompleted && (
                                        <span className="text-xl font-bold text-[#8b5e3c]">
                                            {submittedGrade?.score ? `${submittedGrade.score}점` : "미채점"}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 하단 답안 영역 분기 */}
                    {isObjective ? (
                        <div className="flex flex-col gap-4 border-t border-[#dbc7b1] pt-4">
                            <label className="text-xl font-bold">{isTeacher ? "보기도 및 정답 선택" : "객관식 보기 선택"}</label>
                            {[1, 2, 3, 4].map((num) => {
                                const fieldName = `objectiveOption${num}` as keyof Exam;
                                const isSelectedAnswer = formData.answer === num.toString();

                                return (
                                    <div key={num} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#f5eee4] p-3 rounded-lg border border-[#dbc7b1]">
                                        {/* 5. 선택 버튼 스타일로 정답 토글 구현 */}
                                        <button
                                            type="button"
                                            disabled={(isTeacher && !isEditing) || isExamSetCompleted} // 교사는 수정 모드에서만, 학생은 시험 완료 전까지 선택 가능
                                            onClick={() => setFormData({ ...formData, answer: num.toString() })}
                                            className={`px-3 py-1.5 rounded text-sm border-[#b89b7a] border font-bold whitespace-nowrap transition-colors ${
                                                isSelectedAnswer ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"
                                            } ${((isTeacher && !isEditing) || isExamSetCompleted) ? "opacity-80" : ""}`}
                                        >
                                            {num}번 {isSelectedAnswer ? (isTeacher ? "정답 지정됨" : "선택함") : (isTeacher ? "정답으로 선택" : "선택하기")}
                                        </button>
                                        <input
                                            type="text"
                                            placeholder={`${num}번 보기를 입력하세요`}
                                            value={formData[fieldName] as string}
                                            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
                                            readOnly={!isEditing}
                                            className="border-[#b89b7a] border rounded px-3 py-1.5 bg-white w-full text-base focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* 7. 라벨 폼 (주관식 답안 내용) */
                        <div className="flex flex-col gap-2 border-t border-[#dbc7b1] pt-4">
                            <label className="text-xl font-bold">답안 내용</label>
                            <textarea
                                placeholder={isTeacher ? "정답기준이 될 주관식 답안 내용을 입력하세요" : "답안을 작성하세요"}
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                readOnly={(isTeacher && !isEditing) || isExamSetCompleted} // 교사는 수정 모드에서만, 학생은 시험 완료 전까지 수정 가능
                                className={`border-[#b89b7a] border rounded px-3 py-2 transition-all h-40 resize-none text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] ${((isTeacher && !isEditing) || isExamSetCompleted) ? "bg-[#f5f1e8]" : "bg-white"}`}
                            />
                        </div>
                    )}

                    {/* 하단 제어 버튼 컴포넌트 분기 */}
                    <div className="flex justify-end gap-4 mt-4">
                        {!isTeacher && isExamSetCompleted && incorrectNote.length > 0 && (
                            <button
                            type="button"
                            onClick={() => setShowIncorrectNote(!showIncorrectNote)}
                            className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-8 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
                        >
                            오답노트
                        </button>
                        )}
                        {isTeacher ? (
                            !isEditing ? (
                            <>
                                {/* 6. 일반 버튼 형태로 수정 진입 유도 */}
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-8 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
                                >
                                    시험 수정
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 rounded text-lg border-[#b89b7a] border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#c9b49d] transition-colors"
                                >
                                    취소
                                </button>
                                {/* 6. 일반 버튼 형태로 데이터 반영 실행 */}
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-8 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
                                >
                                    저장
                                </button>
                            </>
                            )
                        ) : (
                            !isExamSetCompleted ? (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
                            >
                                제출하기
                            </button>)
                            : (
                            <button
                                type="button"
                                onClick={() => aiIncorrectNote(Number.parseInt(eid!.toString()))}
                                disabled={isAiLoading}
                                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
                            >
                                {isAiLoading ? "작성 중..." : "AI 오답노트"}
                            </button>)
                        )}
                    </div>
                </div>
                {showIncorrectNote && (
                    <div className="mt-6 rounded-2xl bg-white p-6 border border-[#e6d1a7] shadow-inner animate-in slide-in-from-top duration-300">
                        <div className="space-y-6">
                            <div className="bg-[#fcf7f0] p-6 rounded-2xl border-2 border-[#8d6a44] shadow-md">
                                <label className="block text-xs font-bold text-[#8d6a44] mb-2">오답 노트</label>
                                <textarea
                                    placeholder="오답노트가 작성되기 전까지는 보이면 안됩니다."
                                    rows={8}
                                    className="w-full bg-transparent border-none text-[#3d2b1f] placeholder-[#a68d71] text-lg focus:ring-0 resize-none"
                                    value={incorrectNote}
                                    onChange={(e) => setIncorrectNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}