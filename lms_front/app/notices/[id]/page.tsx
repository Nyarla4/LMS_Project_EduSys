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
    <main style={{ padding: "2rem" }}>
      <h1>공지 상세</h1>
      
      {isEditing ? (
        /* 수정 모드 UI */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ fontSize: '1.5rem', padding: '0.5rem' }}
          />
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)}
            style={{ height: '300px', padding: '0.5rem' }}
          />
          <div>
            <button onClick={handleUpdate}>저장</button>
            <button onClick={handleDelete}>삭제</button>
            <button onClick={() => setIsEditing(false)}>취소</button>
          </div>
        </div>
      ) : (
        /* 보기 모드 UI */
        <div>
          <h2>{notice.title}</h2>
          <hr />
          <div style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}>
            {notice.content}
          </div>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            작성일: {new Date(notice.createDate).toLocaleString()}
          </p>
          
          {/* 관리자(ADMIN)인 경우에만 수정 버튼 노출 */}
          {user?.usertype === "A" && (
            <button onClick={() => setIsEditing(true)}>수정하기</button>
          )}
          <button onClick={() => router.back()}>목록으로</button>
        </div>
      )}
    </main>
  );
}