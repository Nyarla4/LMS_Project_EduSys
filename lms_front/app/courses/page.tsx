// 수강 신청 페이지
"use client";

import { useEffect, useState } from "react";
import { useUser } from "../userContext";

export default function Courses() {
  const { user } = useUser();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>수강 신청</h1>
      
    </main>
  );
}