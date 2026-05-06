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
            <a href="/mypage">
                {user && user.name}
            </a>
            <button
                onClick={toggleSidebar}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center':'flex-end',
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
                    <li>
                        <Link href="/courses">
                            {isCollapsed && <span>강의</span> || <span>강의 목록</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/users">
                            {isCollapsed && <span>사용자</span> || <span>사용자 관리</span>}
                        </Link>
                    </li>
                </ul>
            </nav>
    }
        </aside>
    );
}