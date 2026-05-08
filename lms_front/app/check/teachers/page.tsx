// app/check/teachers/page.tsx
"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useUser } from "@/app/userContext";

export default function checkTeacher() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  if (!user) return <div>사용자 정보를 불러오는 중...</div>;
  if (user.usertype !== "A") return <div>관리자 권한이 필요한 페이지입니다.</div>; // 권한 체크

  return (
    <main style={{ padding: "2rem" }}>
      <h1>교사 인증 (관리자: {user.user?.username || user.username})</h1>
      {loading ? (
        <p>확인 목록을 불러오는 중...</p>
      ) : (
        <ul>
        </ul>
      )}
    </main>
  );
}