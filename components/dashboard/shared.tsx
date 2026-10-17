"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  BookOpen,
  AlertTriangle,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { COURSES } from "@/constants/courses";
import { tenantName } from "@/constants/tenants";
import type { Enrollment } from "@/constants/enrollments";
import type { CompanyWeakness } from "@/constants/evidence";
import type { CourseStatus } from "@/lib/types";

// Severity styling for a category's quiz incorrect rate.
export function severityOf(rate: number) {
  if (rate >= 50)
    return {
      variant: "destructive" as const,
      label: "危険",
      bar: "bg-destructive",
      text: "text-destructive",
    };
  if (rate >= 25)
    return {
      variant: "warning" as const,
      label: "注意",
      bar: "bg-amber-500",
      text: "text-amber-600",
    };
  return {
    variant: "success" as const,
    label: "安全",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  };
}

const STATUS_META: Record<
  CourseStatus,
  {
    label: string;
    variant: "success" | "warning" | "muted";
    icon: typeof CheckCircle2;
  }
> = {
  completed: { label: "完了", variant: "success", icon: CheckCircle2 },
  in_progress: { label: "受講中", variant: "warning", icon: Clock },
  not_started: { label: "未着手", variant: "muted", icon: CircleDashed },
};

const courseTitle = (id: string) =>
  COURSES.find((c) => c.id === id)?.title ?? id;

export function summarize(rows: Enrollment[]) {
  const total = rows.length;
  const completedRows = rows.filter((r) => r.status === "completed");
  const completed = completedRows.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const scored = completedRows.filter((r) => r.score_rate !== null);
  const avgScore = scored.length
    ? Math.round(
        scored.reduce((acc, r) => acc + (r.score_rate ?? 0), 0) / scored.length,
      )
    : null;
  return { total, completed, completionRate, avgScore };
}

/** Per-course completion summary cards for the given (already scoped) rows. */
export function CourseSummaryCards({ rows }: { rows: Enrollment[] }) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <BookOpen className="size-4 text-muted-foreground" />
        教材ごとの受講状況サマリー
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COURSES.map((course) => {
          const s = summarize(rows.filter((r) => r.course_id === course.id));
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
    </>
  );
}

/**
 * Category meters for quiz incorrect rates. `renderAction` lets each mode
 * attach its own call-to-action to the weakest category (OEM: upsell
 * proposal / tenant: self-serve course delivery).
 */
export function WeaknessMeters({
  weakness,
  renderAction,
}: {
  weakness: CompanyWeakness;
  renderAction?: () => React.ReactNode;
}) {
  const weakestRate = Math.max(
    ...weakness.categories.map((c) => c.incorrect_rate),
  );
  return (
    <div className="flex flex-col gap-3.5">
      {weakness.categories.map((c) => {
        const sev = severityOf(c.incorrect_rate);
        const isWeakest = c.incorrect_rate === weakestRate;
        return (
          <div key={c.category} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {c.category}
                <Badge variant={sev.variant}>
                  {sev.variant === "destructive" && (
                    <AlertTriangle className="size-3" />
                  )}
                  {isWeakest && c.incorrect_rate >= 50
                    ? "最弱点：要対策"
                    : sev.label}
                </Badge>
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold tabular-nums ${sev.text}`}
                >
                  不正解率 {c.incorrect_rate}%
                </span>
                {isWeakest && renderAction?.()}
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${sev.bar}`}
                style={{ width: `${c.incorrect_rate}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Enrollment status table with a course filter. */
export function EnrollmentTable({
  rows,
  showCompany,
  description,
}: {
  rows: Enrollment[];
  showCompany: boolean;
  description: string;
}) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = useMemo(
    () =>
      filter === "all" ? rows : rows.filter((r) => r.course_id === filter),
    [filter, rows],
  );
  const colSpan = showCompany ? 6 : 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>受講ステータス一覧</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto">
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社員名</TableHead>
                {showCompany && <TableHead>企業名</TableHead>}
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
                    {showCompany && (
                      <TableCell className="text-muted-foreground">
                        {tenantName(r.corp)}
                      </TableCell>
                    )}
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
                    colSpan={colSpan}
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
  );
}
