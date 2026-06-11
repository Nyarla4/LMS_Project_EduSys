"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../userContext";

interface Notice {
  nid: number;
  title: string;
  content: string;
  active: boolean;
  createDate: string;
}

export default function NoticeDetailPage() {
  const { user } = useUser(); // 관리자 권한 확인용
  const params = useParams();
  const noticeId = params.id; // URL의 [id] 값을 가져옴
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeRes = await fetch("http://localhost:8080/api/notices/all", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if(!noticeRes.ok) {
          throw new Error("공지사항 로드 실패");
        }
        const notices = await noticeRes.json();
        setNotices(notices);

      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);
  function handleToggleActive(nid: number, newState: boolean) {
  const url = `http://localhost:8080/api/notices/${nid}/active?active=${newState}`;
  
  fetch(url, { method: "PUT" })
    .then((res) => {
      if (!res.ok) throw new Error("공지 상태 변경 실패");
      
      setNotices((prevNotices) =>
        prevNotices.map((notice: any) =>
          notice.nid === nid ? { ...notice, active: newState } : notice
        )
      );
    })
    .catch((err) => {
      console.error("공지 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    });
}
  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10 px-10">
        <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          공지 사항
        </p>

        {loading ? (
          <div className="text-center py-20 font-bold text-lg opacity-60">로딩 중...</div>
        ) : notices.length > 0 ? (
          <div className="w-full">
            <ul className="flex flex-col gap-3 list-none p-0">
              {notices.map((notice: any) => (
                <li
                  key={notice.nid}
                  className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg px-6 py-4 shadow-sm flex justify-between items-center transition-all duration-200 hover:bg-[#f5eee4] hover:shadow-md group"
                >
                  <Link
                    href={`/notices/${notice.nid}`}
                    className="text-lg font-bold text-[#5c4033] transition-colors group-hover:text-[#8b5e3c] flex-1"
                  >
                    {notice.title}
                  </Link>
                  {user && user.usertype === "A" && (
                    <div className="flex items-center gap-3 ml-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-sm font-bold text-[#b89b7a]">공개 여부</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only peer" // 실제 체크박스는 숨김
                            checked={notice.active}
                            onChange={(e) => handleToggleActive(notice.nid, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#8b5e3c] peer-focus:ring-2 peer-focus:ring-[#b89b7a] transition-all duration-250"></div>
                          <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white border-gray-300 border rounded-full transition-all duration-250 peer-checked:translate-x-full"></div>
                        </div>
                      </label>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-16 text-center font-bold text-[#b89b7a]">
            등록된 공지사항이 없습니다.
          </div>
        )}

        {user && user.usertype === "A" && (
          <div className="mt-8 flex justify-end">
            <Link href="/notices/create">
              <button
                type="button"
                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-6 py-2 rounded-lg text-lg font-bold transition-all shadow-md active:scale-95"
              >
                공지 작성
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}