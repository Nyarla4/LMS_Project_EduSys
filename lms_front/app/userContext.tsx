"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = localStorage.getItem("loginId");

      // 1. 로그인 정보가 없으면 로딩 종료 후 null 상태 유지 (흐름 제어)
      if (!uid) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // 2. 데이터 페칭 시작
        const userRes = await fetch(`http://localhost:8080/user/entity/${uid}`, {
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!userRes.ok) throw new Error("인증 실패");

        const baseUser = await userRes.json();
        let detailedData = baseUser;

        if (baseUser.usertype === "T") {
          const teacherRes = await fetch(`http://localhost:8080/api/teachers/${baseUser.loginid}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          if (teacherRes.ok) detailedData = await teacherRes.json();
        } else if (baseUser.usertype === "S") {
          const studentRes = await fetch(`http://localhost:8080/api/students/${baseUser.loginid}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          if (studentRes.ok) detailedData = await studentRes.json();
        }

        setUser(detailedData);
      } catch (err) {
        console.error("UserContext 인증 로드 실패:", err);
        setUser(null); // 에러 발생 시에도 비로그인 상태로 처리
      } finally {
        setLoading(false); // 모든 처리가 끝나면 로딩 종료
      }
    };

    fetchUserData();
  }, []);

  // user 데이터와 loading 상태를 함께 전달
  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);