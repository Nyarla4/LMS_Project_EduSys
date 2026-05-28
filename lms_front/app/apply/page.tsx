"use client";
import { useState, useEffect } from "react";
import { useUser } from "../userContext";

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

type CourseResponse = {
    cid: number;
    subject?: {
        subid: number;
        name: string;
        major?: string;
        capacity?: number;
        startDate?: string;
        endDate?: string;
    };
};

type Lesson = {
        id: number;
        category: "전체" | "이과" | "문과";
        subjectName: string;
        lessonName: string;
        teacherName: string;
        schedule: string;
        //currentCount: number;
        maxCount: number;
        // 신청 취소
        cid?: number;
    };

export default function Page() {
    const { user, loading } = useUser();

    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [cards, setCards] = useState<Lesson[]>([]);
    const [appliedCards, setAppliedCards] = useState<typeof cards>([]);
    // 검색 기능
    const [searchType, setSearchType] = useState("subject");
    const [searchKeyword, setSearchKeyword] = useState("");

    // 등록된 강의에 대한 카드정보
    useEffect(() => {
        // 토큰을 로컬 스토리지에서 가져오기
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/api/subjects/apply", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data: SubjectResponse[]) => {
                const mappedCards: Lesson[] = data.map((subject) => ({
                    id: subject.subid,
                    category: subject.major === "science" 
                        ? "이과" : subject.major === "arts"
                        ? "문과" : "전체",
                    subjectName: subject.subName || "미정",
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
            });
    }, []);

    // 신청버튼을 통해 보이는 신청현황 카드정보
    useEffect(() => {
        if (loading || !user?.sid) return;
    
        const token = localStorage.getItem("token");

        fetch(`http://localhost:8080/api/courses/student/${user.sid}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data: CourseResponse[]) => {
                const mappedAppliedCards: Lesson[] = data.map((course) => ({
                    id: course.subject?.subid ?? 0,
                    cid: course.cid,
                    category: course.subject?.major === "science" 
                        ? "이과" : course.subject?.major === "arts"
                        ? "문과" : "전체",
                    subjectName: course.subject?.name || "미정",
                    lessonName: "미정",
                    teacherName: "",
                    schedule: course.subject?.startDate && course.subject?.endDate
                        ? `${course.subject.startDate} ~ ${course.subject.endDate}`
                        : "미정",
                    maxCount: course.subject?.capacity ?? 0,
                }));     
                setAppliedCards(mappedAppliedCards);
            });
        }, [user, loading]);
    
    const filteredCards = selectedCategory === "전체" 
        ? cards 
        : cards.filter((card) => card.category === selectedCategory);
    // 과목 또는 교사 검색 기능
    const searchedCards = filteredCards.filter((card) => {
        if (!searchKeyword.trim()) return true;

        const keyword = searchKeyword.toLowerCase();

        if (searchType === "subject") {
            return card.subjectName.toLowerCase().includes(keyword);
        }
        if (searchType === "teacher") {
            return card.teacherName.toLowerCase().includes(keyword);
        }
        return true;
    })

    const handleApply = async (card: Lesson) => {
        const result = confirm("신청하시겠습니까?");
        if (!result) return;

        const alreadyApplied = appliedCards.some((item) => item.id === card.id);
        if (alreadyApplied) {
            alert("이미 신청한 과목입니다.");
            return;
        }
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                student: { sid: user.sid },
                subject: { subid: card.id },
            }),
        });
            
        if (!res.ok) {
            alert("수강 신청에 실패했습니다.");
            return;
        }

        const savedCourse = await res.json();
        setAppliedCards([...appliedCards, {...card, cid: savedCourse.cid,}]);
        alert("수강 신청이 완료되었습니다.");
    };

    const handleCancel = async (cid?: number) => {
        if (!cid) return;

        const result = confirm("취소하시겠습니까?");
        if (!result) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/courses/${cid}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            alert("수강 취소에 실패했습니다.");
            return;
        }
        setAppliedCards(appliedCards.filter((card) => card.cid !== cid));
        alert("수강 신청이 취소되었습니다..");  
    };
    
    return (
        <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
            <div className="w-full max-w-6xl flex gap-6 mt-10 px-10">
                <div className="flex-1 bg-[#fffaf3] border-[#d6c2a8] border-2 rounded-2xl shadow-md p-4">
                    <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">수강신청</p>
                    <p className="text-xl font-bold text-[#5c4033]">개설과목</p>
                    <div className="mt-2 flex items-center border-b-4 border-[#b89b7a] pb-2 mb-4">
                        <button type="button"
                            onClick={() => setSelectedCategory("전체")}
                            className={`px-3 py-1 rounded text-sm border-[#b89b7a] border-1 font-bold ${selectedCategory === "전체" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>전체</button>
                        <button type="button"
                            onClick={() => setSelectedCategory("이과")}
                            className={`px-3 py-1 rounded text-sm ml-2 border-[#b89b7a] border-1 font-bold ${selectedCategory === "이과" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>이과</button>
                        <button type="button"
                            onClick={() => setSelectedCategory("문과")}
                            className={`px-3 py-1 rounded text-sm ml-2 border-[#b89b7a] border-1 font-bold ${selectedCategory === "문과" ? "bg-[#8b5e3c] text-white" : "bg-[#dbc7b1] text-[#5c4033]"}`}>문과</button>
                        <span className="font-bold ml-auto">
                            <select 
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="border-[#d6c2a8] border-2 rounded px-2 py-1 ml-2 text-[#5c4033]">
                                <option value="subject">과목</option>
                                <option value="teacher">교사</option>
                            </select>
                            <input 
                                type="text" placeholder="검색" value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="border-[#d6c2a8] border-2 rounded px-2 py-1 ml-2" 
                            />
                        </span>
                    </div>

                    {/* 과목 신청 카드 */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                        {searchedCards.map((card) => (
                            <div
                                key={card.id}
                                className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
                            >
                                {/* 과목 */}
                                <div className="border-b border-[#d8c2a8] pb-2 mb-4">
                                    <p className="text-2xl font-bold text-[#5c4033] text-center">
                                        {card.subjectName}<span className="text-lg">({card.category})</span>
                                    </p>
                                </div>

                                {/* 강의 정보 */}
                                <div className="bg-[#f3e7d7] rounded-lg px-3 pt-2 pb-1 text-sm space-y-1">
                                    <p><span className="font-bold">수업</span> : {card.lessonName || "미정"}</p>        
                                    <p><span className="font-bold">교사</span> : {card.teacherName || "미정"}</p>
                                    <p><span className="font-bold">기간</span> :{" "}{card.schedule || "미정"}</p>
                                    <p><span className="font-bold">정원</span> :{" "}{card.maxCount}명</p>                                
                                </div>

                                {/* 버튼 */}
                                <button 
                                    type="button"
                                    key={card.id}
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
                    <p className="font-semibold">신청 과목 수: {appliedCards.length}</p>

                    {appliedCards.map((card) => (
                        <div key={card.id} className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-3 mb-3 text-sm font-semibold">
                            <p className="text-xl  text-center mb-2 border-b">{card.subjectName || "미정"}<span className="text-sm">({card.category})</span></p>
                            <div className="bg-[#f3e7d7] rounded-lg px-3 py-2 mt-3 text-sm space-y-1">
                                <p><span className="font-bold">수업</span> : {card.lessonName || "미정"}</p>
                                <p><span className="font-bold">교사</span> : {card.teacherName || "미정"}</p>
                                <p><span className="font-bold">정원</span> : {card.maxCount || "미정"}</p>
                            </div>
                            <button type="button"
                                key={card.cid}
                                onClick={() => handleCancel(card.cid)}
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
