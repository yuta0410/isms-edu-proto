import type { CourseStatus } from "@/lib/types";

/** Enrollment record tied to a course in the catalog and to a tenant. */
export interface Enrollment {
  id: string;
  corp: string; // テナントID（constants/tenants.ts）
  employee_name: string;
  course_id: string;
  status: CourseStatus;
  completed_at: string | null;
  score_rate: number | null; // 0-100
}

// Mock data. In production: supabase.from("enrollments").select(...) under RLS.
export const ENROLLMENTS: Enrollment[] = [
  // 個人情報の適切な取り扱い
  {
    id: "1",
    corp: "smart-flow",
    employee_name: "佐藤 健一",
    course_id: "personal-info",
    status: "completed",
    completed_at: "2026-05-28 14:32",
    score_rate: 100,
  },
  {
    id: "2",
    corp: "smart-flow",
    employee_name: "鈴木 美咲",
    course_id: "personal-info",
    status: "in_progress",
    completed_at: null,
    score_rate: null,
  },
  {
    id: "3",
    corp: "chiyoda",
    employee_name: "田中 由美",
    course_id: "personal-info",
    status: "completed",
    completed_at: "2026-06-01 09:15",
    score_rate: 100,
  },
  {
    id: "4",
    corp: "chiyoda",
    employee_name: "中村 彩",
    course_id: "personal-info",
    status: "completed",
    completed_at: "2026-06-02 11:40",
    score_rate: 80,
  },
  {
    id: "5",
    corp: "a-corp",
    employee_name: "山本 拓也",
    course_id: "personal-info",
    status: "not_started",
    completed_at: null,
    score_rate: null,
  },

  // パスワード管理と多要素認証
  {
    id: "6",
    corp: "chiyoda",
    employee_name: "伊藤 翔",
    course_id: "password-mfa",
    status: "completed",
    completed_at: "2026-06-02 17:48",
    score_rate: 100,
  },
  {
    id: "7",
    corp: "chiyoda",
    employee_name: "渡辺 七海",
    course_id: "password-mfa",
    status: "in_progress",
    completed_at: null,
    score_rate: null,
  },
  {
    id: "8",
    corp: "smart-flow",
    employee_name: "小林 直樹",
    course_id: "password-mfa",
    status: "completed",
    completed_at: "2026-05-30 10:05",
    score_rate: 90,
  },

  // 標的型メール攻撃への対策
  {
    id: "9",
    corp: "smart-flow",
    employee_name: "高橋 大輔",
    course_id: "phishing",
    status: "in_progress",
    completed_at: null,
    score_rate: null,
  },
  {
    id: "10",
    corp: "a-corp",
    employee_name: "加藤 さくら",
    course_id: "phishing",
    status: "completed",
    completed_at: "2026-06-03 16:20",
    score_rate: 100,
  },
  {
    id: "11",
    corp: "a-corp",
    employee_name: "吉田 亮",
    course_id: "phishing",
    status: "not_started",
    completed_at: null,
    score_rate: null,
  },
  {
    id: "12",
    corp: "smart-flow",
    employee_name: "山田 太郎",
    course_id: "phishing",
    status: "completed",
    completed_at: "2026-05-12 10:24",
    score_rate: 60,
  },
];
