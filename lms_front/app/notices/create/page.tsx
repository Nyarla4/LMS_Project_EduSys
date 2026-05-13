"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NoticeCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8080/api/notices", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ title, content })
    });

    if (res.ok) {
      router.push("/notices"); // 목록으로 돌아가는 흐름
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>공지사항 작성</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input 
          type="text" 
          placeholder="제목을 입력하세요 (최대 100자)" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.8rem", fontSize: "1.1rem" }}
        />
        <textarea 
          placeholder="내용을 입력하세요" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ height: "400px", padding: "0.8rem", resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={() => router.back()} style={{ padding: "0.8rem 1.5rem" }}>취소</button>
          <button onClick={handleSubmit} style={{ padding: "0.8rem 1.5rem", backgroundColor: "#007bff", color: "#fff" }}>
            등록하기
          </button>
        </div>
      </div>
    </main>
  );
}