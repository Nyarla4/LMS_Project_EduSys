// 현재 과목의 시험 목록

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Exam {
    eid: number;
    question: string;
    answer: string;
    objectiveOption1 : string;
    objectiveOption2 : string;
    objectiveOption3 : string;
    objectiveOption4 : string;
}

export default function CurrentExams() {
    const params = useParams();
    const subid = params.subid;
    const { user, loading: userLoading } = useUser();
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => {
        if (userLoading || !user) {
            return;
        }

        const url = `http://localhost:8080/api/exams/subject/${subid}`;

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setExams(data);
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
    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

            <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

                <div className="relative">
                    <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
                        시험 목록
                    </p>
                </div>

                {/* 상담 목록 리스트 */}
                <div className="flex flex-col gap-4">
                    {exams.length > 0 ? (
                        <ul className="flex flex-col gap-3">
                            {exams.map((exam) => (
                                <li
                                    key={exam.eid}
                                    className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg px-6 py-5 shadow-sm flex justify-between items-center transition-all duration-200 hover:bg-[#f5eee4] hover:shadow-md group"
                                >
                                    <Link
                                        href={`/myClasses/${subid}/exam/${exam.eid}`}
                                        className="text-lg font-bold text-[#5c4033] transition-colors group-hover:text-[#8b5e3c] flex-1 flex items-center gap-3"
                                    >
                                        {/* 데코레이션 불릿 */}
                                        <span className="w-1.5 h-1.5 bg-[#b89b7a] rounded-full group-hover:bg-[#8b5e3c]"></span>
                                        {exam.question}
                                    </Link>

                                    <Link href={`/myClasses/${subid}/exam/${exam.eid}/grading`} className="text-[#b89b7a] group-hover:text-[#8b5e3c] transition-colors"
                                    style={{ color: '#5c4033', textDecoration: 'none' }}>
                                        채점
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        /* 시험이 없을 때 */
                        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-20 text-center shadow-sm">
                            <p className="font-bold text-[#b89b7a]">현재 등록된 시험이 없습니다.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <Link href={`/myClasses/${subid}/exam/create`}>
                        <button className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all">
                            시험 작성
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}