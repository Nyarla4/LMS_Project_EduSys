"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("username");
    
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedName || "사용자");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">Main</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-dark fw-bold">
                    {username}님 반갑습니다
                  </span>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">로그인</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/signup">회원가입</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}