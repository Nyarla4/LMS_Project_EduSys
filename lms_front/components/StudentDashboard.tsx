"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../app/userContext";

// YouTube API 타입을 위한 전역 선언
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const tabs = [
  "강의 계획서",
  "출석 현황",
  "동영상 강의",
  "시험 정보",
  "과제 목록",
] as const;

type Tab = (typeof tabs)[number];

interface Subject {
  subid: number;
  name: string;
  planFile?: string; // 강의 계획서 PDF 경로 (DB 컬럼명 planFile 대응)
}

interface Lesson {
  lid: number;
  name: string;
  date: string;
  subject?: Subject;
}

interface Attendance {
  aid: number;
  date: string;
  whether: boolean;
}

interface ExamSet { // Changed from Exam to ExamSet
  esid: number; // ExamSet ID
  name: string;
  subid?: number; // Subject ID (for navigation)
  examDate?: string; // Use examDate from ExamSet
  status?: string;
  totalScore?: number; // 합산 점수 필드 추가
}

// 백엔드에서 Work(과제 정보)와 WorkSubmit(제출/점수 정보)을 합쳐서 보내주는 DTO 구조
interface AssignmentDTO {
  wid: number;
  title: string;
  dueDate: string;
  grade?: string;     // WorkSubmit에서 옴
  fileName?: string;  // WorkSubmit에서 옴
  status?: string; // UI용
}

interface WorkSubmit {
  wsid: number;
  wid: number;
  sid: number;
  studentName: string;
  fileName: string;
  grade: string;
}

interface Answer {
  ansid: number;
  content: string;
  tid: number;
  queid: number;
}

interface Question {
  queid: number;
  content: string;
  lid: number;
  sid?: number;
  studentName?: string; // DTO의 studentName 대응
  answer?: Answer;
}

interface Video {
  lid: number;
  name: string;
  fileUrl: string;
  duration: number;
  week: number;
  date?: string;
}

