// 시험 문제
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
    const { user, loading: userLoading } = useUser();
    const [exam, setExam] = useState<Exam>();
    useEffect(() => {
        if (userLoading || !user) {
            return;
        }

        const url = `http://localhost:8080/api/exams/${eid}`;

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setExam(data);
            })
            .catch((err) => {
                console.error("로드 실패:", err);
            });

    }, [user, userLoading]);

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
    if (exam == undefined) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-10 font-sans">
                <div className="bg-white border-2 border-[#d6c2a8] rounded-3xl p-10 shadow-xl text-center max-w-md">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-[#3d2b1f] mb-4">에러</h2>
                    <p className="text-[#7b6346] leading-relaxed">
                        존재하지 않는 시험입니다.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

            <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

                <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
                    시험 문제 작성
                </p>

                <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-bold ml-1">시험 문제</label>
                        <input
                            type="text"
                            placeholder="문제를 입력하세요"
                            value={exam.question}
                            readOnly
                            className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                        />
                    </div>
                    <label key="unObj">
                        <input type='radio' id="unObj"
                            name='isObj' value="주관식"
                            defaultChecked = {exam.objectiveOption1==""} />주관식
                    </label>
                    <label key="obj">
                        <input type='radio' id="obj"
                            name='isObj' value="객관식"
                            defaultChecked = {exam.objectiveOption1!=""} />객관식
                    </label>
                    {exam.objectiveOption1!="" ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xl font-bold ml-1">1번 답안</label>
                            <input type='radio' id="1"
                                name='answer' value="1"
                                defaultChecked = {exam.answer=="1"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={exam.objectiveOption1}
                                readOnly
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">2번 답안</label>
                            <input type='radio' id="2"
                                name='answer' value="2"
                                defaultChecked = {exam.answer=="2"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={exam.objectiveOption2}
                                readOnly
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">3번 답안</label>
                            <input type='radio' id="3"
                                name='answer' value="3"
                                defaultChecked = {exam.answer=="3"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={exam.objectiveOption3}
                                readOnly
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                            <label className="text-xl font-bold ml-1">4번 답안</label>
                            <input type='radio' id="4"
                                name='answer' value="4"
                                defaultChecked = {exam.answer=="4"} />
                            <input
                                type="text"
                                placeholder="답을 입력하세요"
                                value={exam.objectiveOption4}
                                readOnly
                                className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-xl font-bold ml-1">답안 내용</label>
                            <textarea
                                placeholder="답안 내용을 입력하세요"
                                value={exam.answer}
                                readOnly
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
                            뒤로
                        </button>

                        <button
                            type="button"
                            onClick={(e)=>{}}
                            className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded-lg text-lg font-bold shadow-md transition-all active:scale-95"
                        >
                            시험 수정(미구현)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}