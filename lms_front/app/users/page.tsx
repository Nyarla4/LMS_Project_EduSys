"use client";

import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/user/entity", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => console.error("데이터 로딩 실패:", err));
  }, []);

  const UserRow = ({ user }: { user: any }) => {
    const [extraData, setExtraData] = useState<any>(null);
    const [currentType, setCurrentType] = useState(user.usertype);

    useEffect(() => {
      const fetchExtra = async () => {
        let endpoint = "";
        if (currentType === "S") endpoint = `http://localhost:8080/api/students/${user.loginid}`;
        else if (currentType === "T") endpoint = `http://localhost:8080/api/teachers/${user.loginid}`;
        else return;

        try {
          const res = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          if (res.ok) {
            const data = await res.json();
            setExtraData(data);
          }
        } catch (err) { console.error(err); }
      };
      fetchExtra();
    }, [user, currentType]);

    // 타입 변경 핸들러
    const handleTypeChange = async (newType: string) => {
      if (!confirm(`사용자의 권한을 ${newType}으로 변경하시겠습니까?`)) return;

      try {
        const res = await fetch(`http://localhost:8080/user/${user.loginid}/type`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ usertype: newType }),
        });

        if (res.ok) {
          setCurrentType(newType);
          alert("권한이 변경되었습니다.");
          // 타입이 변경되면 상세 정보가 달라지므로 페이지를 새로고침하거나 상태를 초기화합니다.
          window.location.reload();
        }
      } catch (err) {
        alert("변경에 실패했습니다.");
      }
    };

    return (
      <tr className="border-b border-[#d6c2a8] hover:bg-[#f5eee4] transition-colors">
        <td className="px-6 py-4 font-bold text-[#5c4033]">{user.username}</td>

        <td className="px-6 py-4 text-sm text-[#8b5e3c]">
          {currentType === "S" && extraData ? (
            <div className="flex gap-2">
              <span className="bg-[#e7d7c1] px-2 py-0.5 rounded text-xs font-bold">전공: {extraData.major}</span>
              <span className="bg-[#e7d7c1] px-2 py-0.5 rounded text-xs font-bold">{extraData.grade}학년</span>
            </div>
          ) : currentType === "T" && extraData ? (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${extraData.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {extraData.approved ? "● 인증됨" : "○ 미인증"}
            </span>
          ) : (
            <span className="text-[#b89b7a] italic">별도 상세 정보 없음</span>
          )}
        </td>

        {/* 타입 변경 Select Box 영역 */}
        <td className="px-6 py-4 text-center">
          <select
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value)}
            /* 7. 라벨 폼 스타일의 input 스타일 응용 */
            className={`border-[#b89b7a] border-1 border rounded px-3 py-1 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] transition-all cursor-pointer ${currentType === "A" ? "bg-[#8b5e3c] text-white" : "bg-white text-[#5c4033]"
              }`}
          >
            <option value="S">학생 (S)</option>
            <option value="T">교사 (T)</option>
            <option value="A">관리자 (A)</option>
          </select>
        </td>
      </tr>
    );
  };
  return (
    <div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10 font-sans text-[#5c4033]">

      <div className="w-full max-w-6xl flex flex-col gap-6 mt-10 px-10">

        <p className="text-4xl font-bold text-center mb-8 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 shadow-sm">
          사용자 정보 통합 관리
        </p>

        <div className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e7d7c1] text-[#8b5e3c] border-b-2 border-[#b89b7a]">
                <th className="px-6 py-4 font-bold text-lg">이름</th>
                <th className="px-6 py-4 font-bold text-lg">비고 (상세 정보)</th>
                <th className="px-6 py-4 font-bold text-lg text-center">타입</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user: any) => (
                  <UserRow key={user.loginid} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center font-bold text-[#b89b7a]">
                    등록된 사용자가 존재하지 않습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-white hover:bg-[#f5f1e8] text-[#b89b7a] px-8 py-2 rounded-lg font-bold border border-[#d6c2a8] transition-all"
          >
            목록 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}