function TabPanel({ 
  activeTab,
  lessons,
  attendanceData,
  subjectInfo,
  exams,
  assignments,
  videoList,
  progressMap,
  activeVideoId,
  apiBase,
  sessionBaseProgress,
  subjectId,
  currentSessionSeconds,
  onAssignmentSelect,
  onAddAssignmentClick,
  onVideoSelect,
  onSyllabusUploadClick,
  onAddVideoClick,
  onDeleteVideo,
  onAddExamSetClick,
  onEditVideo,
  onEditExamSet,
  onDeleteExamSet,
  isBatchEditMode,
  selectedAttendanceLesson,
  studentAttendanceList,
  onToggleBatchEdit,
  onSelectLessonForAttendance,
  onUpdateAttendance,
  onSaveAttendance
}: { 
  activeTab: Tab; 
  lessons: Lesson[];
  attendanceData: Attendance[];
  exams: ExamSet[];
  assignments: AssignmentDTO[];
  videoList: Video[];
  progressMap: Record<number, number>;
  activeVideoId?: number;
  apiBase: string;
  isBatchEditMode: boolean;
  selectedAttendanceLesson: Lesson | null;
  studentAttendanceList: any[];
  onToggleBatchEdit: () => void;
  onSelectLessonForAttendance: (lesson: Lesson | null) => void;
  onUpdateAttendance: (sid: number, whether: boolean) => void;
  onSaveAttendance: () => void;
  sessionBaseProgress: number;
  subjectInfo?: Subject | null;
  subjectId?: number | string; // subjectId 타입 확장
  currentSessionSeconds: number;
  onAssignmentSelect: (assignment: AssignmentDTO) => void;
  onAddAssignmentClick?: () => void;
  onVideoSelect: (video: Video) => void;
  onSyllabusUploadClick?: () => void;
  onAddVideoClick?: () => void;
  onDeleteVideo?: (lid: number) => void;
  onAddExamSetClick?: () => void;
  onEditVideo?: (video: Video) => void;
  onEditExamSet?: (examSet: ExamSet) => void;
  onDeleteExamSet?: (esid: number) => void;
}) {
  // 페이지네이션 상태 추가
  const [attPage, setAttPage] = useState(1);
  const [vidPage, setVidPage] = useState(1);
  const [examPage, setExamPage] = useState(1);
  const [assignPage, setAssignPage] = useState(1);
  const itemsPerPage = 10;

  // 공통 페이지네이션 UI 컴포넌트
  const PaginationUI = ({ current, total, onPageChange }: { current: number; total: number; onPageChange: (p: number) => void }) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-full text-xs font-bold transition ${
              current === page
                ? "bg-[#8b5e3c] text-white shadow-md"
                : "bg-[#dbc7b1] text-[#5c4033] hover:bg-[#b89b7a]"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  const { user } = useUser();
  // 데이터 구조를 변수로 뽑아 가독성 높임 (학생/교사 객체 내의 user 또는 관리자 객체 자체)
  const profile = user?.user || user;
  const isTeacher = profile?.usertype === 'T';
  const usertype = profile?.usertype;
  const isOnlyAdmin = usertype === 'A'; // 관리자인 경우

  // 오늘 날짜 문자열 (YYYY-MM-DD) - 과제 마감 기한 및 상태 체크용
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (activeTab === "강의 계획서") {
    const planFile = subjectInfo?.planFile;
    
    // PDF 뷰어의 도구 모음을 숨기고 가로 폭에 맞게 꽉 채우는 파라미터 추가
    // toolbar=0: 상단바 숨김, navpanes=0: 사이드바 숨김, view=FitH: 가로 맞춤
    const pdfParams = "#toolbar=0&navpanes=0&view=FitH";
    
    const baseSyllabusUrl = planFile 
      ? `${apiBase}/files/pdf/${encodeURIComponent(planFile)}` 
      : `${apiBase}/files/syllabus.pdf`;

    const syllabusViewUrl = baseSyllabusUrl + "?download=false" + pdfParams;
    const syllabusDownloadUrl = baseSyllabusUrl + "?download=true";

    return (
      <section className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm font-bold">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3d2b1f]">강의 계획서 미리보기</h2>
            <p className="mt-2 text-sm text-[#7b6346]">과목별 수업 계획서를 내려받거나 바로 확인할 수 있습니다.</p>
          </div>
          <a 
            href={syllabusDownloadUrl}
            target="_blank" // 새 탭에서 열기
            className="inline-flex items-center rounded-full bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6f4a2f]"
            download
          >
            파일 다운로드
          </a>
        </div>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-[#f1e1c4] bg-[#fbf1e8]">
          <iframe
            src={syllabusViewUrl}
            width="100%"
            height="100%"
            title="Syllabus PDF Viewer"
            className="h-full w-full"
          >
            이 브라우저는 iframe을 지원하지 않습니다.
          </iframe>
        </div>
        
        {/* 교사 전용 관리 영역 */}
        {isTeacher && (
          <div className="mt-6 flex justify-end gap-3 border-t border-[#e6d1a7] pt-6">
            <button 
              onClick={onSyllabusUploadClick}
              className="rounded-full bg-[#3d2b1f] px-6 py-2 text-sm font-bold text-white hover:bg-black transition-colors"
            >
              계획서 파일 교체
            </button>
          </div>
        )}
      </section>
    );
  }

  if (activeTab === "출석 현황") {
    return (
      <section className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm font-bold">
        {!selectedAttendanceLesson ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#3d2b1f]">출석 현황</h2>
              {isTeacher && (
                <button 
                  onClick={onToggleBatchEdit}
                  className={`rounded-full px-4 py-2 text-xs font-bold text-white transition ${isBatchEditMode ? "bg-rose-500 hover:bg-rose-600" : "bg-[#8b5e3c] hover:bg-[#6f4a2f]"}`}
                >
                  {isBatchEditMode ? "수정 취소" : "출석부 일괄 수정"}
                </button>
              )}
            </div>
            {/* 페이지네이션 슬라이싱 적용 */}
            <div className="overflow-x-auto rounded-lg border border-[#b89b7a] bg-white shadow-sm">
              <table className="min-w-full divide-y divide-[#b89b7a] text-left text-sm text-[#5c4033]">
                <thead className="bg-[#e7d7c1] text-[#3d2b1f]">
                  <tr>
                    <th className="px-4 py-4">학습 기간</th>
                    <th className="px-4 py-4">강의명</th>
                    <th className="px-4 py-4">상태</th>
                    <th className="px-4 py-4">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9d7b0] bg-white">
                  {lessons.slice((attPage - 1) * itemsPerPage, attPage * itemsPerPage).map((lesson) => {
                    const startDate = new Date(lesson.date);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    const dateRange = `${lesson.date} ~ ${endDate.toISOString().split('T')[0]}`;
                    const att = attendanceData.find(a => a.date === lesson.date);
                    const video = videoList.find(v => v.lid === lesson.lid);
                    const savedTime = progressMap[lesson.lid] || 0;
                    const totalProgress = (activeVideoId === lesson.lid && sessionBaseProgress !== undefined)
                      ? (sessionBaseProgress + currentSessionSeconds)
                      : savedTime;
                    const isPresentByVideo = video && video.duration > 0 && (totalProgress / video.duration) >= 0.9;

                    return (
                      <tr key={lesson.lid} className="hover:bg-[#f5eee4] transition-colors">
                        <td className="px-4 py-4">{dateRange}</td>
                        <td className="px-4 py-4">{lesson.name}</td>
                        <td className="px-4 py-4">
                          {isTeacher ? (
                            <span className="text-gray-400 italic text-xs">수강생 전용 정보</span>
                          ) : (
                            <span className={(isPresentByVideo || (att && att.whether)) ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                              {isPresentByVideo || (att && att.whether) ? "출석" : "결석"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {isTeacher ? (
                            isBatchEditMode ? (
                              <button 
                                onClick={() => onSelectLessonForAttendance(lesson)}
                                className="rounded bg-[#3d2b1f] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-black transition-colors"
                              >
                                학생별 관리
                              </button>
                            ) : (
                              (() => {
                                const lessonAttendances = attendanceData.filter(a => a.date === lesson.date);
                                const presentCount = lessonAttendances.filter(a => a.whether).length;
                                const absentCount = lessonAttendances.length - presentCount;
                                return (
                                  <span className="text-[11px] font-medium whitespace-nowrap">
                                    <span className="text-red-600">출석: {presentCount}</span> / <span className="text-blue-600">결석: {absentCount}</span>
                                  </span>
                                );
                              })()
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationUI current={attPage} total={lessons.length} onPageChange={setAttPage} />
          </>
        ) : (
          /* 학생별 출석 수정 모드 */
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#3d2b1f]">
                <span className="text-[#8b5e3c] mr-2">[{selectedAttendanceLesson.name}]</span> 
                학생별 출석 수정
              </h2>
              <div className="flex gap-2">
                <button onClick={() => onSelectLessonForAttendance(null)} className="rounded-full border border-[#8b5e3c] px-4 py-2 text-xs font-bold text-[#8b5e3c] hover:bg-[#dbc7b1] transition-colors">취소</button>
                <button onClick={onSaveAttendance} className="rounded-full bg-[#8b5e3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f4a2f] shadow-md transition-colors">저장하기</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#b89b7a] bg-white shadow-sm">
              <table className="min-w-full divide-y divide-[#b89b7a] text-left text-sm text-[#5c4033]">
                <thead className="bg-[#e7d7c1] text-[#3d2b1f]">
                  <tr>
                    <th className="px-4 py-4">학생명</th>
                    <th className="px-4 py-4 text-center">비디오 시청 현황</th>
                    <th className="px-4 py-4 text-center">출석 체크</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b89b7a] bg-white">
                  {studentAttendanceList.length > 0 ? studentAttendanceList.map((record) => (
                    <tr key={record.sid} className="hover:bg-[#f5eee4] transition-colors">
                      <td className="px-4 py-4 font-bold">{record.studentName}</td>
                      <td className="px-4 py-4 text-center">
                        {record.isPresentByVideo ? (
                          <span className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full border border-blue-100">시청완료</span>
                        ) : (
                          <span className="text-gray-400 text-xs">미달성</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={record.whether}
                          onChange={(e) => onUpdateAttendance(record.sid, e.target.checked)}
                          className="w-5 h-5 accent-[#8b5e3c] cursor-pointer"
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-gray-400">수강 중인 학생 정보가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    );
  }

  if (activeTab === "동영상 강의") {
    return (
      <section className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm font-bold">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#3d2b1f]">동영상 강의</h2>
          {isTeacher && (
            <button 
              onClick={onAddVideoClick}
              className="rounded-full bg-[#8b5e3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f4a2f] transition-colors"
            >
              + 영상 추가 업로드
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {videoList.length > 0 ? (
            videoList.slice((vidPage - 1) * itemsPerPage, vidPage * itemsPerPage).map((video) => {
              // 현재 재생 중인 영상은 (세션 시작 시점의 진도 + 현재 세션 시청 시간)으로 실시간 계산
              // 그 외 영상은 저장된 누적 시청 시간(progressMap)을 그대로 사용
              const savedTime = progressMap[video.lid] || 0;
              const totalProgress = (activeVideoId === video.lid && sessionBaseProgress !== undefined)
                ? (sessionBaseProgress + currentSessionSeconds)
                : savedTime;
              
              const percentage = video.duration > 0 
                ? Math.min(100, Math.floor((totalProgress / video.duration) * 100)) 
                : 0;

              return (
                <article
                  key={video.lid} 
                  className="rounded-lg border border-[#b89b7a] bg-white p-5 transition duration-200 hover:border-[#8b5e3c] hover:bg-[#f5eee4]"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="cursor-pointer flex-1" onClick={() => onVideoSelect(video)}>
                        <h3 className="text-base font-bold text-[#3d2b1f]">{video.name}</h3>
                        <p className="mt-2 text-sm text-[#7b6346]">{video.week}주차 학습 영상</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!isTeacher && <span className="rounded-full bg-[#dbc7b1] px-3 py-1 text-xs font-bold text-[#5c4033]">{percentage}%</span>}
                        {isTeacher && (
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEditVideo?.(video); }}
                              className="rounded px-2 py-0.5 text-[10px] font-bold text-white bg-slate-400 hover:bg-[#8b5e3c] transition-colors"
                            >
                              수정
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteVideo?.(video.lid); }}
                              className="rounded px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isTeacher && (
                      <div className="space-y-2">
                        <div className="h-3 overflow-hidden rounded-full bg-[#e7d7c1]">
                          <div className="h-full rounded-full bg-[#8b5e3c] transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <p className="text-xs text-[#7b6346]">
                          {Math.floor(video.duration / 60)}분 {video.duration % 60}초 중{" "}
                          {Math.floor(totalProgress / 60)}분 {totalProgress % 60}초 시청
                          ({percentage}%)
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="col-span-2 py-8 text-center text-[#7b6346]">
              현재 등록된 동영상 강의가 없습니다.
            </p>
          )}
        </div>
        <PaginationUI current={vidPage} total={videoList.length} onPageChange={setVidPage} />
      </section>
    );
  }

  if (activeTab === "시험 정보") {
    return (
      <section className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm font-bold">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#3d2b1f]">시험 정보</h2>
          {isTeacher && (
            <button onClick={onAddExamSetClick} className="rounded-full bg-[#8b5e3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f4a2f] transition-colors">
              + 시험 세트 생성
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#b89b7a] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#b89b7a] text-left text-sm text-[#5c4033]">
            <thead className="bg-[#e7d7c1] text-[#3d2b1f]">
              <tr>
                <th className="px-4 py-4">시험명</th>
                <th className="px-4 py-4">일정</th>
                <th className="px-4 py-4">상태</th>
                <th className="px-4 py-4">점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b89b7a] bg-white">
              {exams.length > 0 ? (
                exams.slice((examPage - 1) * itemsPerPage, examPage * itemsPerPage).map((examSet) => {
                  const canAccess = isTeacher || examSet.status === "진행중" || examSet.status === "종료";
                  return (
                  <tr
                    key={examSet.esid} 
                    className={`${canAccess ? "hover:bg-[#f5eee4] cursor-pointer" : "opacity-50 cursor-not-allowed"} ${!isTeacher && examSet.status === "종료" ? "opacity-50" : ""} transition-colors`}
                    onClick={() => {
                      if (canAccess) {
                        window.location.href = `/myClasses/${subjectId || lessons[0]?.subject?.subid || 'all'}/${examSet.esid}`;
                      } else {
                        alert("시험 기간이 아닙니다.");
                      }
                    }}
                  >
                    <td className="px-4 py-4 font-bold text-[#8b5e3c]">{examSet.name || `시험 #${examSet.esid}`}</td>
                    <td className="px-4 py-4">
                      {examSet.examDate 
                        ? new Date(examSet.examDate).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })
                        : "일정 미정"}
                    </td>
                    <td className={`px-4 py-4 font-bold ${examSet.status === "진행중" ? "text-blue-600" : examSet.status === "종료" ? "text-red-500" : "text-gray-500"}`}>
                      {examSet.status}
                    </td>
                    <td className="px-4 py-4">
                      {isTeacher ? (
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditExamSet?.(examSet); }}
                            className="rounded px-2 py-0.5 text-[10px] font-bold text-white bg-slate-400 hover:bg-[#8b5e3c] transition-colors"
                          >
                            수정
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteExamSet?.(examSet.esid); }}
                            className="rounded px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                          <span className="font-bold text-[#8b5e3c]">
                            {examSet.status === "종료"
                              ? `${examSet.totalScore ?? 0}점`
                              : examSet.totalScore !== undefined && examSet.totalScore !== null
                                ? `${examSet.totalScore}점`
                                : "-"}
                          </span>
                      )}
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#7b6346]">등록된 시험 정보가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationUI current={examPage} total={exams.length} onPageChange={setExamPage} />
      </section>
    );
  }

  return (
    <section className="bg-[#fcf7f0] border-[#b89b7a] border-1 border rounded-lg p-6 shadow-sm font-bold">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#3d2b1f]">과제 목록</h2>
        {isTeacher && (
          <button 
            onClick={onAddAssignmentClick}
            className="rounded-full bg-[#8b5e3c] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f4a2f] transition-colors"
          >
            + 새 과제 생성
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#b89b7a] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[#b89b7a] text-left text-sm text-[#5c4033]">
          <thead className="bg-[#e7d7c1] text-[#3d2b1f]">
            <tr>
              <th className="px-4 py-4">과제명</th>
              <th className="px-4 py-4">마감일</th>
              <th className="px-4 py-4">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b89b7a] bg-white">
            {assignments.length > 0 ? assignments.slice((assignPage - 1) * itemsPerPage, assignPage * itemsPerPage).map((assignment) => {
              const isDeadlinePassed = !isTeacher && assignment.dueDate < todayStr;
              return (
              <tr 
                key={assignment.wid} 
                className={`hover:bg-[#f5eee4] cursor-pointer ${isDeadlinePassed ? "opacity-50" : ""} transition-colors`} 
                onClick={() => onAssignmentSelect(assignment)}
              >
                <td className="px-4 py-4">{assignment.title}</td>
                <td className="px-4 py-4">{assignment.dueDate}</td>
                <td className="px-4 py-4">
                  {isTeacher ? (
                    <span className="text-[#8b5e3c] font-bold">현황 보기</span>
                  ) : (
                    assignment.status
                      ? assignment.status
                      : assignment.grade && assignment.grade !== ""
                        ? "채점완료"
                        : assignment.fileName && assignment.fileName !== ""
                          ? "제출완료"
                          : "제출전"
                  )}
                </td>
              </tr>
            );
          }) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[#7b6346]">등록된 과제가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationUI current={assignPage} total={assignments.length} onPageChange={setAssignPage} />
    </section>
  );
}

export default function StudentDashboard({ subjectId }: { subjectId?: number }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("강의 계획서");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<ExamSet[]>([]); // Changed to ExamSet[]
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDTO | null>(null);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [showVideoQna, setShowVideoQna] = useState(false);
  const [subjectInfo, setSubjectInfo] = useState<Subject | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<WorkSubmit[]>([]);
  const [mySubmission, setMySubmission] = useState<WorkSubmit | null>(null);
  const [newQnaContent, setNewQnaContent] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [teacherAnswer, setTeacherAnswer] = useState('');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingExamSet, setEditingExamSet] = useState<ExamSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false); // 학생 질문 작성 모드 상태
  const [isEditingQuestion, setIsEditingQuestion] = useState(false); // 기존 질문 수정 모드 상태
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [sessionBaseProgress, setSessionBaseProgress] = useState(0); // 현재 시청 세션 시작 시점의 DB 진도
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0); // 현재 세션 순수 시청 시간
  const [qnaPage, setQnaPage] = useState(1); // QnA 전용 페이징 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', dueDate: '' });
  
  // 출석부 일괄 수정 관련 상태
  const [isBatchEditMode, setIsBatchEditMode] = useState(false);
  const [selectedAttendanceLesson, setSelectedAttendanceLesson] = useState<Lesson | null>(null);
  const [studentAttendanceList, setStudentAttendanceList] = useState<any[]>([]);

  // 실시간 진도 추적을 위한 Refs (언마운트/종료 시점의 최신값 보장용)
  const sessionBaseProgressRef = useRef(0);
  const currentSessionSecondsRef = useRef(0);
  const selectedVideoRef = useRef<Video | null>(null);

  useEffect(() => { sessionBaseProgressRef.current = sessionBaseProgress; }, [sessionBaseProgress]);
  useEffect(() => { currentSessionSecondsRef.current = currentSessionSeconds; }, [currentSessionSeconds]);
  useEffect(() => { selectedVideoRef.current = selectedVideo; }, [selectedVideo]);

  const [isAddExamSetModalOpen, setIsAddExamSetModalOpen] = useState(false);
  const [newExamSet, setNewExamSet] = useState({ name: '', examDate: '' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({ name: '', date: '', url: '' });

  const ytPlayerRef = useRef<any>(null); // 유튜브 플레이어 인스턴스 저장용
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  const { user, loading: userLoading } = useUser();

  // 컴포넌트 메인 로직에서도 동일하게 단순화된 변수 사용
  const profile = user?.user || user;
  const usertype = profile?.usertype;
  // 학생일 경우에만 studentId를 가져오고, 교사일 경우 null로 설정하여 학생 전용 API 호출 방지
  const studentId = usertype === 'S' ? (user?.sid || profile?.userid || profile?.id) : null;
  // 교사일 경우 teacherId를 가져옴 (현재는 사용되지 않지만 확장성을 위해 유지)
  const teacherId = usertype === 'T' ? (user?.tid || profile?.userid || profile?.id) : null;

  const API_BASE = "http://localhost:8080/api";
  const isTeacher = usertype === 'T';

  const enrichAssignmentsWithStatus = async (works: AssignmentDTO[]) => {
    if (isTeacher || !studentId || works.length === 0) return works;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      };

      const enriched = await Promise.all(
        works.map(async (assignment) => {
          try {
            const res = await fetch(`${API_BASE}/work-submits/work/${assignment.wid}/student/${studentId}`, { headers });
            
            // 204 No Content 응답은 res.ok가 true이지만 본문이 없으므로 res.json() 호출 시 오류 발생
            // 따라서 204 상태 코드를 명시적으로 처리하여 JSON 파싱을 건너뜁니다.
            if (res.status === 204) {
              return {
                ...assignment,
                fileName: "",
                grade: "",
                status: "제출전",
              };
            } else if (res.ok) {
              const submission = await res.json();
              const status = submission.grade && submission.grade !== ""
                ? "채점완료"
                : submission.fileName && submission.fileName !== ""
                  ? "제출완료"
                  : "제출전";

              return {
                ...assignment,
                fileName: submission.fileName ?? "",
                grade: submission.grade ?? "",
                status,
              };
            }
          } catch (err) {
            console.error(`과제 상태 조회 실패 (wid=${assignment.wid}):`, err);
          }

          return {
            ...assignment,
            fileName: "",
            grade: "",
            status: "제출전",
          };
        })
      );

      return enriched;
    } catch (err) {
      console.error("과제 상태 보강 실패:", err);
      return works;
    }
  };

  // 탭 전환 시 과제 상세 정보는 닫도록 설정 (동영상은 유지하여 멀티태스킹 지원)
  useEffect(() => {
    setSelectedAssignment(null);
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      // 유저 정보 로딩 대기 및 권한별 ID 확인
      if (userLoading || !user) return;
      if (usertype === 'S' && !studentId) return;

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        // 토큰이 없더라도 기본 데이터는 가져올 수 있도록 headers를 유연하게 설정
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 강의 목록 API: 과목 ID가 있으면 해당 과목의 강의를, 없으면 사용자 권한에 따른 전체 강의를 가져옵니다.
        const lessonUrl = subjectId 
          ? `${API_BASE}/lessons/subject/${subjectId}` 
          : (isTeacher && teacherId 
              ? `${API_BASE}/lessons/teacher/${teacherId}` 
              : `${API_BASE}/lessons`);

        // 시험 및 과제 목록은 교사와 학생 모두 필요합니다.
        const examUrl = subjectId 
          ? `${API_BASE}/examsets/subject/${subjectId}${studentId ? `?sid=${studentId}` : ''}` 
          : `${API_BASE}/examsets`;
        const assignUrl = subjectId ? `${API_BASE}/works/subject/${subjectId}` : `${API_BASE}/works`;

        const fetches: Promise<Response>[] = [
          fetch(lessonUrl, { headers }), // index 0
          fetch(examUrl, { headers }),   // index 1
          fetch(assignUrl, { headers })    // index 2
        ];

        // 출석 데이터는 교사(통계용)와 학생(본인확인용) 모두 필요합니다.
        const attUrl = subjectId ? `${API_BASE}/attendances/subject/${subjectId}` : `${API_BASE}/attendances`;
        fetches.push(fetch(attUrl, { headers })); // index 3

        // 학생일 경우에만 진도 데이터 페칭을 추가 (index 4)
        if (!isTeacher && studentId) {
          fetches.push(fetch(`${API_BASE}/progresses/student/${studentId}`, { headers })); // index 4
        }

        // 질의응답 목록 페칭
        if (subjectId) {
          const qnaRes = await fetch(`${API_BASE}/question/subject/${subjectId}`, { headers });
          const qData = qnaRes.ok ? await qnaRes.json() : [];
          // QnA 목록 내림차순 정렬 (최신 질문이 위로)
          setQuestionList([...qData].sort((a: any, b: any) => b.queid - a.queid));
        }

        // 과목 상세 정보(강의 계획서 파일명 포함)를 subid로 직접 조회합니다.
        if (subjectId) {
          const subRes = await fetch(`${API_BASE}/subjects/${subjectId}`, { headers });
          if (subRes.ok) setSubjectInfo(await subRes.json());
        }

        const responses = await Promise.all(fetches);
        const lessonRes = responses[0];
        const examRes = responses[1];
        const assignRes = responses[2];

        if (!lessonRes.ok) {
          const errText = await lessonRes.text();
          throw new Error(`강의 로드 실패 (${lessonRes.status}): ${errText.substring(0, 50)}`);
        }

        const lessonData = await lessonRes.json();
        // 최신 강의(lid 내림차순)가 먼저 보이도록 정렬
        const sortedLessons = [...lessonData].sort((a: any, b: any) => b.lid - a.lid);
        setLessons(sortedLessons);
        setVideoList(sortedLessons);

        if (examRes?.ok) {
          const examData = await examRes.json();
          setExams([...examData].sort((a: any, b: any) => b.esid - a.esid));
        }
        if (assignRes?.ok) {
          const works = await assignRes.json();
          const sortedWorks = [...works].sort((a: any, b: any) => b.wid - a.wid);
          setAssignments(await enrichAssignmentsWithStatus(sortedWorks));
        }

        // 출석 데이터 처리 (교사/학생 공통)
        if (responses[3]?.ok) setAttendanceData(await responses[3].json());

        // 학생일 경우에만 진도 데이터 파싱 (index 4)
        if (!isTeacher && studentId) {
          const progRes = responses[4];
          if (progRes?.ok) {
            const progs = await progRes.json();
            const map: Record<number, number> = {};
            progs.forEach((p: any) => {
              const lid = p.lid || p.lesson?.lid;
              if (lid) {
                // DB 진도와 로컬 스토리지 백업 중 더 큰 값을 선택하여 반영
                const dbVal = p.progressed ?? 0;
                const localVal = parseInt(localStorage.getItem(`video_progress_${lid}`) || "0");
                map[lid] = Math.max(dbVal, localVal);
              }
            });
            setProgressMap(map);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, studentId, teacherId, isTeacher, userLoading, user]); // teacherId 의존성 추가

  // 학생별 출석 데이터 불러오기 (교사용)
  const handleSelectLessonForAttendance = async (lesson: Lesson | null) => {
    setSelectedAttendanceLesson(lesson);
    if (!lesson) return;

    try {
      const token = localStorage.getItem("token");
      // 해당 강의의 학생별 출석 및 진도 정보를 가져오는 엔드포인트 호출 (가정)
      const res = await fetch(`${API_BASE}/attendances/lesson/${lesson.lid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStudentAttendanceList(await res.json());
      }
    } catch (err) {
      console.error("출석 데이터 로드 실패:", err);
    }
  };

  // 출석 상태 로컬 업데이트 (체크박스 조작)
  const handleUpdateAttendance = (sid: number, whether: boolean) => {
    setStudentAttendanceList(prev => 
      prev.map(item => item.sid === sid ? { ...item, whether } : item)
    );
  };

  // 출석 변경사항 서버 저장
  const handleSaveAttendance = async () => {
    if (!selectedAttendanceLesson) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/attendances/batch-update`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          lid: selectedAttendanceLesson.lid,
          records: studentAttendanceList.map(r => ({ sid: r.sid, whether: r.whether }))
        })
      });
      if (res.ok) {
        // UX 개선: 서버 응답 후 전체 데이터를 다시 불러오지 않고, 수정한 내용을 로컬 상태에 즉시 반영 (Optimistic Update)
        setAttendanceData(prev => {
          // 현재 수정 중인 강의의 날짜와 다른 데이터들만 필터링하여 유지
          const otherRecords = prev.filter(a => a.date !== selectedAttendanceLesson.date);
          // 현재 화면에서 수정한 학생별 출석 리스트를 새로운 Attendance 객체 형식으로 변환하여 병합
          const updatedRecords = studentAttendanceList.map(record => ({
            ...record,
            date: selectedAttendanceLesson.date
          }));
          return [...otherRecords, ...updatedRecords];
        });
        
        setSelectedAttendanceLesson(null);
        setIsBatchEditMode(false);
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      console.error("출석 저장 오류:", err);
    }
  };

  // 과제 목록만 새로고침하는 함수
  const refreshAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      const assignUrl = subjectId ? `${API_BASE}/works/subject/${subjectId}` : `${API_BASE}/works`;
      const res = await fetch(assignUrl, { headers });
      if (res.ok) {
        const works = await res.json();
        const sortedWorks = [...works].sort((a: any, b: any) => b.wid - a.wid);
        setAssignments(await enrichAssignmentsWithStatus(sortedWorks));
      }
    } catch (err) {
      console.error("Error refreshing assignments:", err);
    }
  };

  // YouTube IFrame API 스크립트 로드
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 현재 선택된 영상에 대해 현재 로그인한 학생이 남긴 질문 찾기
  const currentStudentQuestion = !isTeacher && selectedVideo 
    ? questionList.find(q => q.lid === selectedVideo.lid && q.sid === studentId) 
    : null;

  // 영상 선택 시 학생 질문 내용 동기화
  useEffect(() => {
    setNewQnaContent(currentStudentQuestion ? currentStudentQuestion.content : '');
  }, [selectedVideo, currentStudentQuestion]);

  // 교사가 질문을 선택했을 때, 기존 답변이 있으면 입력창에 동기화
  useEffect(() => {
    if (isTeacher && selectedQuestion) {
      setTeacherAnswer(selectedQuestion.answer ? selectedQuestion.answer.content : "");
    } else if (isTeacher && !selectedQuestion) {
      setTeacherAnswer("");
    }
  }, [selectedQuestion, isTeacher]);

  // 실시간 진도 영구 저장 함수 (fetch keepalive 사용)
  const persistProgress = (video: Video, base: number, current: number) => {
    if (isTeacher || !studentId || current <= 0) return;

    const totalTime = base + current;

    // 1. 로컬 스토리지에 즉시 백업 (네트워크 지연 시 fetchData에서 보정용)
    localStorage.setItem(`video_progress_${video.lid}`, totalTime.toString());

    // 2. UI 상태 즉시 업데이트 (리스트의 % 바와 텍스트에 즉시 반영)
    setProgressMap(prev => ({
      ...prev,
      [video.lid]: totalTime
    }));

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const url = `${API_BASE}/progresses/update?studentId=${studentId}&videoId=${video.lid}&lastTime=${totalTime}`;

    // keepalive: true 옵션으로 페이지 이동이나 탭 종료 시에도 요청이 서버에 도달함을 보장합니다.
    fetch(url, {
      method: 'POST',
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      keepalive: true
    }).catch(err => console.error("진도 자동 저장 실패:", err));

    // 물리적 재생 위치 저장 (LocalStorage는 동기적이므로 안전함)
    let physicalTime = 0;
    if (ytPlayerRef.current?.getCurrentTime) {
      physicalTime = Math.floor(ytPlayerRef.current.getCurrentTime());
    } else if (videoRef.current) {
      physicalTime = Math.floor(videoRef.current.currentTime);
    }
    if (physicalTime > 0) {
      localStorage.setItem(`video_resume_${video.lid}`, physicalTime.toString());
    }
  };

  // 실시간 시청 시간 누적 스탑워치 (1초마다)
  useEffect(() => {
    if (isPlaying && selectedVideo && !isTeacher) {
      trackingInterval.current = setInterval(() => {
        setCurrentSessionSeconds((prev) => {
          const next = prev + 1;
          currentSessionSecondsRef.current = next; // Ref 즉시 동기화
          if (next > 0 && next % 15 === 0) {
            persistProgress(selectedVideo, sessionBaseProgress, next); // 15초마다 자동 누적 저장
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, [isPlaying, selectedVideo]);

  // 페이지 라우팅 이동 및 컴포넌트 언마운트 시 자동 저장
  useEffect(() => {
    return () => {
      if (selectedVideoRef.current) {
        persistProgress(
          selectedVideoRef.current, 
          sessionBaseProgressRef.current, 
          currentSessionSecondsRef.current
        );
      }
    };
  }, [selectedVideo]); // 영상이 바뀌거나 대시보드를 떠날 때 실행

  // 브라우저 새로고침/탭 닫기 대응
  useEffect(() => {
    const handleUnload = () => {
      if (selectedVideoRef.current) {
        persistProgress(
          selectedVideoRef.current, 
          sessionBaseProgressRef.current, 
          currentSessionSecondsRef.current
        );
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // 기존 수동 저장 함수를 persistProgress 기반으로 단순화
  const saveVideoProgress = (sessionTime?: number) => {
    const currentSession = sessionTime ?? currentSessionSeconds;
    if (selectedVideo) {
      persistProgress(selectedVideo, sessionBaseProgress, currentSession);
      setProgressMap(prev => ({ 
        ...prev, 
        [selectedVideo.lid]: sessionBaseProgress + currentSession 
      }));
    }
  };

  // 과제 제출 내역 가져오기
  const fetchSubmissions = async (assignment: AssignmentDTO) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      
      if (isTeacher) {
        const res = await fetch(`${API_BASE}/work-submits/work/${assignment.wid}`, { headers });
        if (res.ok) setAssignmentSubmissions(await res.json());
      } else if (studentId) {
        const res = await fetch(`${API_BASE}/work-submits/work/${assignment.wid}/student/${studentId}`, { headers });
        if (res.status === 200) {
          setMySubmission(await res.json());
        } else {
          setMySubmission(null);
        }
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const handleAssignmentSelect = (assignment: AssignmentDTO) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment);
  };

  const handleVideoSelect = async (video: Video) => {
    if (selectedVideo?.lid === video.lid) return;

    // 1. 기존 영상이 재생 중이었다면 즉시 저장 후 재생 상태 초기화
    if (selectedVideo && isPlaying) {
      saveVideoProgress();
    }
    setIsPlaying(false);

    // 로컬 맵에서 최신 진도 가져오기 (이미 localStorage와 동기화된 상태)
    const initialProgress = progressMap[video.lid] || 0;
    
    setSessionBaseProgress(initialProgress);
    setCurrentSessionSeconds(0); 
    setSelectedVideo(video);
    setShowVideoQna(false);
    setIsCreatingQuestion(false);
    setIsEditingQuestion(false);
    setQnaPage(1); // 영상 변경 시 QnA 페이지 초기화
    setNewQnaContent('');
    setSelectedQuestion(null); // 이전 영상에서 선택했던 질문 상태 초기화

    // 유튜브 영상인 경우 플레이어 초기화 대기
    const isYoutube = video.fileUrl.includes('youtube.com') || video.fileUrl.includes('youtu.be');
    
    let resumeTime = 0;

    if (!isTeacher && studentId) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${API_BASE}/progresses/student/${studentId}/video/${video.lid}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        let dbProgress = 0; // 기본값은 0으로 설정

        if (res.ok) {
          const data = await res.json();
          dbProgress = data.progressed ?? data.progress ?? 0;
        } else if (res.status === 404) {
          // 404인 경우 DB 진도가 없는 것이므로 dbProgress = 0 유지 (에러 아님)
          console.log("기존 진도 데이터가 없습니다. 0%부터 시작합니다.");
        } else {
          // 500 등 진짜 에러인 경우 예외 처리
          throw new Error("서버 에러 발생");
        }

        // 이제 404여도 로컬 스토리지 값(`localVal`)을 비교하여 정상적으로 세팅됩니다!
        const localVal = parseInt(localStorage.getItem(`video_progress_${video.lid}`) || "0");
        const latestProgress = Math.max(dbProgress, localVal);
        
        setSessionBaseProgress(latestProgress);
        setProgressMap(prev => ({ ...prev, [video.lid]: latestProgress }));
      } catch (e) {
        console.log("기존 진행 정보가 없습니다.");
      }

      // localStorage에서 실제 마지막으로 보던 물리적 위치 가져오기
      const storedResume = typeof window !== "undefined" ? localStorage.getItem(`video_resume_${video.lid}`) : null;
      if (storedResume) resumeTime = parseInt(storedResume);

      // 이어보기 위치가 영상 길이를 초과하지 않도록 보정
      if (video.duration > 0 && resumeTime >= video.duration) {
        resumeTime = 0; 
      }
    }

    // 교사 계정으로 로그인했을 때도 영상은 재생되어야 하므로 플레이어 초기화 로직을 if문 밖으로 이동했습니다.
    if (isYoutube) {
      // API 준비 상태 확인 후 초기화
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initYoutubePlayer(extractYouTubeId(video.fileUrl) || "", resumeTime);
          clearInterval(checkYT);
        }
      }, 100);
    } else {
      if (videoRef.current) videoRef.current.currentTime = resumeTime;
    }
  };

  // 과제 생성 처리
  const handleAddAssignmentSubmit = async () => {
    if (!newAssignment.title || !newAssignment.dueDate || !subjectId) {
      alert("과제 제목과 마감일을 입력해주세요.");
      return;
    }

    const payload = {
      title: newAssignment.title,
      dueDate: newAssignment.dueDate,
      subject: { subid: Number(subjectId) }
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/works`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("과제가 등록되었습니다.");
        setIsAddAssignmentModalOpen(false);
        refreshAssignments(); // 전체 새로고침 대신 목록만 업데이트
      } else {
        alert("과제 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 시험 세트 생성 처리
  const handleAddExamSetSubmit = async () => {
    if (!newExamSet.name || !newExamSet.examDate || !subjectId) {
      alert("시험 이름과 예정 시간을 입력해주세요.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/examsets`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newExamSet.name,
          examDate: newExamSet.examDate,
          subid: Number(subjectId)
        }),
      });
      if (res.ok) {
        alert("시험 세트가 생성되었습니다.");
        setIsAddExamSetModalOpen(false);
        // 새로고침 대신 목록 재요청
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };
        const examUrl = subjectId 
          ? `${API_BASE}/examsets/subject/${subjectId}${studentId ? `?sid=${studentId}` : ''}` 
          : `${API_BASE}/examsets`;
        const examRes = await fetch(examUrl, { headers });
        if (examRes.ok) {
          const examData = await examRes.json();
          setExams([...examData].sort((a: any, b: any) => b.esid - a.esid));
        }
      } else {
        alert("생성 실패");
      }
    } catch (err) { console.error(err); }
  };

  // 학생용 과제 파일 업로드 처리
  const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAssignment) return;

    // 마감 기한 체크 (클라이언트단 2차 보안 방어)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (selectedAssignment.dueDate < todayStr) {
      alert("마감 기한이 지나 더 이상 과제를 제출할 수 없습니다.");
      return;
    }

    if (!confirm(`'${file.name}' 파일을 제출하시겠습니까?`)) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("wid", selectedAssignment.wid.toString());
    formData.append("sid", studentId?.toString() || "");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/work-submits/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("과제 파일이 제출되었습니다.");
        if (selectedAssignment) {
          fetchSubmissions(selectedAssignment);
          await refreshAssignments();
        }
      } else alert("제출에 실패했습니다.");
    } catch (err) { console.error(err); }
  };

  // 교사용 점수 저장 처리
  const handleGradeSubmit = async (wsid: number, grade: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/work-submits/${wsid}/grade`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(grade),
      });

      if (res.ok) {
        alert("점수가 저장되었습니다.");
        if (selectedAssignment) {
          fetchSubmissions(selectedAssignment);
          await refreshAssignments();
        }
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initYoutubePlayer = (videoId: string, startSeconds: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
    }

    ytPlayerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        start: startSeconds,
        enablejsapi: 1,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          }
          else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            saveVideoProgress(); 
          }
          else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            saveVideoProgress();
          }
        },
      },
    });
  };

  // 학생 질문 저장/수정 처리
  const handleSaveStudentQuestion = async () => {
    if (!selectedVideo || !studentId) {
      alert("질문 내용을 입력해주세요.");
      return;
    }
    const payload = { sid: studentId, lid: selectedVideo.lid, content: newQnaContent };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/question`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("질문이 등록되었습니다.");
        const qnaRes = await fetch(`${API_BASE}/question/subject/${subjectId}`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        if (qnaRes.ok) {
          const qData = await qnaRes.json();
          // 저장 후 목록 내림차순 정렬 유지
          setQuestionList([...qData].sort((a: any, b: any) => b.queid - a.queid));
        }
        setIsCreatingQuestion(false);
        setNewQnaContent('');
      } else {
        alert("저장 실패");
      }
    } catch (err) { console.error(err); }
  };

  // 학생 질문 수정 처리
  const handleUpdateStudentQuestion = async (queid: number) => {
    if (!newQnaContent.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/question/${queid}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newQnaContent }),
      });
      if (res.ok) {
        alert("질문이 수정되었습니다.");
        // 목록 새로고침하여 상태 반영
        const qnaRes = await fetch(`${API_BASE}/question/subject/${subjectId}`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        if (qnaRes.ok) {
          const qData = await qnaRes.json();
          // 수정 후 목록 내림차순 정렬 유지
          setQuestionList([...qData].sort((a: any, b: any) => b.queid - a.queid));
        }
        setIsEditingQuestion(false);
        setSelectedQuestion(null);
      }
    } catch (err) { console.error(err); }
  };

  // 학생 질문 삭제 처리
  const handleDeleteQuestion = async (queid: number) => {
    if (!confirm("질문을 삭제하시겠습니까? 답변도 함께 삭제됩니다.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/question/${queid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("삭제되었습니다.");
        setSelectedQuestion(null);
        const qnaRes = await fetch(`${API_BASE}/question/subject/${subjectId}`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        if (qnaRes.ok) {
          const qData = await qnaRes.json();
          // 삭제 후 목록 내림차순 정렬 유지
          setQuestionList([...qData].sort((a: any, b: any) => b.queid - a.queid));
        }
        setIsCreatingQuestion(false); // 저장 후 목록으로 돌아감
      } else {
        alert("저장 실패");
      }
    } catch (err) { console.error(err); }
  };

  // 교사 답변 등록 처리
  const handleAnswerSubmit = async (qid: number, lid: number) => {
    if (!teacherAnswer) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    const isUpdate = !!selectedQuestion?.answer;
    const url = isUpdate 
      ? `${API_BASE}/answer/${selectedQuestion?.answer?.ansid}` 
      : `${API_BASE}/answer`;
    const method = isUpdate ? "PUT" : "POST";

    const payload = isUpdate
      ? { ansid: selectedQuestion?.answer?.ansid, queid: qid, tid: teacherId, content: teacherAnswer }
      : { queid: qid, tid: teacherId, content: teacherAnswer };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isUpdate ? "답변이 수정되었습니다." : "답변이 등록되었습니다.");
        // 답변 등록 후 '과목 전체' 목록 새로고침하여 카드 상태 즉시 반영
        const qnaRes = await fetch(`${API_BASE}/question/subject/${subjectId}`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        if (qnaRes.ok) {
          const qData = await qnaRes.json();
          // 답변 등록 후 목록 내림차순 정렬 유지
          setQuestionList([...qData].sort((a: any, b: any) => b.queid - a.queid));
        }
        
        setTeacherAnswer('');
        setSelectedQuestion(null);
      }
    } catch (err) { console.error(err); }
  };

  // 시험 세트 수정 처리
  const handleEditExamSetSubmit = async () => {
    if (!editingExamSet || !editingExamSet.name || !editingExamSet.examDate) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/examsets/${editingExamSet.esid}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          esid: editingExamSet.esid,
          name: editingExamSet.name,
          examDate: editingExamSet.examDate,
          status: editingExamSet.status,
          subid: subjectId
        }),
      });

      if (res.ok) {
        alert("시험 설정이 수정되었습니다.");
        setEditingExamSet(null);
        // UI 업데이트를 위해 라우터 새로고침 활용 (SPA 유지)
        router.refresh();
      } else {
        alert("수정 실패");
      }
    } catch (err) { console.error(err); }
  };

  // 시험 세트 삭제 처리
  const handleDeleteExamSet = async (esid: number) => {
    if (!confirm("정말로 이 시험 세트를 삭제하시겠습니까? 포함된 모든 문제와 성적 데이터가 삭제됩니다.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/examsets/${esid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) router.refresh();
      else alert("삭제 실패");
    } catch (err) { console.error(err); }
  };

  // 동영상 강의 수정 처리
  const handleEditVideoSubmit = async () => {
    if (!editingVideo || !editingVideo.name || !editingVideo.fileUrl || !editingVideo.date) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/${editingVideo.lid}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editingVideo),
      });

      if (res.ok) {
        alert("수정되었습니다.");
        setEditingVideo(null);
        router.refresh();
      } else {
        alert("수정 실패: " + await res.text());
      }
    } catch (err) { console.error(err); }
  };

  // 동영상 강의 삭제 처리
  const handleDeleteVideo = async (lid: number) => {
    if (!confirm("정말로 이 강의를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons/${lid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) router.refresh();
      else alert("삭제 실패");
    } catch (err) { console.error(err); }
  };

  // 강의 계획서 업로드 처리
  const handleSyllabusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!subjectId) {
      alert("과목 정보(ID)를 찾을 수 없습니다.");
      return;
    }

    // register/page.tsx의 방식을 활용한 PDF 형식 검증
    if (file.type !== "application/pdf") {
      alert("PDF 파일만 등록 가능");
      e.target.value = ""; // 선택된 파일 초기화
      return;
    }

    // register/page.tsx의 등록 확인(confirm) 방식 활용
    if (!confirm(`선택한 파일('${file.name}')로 강의 계획서를 교체하시겠습니까?`)) {
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subid", String(subjectId));
    formData.append("tid", String(user?.tid || profile?.userid));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/subjects/upload-syllabus`, {
        method: "POST", // 파일 저장 및 DB 수정을 함께 처리하는 엔드포인트
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("강의 계획서가 성공적으로 변경되었습니다.");
        // 상태를 직접 업데이트하여 새로고침 없이 PDF 뷰어에 반영
        const newFileName = await res.text();
        setSubjectInfo(prev => prev ? { ...prev, planFile: newFileName } : null);
      } else {
        const errorText = await res.text();
        alert(`업로드에 실패했습니다. (상태 코드: ${res.status})\n${errorText}`);
      }
    } catch (err) {
      console.error("Syllabus upload error:", err);
      alert("서버 연결 중 오류가 발생했습니다.");
    }
  };

  // 동영상 강의 추가 처리
  const handleAddVideoSubmit = async () => {
    if (!newVideo.name || !newVideo.date || !newVideo.url || !subjectId) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const payload = {
      name: newVideo.name,
      date: newVideo.date,
      fileUrl: newVideo.url,
      subject: { subid: Number(subjectId) } // 엔티티 구조와 동일하게 객체로 전달
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lessons`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("새로운 강의가 등록되었습니다.");
        setIsAddVideoModalOpen(false);
        router.refresh();
      } else {
        const errorText = await res.text();
        alert(`강의 등록 실패: ${errorText}`);
      }
    } catch (err) {
      console.error("Add lesson error:", err);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-4 py-8 text-slate-900 sm:px-6 lg:px-10 border-[#d6c2a8] border-2 rounded-lg">
      <div className="mx-auto max-w-7xl">
        <section className="bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-lg p-8 shadow-sm">
          {/* 상단 이동 버튼 추가 */}
          <button 
            onClick={() => router.push(isTeacher ? "/myClasses" : "/student")}
            className="mb-6 flex items-center gap-2 text-[#8b5e3c] font-bold hover:text-[#3d2b1f] transition-all group"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> 
            {isTeacher ? "담당 과목 관리로 돌아가기" : "수강 과목 목록으로 돌아가기"}
          </button>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#8b5e3c] font-bold">
                {isTeacher ? "교사 LMS" : "학생 LMS"}
              </p>
              <h1 className="mt-3 text-4xl font-bold text-center bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2 text-[#3d2b1f]">강의 학습 대시보드</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5c4033] font-bold">
                수강 현황, 출석, 동영상 강의, 시험, 과제를 한 곳에서 확인하고 학습 흐름을 관리하세요.
              </p>
              {error && (
                <p className="mt-4 rounded-3xl bg-[#ffe6e1] px-4 py-3 text-sm text-[#9f2b2b] shadow-sm">
                  백엔드 연결 오류: {error}
                </p>
              )}
            </div>
            <div className="rounded-[30px] border border-[#ecd6b7] bg-[#fff5e4] px-5 py-4 text-sm leading-6 text-[#7c6445] shadow-sm">
              탭을 눌러 학습 요소를 빠르게 전환할 수 있습니다.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ${
                  activeTab === tab
                    ? "bg-[#8b5e3c] text-white shadow-md"
                    : "bg-[#dbc7b1] text-[#5c4033] hover:bg-[#b89b7a]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-lg p-7 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#8b5e3c] font-bold">대시보드</p>
              <h2 className="mt-2 text-3xl font-bold text-[#3d2b1f]">학습 정보</h2>
            </div>
            <div className="rounded-full bg-[#dbc7b1] px-4 py-2 text-sm font-bold text-[#5c4033] border border-[#b89b7a]">
              현재 선택된 탭: {activeTab}
            </div>
          </div>
          <TabPanel 
            activeTab={activeTab} 
            lessons={lessons}
            attendanceData={attendanceData}
            exams={exams}
            assignments={assignments}
            videoList={videoList}
            progressMap={progressMap}
            activeVideoId={selectedVideo?.lid}
            isBatchEditMode={isBatchEditMode}
            selectedAttendanceLesson={selectedAttendanceLesson}
            studentAttendanceList={studentAttendanceList}
            onToggleBatchEdit={() => setIsBatchEditMode(!isBatchEditMode)}
            onSelectLessonForAttendance={handleSelectLessonForAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onSaveAttendance={handleSaveAttendance}
            apiBase={API_BASE}
            sessionBaseProgress={sessionBaseProgress}
            subjectId={subjectId}
            subjectInfo={subjectInfo}
            currentSessionSeconds={currentSessionSeconds}
            onAssignmentSelect={handleAssignmentSelect}
            onAddAssignmentClick={() => setIsAddAssignmentModalOpen(true)}
            onVideoSelect={handleVideoSelect}
            onSyllabusUploadClick={() => syllabusInputRef.current?.click()}
            onAddVideoClick={() => setIsAddVideoModalOpen(true)}
            onAddExamSetClick={() => setIsAddExamSetModalOpen(true)}
            onDeleteVideo={handleDeleteVideo}
            onEditVideo={(video) => setEditingVideo(video)}
            onEditExamSet={(examSet) => setEditingExamSet(examSet)}
            onDeleteExamSet={handleDeleteExamSet}
          />
        </section>

        {/* 숨겨진 파일 입력 필드 (강의 계획서용) */}
        <input 
          type="file" 
          ref={syllabusInputRef} 
          className="hidden"
          accept="application/pdf,.pdf" // regist 페이지와 동일한 accept 설정
          onChange={handleSyllabusChange}
        />

        {/* 과제 상세 보기 (선택 시 하단에 표시) */}
        {selectedAssignment && (
          <section className="mt-6 bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-lg p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#8b5e3c] font-bold">과제 상세 정보</p>
                <h2 className="mt-2 text-3xl font-bold text-[#3d2b1f]">{selectedAssignment.title}</h2>
                <p className="mt-1 text-red-600 font-semibold">마감기한: {selectedAssignment.dueDate}</p>
              </div>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] transition-colors"
              >
                목록으로
              </button>
            </div>

            <div className="rounded-lg bg-white p-6 border border-[#b89b7a]">
              {isTeacher ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#3d2b1f] border-b pb-2">학생 제출 현황</h3>
                  <div className="overflow-x-auto rounded-lg border border-[#b89b7a]">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-[#fcf7f0]">
                        <tr>
                          <th className="p-3">학생명</th>
                          <th className="p-3">제출 파일</th>
                          <th className="p-3">점수</th>
                          <th className="p-3">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignmentSubmissions.length > 0 ? assignmentSubmissions.map((sub) => (
                          <tr key={sub.wsid} className="border-t">
                            <td className="p-3">{sub.studentName}</td>
                            <td className="p-3">
                              <a href={`${API_BASE}/files/work/${sub.fileName}`} className="text-blue-600 underline" download>
                                {sub.fileName}
                              </a>
                            </td>
                            <td className="p-3">
                              <input 
                                type="text" 
                                defaultValue={sub.grade || ""} 
                                onBlur={(e) => handleGradeSubmit(sub.wsid, e.target.value)}
                                className="w-16 border rounded p-1" 
                              />
                            </td>
                            <td className="p-3"><button onClick={(e) => { const input = (e.target as HTMLElement).parentElement?.previousElementSibling?.querySelector('input'); if(input) handleGradeSubmit(sub.wsid, input.value); }} className="text-xs bg-[#3d2b1f] text-white px-2 py-1 rounded">저장</button></td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="p-4 text-center text-gray-500">제출된 과제가 없습니다.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#3d2b1f]">내 과제 제출</h3>
                  {mySubmission && (
                    <div className="p-4 bg-[#fcf7f0] border border-[#b89b7a] rounded-lg flex items-center justify-between font-bold">
                      <div>
                        <p className="text-xs font-bold text-[#8b5e3c]">제출 완료된 파일:</p>
                        <a href={`${API_BASE}/files/work/${mySubmission.fileName}`} className="text-sm text-[#5c4033] underline font-bold" download>
                          {mySubmission.fileName}
                        </a>
                      </div>
                      <span className="text-xs bg-[#8b5e3c] text-white px-2 py-1 rounded-full">제출됨</span>
                    </div>
                  )}

                  {/* 마감 기한 체크 로직: 오늘 날짜가 마감일보다 늦으면 업로드 영역 숨김 */}
                  {(() => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const isDeadlinePassed = selectedAssignment.dueDate < todayStr;

                    return !isDeadlinePassed ? (
                      <div className="flex flex-col gap-4 p-6 bg-[#fcf7f0] rounded-lg border-2 border-dashed border-[#b89b7a] items-center">
                        <p className="text-[#7b6346]">{mySubmission ? "파일을 다시 선택하면 기존 제출물이 교체됩니다." : "Word, PDF 등 문서 파일을 선택해주세요."}</p>
                        <input 
                          type="file" 
                          className="text-sm text-[#8b5e3c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#8b5e3c] file:text-white hover:file:bg-[#6f4a2f] cursor-pointer"
                          onChange={handleAssignmentFileUpload}
                          accept=".doc,.docx,.pdf"
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-100 rounded-xl border border-gray-300 text-center">
                        <p className="text-gray-500 font-bold italic">마감 기한이 지나 더 이상 과제를 제출하거나 수정할 수 없습니다.</p>
                      </div>
                    );
                  })()}

                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <p className="text-sm font-bold">현재 점수: <span className="text-[#8b5e3c]">{mySubmission?.grade || "평가 전"}</span></p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 과제 추가 모달 */}
        {isAddAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-[#fcf7f0] p-8 shadow-2xl border-2 border-[#b89b7a] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">새 과제 생성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">과제 제목</label>
                  <input 
                    type="text" 
                    placeholder="과제 제목을 입력하세요"
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">마감 일자</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#dbc7b1] transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddAssignmentSubmit}
                  className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] shadow-md transition-colors"
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 시험 세트 추가 모달 */}
        {isAddExamSetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-[#fcf7f0] p-8 shadow-2xl border-2 border-[#b89b7a]">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">새 시험 세트 생성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">시험 명칭</label>
                  <input 
                    type="text" 
                    placeholder="예: 중간고사, 기말고사"
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2"
                    value={newExamSet.name}
                    onChange={(e) => setNewExamSet({ ...newExamSet, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">시험 시작 일시</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2"
                    value={newExamSet.examDate}
                    onChange={(e) => setNewExamSet({ ...newExamSet, examDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setIsAddExamSetModalOpen(false)} className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346]">취소</button>
                <button onClick={handleAddExamSetSubmit} className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white shadow-md">생성하기</button>
              </div>
            </div>
          </div>
        )}

        {/* 시험 세트 수정 모달 */}
        {editingExamSet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-[#fcf7f0] p-8 shadow-2xl border-2 border-[#b89b7a] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">시험 세트 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">시험 명칭</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={editingExamSet.name}
                    onChange={(e) => setEditingExamSet({ ...editingExamSet, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">시험 시작 일시</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    // 타임존 오프셋을 계산하여 로컬 시간을 datetime-local 포맷(YYYY-MM-DDTHH:mm)으로 변환
                    value={(() => {
                      if (!editingExamSet.examDate) return "";
                      const d = new Date(editingExamSet.examDate);
                      const offset = d.getTimezoneOffset() * 60000; // 분 단위를 밀리초로 변환
                      const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
                      return localISOTime;
                    })()}
                    onChange={(e) => setEditingExamSet({ ...editingExamSet, examDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingExamSet(null)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#dbc7b1]"
                >
                  취소
                </button>
                <button 
                  onClick={handleEditExamSetSubmit}
                  className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] shadow-md"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 동영상 수정 모달 */}
        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-[#fcf7f0] p-8 shadow-2xl border-2 border-[#b89b7a] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">동영상 강의 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의명</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={editingVideo.name}
                    onChange={(e) => setEditingVideo({ ...editingVideo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의 일자</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={editingVideo.date || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">유튜브 URL</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={editingVideo.fileUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, fileUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingVideo(null)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#dbc7b1]"
                >
                  취소
                </button>
                <button 
                  onClick={handleEditVideoSubmit}
                  className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] shadow-md"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 동영상 추가 모달 */}
        {isAddVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-[#fcf7f0] p-8 shadow-2xl border-2 border-[#b89b7a] animate-in fade-in zoom-in duration-200">
              <h3 className="mb-6 text-2xl font-bold text-[#3d2b1f]">동영상 강의 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의명</label>
                  <input 
                    type="text" 
                    placeholder="강의 제목을 입력하세요"
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={newVideo.name}
                    onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">강의 일자</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={newVideo.date}
                    onChange={(e) => setNewVideo({ ...newVideo, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#7b6346] mb-1">유튜브 URL</label>
                  <input 
                    type="text" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-[#b89b7a] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="rounded-full px-6 py-2 text-sm font-bold text-[#7b6346] hover:bg-[#dbc7b1]"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddVideoSubmit}
                  className="rounded-full bg-[#8b5e3c] px-6 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] shadow-md"
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedVideo && (
          <section className="mt-6 bg-[#fcf7f0] border-[#d6c2a8] border-2 rounded-lg p-6 shadow-md">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#8b5e3c] font-bold">재생 중</p>
                <h2 className="mt-2 text-2xl font-bold text-[#3d2b1f]">{selectedVideo.name}</h2>
              </div>
              <span>
              <button 
                onClick={() => setShowVideoQna(!showVideoQna)}
                className="rounded-full bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#6f4a2f] transition-colors"
                style={{marginRight:"30px"}}
              >
                QnA
              </button>
              <button
                onClick={async () => { 
                  setIsPlaying(false); // 인터벌 중단
                  await saveVideoProgress(); // 진행도 계산 및 맵 업데이트 대기
                  setShowVideoQna(false); // QnA 섹션도 함께 종료
                  setSelectedVideo(null); // 비디오 닫기
                  setSelectedQuestion(null); // 교사용 질문 선택 상태 초기화
                  setTeacherAnswer(''); // 답변 입력 필드 초기화
                }}
                className="rounded-full bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#6f4a2f] transition-colors"
              >
                닫기
              </button>
              </span>
            </div>
            {selectedVideo.fileUrl.includes('youtube.com') || selectedVideo.fileUrl.includes('youtu.be') ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <div id="youtube-player" className="h-full w-full"></div>
              </div>
            ) : (
              <video
                ref={videoRef}
                controls
                className="w-full rounded-lg bg-black"
                onPlay={() => setIsPlaying(true)}
                onPause={() => {
                  setIsPlaying(false);
                  saveVideoProgress();
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  saveVideoProgress();
                }}
                src={`${API_BASE.replace('/api', '')}${selectedVideo.fileUrl}`}
              >
                브라우저가 동영상을 지원하지 않습니다.
              </video>
            )}

            {/* 동영상 하단 QnA 섹션 */}
            {showVideoQna && (
              <div className="mt-6 rounded-lg bg-white p-6 border border-[#b89b7a] shadow-inner animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#3d2b1f]">강의 QnA</h3>
                  <div className="flex gap-2 items-center">
                    {!isTeacher && !selectedQuestion && !isCreatingQuestion && !isEditingQuestion && (
                      <button onClick={() => { setIsCreatingQuestion(true); setNewQnaContent(''); }} className="text-sm bg-[#8b5e3c] text-white px-3 py-1 rounded-full font-bold hover:bg-[#6f4a2f] transition-colors">
                        질문하기
                      </button>
                    )}
                    {(selectedQuestion || isCreatingQuestion || isEditingQuestion) && (
                      <button onClick={() => { setSelectedQuestion(null); setIsCreatingQuestion(false); setIsEditingQuestion(false); }} className="text-sm text-[#8b5e3c] font-bold hover:underline">
                      ← 학생 목록으로
                      </button>
                    )}
                  </div>
                </div>

                {/* QnA 본문 영역 분기 */}
                {isCreatingQuestion && !isTeacher ? (
                  /* 학생: 새 질문 작성/수정 모드 */
                  <div className="space-y-6">
                    <div className="bg-[#fcf7f0] p-6 rounded-lg border-2 border-[#b89b7a] shadow-md">
                      <label className="block text-xs font-bold text-[#8b5e3c] mb-2">질문 및 메모 작성</label>
                      <textarea 
                        placeholder="강의에 대해 궁금한 점이나 메모를 남겨주세요."
                        rows={6}
                        className="w-full bg-transparent border-none text-[#3d2b1f] placeholder-[#a68d71] text-lg focus:ring-0 resize-none font-bold"
                        value={newQnaContent}
                        onChange={(e) => setNewQnaContent(e.target.value)}
                      />
                      <div className="flex justify-end mt-4">
                        <button 
                          onClick={handleSaveStudentQuestion}
                          className="rounded-full bg-[#8b5e3c] px-8 py-2 text-sm font-bold text-white hover:bg-[#6f4a2f] shadow-lg transition-transform active:scale-95"
                        >
                          저장하기
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedQuestion ? (
                  /* 공통: 질문 상세 보기 (교사는 답변 가능) */
                    <div className="space-y-4">
                      <div className="bg-[#fcf7f0] p-6 rounded-lg border border-[#b89b7a] shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-[#8b5e3c]">질문 내용 (익명)</p>
                          {/* 작성자 본인인 경우 수정/삭제 버튼 노출 */}
                          {!isTeacher && selectedQuestion.sid === studentId && !isEditingQuestion && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setIsEditingQuestion(true); setNewQnaContent(selectedQuestion.content); }}
                                className="text-[10px] text-blue-600 font-bold hover:underline"
                              >
                                수정
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(selectedQuestion.queid)}
                                className="text-[10px] text-red-600 font-bold hover:underline"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {isEditingQuestion ? (
                          <div className="space-y-2">
                            <textarea 
                              className="w-full bg-white border border-[#b89b7a] rounded-lg p-2 text-sm focus:ring-0 resize-none font-bold"
                              rows={4}
                              value={newQnaContent}
                              onChange={(e) => setNewQnaContent(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <button onClick={() => handleUpdateStudentQuestion(selectedQuestion.queid)} className="bg-[#8b5e3c] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#6f4a2f]">
                                수정 완료
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#3d2b1f] text-lg leading-relaxed whitespace-pre-wrap">{selectedQuestion.content}</div>
                        )}
                      </div>
                      
                      {/* 답변 영역 */}
                      {(selectedQuestion.answer || isTeacher) && (
                        <div className="bg-white p-4 rounded-lg border border-[#b89b7a] shadow-sm">
                          <label className="block text-[10px] font-bold text-[#8b5e3c] mb-1">교사 답변</label>
                          {isTeacher ? (
                            <>
                              <textarea 
                                placeholder="답변을 입력하세요..."
                                rows={3}
                                className="w-full rounded-lg border-none p-2 text-sm focus:ring-0 resize-none bg-[#fcf7f0]"
                                value={teacherAnswer}
                                onChange={(e) => setTeacherAnswer(e.target.value)}
                              />
                              <div className="flex justify-end mt-2">
                                <button 
                                  onClick={() => handleAnswerSubmit(selectedQuestion.queid, selectedVideo.lid)}
                                  className="rounded-full bg-[#3d2b1f] px-4 py-1.5 text-xs font-bold text-white hover:bg-black"
                                >
                                  {selectedQuestion.answer ? "답변 수정" : "답변 저장"}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-[#3d2b1f] p-3 bg-[#fcf7f0] rounded-lg border border-[#f0debe] whitespace-pre-wrap">
                              {selectedQuestion.answer?.content}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                ) : (
                  /* 공통: 질문 목록 보기 */
                  <div>
                    <div className="grid grid-cols-1 gap-3">
                      {questionList.filter(q => q.lid === selectedVideo.lid).length > 0 ? (
                        questionList.filter(q => q.lid === selectedVideo.lid).slice((qnaPage - 1) * 10, qnaPage * 10).map((qna) => (
                        <div 
                          key={qna.queid} 
                          onClick={() => setSelectedQuestion(qna)}
                          className="relative cursor-pointer rounded-lg border border-[#b89b7a] bg-[#fdfaf5] p-4 transition hover:border-[#8b5e3c] hover:shadow-md flex items-center gap-3 font-bold"
                        >
                          {qna.answer && (
                            <span className="shrink-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">답변완료</span>
                          )}
                          <div className="text-sm text-[#7b6346] truncate flex-1 min-w-0">
                            {qna.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-full text-center py-8 text-[#7b6346] italic">등록된 질문이 없습니다.</p>
                    )}
                    </div>
                    {/* QnA 전용 페이지네이션 */}
                    {questionList.filter(q => q.lid === selectedVideo.lid).length > 10 && (
                      <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.ceil(questionList.filter(q => q.lid === selectedVideo.lid).length / 10) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setQnaPage(page)}
                            className={`h-7 w-7 rounded-full text-[10px] font-bold transition ${
                              qnaPage === page
                                ? "bg-[#8b5e3c] text-white"
                                : "bg-[#dbc7b1] text-[#5c4033] hover:bg-[#b89b7a]"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

// 유튜브 ID 추출을 위한 헬퍼 함수
function extractYouTubeId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}
