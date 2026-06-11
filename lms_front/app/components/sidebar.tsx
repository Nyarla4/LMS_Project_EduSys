"use client";

import { useEffect, useState } from 'react';
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
    LogOut,
    User
} from 'lucide-react';
import { useUser } from '../userContext';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { user, loading: userLoading } = useUser();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogin = () => {
        window.location.href = "/login";
    };
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };
    
    useEffect(() => {
        if (userLoading || !user) {
            return;
        }
    }, [user, userLoading]);
    
    return (
        <aside
            className={`sticky top-0 bg-[#f5f1e8] border-r-2 border-[#d6c2a8] p-4 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${isCollapsed ? "w-[90px]" : "w-[200px]"}`}
            style={{ height: '100vh' }}
        >
            {/* 사이드바 토글 버튼 */}
            <button
                onClick={toggleSidebar}
                className="bg-transparent border-none cursor-pointer flex items-center w-full text-[#8b5e3c] focus:outline-none"
                style={{ justifyContent: isCollapsed ? "center" : "flex-end" }}
            >
                {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
            </button>
            {user && (
                <a
                    href="/mypage"
                    className="block text-center text-sm font-bold bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 truncate px-2"
                    style={{ color: '#5c4033', textDecoration: 'none' }} // 강제 스타일 지정
                >
                    {isCollapsed ? <User size={20}/> : (user.user ? user.user.username : user.username)}
                    {!isCollapsed && user?.user?.usertype === 'S' && ` (${user.grade}학년)`}
                </a>
            )}
            <a
                onClick={user ? handleLogout : handleLogin}
                className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white w-full py-2 rounded-lg text-sm font-bold flex justify-center items-center transition-colors border-none cursor-pointer"
                style={{textDecoration: 'none'}}
            >
                {user ? (
                    isCollapsed ? <LogOut size={20} /> : "로그아웃"
                ) : (
                    isCollapsed ? <LogIn size={20} /> : "로그인"
                )}
            </a>

            {user && (
                <nav className="mt-4">
                    <ul className="list-none p-0 flex flex-col gap-3">
                        {[
                            { href: "/", icon: <Home size={24} />, text: "홈", show: true },
                            {
                                href: user.user?.usertype === 'T' ? "/register" : "/apply",
                                icon: <BookOpen size={24} />,
                                text: user.user?.usertype === 'T' ? "수강 등록" : "수강 신청",
                                show: !!user.user
                            },
                            {
                                href: user.user?.usertype === 'T' ? "/myClasses" : user.user?.usertype === 'S' ? "/student" : "#",
                                icon: <PlayCircle size={24} />,
                                text: "강의 관리",
                                show: !!user.user
                            },
                            {
                                href: user.user?.usertype === 'T' ? "/studentGrades" : user.user?.usertype === 'S' ? "/myGrades" : "#",
                                icon: <BarChart3 size={24} />,
                                text: "성적 조회",
                                show: !!user.user
                            },
                            {
                                href: user.user?.usertype === 'T' || user.user?.usertype === 'S' ? "/counseling" : "#",
                                icon: <BarChart3 size={24} />,
                                text: "상담 관리",
                                show: !!user.user
                            },
                            /* 관리자 메뉴 */
                            { href: "/notices", icon: <Bell size={24} />, text: "공지 사항", show: user.usertype === 'A' },
                            { href: "/check/classes", icon: <PlayCircle size={24} />, text: "과목 승인", show: user.usertype === 'A' },
                            { href: "/check/teachers", icon: <Users size={24} />, text: "교사 승인", show: user.usertype === 'A' },
                            { href: "/users", icon: <Users size={24} />, text: "사용자 관리", show: user.usertype === 'A' },
                        ].map((menu, idx) => menu.show && (
                            <li key={idx} className="flex items-center justify-center">
                                <Link
                                    href={menu.href}
                                    className={`w-full flex items-center transition-colors ${isCollapsed
                                        ? "justify-center py-2 hover:bg-[#dbc7b1] rounded-lg" // 접혔을 때: 박스 제거, 아이콘 중앙 정렬
                                        : "gap-3 bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-2 shadow-sm font-bold hover:bg-[#dbc7b1]" // 펼쳐졌을 때: 통합 CSS 3번 박스 형태
                                        }`}
                                    style={{ color: '#5c4033', textDecoration: 'none' }} // 파란색/밑줄 방어
                                >
                                    <div className="shrink-0">{menu.icon}</div>
                                    {!isCollapsed && <span className="truncate">{menu.text}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </aside>
    );
}