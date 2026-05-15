"use client";
import { useUser } from "@/app/userContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id;
  const { user } = useUser(); // 관리자 권한 확인용

  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 수정 모드 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/notices/detail/${noticeId}`)
      .then((res) => res.json())
      .then((data) => {
        setNotice(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error("공지 로드 실패:", err);
        setLoading(false);
      });
  }, [noticeId]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/notices/detail/${noticeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (response.ok) {
        const updatedNotice = await response.json();
        setNotice(updatedNotice);
        setIsEditing(false);
        alert("수정되었습니다.");
      }
    } catch (err) {
      console.error("수정 실패:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 공지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/notices/detail/${noticeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("공지가 삭제되었습니다.");
        router.push("/notices");
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!notice) return <p>공지가 없습니다.</p>;

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          {isEditing ? "공지사항 수정" : "공지사항 상세"}
        </p>

        {isEditing ? (
          /* ================= 수정 모드 UI ================= */
          <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xl font-bold ml-1">제목 수정</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border-[#b89b7a] border-1 border rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-bold ml-1">내용 수정</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border-[#b89b7a] border-1 border rounded px-4 py-2 h-[300px] text-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white"
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={handleUpdate}
                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-5 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
              >
                저장하기
              </button>
              <button
                onClick={handleDelete}
                className="bg-[#d97706] hover:bg-[#b45309] text-white px-5 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
              >
                삭제
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-5 py-2 rounded-lg font-bold border border-[#b89b7a] transition-all"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          /* ================= 보기 모드 UI ================= */
          <div className="flex flex-col gap-6">
            <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-10 shadow-sm min-h-[400px] flex flex-col">
              <h2 className="text-3xl font-bold mb-4 border-b-2 border-[#e7d7c1] pb-4 text-[#8b5e3c]">
                {notice.title}
              </h2>

              <div className="flex-1 text-lg leading-8 whitespace-pre-wrap py-4 text-[#5c4033]">
                {notice.content}
              </div>

              <div className="mt-8 pt-4 border-t border-[#e7d7c1] flex justify-between items-center text-sm text-[#b89b7a] font-bold">
                <span>작성일: {new Date(notice.createDate).toLocaleString()}</span>
                <span className="bg-[#8b5e3c] text-white px-3 py-1 rounded-full text-xs">{notice.author} 작성</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-4">
              {user?.usertype === "A" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all"
                >
                  수정하기
                </button>
              )}
              <button
                onClick={() => router.push("/notices")}
                className="bg-[#dbc7b1] hover:bg-[#c9b49d] text-[#5c4033] px-6 py-2 rounded-lg text-lg font-bold border border-[#b89b7a] transition-all"
              >
                목록으로
              </button>
              <button
                onClick={() => router.back()}
                className="bg-white hover:bg-[#f5f1e8] text-[#b89b7a] px-6 py-2 rounded-lg text-lg font-bold border border-[#d6c2a8] transition-all"
              >
                뒤로가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}