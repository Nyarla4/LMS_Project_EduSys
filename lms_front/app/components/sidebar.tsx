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
    Users, 
    LogIn,
    LogOut
} from 'lucide-react';
import { useUser } from '../userContext';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const { user } = useUser();

    const handleLogin = () => {
        window.location.href = "/login";
    };
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <aside style={{
            width: isCollapsed ? '130px' : '200px',
            height: '100vh',
            backgroundColor: '#f5f1e8',
            padding: '1rem',
            borderRight: '1px solid #8b5e3c',
            transition: 'width 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <button
                onClick={toggleSidebar}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    alignItems: 'center',
                    color: '#8b5e3c',
                    display: 'flex',
                    width: '100%',
                    justifyContent: isCollapsed ? 'flex-start' : 'flex-end'
                }}>
                {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
            </button>
            {user &&
                <a href='"/mypage"'>
                    {user.user ? user.user.username : user.username}{!isCollapsed && user && user.user && user.user.usertype === 'S' && ` (${user.grade}학년)`}
                </a>
            }
            <button className='btn btn-light' onClick={user ? handleLogout : handleLogin} style={{ color: '#8b5e3c' }}>{user ? (isCollapsed ? <LogOut size={20} /> : "로그아웃") : (isCollapsed ? <LogIn size={20} /> : "로그인")}</button>
            {user &&
                <nav style={{color: '#8b5e3c'}}>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', backgroundColor: '#e7d7c1' }}>
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
                            <Link href={user.user.usertype === 'T' ? "/myClasses" : user.user.usertype === 'S' ? "/student" : "#"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
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
                                    {!isCollapsed && <span>공지 사항</span>}
                                </Link>
                            </li>
                        }
                        {user.usertype === 'A' &&
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href="/check/classes" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                    <PlayCircle size={20} />
                                    {!isCollapsed && <span>강의 검토</span>}
                                </Link>
                            </li>
                        }
                        {user.usertype === 'A' &&
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href="/check/teachers" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                                    <Users size={20} />
                                    {!isCollapsed && <span>교사 인증</span>}
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