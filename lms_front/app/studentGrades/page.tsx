// 성적 조회 페이지(교사)
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function ClassRequest() {
  const { user } = useUser();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>성적 조회</h1>
      
    </main>
  );
}