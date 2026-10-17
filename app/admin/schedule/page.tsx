"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  Flag,
  RefreshCw,
  CalendarClock,
  Lightbulb,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { OemOnly } from "@/components/oem-only";
import {
  TENANT_ACCOUNTS,
  PROPOSAL_LEAD_MONTHS,
  parseDate,
  addMonths,
  startOfDay,
  daysBetween,
  formatMonthDay,
  formatFullDate,
} from "@/constants/accounts";
import { tenantName } from "@/constants/tenants";
import { cn } from "@/lib/utils";

const WINDOW_MONTHS = 12;
const MONTHS_BEFORE_TODAY = 3;

type MilestoneKind = "proposal" | "audit" | "renewal";

const KIND_META: Record<
  MilestoneKind,
  { label: string; variant: "default" | "destructive" | "success" }
> = {
  proposal: { label: "直前対策の提案", variant: "default" },
  audit: { label: "審査", variant: "destructive" },
  renewal: { label: "契約更新", variant: "success" },
};

interface Row {
  tenantId: string;
  name: string;
  auditType: string;
  audit: Date;
  proposal: Date;
  renewal: Date;
}

export default function SchedulePage() {
  return (
    <OemOnly>
      <ScheduleView />
    </OemOnly>
  );
}

function ScheduleView() {
  const [today] = useState(() => startOfDay(new Date()));

  // Visible window: from the 1st of (today - 3 months), spanning 12 months.
  const windowStart = new Date(
    today.getFullYear(),
    today.getMonth() - MONTHS_BEFORE_TODAY,
    1,
  );
  const windowEnd = addMonths(windowStart, WINDOW_MONTHS);
  const span = windowEnd.getTime() - windowStart.getTime();
  const pct = (d: Date) =>
    Math.min(
      100,
      Math.max(0, ((d.getTime() - windowStart.getTime()) / span) * 100),
    );
  const months = Array.from({ length: WINDOW_MONTHS }, (_, i) =>
    addMonths(windowStart, i),
  );

  const rows: Row[] = TENANT_ACCOUNTS.map((a) => {
    const audit = parseDate(a.audit_on);
    return {
      tenantId: a.tenant_id,
      name: tenantName(a.tenant_id),
      auditType: a.audit_type,
      audit,
      proposal: addMonths(audit, -PROPOSAL_LEAD_MONTHS),
      renewal: parseDate(a.contract_renewal_on),
    };
  }).sort((a, b) => a.audit.getTime() - b.audit.getTime());

  // Upcoming milestones, nearest first.
  const milestones = rows
    .flatMap((r) => [
      { row: r, kind: "proposal" as const, date: r.proposal },
      { row: r, kind: "audit" as const, date: r.audit },
      { row: r, kind: "renewal" as const, date: r.renewal },
    ])
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Tenants currently inside the "3 months before audit" window.
  const inProposalWindow = rows.filter(
    (r) => r.proposal <= today && today < r.audit,
  );

  const todayPct = pct(today);

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center gap-3 border-b bg-card px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
          <CalendarRange className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-base font-semibold">
            監査スケジュール
          </h1>
          <p className="text-xs text-muted-foreground">
            審査予定日・契約更新日と提案タイミング（審査の
            {PROPOSAL_LEAD_MONTHS}ヶ月前）
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Alert: tenants in the proposal window right now */}
        {inProposalWindow.length > 0 && (
          <div className="mb-6 flex flex-col gap-2 rounded-xl border border-violet-300/60 bg-violet-50/60 p-4 sm:flex-row sm:items-center dark:border-violet-900/50 dark:bg-violet-950/20">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
              <Lightbulb className="size-4" />
            </span>
            <p className="flex-1 text-sm">
              <span className="font-semibold">
                直前対策の提案タイミングです：
              </span>
              {inProposalWindow
                .map(
                  (r) =>
                    `${r.name}（審査まであと${daysBetween(today, r.audit)}日）`,
                )
                .join("、")}
            </p>
            <Link href="/admin/opportunities">
              <Button size="sm" variant="outline">
                提案パイプラインへ
              </Button>
            </Link>
          </div>
        )}

        {/* Gantt chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>年間タイムライン</CardTitle>
            <CardDescription>
              {formatFullDate(windowStart)} 〜{" "}
              {formatFullDate(new Date(windowEnd.getTime() - 86_400_000))}
              ・帯は「提案タイミング → 審査日」の直前対策期間です。
            </CardDescription>
            <Legend />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[760px] pr-10">
              {/* Month header */}
              <div className="flex">
                <div className="w-44 shrink-0" />
                <div className="relative flex flex-1 border-b pb-1.5">
                  {months.map((m) => (
                    <div
                      key={m.toISOString()}
                      className="flex-1 text-center text-xs text-muted-foreground"
                    >
                      {m.getMonth() === 0 && (
                        <span className="mr-0.5 font-medium text-foreground">
                          {m.getFullYear()}年
                        </span>
                      )}
                      {m.getMonth() + 1}月
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="relative">
                {rows.map((r) => {
                  const barLeft = pct(r.proposal);
                  const barWidth = pct(r.audit) - barLeft;
                  return (
                    <div
                      key={r.tenantId}
                      className="flex items-center border-b last:border-b-0"
                    >
                      <div className="w-44 shrink-0 py-3 pr-3">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.auditType}
                        </p>
                      </div>
                      <div className="relative h-14 flex-1">
                        {/* Month grid */}
                        <div className="absolute inset-0 flex">
                          {months.map((m) => (
                            <div
                              key={m.toISOString()}
                              className="flex-1 border-l border-dashed border-border/60 first:border-l-0"
                            />
                          ))}
                        </div>

                        {/* 直前対策期間 bar */}
                        <div
                          className="absolute top-1/2 h-5 -translate-y-1/2 rounded-md bg-violet-500/15 ring-1 ring-violet-500/30"
                          style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                          title={`直前対策期間：${formatMonthDay(r.proposal)} 〜 ${formatMonthDay(r.audit)}`}
                        >
                          <span className="absolute inset-0 hidden items-center justify-center truncate px-6 text-[0.7rem] font-medium text-violet-700 sm:flex dark:text-violet-300">
                            直前対策期間
                          </span>
                        </div>

                        {/* Proposal milestone */}
                        <Marker
                          left={barLeft}
                          label={`提案 ${formatMonthDay(r.proposal)}`}
                          className="bg-violet-600 text-white"
                        >
                          <Flag className="size-3" />
                        </Marker>

                        {/* Audit milestone (diamond) */}
                        <div
                          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${pct(r.audit)}%` }}
                          title={`審査 ${formatMonthDay(r.audit)}`}
                        >
                          <span className="block size-4 rotate-45 rounded-[3px] bg-destructive shadow ring-2 ring-card" />
                          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[0.7rem] font-semibold whitespace-nowrap text-destructive">
                            審査 {formatMonthDay(r.audit)}
                          </span>
                        </div>

                        {/* Contract renewal */}
                        <Marker
                          left={pct(r.renewal)}
                          label={`更新 ${formatMonthDay(r.renewal)}`}
                          className="bg-emerald-600 text-white"
                        >
                          <RefreshCw className="size-3" />
                        </Marker>
                      </div>
                    </div>
                  );
                })}

                {/* Today line across all rows */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-44 right-0"
                  aria-hidden
                >
                  <div
                    className="absolute inset-y-0 w-px bg-primary"
                    style={{ left: `${todayPct}%` }}
                  >
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-primary px-1.5 py-0.5 text-[0.65rem] font-medium whitespace-nowrap text-primary-foreground">
                      今日
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-muted-foreground" />
              直近のマイルストーン
            </CardTitle>
            <CardDescription>
              今日以降の予定を近い順に表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {milestones.map((m) => {
                const days = daysBetween(today, m.date);
                const meta = KIND_META[m.kind];
                return (
                  <li
                    key={`${m.row.tenantId}-${m.kind}`}
                    className="flex flex-wrap items-center gap-3 py-3"
                  >
                    <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                      {formatFullDate(m.date)}
                    </span>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {m.row.name}
                      {m.kind === "audit" && (
                        <span className="text-muted-foreground">
                          （{m.row.auditType}）
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        days <= 30
                          ? "font-semibold text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      あと {days} 日
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Marker({
  left,
  label,
  className,
  children,
}: {
  left: number;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%` }}
      title={label}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full shadow ring-2 ring-card",
          className,
        )}
      >
        {children}
      </span>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.7rem] whitespace-nowrap text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="flex size-4 items-center justify-center rounded-full bg-violet-600 text-white">
          <Flag className="size-2.5" />
        </span>
        提案タイミング（審査{PROPOSAL_LEAD_MONTHS}ヶ月前）
      </span>
      <span className="flex items-center gap-1.5">
        <span className="block size-3 rotate-45 rounded-[2px] bg-destructive" />
        審査予定日
      </span>
      <span className="flex items-center gap-1.5">
        <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white">
          <RefreshCw className="size-2.5" />
        </span>
        システム契約更新日
      </span>
      <span className="flex items-center gap-1.5">
        <span className="block h-3 w-px bg-primary" />
        今日
      </span>
    </div>
  );
}
