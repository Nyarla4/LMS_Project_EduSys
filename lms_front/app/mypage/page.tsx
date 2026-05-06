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
          <p>이름: {user.name}</p>
          <p>유형: {user.type}</p>
          <p>ID : {user.id}</p>
          <p>비밀번호: {user.password}</p>
        </div>
      )}
    </main>
  );
}