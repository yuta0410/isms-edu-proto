"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  CircleDashed,
  BookOpen,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { COURSES } from "@/constants/courses";
import type { CourseStatus } from "@/lib/types";

// Enrollment record tied to a course in the catalog.
interface Enrollment {
  id: string;
  employee_name: string;
  company_name: string;
  course_id: string;
  status: CourseStatus;
  completed_at: string | null;
  score_rate: number | null; // 0-100
}

// Mock data. In production: supabase.from("enrollments").select(...)
const ENROLLMENTS: Enrollment[] = [
  // 個人情報の適切な取り扱い
  { id: "1", employee_name: "佐藤 健一", company_name: "株式会社アルファテック", course_id: "personal-info", status: "completed", completed_at: "2026-05-28 14:32", score_rate: 100 },
  { id: "2", employee_name: "鈴木 美咲", company_name: "株式会社アルファテック", course_id: "personal-info", status: "in_progress", completed_at: null, score_rate: null },
  { id: "3", employee_name: "田中 由美", company_name: "ベータ商事株式会社", course_id: "personal-info", status: "completed", completed_at: "2026-06-01 09:15", score_rate: 100 },
  { id: "4", employee_name: "中村 彩", company_name: "ベータ商事株式会社", course_id: "personal-info", status: "completed", completed_at: "2026-06-02 11:40", score_rate: 80 },
  { id: "5", employee_name: "山本 拓也", company_name: "ガンマ工業株式会社", course_id: "personal-info", status: "not_started", completed_at: null, score_rate: null },

  // パスワード管理と多要素認証
  { id: "6", employee_name: "伊藤 翔", company_name: "ベータ商事株式会社", course_id: "password-mfa", status: "completed", completed_at: "2026-06-02 17:48", score_rate: 100 },
  { id: "7", employee_name: "渡辺 七海", company_name: "ベータ商事株式会社", course_id: "password-mfa", status: "in_progress", completed_at: null, score_rate: null },
  { id: "8", employee_name: "小林 直樹", company_name: "株式会社アルファテック", course_id: "password-mfa", status: "completed", completed_at: "2026-05-30 10:05", score_rate: 90 },

  // 標的型メール攻撃への対策
  { id: "9", employee_name: "高橋 大輔", company_name: "株式会社アルファテック", course_id: "phishing", status: "in_progress", completed_at: null, score_rate: null },
  { id: "10", employee_name: "加藤 さくら", company_name: "ガンマ工業株式会社", course_id: "phishing", status: "completed", completed_at: "2026-06-03 16:20", score_rate: 100 },
  { id: "11", employee_name: "吉田 亮", company_name: "ガンマ工業株式会社", course_id: "phishing", status: "not_started", completed_at: null, score_rate: null },
];

const STATUS_META: Record<
  CourseStatus,
  { label: string; variant: "success" | "warning" | "muted"; icon: typeof CheckCircle2 }
> = {
  completed: { label: "完了", variant: "success", icon: CheckCircle2 },
  in_progress: { label: "受講中", variant: "warning", icon: Clock },
  not_started: { label: "未着手", variant: "muted", icon: CircleDashed },
};

const courseTitle = (id: string) =>
  COURSES.find((c) => c.id === id)?.title ?? id;

function summarize(rows: Enrollment[]) {
  const total = rows.length;
  const completedRows = rows.filter((r) => r.status === "completed");
  const completed = completedRows.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const scored = completedRows.filter((r) => r.score_rate !== null);
  const avgScore = scored.length
    ? Math.round(
        scored.reduce((acc, r) => acc + (r.score_rate ?? 0), 0) / scored.length
      )
    : null;
  return { total, completed, completionRate, avgScore };
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? ENROLLMENTS
        : ENROLLMENTS.filter((r) => r.course_id === filter),
    [filter]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              受講進捗ダッシュボード
            </h1>
            <p className="text-xs text-muted-foreground">
              コンサル・企業管理者向け
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/admin/generate">
            <Button variant="ghost" size="sm">
              スライド生成へ
            </Button>
          </Link>
          <Link href="/pages/course">
            <Button variant="ghost" size="sm">
              受講画面へ
            </Button>
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Per-course summary cards */}
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <BookOpen className="size-4 text-muted-foreground" />
          教材ごとの受講状況サマリー
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COURSES.map((course) => {
            const s = summarize(
              ENROLLMENTS.filter((r) => r.course_id === course.id)
            );
            return (
              <Card key={course.id}>
                <CardHeader>
                  <CardDescription className="line-clamp-1">
                    {course.title}
                  </CardDescription>
                  <CardTitle className="flex items-baseline gap-2">
                    <span className="text-2xl text-emerald-600">
                      {s.completionRate}%
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      完了率（{s.completed}/{s.total}名）
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${s.completionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>平均点</span>
                    <span className="font-medium text-foreground">
                      {s.avgScore !== null ? `${s.avgScore} 点` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table with course filter */}
        <Card>
          <CardHeader>
            <CardTitle>受講ステータス一覧</CardTitle>
            <CardDescription>
              教材名でフィルタして受講状況を確認できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">すべて</TabsTrigger>
                {COURSES.map((c) => (
                  <TabsTrigger key={c.id} value={c.id}>
                    {c.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>社員名</TableHead>
                    <TableHead>企業名</TableHead>
                    <TableHead>教材名</TableHead>
                    <TableHead>進捗</TableHead>
                    <TableHead>完了日時</TableHead>
                    <TableHead className="text-right">テスト正解率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const meta = STATUS_META[r.status];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.employee_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.company_name}
                        </TableCell>
                        <TableCell>{courseTitle(r.course_id)}</TableCell>
                        <TableCell>
                          <Badge variant={meta.variant}>
                            <Icon className="size-3" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.completed_at ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.score_rate !== null ? (
                            <span
                              className={
                                r.score_rate === 100
                                  ? "font-medium text-emerald-600"
                                  : "font-medium"
                              }
                            >
                              {r.score_rate}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        該当する受講者がいません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
