"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
    Menu, 
    ChevronLeft, 
    Home, 
    BookOpen, 
    PlayCircle, 
    BarChart3, 
    Bell, 
    Users 
} from 'lucide-react';
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
                {user ? (user.user ? user.user.username : user.username) : "로그인"} {!isCollapsed && user && user.user && user.user.usertype === 'S' && ` (${user.grade}학년)`}
            </a>
            {user && <button className='btn' onClick={handleLogout} style={{ marginLeft: '1rem' }}>로그아웃</button>}
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
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                <Home size={20} />
                                {!isCollapsed && <span>홈</span>}
                            </Link>
                        </li>
                        {user.user &&
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={20} />
                                {!isCollapsed && (
                                    user.user.usertype === 'T' ? 
                                    <Link href="/register" style={{ textDecoration: 'none', color: 'inherit' }}>수강 등록</Link> : 
                                    <Link href="/apply" style={{ textDecoration: 'none', color: 'inherit' }}>수강 신청</Link>
                                )}
                            </li>
                        }
                        {user.user &&
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href={user.user.usertype === 'T' ? "/myClasses" : user.user.usertype === 'S' ? "/enrolledClasses" : "#"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                <PlayCircle size={20} />
                                {!isCollapsed && <span>강의 관리</span>}
                            </Link>
                        </li>
                        }{user.user &&
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href={user.user.usertype === 'T' ? "/studentGrades" : user.user.usertype === 'S' ? "/myGrades" : "#"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                <BarChart3 size={20} />
                                {!isCollapsed && <span>성적 조회</span>}
                            </Link>
                        </li>
                        }
                        {user.usertype === 'A' &&
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href="/notices" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                    <Bell size={20} />
                                    {!isCollapsed && <span>공지사항</span>}
                                </Link>
                            </li>
                        }
                        {user.usertype === 'A' &&
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href="/users" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                    <Users size={20} />
                                    {!isCollapsed && <span>사용자 관리</span>}
                                </Link>
                            </li>
                        }
                    </ul>
                </nav>
            }
        </aside>
    );
}