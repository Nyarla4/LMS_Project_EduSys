"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function Users() {
  const { user } = useUser();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>마이페이지</h1>
      {user && (
        <div>
          <p>이름: {user.user.name}</p>
          <p>유형: {user.user.type}</p>
          <p>ID : {user.user.id}</p>
          <p>비밀번호: {user.user.password}</p>
        </div>
      )}
    </main>
  );
}