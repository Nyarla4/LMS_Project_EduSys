"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Question {
  queid: number;
  sid: number;
  lid: number;
  content: string;
  comment?: string;
}

export default function EditQuestion() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id;
  const { user, loading: userLoading } = useUser();
  const [question, setQuestion] = useState<Question>();
  const [comment, setComment] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (userLoading || !user) return;

    const url = `http://localhost:8080/api/question/detail/${questionId}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
        if (data) {
          setComment(data.comment ?? "");
          setContent(data.content);
        }
      })
      .catch((err) => {
        console.error("로드 실패:", err);
      });
  }, [user, userLoading, questionId]);

  const edit = async () => {
    const res = await fetch("http://localhost:8080/api/question/" + question?.queid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content }),
    });

    if (res.status === 204) return;
    if (!res.ok) throw new Error("서버 응답 오류");

    alert("질문이 수정되었습니다.");
    router.push(`/qna/${question?.lid}/${question?.queid}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

        <div className="relative mb-4">
          <p className="text-4xl font-bold text-center bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
            강의 질문
          </p>
        </div>

        <textarea
          placeholder="질문 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all h-64 resize-none"
        />

        <div className="bg-[#e7d7c1]/30 border-[#d6c2a8] border-2 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#8b5e3c] rounded-full"></span>
            선생님 답변
          </h3>

          {user && user.sid != null && (
            <div className="bg-white/50 rounded-lg p-6 min-h-[100px] border border-[#d6c2a8] italic text-lg">
              {question?.comment ? question.comment : "아직 등록된 답변이 없습니다."}
            </div>
          )}

        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button onClick={edit} className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-10 py-2 rounded-lg font-bold border border-[#b89b7a] transition-all">
            수정
          </button>
          <button
            onClick={() => router.back()}
            className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-10 py-2 rounded-lg font-bold border border-[#b89b7a] transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}