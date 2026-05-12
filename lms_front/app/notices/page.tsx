"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../userContext";
import styles from "./Notice.module.css";

interface Notice {
  nid: number;
  title: string;
  content: string;
  active: boolean;
  createDate: string;
}

export default function NoticeDetailPage() {
  const { user } = useUser(); // 관리자 권한 확인용
  const params = useParams();
  const noticeId = params.id; // URL의 [id] 값을 가져옴
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeRes = await fetch("http://localhost:8080/api/notices/all");
        const notices = await noticeRes.json();
        setNotices(notices);

      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);
  function handleToggleActive(nid: number, newState: boolean) {
  const url = `http://localhost:8080/api/notices/${nid}/active?active=${newState}`;
  
  fetch(url, { method: "PUT" })
    .then((res) => {
      if (!res.ok) throw new Error("공지 상태 변경 실패");
      
      // ✅ 성공 시: 리액트 상태(notices)를 순회하며 해당 ID의 상태만 업데이트
      setNotices((prevNotices) =>
        prevNotices.map((notice: any) =>
          notice.nid === nid ? { ...notice, active: newState } : notice
        )
      );
    })
    .catch((err) => {
      console.error("공지 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    });
}
  return (
    <div>
      <h1>공지 상세</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : notices.length > 0 ? (
          <div>
            <ul className={styles.noticeList}>
              {notices.map((notice: any) => (
                <li key={notice.nid} className={styles.noticeItem}>
                  {/* 1. 공지사항 제목 영역 */}
                  <Link href={`/notices/${notice.nid}`} className={styles.link}>
                    {notice.title}
                  </Link>

                  {/* 2. 관리자 전용 액션 영역 */}
                  {user && user.usertype === "A" && (
                    <div className={styles.adminSection}>
                      <label className={styles.label}>
                        <input
                          id={`notice-${notice.nid}`}
                          role="switch"
                          type="checkbox"
                          checked={notice.active}
                          onChange={(e) => handleToggleActive(notice.nid, e.target.checked)}
                          className={styles.checkbox}
                        />
                        <span>공개 여부</span>
                      </label>
                    </div>
                  )}
                </li>
              ))}
            </ul>
        </div>
      ) : (
        <p>공지가 없습니다.</p>
      )}
    </div>
  );
}