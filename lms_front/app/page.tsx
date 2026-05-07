"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [notices, setNotices] = useState([]);
  useEffect(() => {
  const fetchNotices = async () => {
    try {
      const noticeRes = await fetch("http://localhost:8080/api/notices");

      // 1. 204 No Content 응답 처리 (실행 흐름 분기)
      if (noticeRes.status === 204) {
        setNotices([]); // 빈 배열로 상태 초기화
        return; // 이후의 .json() 호출을 막음
      }

      // 2. 응답이 성공적(200 OK 등)인 경우에만 파싱 진행
      if (!noticeRes.ok) throw new Error("서버 응답 오류");

      const notices = await noticeRes.json();
      setNotices(notices);

    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  fetchNotices();
}, []);
  return (
    <div>
      <h2>기본 페이지</h2>
      <p>공지사항</p>
      <ul>
          {notices.map((notice: any) => (
            <li key={notice.nid}>
              <Link href={`/notices/${notice.nid}`} style={{ textDecoration: 'none', color: 'blue' }}>
                {notice.title}
              </Link>
            </li>
          ))}
        </ul>
        <a href="/notices">더보기</a>
    </div>      
  );
}