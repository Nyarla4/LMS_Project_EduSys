// 강의 관리 페이지(학생)
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function ClassRequest() {
  const { user } = useUser();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>강의 관리</h1>
      
    </main>
  );
}