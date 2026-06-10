"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  Bell,
  CheckCircle2,
  MessageCircle,
  Hash,
  X,
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DISTRIBUTIONS,
  completionRate,
} from "@/constants/distribution";
import type { DistributionRecord } from "@/lib/types";

interface Toast {
  id: number;
  message: string;
}

export default function DistributionPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Track which rows have just been reminded (brief visual confirmation).
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const toastSeq = useRef(0);

  function pushToast(message: string) {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handleRemind(r: DistributionRecord) {
    const pending = r.total_count - r.completed_count;
    const via =
      r.channels.includes("line") && r.channels.includes("slack")
        ? "LINE/メール"
        : r.channels.includes("slack")
          ? "Slack/メール"
          : "LINE/メール";
    pushToast(`未受講者 ${pending}名に${via}で再通知しました（${r.corp_name}）`);
    setReminded((prev) => ({ ...prev, [r.id]: true }));
    setTimeout(
      () => setReminded((prev) => ({ ...prev, [r.id]: false })),
      2500
    );
  }

  // Summary across all distributions.
  const totalLearners = DISTRIBUTIONS.reduce((a, r) => a + r.total_count, 0);
  const totalDone = DISTRIBUTIONS.reduce((a, r) => a + r.completed_count, 0);
  const overallRate = totalLearners
    ? Math.round((totalDone / totalLearners) * 100)
    : 0;
  const companyCount = new Set(DISTRIBUTIONS.map((r) => r.corp)).size;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Send className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              配信・進捗管理
            </h1>
            <p className="text-xs text-muted-foreground">
              管理者向け / 企業別・グループ別の配信状況
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin/generate">
            <Button variant="ghost" size="sm">
              スライド生成へ
            </Button>
          </Link>
          <Link href="/admin/materials">
            <Button variant="ghost" size="sm">
              参考資料管理
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              進捗ダッシュボード
            </Button>
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>配信中の教材（延べ）</CardDescription>
              <CardTitle className="text-2xl">
                {DISTRIBUTIONS.length} 件
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>配信先企業</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="size-5 text-muted-foreground" />
                {companyCount} 社
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>全体受講完了率</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {overallRate}%
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {totalDone}/{totalLearners} 名
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Distribution table */}
        <Card>
          <CardHeader>
            <CardTitle>配信状況一覧</CardTitle>
            <CardDescription>
              教材ごとの配信先・受講完了率を確認し、未受講者へリマインドを送信できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>教材名</TableHead>
                  <TableHead>配信先企業</TableHead>
                  <TableHead>対象グループ</TableHead>
                  <TableHead>配信日時</TableHead>
                  <TableHead>通知</TableHead>
                  <TableHead className="min-w-[160px]">受講完了率</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DISTRIBUTIONS.map((r) => {
                  const rate = completionRate(r);
                  const pending = r.total_count - r.completed_count;
                  const done = pending === 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.course_title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.corp_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{r.group}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.distributed_at}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          {r.channels.includes("line") && (
                            <MessageCircle className="size-4 text-green-600" />
                          )}
                          {r.channels.includes("slack") && (
                            <Hash className="size-4 text-violet-600" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${
                                rate === 100 ? "bg-emerald-500" : "bg-primary"
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              rate === 100 ? "text-emerald-600" : ""
                            }`}
                          >
                            {rate}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({r.completed_count}/{r.total_count})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {done ? (
                          <Badge variant="success">
                            <CheckCircle2 className="size-3" />
                            全員完了
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemind(r)}
                            disabled={reminded[r.id]}
                            className="gap-1.5"
                          >
                            {reminded[r.id] ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                送信済み
                              </>
                            ) : (
                              <>
                                <Bell className="size-3.5" />
                                リマインド送信
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Toast notifications */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-200 animate-in slide-in-from-right-4 fade-in"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Bell className="size-3.5" />
            </span>
            <p className="flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="text-muted-foreground hover:text-foreground"
              aria-label="閉じる"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
