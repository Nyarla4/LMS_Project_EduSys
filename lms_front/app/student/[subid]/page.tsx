"use client";

import { useParams } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";

export default function SubjectDashboardPage() {
  const params = useParams();
  const subid = Number(params.subid);

  return <StudentDashboard subjectId={subid} />;
}