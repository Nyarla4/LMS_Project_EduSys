"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronLeft } from 'lucide-react';
import { useUser } from '../userContext';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const { user } = useUser();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <aside style={{
            width: isCollapsed ? '80px' : '250px',
            height: '100vh',
            backgroundColor: '#cecece',
            padding: '1rem',
            borderRight: '1px solid #ddd',
            transition: 'width 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <a href={user ? "/mypage" : "/login"}>
                {user ? (user.user ? user.user.username : user.username) : "로그인"}
            </a>
            {user && <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>로그아웃</button>}
            <button
                onClick={toggleSidebar}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-end',
                    width: '100%'
                }}>
                {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
            </button>
            {user &&
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li>
                            <Link href="/">
                                <span>홈</span>
                            </Link>
                        </li>
                        {user.user &&
                        <li>
                            {user.user.usertype === 'T' ?
                                <Link href="/register">
                                    {isCollapsed && <span>수강</span> || <span>수강 등록</span>}
                                </Link>
                                : user.user.usertype === 'S' &&
                                <Link href="/apply">
                                    {isCollapsed && <span>수강</span> || <span>수강 신청</span>}
                                </Link>}
                        </li>
                        }{user.user &&
                        <li>
                            <Link href={user.user.usertype === 'T' ? "/myClasses" : user.user.usertype === 'S' ? "/enrolledClasses" : "#"}>
                                {isCollapsed && <span>강의</span> || <span>강의 관리</span>}
                            </Link>
                        </li>
                        }{user.user &&
                        <li>
                            <Link href={user.user.usertype === 'T' ? "/studentGrades" : user.user.usertype === 'S' ? "/myGrades" : "#"}>
                                {isCollapsed && <span>성적</span> || <span>성적 조회</span>}
                            </Link>
                        </li>
                        }
                        {user.usertype === 'A' &&
                            <li>
                                <Link href="/notices">
                                    {isCollapsed && <span>공지</span> || <span>공지사항</span>}
                                </Link>
                            </li>
                        }
                        {user.usertype === 'A' &&
                            <li>
                                <Link href="/users">
                                    {isCollapsed && <span>사용자</span> || <span>사용자 관리</span>}
                                </Link>
                            </li>
                        }
                    </ul>
                </nav>
            }
        </aside>
    );
}