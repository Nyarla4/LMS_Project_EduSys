"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

interface Subject {
  subid: number;
  name: string;
  tid: number;
}

interface StudentExtra {
  major: string;
  grade: number;
}

interface TeacherExtra {
  tid: number;
  approved: boolean;
  subjects?: Subject[];
  user?: { username: string };
}

interface User {
  loginid: string;
  username: string;
  usertype: "S" | "T" | "A";
}

const UserRow = memo(function UserRow({
  user,
  onTypeChange,
  onOpenSubjectModal,
}: {
  user: User;
  onTypeChange: (loginid: string, newType: User["usertype"]) => Promise<void>;
  onOpenSubjectModal: (subject: Subject | null) => void;
}) {
  const [extraData, setExtraData] = useState<StudentExtra | TeacherExtra | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchExtra = async () => {
      if (user.usertype === "S") {
        const res = await fetch(`http://localhost:8080/api/students/${user.loginid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setExtraData(data);
        return;
      }

      if (user.usertype === "T") {
        const res = await fetch(`http://localhost:8080/api/teachers/${user.loginid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setExtraData(data);

        if (data?.tid) {
          const subjectRes = await fetch(`http://localhost:8080/api/subjects/teacher/${data.tid}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          if (subjectRes.ok) {
            const subjectData = (await subjectRes.json()) as Subject[];
            if (!cancelled) {
              setExtraData((prev) => ({ ...(prev ?? {}), subjects: subjectData } as TeacherExtra));
            }
          }
        }
      }
    };

    fetchExtra();

    return () => {
      cancelled = true;
    };
  }, [user.loginid, user.usertype]);

  const handleTypeChange = async (newType: User["usertype"]) => {
    if (!confirm(`사용자의 권한을 ${newType}으로 변경하시겠습니까?`)) return;
    await onTypeChange(user.loginid, newType);
  };

  const studentExtra = user.usertype === "S" ? (extraData as StudentExtra | null) : null;
  const teacherExtra = user.usertype === "T" ? (extraData as TeacherExtra | null) : null;

  return (
    <tr className="border-b border-[#d6c2a8] hover:bg-[#f5eee4] transition-colors">
      <td className="px-6 py-4 font-bold text-[#5c4033]">{user.username}</td>

      <td className="px-6 py-4 text-sm text-[#8b5e3c]">
        {studentExtra ? (
          <div className="flex gap-2">
            <span className="bg-[#e7d7c1] px-2 py-0.5 rounded text-xs font-bold">전공: {studentExtra.major}</span>
            <span className="bg-[#e7d7c1] px-2 py-0.5 rounded text-xs font-bold">{studentExtra.grade}학년</span>
          </div>
        ) : teacherExtra ? (
          <span className="flex gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${teacherExtra.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {teacherExtra.approved ? "● 인증됨" : "○ 미인증"}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${teacherExtra.subjects && teacherExtra.subjects.length > 0 ? "bg-green-100 text-green-700 cursor-pointer" : "bg-red-100 text-red-700"}`}
              onClick={() => onOpenSubjectModal(teacherExtra.subjects && teacherExtra.subjects.length > 0 ? teacherExtra.subjects[0] : null)}
            >
              {teacherExtra.subjects && teacherExtra.subjects.length > 0 ? `● ${teacherExtra.subjects[0].name} 담당` : "○ 과목 없음"}
            </span>
          </span>
        ) : (
          <span className="text-[#b89b7a] italic">별도 상세 정보 없음</span>
        )}
      </td>

      <td className="px-6 py-4 text-center">
        <select
          value={user.usertype}
          onChange={(e) => handleTypeChange(e.target.value as User["usertype"])}
          className={`border-[#b89b7a] border rounded px-3 py-1 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] transition-all cursor-pointer ${user.usertype === "A" ? "bg-[#8b5e3c] text-white" : "bg-white text-[#5c4033]"}`}
        >
          <option value="S">학생 (S)</option>
          <option value="T">교사 (T)</option>
          <option value="A">관리자 (A)</option>
        </select>
      </td>
    </tr>
  );
});

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [approvedFreeTeachers, setApprovedTeachers] = useState<TeacherExtra[]>([]);
  const [selectedTid, setSelectedTid] = useState<number>(-1);

  useEffect(() => {
    fetch("http://localhost:8080/user/entity", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        fetch("http://localhost:8080/api/teachers/approved", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
          .then((res) => res.json())
          .then(async (approvedData: Array<{ tid: number; user?: { username: string } }>) => {
            const teachersWithSubjects = await Promise.all(
              approvedData.map(async (teacher) => {
                const subjectRes = await fetch(`http://localhost:8080/api/subjects/teacher/${teacher.tid}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                if (!subjectRes.ok) return null;

                const subjects = (await subjectRes.json()) as Subject[];
                return subjects.length === 0
                  ? ({ tid: teacher.tid, approved: true, subjects, user: teacher.user } as TeacherExtra)
                  : null;
              })
            );

            setApprovedTeachers(teachersWithSubjects.filter(Boolean) as TeacherExtra[]);
          })
          .catch((err) => console.error("인증된 교사 데이터 로딩 실패:", err));
      })
      .catch((err) => console.error("데이터 로딩 실패:", err));
  }, []);

  const handleSubjectChange = useCallback(async (suid: number, tid: number) => {
    if (!confirm("담당 과목을 변경하시겠습니까?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/teachers/subject/${suid}/${tid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("subject update failed");

      setApprovedTeachers((prev) => prev.filter((teacher) => teacher.tid !== tid));
      alert("담당 과목이 변경되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("변경에 실패했습니다.");
    }
  }, []);

  const handleTypeChange = useCallback(async (loginid: string, newType: User["usertype"]) => {
    try {
      const res = await fetch(`http://localhost:8080/user/${loginid}/type`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ usertype: newType }),
      });

      if (!res.ok) throw new Error("type update failed");

      setUsers((prev) => prev.map((userItem) =>
        userItem.loginid === loginid ? { ...userItem, usertype: newType } : userItem
      ));
      alert("권한이 변경되었습니다.");
    } catch (err) {
      console.error(err);
      alert("변경에 실패했습니다.");
    }
  }, []);

  const handleSubjectModalOpen = useCallback((subject: Subject | null) => {
    setSelectedSubject(subject);
    if (subject) {
      setSelectedTid(-1);
      setIsModalOpen(true);
    }
  }, []);

  const availableTeachers = useMemo(
    () => approvedFreeTeachers.filter((teacher: TeacherExtra) => teacher.tid !== selectedSubject?.tid),
    [approvedFreeTeachers, selectedSubject?.tid]
  );
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
                users.map((user: User) => (
                  <UserRow
                    key={user.loginid}
                    user={user}
                    onTypeChange={handleTypeChange}
                    onOpenSubjectModal={handleSubjectModalOpen}
                  />
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

        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcf7f0] border-[#b89b7a] border rounded-lg p-6 shadow-md font-bold w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-center mb-6 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-1.5 text-[#5c4033]">
                담당 변경
              </h2>
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-lg font-bold text-[#5c4033]">
                  현재 과목: <span className="text-[#8b5e3c] font-extrabold">{selectedSubject?.name}</span>
                </label>

                <select
                  value={selectedTid}
                  onChange={(e) => setSelectedTid(Number(e.target.value))}
                  className="border-[#b89b7a] border rounded px-3 py-2 bg-white text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] font-bold cursor-pointer"
                >
                  <option value={-1} disabled>
                    담당 교사를 선택하세요
                  </option>
                  {availableTeachers.map((teacher: TeacherExtra) => (
                    <option key={teacher.tid} value={teacher.tid}>
                      {teacher.user?.username ?? `교사 ${teacher.tid}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSubject && selectedTid !== -1) {
                      handleSubjectChange(selectedSubject.subid, selectedTid);
                    }
                  }}
                  className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-5 py-2 rounded text-base font-bold transition-colors flex-1"
                >
                  변경 적용
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded text-base border-[#b89b7a] border font-bold bg-[#dbc7b1] text-[#5c4033] hover:bg-[#cbb59c] transition-colors flex-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}