"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useUser } from "@/app/userContext";
import { useRouter } from "next/navigation";

export default function Counselling() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [teachers, setTeachers] = useState([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tid, setTid] = useState<number>(-1);

  useEffect(() => {
    if (userLoading || !user) return;

    const fetchTeachersData = async () => {
      try {
        const teacherRes = await fetch(`http://localhost:8080/api/teachers/approved`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!teacherRes.ok) throw new Error("인증 실패");

        const detailedData = await teacherRes.json();
        setTeachers(detailedData);
      } catch (err) {
        console.error("선생님 목록 로드 실패", err);
      }
    };
    fetchTeachersData();
  }, [user, userLoading]);

  const register = async () => {
    if (tid === -1) {
      alert("상담받을 선생님을 선택해주세요.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/counsel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sid: user.sid, tid: tid, title: title, content: content }),
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      alert("상담 신청이 등록되었습니다.");
      // 새로고침 대신 목록으로 이동하거나 상태를 초기화하는 것이 UX상 좋지만, 
      // 요청하신 대로 새로고침 로직을 유지하거나 이동 처리할 수 있습니다.
      router.push("/counseling"); 
    } catch (err) {
      alert("등록에 실패했습니다.");
    }
  };

  const onTeacherChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    setTid(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
        
        <p className="text-4xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          새 상담 신청
        </p>

        <div className="bg-[#fcf7f0] border-[#b89b7a] border border-1 rounded-lg p-8 shadow-sm flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1">담당 선생님 선택</label>
            <select 
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all cursor-pointer"
              onChange={onTeacherChanged}
              value={tid}
            >
              <option value="-1">상담하실 선생님을 선택해 주세요</option>
              {teachers.map((teacher: any) => (
                <option key={teacher.tid} value={teacher.tid}>
                  {teacher.user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1">상담 제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요 (최대 100자)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xl font-bold ml-1">상담 내용</label>
            <textarea
              placeholder="상담하실 내용을 상세히 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-[#b89b7a] border-1 border rounded px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] bg-white transition-all h-64 resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg text-lg border-[#b89b7a] border-1 border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#c9b49d] transition-colors"
            >
              취소
            </button>
            
            <button
              type="button"
              onClick={register}
              className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-10 py-2 rounded-lg text-lg font-bold shadow-md transition-all active:scale-95"
            >
              상담 신청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}