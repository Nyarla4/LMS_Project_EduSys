"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";

export default function MyPage() {
  const { user, loading } = useUser(); // loading 상태를 같이 가져오세요.
  const router = useRouter();

  useEffect(() => {
    // 로딩이 끝났는데 유저가 없다면 로그인으로 강제 이동
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <p>인증 확인 중...</p>;
  if (!user) return null; // 리다이렉트 중에는 아무것도 보여주지 않음

  return (
    <main style={{ padding: "2rem" }}>
      <h1>마이페이지</h1>
      <div>
        <p>이름: {user.user?.username || user.username}</p>
        <p>유형: {user.user?.usertype || user.usertype}</p>
        <p>ID : {user.user?.loginid || user.loginid}</p>
        {/* 비밀번호는 보통 보안상 화면에 노출하지 않는 것을 권장합니다. */}
      </div>
    </main>
  );
}