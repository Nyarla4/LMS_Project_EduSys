"use client";

import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 백엔드의 UserController에서 지정한 엔드포인트 호출
    fetch("http://localhost:8080/user/entity", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => console.error("데이터 로딩 실패:", err));
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>사용자 목록</h1>
      <ul>
        {users.length > 0 ? (
          users.map((user: any) => (
            <li key={user.loginid}>
              {user.username} ({user.usertype})
            </li>
          ))
        ) : (
          <p>사용자가 없습니다.</p>
        )}
      </ul>
    </main>
  );
}