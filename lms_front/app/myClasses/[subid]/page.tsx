"use client";
import { useParams } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";

export default function TeacherSubjectDashboardPage() {
  const params = useParams();
  // 폴더명이 [subid]이므로 params.subid로 가져와야 합니다.
  const subid = Number(params.subid);

  return <StudentDashboard subjectId={subid} />;
}