// 해당 과목의 질문들 페이지

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Question() {
  const params = useParams();
  const lessonId = params.lid;
  const { user, loading: userLoading } = useUser();
  const [questions, setQuestions] = useState([]);
  const [lesson, setLesson] = useState("");
  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    const lessonUrl = `http://localhost:8080/api/lessons/${lessonId}`;
    fetch(lessonUrl, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setLesson(data.name);
      });

    const url = `http://localhost:8080/api/question/${lessonId}`;

    fetch(url, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
      })
      .catch((err) => {
        console.error("로드 실패:", err);
      });

  }, [user, userLoading]);
  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

        <div className="relative">
          <p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
            {lesson && `${lesson} `}질문 목록
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {questions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {questions.map((question: any) => (
                <li
                  key={question.queid}
                  className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg px-6 py-5 shadow-sm flex justify-between items-center transition-all duration-200 hover:bg-[#f5eee4] hover:shadow-md group"
                >
                  <Link
                    href={`/qna/${lessonId}/${question.queid}`}
                    className="text-lg font-bold text-[#5c4033] transition-colors group-hover:text-[#8b5e3c] flex-1 flex items-center gap-3"
                  >
                    {/* 데코레이션 불릿 */}
                    <span className="w-1.5 h-1.5 bg-[#b89b7a] rounded-full group-hover:bg-[#8b5e3c]"></span>
                    {question.content}
                  </Link>

                  {/* 화살표 아이콘 (선택 사항) */}
                  <span className="text-[#b89b7a] group-hover:text-[#8b5e3c] transition-colors">
                    ➔
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-20 text-center shadow-sm">
              <p className="font-bold text-[#b89b7a]">현재 등록된 질문 내역이 없습니다.</p>
            </div>
          )}
        </div>

        {user && user.sid != null && (
          <div className="flex justify-end mt-4">
            <Link href={`/qna/${lessonId}/create`}>
              <button className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all">
                새 질문 등록하기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}