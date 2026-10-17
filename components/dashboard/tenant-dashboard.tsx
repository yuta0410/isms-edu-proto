"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  FileCheck2,
  ChartNoAxesColumn,
  Send,
  Bell,
  Users,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ENROLLMENTS } from "@/constants/enrollments";
import { getWeakness } from "@/constants/evidence";
import { scopeByTenant } from "@/lib/scope";
import { useTenantWorkspace } from "@/lib/workspace";
import {
  CourseSummaryCards,
  EnrollmentTable,
  WeaknessMeters,
  summarize,
} from "@/components/dashboard/shared";

/**
 * テナント（契約企業）向けホーム。自社データのみを受け取り、他社情報・
 * 企業選択・アップセル導線は一切持たない。
 */
export function TenantDashboard() {
  const ws = useTenantWorkspace();
  const rows = scopeByTenant(ws, ENROLLMENTS, (r) => r.corp);
  const weakness = getWeakness(ws.tenantId);
  const s = summarize(rows);
  const pending = rows.filter((r) => r.status !== "completed").length;

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">ホーム</h1>
            <p className="text-xs text-muted-foreground">
              {ws.tenant.name} の教育実施状況
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/generate" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="size-3.5" />
              教材をつくる
            </Button>
          </Link>
          <Link href="/admin/evidence" target="_blank">
            <Button size="sm" className="gap-1.5">
              <FileCheck2 className="size-3.5" />
              審査用 証跡PDF出力
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* 今月やること */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                全体の受講完了率
              </CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {s.completionRate}%
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {s.completed}/{s.total} 件
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Bell className="size-3.5" />
                未完了の受講
              </CardDescription>
              <CardTitle className="flex items-center justify-between gap-2 text-2xl">
                <span>{pending} 件</span>
                {pending > 0 && (
                  <Link href="/admin/distribution">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Send className="size-3.5" />
                      リマインド
                    </Button>
                  </Link>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                平均点
              </CardDescription>
              <CardTitle className="text-2xl">
                {s.avgScore !== null ? `${s.avgScore} 点` : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <CourseSummaryCards rows={rows} />

        {/* 自社の理解度レポート（提案導線なし、自己解決型の導線のみ） */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartNoAxesColumn className="size-4 text-primary" />
              理解度レポート
            </CardTitle>
            <CardDescription>
              確認テストのカテゴリ別不正解率です。数値が高い分野は、追加の教材配信で底上げできます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeaknessMeters
              weakness={weakness}
              renderAction={() => (
                <Link href="/admin/courses">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Send className="size-3.5" />
                    おすすめ教材を配信
                  </Button>
                </Link>
              )}
            />
          </CardContent>
        </Card>

        <EnrollmentTable
          rows={rows}
          showCompany={false}
          description="自社社員の受講状況を教材ごとに確認できます。"
        />
      </div>
    </div>
  );
}
