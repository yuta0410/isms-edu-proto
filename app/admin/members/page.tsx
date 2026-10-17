"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Mail,
  UserCheck,
  Clock,
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GROUPS } from "@/constants/distribution";
import { MEMBERS, MEMBER_STATUS_META } from "@/constants/members";
import { tenantName } from "@/constants/tenants";
import type { DeliveryGroup } from "@/lib/types";
import { scopeByTenant } from "@/lib/scope";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

type Notice = "add" | "csv" | null;

const NOTICE_TEXT: Record<Exclude<Notice, null>, string> = {
  add: "社員の個別追加（氏名・メールアドレス・所属グループ入力 → 招待メール送信）はプロトタイプでは未実装です。",
  csv: "CSV一括登録（列：氏名, メールアドレス, 所属部署, 所属グループ）はプロトタイプでは未実装です。",
};

export default function MembersPage() {
  const ws = useWorkspace();
  const { isOem } = ws;
  // Tenant mode only ever receives its own roster.
  const members = scopeByTenant(ws, MEMBERS, (m) => m.corp);

  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<DeliveryGroup | "all">("all");
  const [notice, setNotice] = useState<Notice>(null);

  const q = query.trim().toLowerCase();
  const filtered = members.filter(
    (m) =>
      (group === "all" || m.groups.includes(group)) &&
      (!q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)),
  );

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <div className="min-h-screen">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">受講者管理</h1>
            <p className="text-xs text-muted-foreground">
              {isOem
                ? "全契約企業の受講者（社員）名簿"
                : `${ws.tenant.name} の社員名簿・所属グループ`}
            </p>
          </div>
        </div>
        {/* ダミー：登録フローは未実装 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setNotice("csv")}
          >
            <FileSpreadsheet className="size-3.5" />
            CSVで一括登録
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setNotice("add")}
          >
            <UserPlus className="size-3.5" />
            社員を追加
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {notice && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm duration-200 animate-in fade-in">
            {notice === "csv" ? (
              <FileSpreadsheet className="size-4 shrink-0 text-primary" />
            ) : (
              <UserPlus className="size-4 shrink-0 text-primary" />
            )}
            <span className="flex-1">{NOTICE_TEXT[notice]}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="閉じる"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                登録社員数
              </CardDescription>
              <CardTitle className="text-2xl">{members.length} 名</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <UserCheck className="size-3.5" />
                有効アカウント
              </CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {activeCount} 名
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                招待中（未アクセス）
              </CardDescription>
              <CardTitle className="text-2xl text-amber-600">
                {invitedCount} 名
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>社員一覧</CardTitle>
            <CardDescription>
              所属グループは配信時の対象グループ（全社員・新入社員・管理職）と連動します。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="氏名・メール・部署で検索"
                  aria-label="社員を検索"
                  className="pl-8"
                />
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="所属グループで絞り込み"
              >
                {(["all", ...GROUPS] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(g)}
                    aria-pressed={group === g}
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs transition-colors",
                      group === g
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-input text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {g === "all" ? "すべて" : g}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>氏名</TableHead>
                    {isOem && <TableHead>企業</TableHead>}
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>所属グループ</TableHead>
                    <TableHead>最終アクセス</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => {
                    const status = MEMBER_STATUS_META[m.status];
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <span className="flex flex-col">
                            <span className="font-medium">{m.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {m.department}
                            </span>
                          </span>
                        </TableCell>
                        {isOem && (
                          <TableCell className="text-muted-foreground">
                            {tenantName(m.corp)}
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-3.5 shrink-0" />
                            {m.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex flex-wrap gap-1">
                            {m.groups.map((g) => (
                              <Badge
                                key={g}
                                variant={g === "全社員" ? "muted" : "info"}
                              >
                                {g}
                              </Badge>
                            ))}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.last_access ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isOem ? 6 : 5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        条件に一致する社員がいません。
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
