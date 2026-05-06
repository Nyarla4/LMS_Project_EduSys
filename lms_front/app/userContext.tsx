// lms_front/context/UserContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. 기본 유저 정보(UID, Type 등)를 먼저 가져옴
        const userRes = await fetch("http://localhost:8080/api/users/2");// 현재 임시 유저, 추후 http://localhost:8080/api/auth/me 등으로 변경 가능성 있음
        const baseUser = await userRes.json();

        let detailedData = baseUser;

        // 2. 유저 타입에 따라 추가 상세 정보 페칭
        if (baseUser.type === "TEACHER") {
          const teacherRes = await fetch(`http://localhost:8080/api/teachers/${baseUser.uid}`);
          detailedData = await teacherRes.json();
        } else if (baseUser.type === "STUDENT") {
          const studentRes = await fetch(`http://localhost:8080/api/students/${baseUser.uid}`);
          detailedData = await studentRes.json();
        }

        // 3. 통합된 데이터를 Provider에 저장
        setUser(detailedData);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);