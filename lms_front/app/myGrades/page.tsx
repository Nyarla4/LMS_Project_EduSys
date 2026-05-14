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
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 text-[#5c4033]">
          성적 조회
        </p>

        {loading ? (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-5 shadow-sm font-bold text-center text-[#8b5e3c]">
            성적을 불러오는 중...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="px-4">
              <label className="text-2xl font-bold text-[#5c4033]">
                {user?.user?.username}님의 성적 리스트
              </label>
            </div>

            <div className="flex flex-col gap-4">
              {scores.length > 0 ? (
                scores.map((score: any) => (
                  <div
                    key={score.gid}
                    className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-5 shadow-sm flex justify-between items-center transition-all hover:shadow-md"
                  >
                    <span className="text-xl font-bold text-[#5c4033]">
                      {score.subjectName}
                    </span>

                    <span className={`text-xl font-bold ${score.score ? "text-[#8b5e3c]" : "text-[#b89b7a]"}`}>
                      {score.score ?? "성적 미입력"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-10 text-center text-[#b89b7a]">
                  조회된 성적 데이터가 없습니다.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded text-lg mx-auto block mt-6 transition-colors"
            >
              뒤로 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}