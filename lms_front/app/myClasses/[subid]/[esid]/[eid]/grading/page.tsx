// 시험 채점
"use client"

import { useUser } from "@/app/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Exam {
    subid: number;
    question: string;
    answer: string;
    isObjective: boolean;
    objectiveOption1: string;
    objectiveOption2: string;
    objectiveOption3: string;
    objectiveOption4: string;
}

interface Grade {
    egid: number;
    sid: number;
    student: string;
    eid: number;
    answer: string;
    score: string;
}

export default function GradingExam() {
    const router = useRouter();
    const params = useParams();
    const eid = params.eid;
    const subid = params.subid;
    const esid = params.esid;
    const { user, loading: userLoading } = useUser();
    const [exam, setExam] = useState<Exam>();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [gradingEgid, setGradingEgid] = useState<number | null>(null);

    useEffect(() => {
        if (userLoading || !user) return;
        const exUrl = `http://localhost:8080/api/exams/${eid}`;

        fetch(exUrl, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setExam(data);
                    const url = `http://localhost:8080/api/exams/grading/${eid}`;

                    fetch(url, {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    })
                        .then((res) => res.json())
                        .then((data) => setGrades(data))
                        .catch((err) => console.error("로드 실패:", err));
                });
            }
        });
    }, [user, userLoading, eid]);

    // 흐름: 입력 점수 상태 업데이트
    const handleScoreChange = (egid: number, value: string) => {
        setGrades((prev) =>
            prev.map((grade) => (grade.egid === egid ? { ...grade, score: value } : grade))
        );
    };

    // 흐름: 채점 저장 처리
    const handleSave = () => {
        const url = `http://localhost:8080/api/exams/grading`;

        fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(grades),
        })
            .then((res) => {
                if (res.ok) {
                    alert("점수가 저장되었습니다.");
                    return res.json();
                }
            })
            .then((data) => setGrades(data))
            .catch((err) => console.error("로드 실패:", err));
    };

    const profile = user?.user || user;
    const userRole = profile?.usertype;

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

    if (exam == null) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-10 font-sans">
                <div className="bg-white border-2 border-[#d6c2a8] rounded-3xl p-10 shadow-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-[#3d2b1f] mb-4">존재하지 않는 문제</h2>
                    <p className="text-[#7b6346] leading-relaxed">
                        해당 문제는 존재하지 않습니다.
                    </p>
                </div>
            </div>
        );
    }

    const options = [
        exam.objectiveOption1,
        exam.objectiveOption2,
        exam.objectiveOption3,
        exam.objectiveOption4
    ];

    const handleAiGrade = async (eid: number, answer: string, egid: number) => {
        setIsAiLoading(true);
        setGradingEgid(egid); // 채점 중인 답안의 egid 상태 업데이트
        const url = `http://localhost:8080/api/ai/grade-exam/${eid}`;

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ answer }), // 단축 속성명(Shorthand) 적용
            });

            // 1. HTTP 응답 상태가 정상(2xx)이 아닐 경우 예외 처리
            if (!res.ok) {
                throw new Error(`서버 응답 실패 (상태코드: ${res.status})`);
            }

            // 2. 비동기로 JSON 파싱 완료 후 데이터 확보
            const data = await res.json(); // 데이터 구조: { score: number, reason: string }

            // 3. 확보된 데이터를 바탕으로 후속 비즈니스 로직 실행
            alert(`AI가 채점을 완료했습니다. \n\n[채점 근거]\n${data.reason}`);
            console.log("AI 채점 결과:", data.score, data.reason);

            handleScoreChange(egid, data.score.toString());

        } catch (err) {
            // 4. 네트워크 에러 및 throw된 에러들을 이곳에서 한 번에 캐치
            console.error("로딩 실패 또는 채점 오류:", err);
            alert("AI 채점 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            // 5. 성공/실패 여부와 상관없이 무조건 로딩 상태 해제
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
            <div className="w-full max-w-7xl flex flex-col gap-6 px-10 mt-10">

                {/* 뒤로 가기 버튼 추가 */}
                <button 
                    onClick={() => router.push(`/myClasses/${subid}/${esid}`)}
                    className="flex items-center gap-2 text-[#8d6a44] font-bold hover:text-[#3d2b1f] transition-all group w-fit"
                >
                    <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> 
                    시험 목록으로 돌아가기
                </button>

                <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
                    시험 채점 관리
                </p>

                <div className="w-full flex flex-col md:flex-row gap-6">

                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <div className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-5 shadow-sm font-bold sticky top-10">
                            <h3 className="text-lg font-bold text-[#5c4033] mb-3 border-b pb-2 border-[#dbc7b1]">
                                출제 문제 정보
                            </h3>
                            <p className="text-base text-[#3d2b1f] font-semibold mb-4">
                                Q. {exam.question}
                            </p>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#7b6346]">정답 가이드:</span>
                                {exam.objectiveOption1 !== "" ? (
                                    <div className="flex flex-col gap-1.5">
                                        {options.map((option, index) => {
                                            const optionNum = (index + 1).toString();
                                            const isCorrect = exam.answer === optionNum;
                                            return (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    disabled
                                                    className={`px-3 py-1 rounded text-sm border-[#b89b7a] border font-bold text-left transition-colors ${isCorrect
                                                            ? "bg-[#8b5e3c] text-white"
                                                            : "bg-[#dbc7b1] text-[#5c4033] opacity-60"
                                                        }`}
                                                >
                                                    {optionNum}. {option}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-3 shadow-sm font-bold text-[#5c4033] text-center">
                                        {exam.answer}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3">
                        {grades.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <ul className="flex flex-col gap-3">
                                    {grades.map((grade) => (
                                        <li
                                            key={grade.egid}
                                            className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-5 shadow-sm font-bold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 hover:bg-[#f5eee4]"
                                        >
                                            <div className="flex flex-col gap-1.5 max-w-55/100">
                                                <span className="text-lg font-bold text-[#5c4033] flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-[#8b5e3c] rounded-full"></span>
                                                    학생: {grade.student}
                                                </span>
                                                <p className="text-sm text-[#7b6346] pl-3.5 bg-[#f5eee4] py-1 px-2 rounded border border-[#dbc7b1] inline-block font-normal">
                                                    제출 답안: <span className="font-bold text-[#5c4033]">{grade.answer}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 self-end sm:self-auto">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xl font-bold text-[#5c4033]">점수</label>
                                                    <input
                                                        type="text"
                                                        className="border-[#b89b7a] border rounded px-3 py-2 w-20 text-center bg-white font-bold text-[#5c4033]"
                                                        value={grade.score || ""}
                                                        onChange={(e) => handleScoreChange(grade.egid, e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                {exam.objectiveOption1 === "" && (
                                                    <button
                                                        type="button"
                                                        disabled={isAiLoading}
                                                        onClick={(e) => handleAiGrade(grade.eid, grade.answer, grade.egid)}
                                                        className={`px-3 py-1 rounded text-sm border-[#b89b7a] border font-bold transition-colors ${isAiLoading
                                                                ? "bg-[#dbc7b1]/60 text-[#5c4033]/"+(gradingEgid !== grade.egid ? "60" : "1")+" cursor-not-allowed" // 로딩 중 스타일 (색상 연해짐)
                                                                : "bg-[#dbc7b1] text-[#5c4033] hover:bg-[#8b5e3c] hover:text-white cursor-pointer" // 활성화 스타일
                                                            }`}
                                                    >
                                                        {isAiLoading ? "채점 중..." : "AI 채점"}
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-lg mx-auto block mt-2 font-bold shadow-md transition-colors"
                                >
                                    채점 결과 저장하기
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-20 text-center shadow-sm font-bold">
                                <p className="text-[#b89b7a] text-lg">현재 제출된 학생 답안이 없습니다.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}