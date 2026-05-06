"use client";
import { useState } from "react";


const cards = [
    { id: 1, title: "수학", description: "기초 수학 개념을 배우는 과정입니다."},
    { id: 2, title: "과학", description: "과학의 기본 원리를 배우는 과정입니다." },
    { id: 3, title: "영어", description: "영어 회화 능력을 향상시키는 과정입니다." },
    { id: 4, title: "국어", description: "국어의 기초를 배우는 과정입니다." },
];


export default function Page() {
    const [selectedCategory, setSelectedCategory] = useState("전체");
    //const [classInfo, setClassInfo] = useState([]);

    // useEffect(() => {
    //     // API 호출 코드
    //     fetch("http://localhost:3000/api/class")
    //     .then(res => res.json())
    //     .then(data => setClassInfo(data))
    // }, []);

    const [appliedCards, setAppliedCards] = useState<typeof cards>([]);
    // 신청하기 버튼 클릭 이벤트
    const handleApply = (card: typeof cards[number]) => {
        // 중복방지
        const alreadyApplied = appliedCards.some((item) => item.id === card.id);
        if (alreadyApplied) {
            alert("이미 신청한 과목입니다.");
            return;
        }
        setAppliedCards([...appliedCards, card]);
    };
    // 취소 버튼 클릭 이벤트
    const handleCancel = (id: number) => {
        const result = confirm("취소하시겠습니까?");
        if (!result) return;
        setAppliedCards(appliedCards.filter((card) => card.id !== id));
    };

  return (
    // 전체 페이지 영역 
  <div className="min-h-screen bg-zinc-100 flex justify-center py-10">
    {/* 내부 div 전체 영역 */}
    <div className="w-full max-w-6xl flex gap-6 mt-10 px-10">
        
        {/* 수강신청 영역 */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-4">
            <h1 className="text-3xl font-bold text-center mb-4 bg-gray-200 rounded-full py-2">수강신청</h1>
            <p className="text-xl font-bold">개설과목</p>
            <div className="mt-2">
                <button type="button"
                    onClick={() => setSelectedCategory("전체")}
                    className={`px-3 py-1 rounded text-sm ${selectedCategory === "전체" ? "bg-black text-white" : "bg-gray-300"}`}>전체</button>
                <button type="button" 
                    onClick={() => setSelectedCategory("이과")}
                    className={`px-3 py-1 rounded text-sm ml-2 ${selectedCategory === "이과" ? "bg-black text-white" : "bg-gray-300"}`}>이과</button>
                <button type="button" 
                    onClick={() => setSelectedCategory("문과")}
                    className={`px-3 py-1 rounded text-sm ml-2 ${selectedCategory === "문과" ? "bg-black text-white" : "bg-gray-300"}`}>문과</button>
            </div>

            {/* 수강신청 카드 */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                {cards.map((card) => (
                <div key={card.id} className="bg-gray-50 border rounded-lg p-3 shadow-sm font-bold">
                    <h2 className="text-lg text-center border-b mb-2">{card.title}</h2>
                    <p className="text-gray-600 h-20 mb-4">{card.description}</p>
                    <div className="flex justify-between text-sm">
                    <p>📖 김선생</p>
                    <p>🕒 월,화 5교시</p>
                    </div>
                    <p className="text-sm border-b mb-2">👥 5/32</p>
                    <button type="button" 
                        onClick={() => handleApply(card)}
                        className="bg-black text-white px-3 py-1 rounded text-sm mx-auto block mt-2"
                        >신청하기</button>
                </div>
                ))}
            </div>
        </div>
        
        {/* 신청현황 영역 */}
        <div className="w-64 bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-lg text-center bg-gray-200 rounded-full mb-4 py-1">
            신청현황
        </h1>

        {appliedCards.map((card) => (
            <div key={card.id} className="border rounded-lg p-3 mb-3 text-sm font-semibold">
                <h2 className="text-xl  text-center mb-2 border-b">{card.title}</h2>
                <p className="text-sm">👥 5/32</p>
                <div className="flex justify-between text-sm mb-1">
                    <p>📖 김선생</p>
                    <p>🕒 월,화 5교시</p>
                </div>
                <button type="button" 
                    onClick={() => handleCancel(card.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm mx-auto block mt-2"
                    >취소</button>
            </div>
        ))}
        </div>
    </div>
  </div>
);
}