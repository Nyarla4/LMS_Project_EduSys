// lms_front/context/UserContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

//   useEffect(() => {
//     // 앱이 켜질 때 백엔드(8080)에서 현재 로그인한 유저 정보를 가져옴
//     fetch("http://localhost:8080/api/auth/me") 
//       .then(res => res.json())
//       .then(data => setUser(data));
//   }, []);
  useEffect(() => {
    // 임시 유저
    fetch("http://localhost:8080/api/users/1")
      .then((res) => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);