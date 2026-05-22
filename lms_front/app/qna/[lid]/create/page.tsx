"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import { useParams, useRouter } from "next/navigation";

export default function CreateQuestion() {
  const params = useParams();
  const lessonId = parseInt(params.lid?.toString() || "-1");
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [lesson, setLesson] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tid, setTid] = useState<number>(-1);

  
  useEffect(() => {
    if (userLoading || !user) return;
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
    
  }, [user, userLoading]);

  const register = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sid: user.sid, lid: lessonId, content: content }),
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      alert("질문이 등록되었습니다.");
      router.push(`/qna/${lessonId}`);
    } catch (err) {
      alert("등록에 실패했습니다.");
    }
  };

  const onTeacherChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    setTid(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">

        <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          새 질문 등록{lesson && ` - ${lesson}`}
        </p>

        <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1"> 질문 내용</label>
            <textarea
              placeholder="질문 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all h-64 resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg text-lg border-[#b89b7a] border-1 border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#c9b49d] transition-colors"
            >
              취소
            </button>

            <button
              type="button"
              onClick={register}
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded-lg text-lg font-bold shadow-md transition-all active:scale-95"
            >
              질문 등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}