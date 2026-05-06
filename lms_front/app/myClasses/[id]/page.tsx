"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubjectDetailPage() {
  const params = useParams();
  const suId = params.id; // URL의 [id] 값을 가져옴[cite: 2]
  const [subjects, setSubjects] = useState(); // 과목 데이터를 담을 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. user 정보와 tid가 확실히 로드되었을 때만 fetch 실행
    const url = `http://localhost:8080/api/subjects/${suId}`;
      console.log("Fetching subjects from:", url);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setSubjects(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("과목 로드 실패:", err);
          setLoading(false);
        });
  }, []);

  return (
    <div>
      <h1>과목 상세 및 강의 관리 ({subjects?.name})</h1>
      
    </div>
  );
}