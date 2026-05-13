// app/classRequest/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext"; //
import Link from "next/link";

export default function ClassRequest() { // 1. async 제거
  const { user } = useUser(); //
  const [subjects, setSubjects] = useState([]); // 과목 데이터를 담을 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. user 정보와 tid가 확실히 로드되었을 때만 fetch 실행
    if (user && user.tid) {
      const url = `http://localhost:8080/api/subjects/teacher/${user.tid}`;
      console.log("Fetching subjects from:", url);

      fetch(url, {
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then((res) => res.json())
        .then((data) => {
          setSubjects(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("과목 로드 실패:", err);
          setLoading(false);
        });
    }
  }, [user]); // 3. user 정보가 업데이트될 때마다 다시 실행

  // 4. 데이터 로딩 중이거나 유저 정보가 없을 때의 예외 처리
  if (!user) return <div>사용자 정보를 불러오는 중...</div>;
  if (user.user.usertype !== "T") return <div>교사 권한이 필요한 페이지입니다.</div>; // 권한 체크

  return (
    <main style={{ padding: "2rem" }}>
      <h1>강의 관리 (교사: {user.user?.username || user.username})</h1>
      {loading ? (
        <p>강의 목록을 불러오는 중...</p>
      ) : (
        <ul>
          {subjects.map((subject: any) => (
            <li key={subject.subid}>
              <Link href={`/myClasses/${subject.subid}`} style={{ textDecoration: 'none', color: 'blue' }}>
                {subject.name} ({subject.major})
              </Link>
            </li>
          ))}
        </ul>
      )}
      {subjects.length === 0 && !loading && <p>등록된 과목이 없습니다.</p>}
    </main>
  );
}