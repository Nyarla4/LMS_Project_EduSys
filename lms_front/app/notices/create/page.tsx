"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/userContext";

export default function NoticeCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const userName = user.username;

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8080/api/notices", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ title, content, userName })
    });

    if (res.ok) {
      router.push("/notices"); // 목록으로 돌아가는 흐름
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          공지사항 작성
        </p>
        <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1">공지 제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요 (최대 100자)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1">공지 내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 h-[400px] text-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
            />
          </div>
          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded text-lg border-[#b89b7a] border-1 border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#c9b49d] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-8 py-2 rounded text-lg font-bold shadow-md transition-all active:scale-95"
            >
              등록하기
            </button>
          </div>
        </div>
        <div className="bg-[#e7d7c1]/50 border-[#d6c2a8] border rounded-lg p-4 text-sm text-[#5c4033]">
          <p className="font-bold">※ 작성 유의사항</p>
          <p>공지사항 등록 시 즉시 모든 사용자에게 노출됩니다. 중요 정보는 한 번 더 확인해 주세요.</p>
        </div>
      </div>
    </div>
  );
}