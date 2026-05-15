"use client";
import { useState, useEffect } from "react";

type SubjectResponse = {
    subid: number;
    major: string;
    subName: string;
    lessonName: string;
    teacherName?: string;
    capacity?: number;
    startDate?: string;
    endDate?: string;
};

export default function Page() {
    type Lesson = {
        id: number;
        category: "이과" | "문과";
        subjectName: string;
        lessonName: string;
        //description: string;
        teacherName: string;
        schedule: string;
        //currentCount: number;
        maxCount: number;
    };

    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [cards, setCards] = useState<Lesson[]>([]);
    const [appliedCards, setAppliedCards] = useState<typeof cards>([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/subjects/apply")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`요청 실패: ${res.status}`);
                }
                return res.json();
            })
            .then((data: SubjectResponse[]) => {
                const mappedCards: Lesson[] = data.map((subject) => ({
                    id: subject.subid,
                    category: subject.major === "science" ? "이과" : "문과",
                    subjectName: subject.subName || "미정",
                    //description: "",
                    teacherName: subject.teacherName || "",
                    lessonName: subject.lessonName || "미정",
                    schedule:
                        subject.startDate && subject.endDate
                            ? `${subject.startDate} ~ ${subject.endDate}`
                            : "미정",
                    currentCount: 0,
                    maxCount: subject.capacity ?? 0,
                }));
                setCards(mappedCards);
            })
            .catch((error) => {
                console.error("데이터 불러오기 실패:", error);
            });
    }, []);

    const filteredCards = selectedCategory === "전체" ? cards : cards.filter((card) =>
        card.category === selectedCategory);

    const handleApply = (card: Lesson) => {
        const result = confirm("신청하시겠습니까?");
        if (!result) return;

        const alreadyApplied = appliedCards.some((item) => item.id === card.id);
        if (alreadyApplied) {
            alert("이미 신청한 과목입니다.");
            return;
        }
        setAppliedCards([...appliedCards, card]);
    };

    const handleCancel = (id: number) => {
        const result = confirm("취소하시겠습니까?");
        if (!result) return;
        setAppliedCards(appliedCards.filter((card) => card.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
            <div className="w-full max-w-6xl flex gap-6 mt-10 px-10">
                <div className="flex-1 bg-[#fffaf3] border-[#d6c2a8] border-2 rounded-2xl shadow-md p-4">
                    <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">수강신청</p>
                    <p className="text-xl font-bold">개설과목</p>
                    <div className="mt-2">
                        <button type="button"
                            onClick={() => setSelectedCategory("전체")}
                            className={`px-3 py-1 rounded text-sm border-[#b89b7a] border-1 font-bold ${selectedCategory === "전체" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>전체</button>
                        <button type="button"
                            onClick={() => setSelectedCategory("이과")}
                            className={`px-3 py-1 rounded text-sm ml-2 border-[#b89b7a] border-1 font-bold ${selectedCategory === "이과" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>이과</button>
                        <button type="button"
                            onClick={() => setSelectedCategory("문과")}
                            className={`px-3 py-1 rounded text-sm ml-2 border-[#b89b7a] border-1 font-bold ${selectedCategory === "문과" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>문과</button>
                    </div>

                    {/* 과목 신청 카드 */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredCards.map((card) => (
                            <div
                                key={card.id}
                                className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
                            >
                                {/* 과목 */}
                                <div className="border-b border-[#d8c2a8] pb-3 mb-4">
                                    <p className="text-2xl font-bold text-[#5c4033] text-center">
                                        {card.subjectName}
                                    </p>
                                </div>

                                {/* 설명 */}
                                {/* <div className="min-h-[90px]">
                                    <p className="text-[#6e5a4b] leading-relaxed text-sm">
                                        {card.description || "강의 설명이 없습니다."}
                                    </p>
                                </div> */}

                                {/* 강의 정보 */}
                                <div className="bg-[#f3e7d7] rounded-lg px-3 py-2 mt-3 text-sm space-y-1">
                                    <p>
                                        <span className="font-bold">수업</span> : {card.lessonName || "미정"}
                                    </p>
                                    
                                    <p>
                                        <span className="font-bold">교사</span> : {card.teacherName || "미정"}
                                    </p>

                                    <p>
                                        <span className="font-bold">기간</span> :{" "}
                                        {card.schedule || "미정"}
                                    </p>

                                    <p>
                                        <span className="font-bold">정원</span> :{" "}
                                        {card.maxCount}
                                    </p>
                                </div>

                                {/* 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => handleApply(card)}
                                    className="w-full mt-4 bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white py-2 rounded font-bold transition"
                                >
                                    신청하기
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-64 bg-[#fffaf3] border-[#d6c2a8] border-2 rounded-2xl shadow-md p-4">
                    <p className="text-xl font-bold text-center bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full mb-4 py-1">
                        신청현황
                    </p>

                    {appliedCards.map((card) => (
                        <div key={card.id} className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-3 mb-3 text-sm font-semibold">
                            <p className="text-xl  text-center mb-2 border-b">{card.subjectName || "미정"}</p>
                            <p className="text-sm">정원 {card.maxCount}</p>
                            <div className="flex justify-between text-sm mb-1">
                                <p>교사 {card.teacherName || "미정"}</p>
                                <p>기간 {card.schedule || "미정"}</p>
                            </div>
                            <button type="button"
                                onClick={() => handleCancel(card.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm mx-auto block mt-2"
                            >취소</button>
                        </div>
                    ))}

                    {appliedCards.length === 0 && (
                        <p className="text-sm text-[#8b735f] text-center mt-6">
                            신청한 과목이 없습니다.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
