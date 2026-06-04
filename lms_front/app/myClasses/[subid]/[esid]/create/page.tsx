// 시험 작성 페이지(ai를 시험 작성 보조에 사용하는 경우 이곳에서 처리)

"use client"

import { useUser } from "@/app/userContext";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateExam() {
    const router = useRouter();
    const params = useParams();
    const subid = params.subid;
    const esid = params.esid;
    const { user, loading: userLoading } = useUser();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isObjective, setIsObjective] = useState(false);
    const [objectiveOption1, setObjectiveOption1] = useState("");
    const [objectiveOption2, setObjectiveOption2] = useState("");
    const [objectiveOption3, setObjectiveOption3] = useState("");
    const [objectiveOption4, setObjectiveOption4] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    const create = async () => {

        try {
            const res = await fetch("http://localhost:8080/api/exams/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(
                    {
                        esid: esid,
                        question: question,
                        answer: answer,
                        objectiveOption1: isObjective?objectiveOption1:"",
                        objectiveOption2: isObjective?objectiveOption2:"",
                        objectiveOption3: isObjective?objectiveOption3:"",
                        objectiveOption4: isObjective?objectiveOption4:""
                    }
                ),
            });

            if (!res.ok) throw new Error("서버 응답 오류");

            alert("시험이 작성되었습니다.");
            router.push(`/myClasses/${subid}/${esid}`);
        } catch (err) {
            alert("등록에 실패했습니다.");
        }
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

    const handleAiRecommend = async () => {
        setIsAiLoading(true);
        try {
            // [흐름 및 구조 수정] 사용자가 선택한 주관식/객관식 상태(isObjective)를 쿼리 스트링으로 전달
            const res = await fetch(`http://localhost:8080/api/ai/recommend-exam/${esid}?isObjective=${isObjective}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("AI 추천 실패");
            const data = await res.json();

            // AI가 추천해준 데이터로 입력창 업데이트
            setQuestion(data.question);
            
            // [흐름 수정] 하드코딩(setIsObjective(true)) 제거. 사용자가 지정한 폼 상태를 유지함
            // 만약 주관식이면 아래 옵션값들은 FastAPI 포맷 정책에 의해 빈 문자열("")로 파싱되어 컴포넌트에 매핑됩니다.
            setObjectiveOption1(data.objectiveOption1 || "");
            setObjectiveOption2(data.objectiveOption2 || "");
            setObjectiveOption3(data.objectiveOption3 || "");
            setObjectiveOption4(data.objectiveOption4 || "");
            setAnswer(data.answer);

            alert("AI가 추천 문제를 생성했습니다. 내용을 확인해주세요.");
        } catch (err) {
            alert("AI 추천 중 오류가 발생했습니다. 학습된 자막이 있는지 확인하세요.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

            <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

                {/* 뒤로 가기 버튼 추가 */}
                <button 
                    onClick={() => router.push(`/myClasses/${subid}/${esid}`)}
                    className="flex items-center gap-2 text-[#8d6a44] font-bold hover:text-[#3d2b1f] transition-all group w-fit"
                >
                    <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> 
                    시험 목록으로 돌아가기
                </button>

                <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
                    시험 문제 작성
                </p>
                <button
                        type="button"
                        onClick={handleAiRecommend}
                        disabled={isAiLoading}
                        className="ml-4 bg-[#4a6baf] hover:bg-[#3b558d] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:bg-gray-400"
                    >
                        {isAiLoading ? "생성 중..." : "AI 문제 추천"}
                    </button>

                <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-bold ml-1">시험 문제</label>
                        <input
                            type="text"
                            placeholder="문제를 입력하세요"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                        />
                    </div>
                    <label key="unObj">
                        <input type='radio' id="unObj"
                            name='isObj' value="주관식"
                            onChange={(e) => { setIsObjective(false); }}
                            checked = {!isObjective} />주관식
                    </label>
                    <label key="obj">
                        <input type='radio' id="obj"
                            name='isObj' value="객관식"
                            onChange={(e) => { setIsObjective(true); }}
                            checked = {isObjective} />객관식
                    </label>
                    {isObjective ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xl font-bold ml-1">1번 답안</label>
                            <input type='radio' id="1"
                                name='answer' value="1"
                                onChange={(e) => { setAnswer("1"); }}
                                checked={answer == "1"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={objectiveOption1}
                                onChange={(e) => setObjectiveOption1(e.target.value)}
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">2번 답안</label>
                            <input type='radio' id="2"
                                name='answer' value="2"
                                onChange={(e) => { setAnswer("2"); }}
                                checked={answer == "2"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={objectiveOption2}
                                onChange={(e) => setObjectiveOption2(e.target.value)}
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">3번 답안</label>
                            <input type='radio' id="3"
                                name='answer' value="3"
                                onChange={(e) => { setAnswer("3"); }}
                                checked={answer == "3"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={objectiveOption3}
                                onChange={(e) => setObjectiveOption3(e.target.value)}
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">4번 답안</label>
                            <input type='radio' id="4"
                                name='answer' value="4"
                                onChange={(e) => { setAnswer("4"); }}
                                checked={answer == "4"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={objectiveOption4}
                                onChange={(e) => setObjectiveOption4(e.target.value)}
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-xl font-bold ml-1">답안 내용</label>
                            <textarea
                                placeholder="답안 내용을 입력하세요"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all h-64 resize-none"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 rounded-lg text-lg border-[#b89b7a] border-1 border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#c9b49d] transition-colors"
                        >
                            취소
                        </button>

                        <button
                            type="button"
                            onClick={create}
                            className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded-lg text-lg font-bold shadow-md transition-all active:scale-95"
                        >
                            시험 작성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}