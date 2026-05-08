// 성적 조회 페이지(학생)
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function ClassRequest() {
  const { user, loading: userLoading } = useUser(); 
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. 유저 정보를 불러오는 중이거나 유저 정보가 없으면 아무것도 하지 않습니다. (흐름 제어)
    if (userLoading || !user) {
      return;
    }

    // 3. 유저 로딩이 끝나고 user 객체가 있을 때만 fetch 실행
    const url = `http://localhost:8080/api/grades/student/${user.sid}`;
    console.log("Fetching grades for sid:", user.sid);

    fetch(url, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("성적 로드 실패:", err);
        setLoading(false);
      });

  }, [user, userLoading]);

  // 유저 정보 자체가 로딩 중일 때의 처리
  if (userLoading) return <p>사용자 확인 중...</p>;
  if (!user) return <p>로그인이 필요한 서비스입니다.</p>;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>성적 조회</h1>
      {loading ? (
        <p>성적을 불러오는 중...</p>
      ) : (
        <div>
          <h2>{user.user.username}님의 성적</h2>
          <ul>
            {scores.map((score: any) => (
              <li key={score.gid}>
                <strong>{score.subjectName}</strong>: {score.score ?? "성적 미입력"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}