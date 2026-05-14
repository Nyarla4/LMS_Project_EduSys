"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Counsel {
  couid: number;
  sid: number;
  tid: number;
  title: string;
  content: string;
  comment: string;
}

export default function Counselling() {
  const params = useParams();
  const router = useRouter();
  const counselId = params.id;
  const { user, loading: userLoading } = useUser();
  const [counsel, setCounsel] = useState<Counsel>();
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (userLoading || !user) return;

    const url = `http://localhost:8080/api/counsel/detail/${counselId}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCounsel(data);
        if (data) {
          setComment(data.comment ?? "");
        }
      })
      .catch((err) => {
        console.error("로드 실패:", err);
      });
  }, [user, userLoading, counselId]);

  const answer = async () => {
    const res = await fetch("http://localhost:8080/api/counsel/" + counsel?.couid, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ comment }),
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
            상담 상세 내용
          </p>
        </div>

        <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-4">
          <div className="border-b border-[#d6c2a8] pb-4">
            <h2 className="text-2xl font-bold text-[#8b5e3c]">
              {counsel?.title}
            </h2>
          </div>

          <div className="min-h-[200px] text-lg leading-8 whitespace-pre-wrap py-4">
            {counsel?.content}
          </div>
        </div>

        <div className="bg-[#e7d7c1]/30 border-[#d6c2a8] border-2 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#8b5e3c] rounded-full"></span>
            선생님 답변
          </h3>

          {user && user.sid != null && (
            <div className="bg-white/50 rounded-lg p-6 min-h-[100px] border border-[#d6c2a8] italic text-lg">
              {counsel?.comment ? counsel.comment : "아직 등록된 답변이 없습니다."}
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
        </div>

        <div className="flex justify-center gap-4 mt-6">
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