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
interface Answer {
  ansid: number;
  queid: number;
  tid: number;
  content: string;
}

export default function Question() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id;
  const { user, loading: userLoading } = useUser();
  const [question, setQuestion] = useState<Question>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comment, setComment] = useState<string>("");

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
          const answerUrl = `http://localhost:8080/api/answer/${data.queid}`;
          fetch(answerUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((res) => res.json())
            .then((answerData) => {
              setAnswers(answerData);
            });
        }
      })
      .catch((err) => {
        console.error("로드 실패:", err);
      });
  }, [user, userLoading, questionId]);

  const answer = async () => {
    const res = await fetch("http://localhost:8080/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ queid: question?.queid, tid: user?.tid, content: comment }),
    });

    if (res.status === 204) return;
    if (!res.ok) throw new Error("서버 응답 오류");

    alert("답변이 등록되었습니다.");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

        <div className="relative mb-4">
          <p className="text-4xl font-bold text-center bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
            강의 질문
          </p>
        </div>

        <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-4">
          <div className="min-h-[200px] text-lg leading-8 whitespace-pre-wrap py-4">
            {question?.content}
          </div>
        </div>

        {answers.length > 0 && (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-6">
            <p className="text-2xl font-bold border-b-2 border-[#b89b7a] pb-2">답변</p>
            {answers.map((answer) => (
              <div
                key={answer.ansid}>
                <div className="text-sm text-[#5c4033] mb-2">
                  {answer.content}
                </div>
                <div className="w-full border-t-1 border-[#b89b7a] mt-4"></div>
                </div>
            ))}
          </div>
        )}
        {user && user.tid != null && (
          <div className="flex flex-col gap-4">
            <textarea
              placeholder="답변을 입력하세요 (최대 100자)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border-[#b89b7a] border-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all h-32"
            />
            <div className="flex justify-end">
              <button
                onClick={answer}
                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-8 py-2 rounded-lg text-lg font-bold shadow-md transition-all active:scale-95"
              >
                답변 등록하기
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          {user && user.sid != null && user.sid === question?.sid && (
            <Link href={`/qna/${question?.lid}/${question?.queid}/edit`} className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-10 py-2 rounded-lg font-bold border border-[#b89b7a] transition-all">
              수정하기
            </Link>
          )}
          <button
            onClick={() => router.back()}
            className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-10 py-2 rounded-lg font-bold border border-[#b89b7a] transition-all"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}