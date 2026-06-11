// 현재 과목의 시험 목록
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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
    const router = useRouter();
    const subid = params.subid;
    const esid = params.esid;
    const { user, loading: userLoading } = useUser();
    const [exams, setExams] = useState<Exam[]>([]);
    const [examSetName, setExamSetName] = useState<string>("시험 목록");
    const [examSetStatus, setExamSetStatus] = useState<string>("");
    const [grades, setGrades] = useState<Record<number, string | null>>({});

    useEffect(() => {
        if (userLoading || !user) {
            return;
        }

        const profile = user?.user || user;
        const userRole = profile?.usertype;
        const studentId = userRole === "S" ? (user?.sid || profile?.userid || profile?.id) : null;

        // 1. esid에 해당하는 시험 목록 가져오기
        const url = `http://localhost:8080/api/exams/examset/${esid}`;

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setExams(data);
                
                // 학생인 경우 각 문제에 대한 본인의 점수 정보를 가져옵니다.
                if (userRole === "S" && studentId) {
                    data.forEach((exam: Exam) => {
                        fetch(`http://localhost:8080/api/exams/grade/${exam.eid}/student/${studentId}`, {
                            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                        })
                        .then(res => res.ok ? res.json() : null)
                        .then(gradeData => {
                            if (gradeData) {
                                setGrades(prev => ({ ...prev, [exam.eid]: gradeData.score }));
                            }
                        });
                    });
                }
            })
            .catch((err) => {
                console.error("로드 실패:", err);
            });

        // 2. ExamSet 정보를 가져와서 제목(이름) 설정
        fetch(`http://localhost:8080/api/examsets/${esid}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setExamSetStatus(data.status);
                setExamSetName(data.name);
            })
            .catch((err) => console.error("ExamSet 정보 로드 실패:", err));

    }, [user, userLoading, subid, esid]);

    const profile = user?.user || user;
    const userRole = profile?.usertype;
    const isTeacher = userRole === "T";
    const basePath = isTeacher ? "myClasses" : "student";

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

    if (userLoading) {
        return <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center font-bold text-[#8d6a44]">데이터 로딩 중...</div>;
    }

    return (
        /* 1. 전체 영역 */
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">

            {/* 2. 내부 전체 영역 */}
            <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">

                {/* 뒤로 가기 버튼 추가 */}
                <button 
                    onClick={() => router.push(`/${basePath}/${subid}`)}
                    className="flex items-center gap-2 text-[#8d6a44] font-bold hover:text-[#3d2b1f] transition-all group w-fit"
                >
                    <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> 
                    강의 대시보드로 돌아가기
                </button>

                {/* 4. 큰 제목 */}
                <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
                    {examSetName}
                </p>

                {/* 시험 목록 리스트 영역 */}
                <div className="flex flex-col gap-4">
                    {exams.length > 0 ? (
                        <ul className="flex flex-col gap-3">
                            {exams.map((exam) => (
                                /* 3. 내부 영역 박스 */
                                <li
                                    key={exam.eid}
                                    className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-5 shadow-sm font-bold flex justify-between items-center transition-all duration-200 hover:bg-[#f5eee4]"
                                >
                                    <Link
                                        href={`/${basePath}/${subid}/${esid}/${exam.eid}`}
                                        className="text-lg font-bold text-[#5c4033] transition-colors hover:text-[#8b5e3c] flex-1 flex items-center gap-3"
                                        style = {{ textDecoration: 'none', color: 'inherit' }} >
                                        <span className="w-1.5 h-1.5 bg-[#8b5e3c] rounded-full"></span>
                                        {exam.question}
                                    </Link>

                                    {/* 5. 선택 버튼 (UX 개선: 텍스트 링크를 명확한 버튼 형태로 변경) */}
                                    {isTeacher ? (
                                        <Link href={`/myClasses/${subid}/${esid}/${exam.eid}/grading`}>
                                            <button
                                                type="button"
                                                className="px-4 py-1.5 rounded text-sm border-[#b89b7a] border-1 border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#8b5e3c] hover:text-white transition-colors"
                                            >
                                                채점하기
                                            </button>
                                        </Link>
                                    ) : (
                                        examSetStatus === "종료" ? (
                                            <span className="text-sm text-[#8d6a44] font-bold">
                                                {grades[exam.eid] ? `${grades[exam.eid]}점` : "미채점"}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-[#8d6a44] font-medium italic">응시하기</span>
                                        )
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        /* 3. 내부 영역 박스 (데이터 공백 레이아웃) */
                        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-20 text-center shadow-sm font-bold">
                            <p className="text-[#b89b7a] text-lg">현재 등록된 시험이 없습니다.</p>
                        </div>
                    )}
                </div>

                {isTeacher && (
                    <div className="flex justify-end mt-4">
                        <Link href={`/myClasses/${subid}/${esid}/create`}>
                            {/* 6. 일반 버튼 */}
                            <button 
                                type="button"
                                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2.5 rounded text-lg font-bold shadow-md transition-colors"
                            >
                                시험 작성
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}