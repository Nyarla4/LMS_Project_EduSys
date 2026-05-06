// 강의 등록 페이지
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function ClassRequest() {
  const { user } = useUser();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>강의 등록</h1>
      
    </main>
  );
}