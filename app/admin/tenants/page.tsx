"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Users,
  RefreshCw,
  CheckCircle2,
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
import { OemOnly } from "@/components/oem-only";
import {
  TENANT_ACCOUNTS,
  PLAN_LABEL,
  parseDate,
  formatFullDate,
  type PlanCode,
  type TenantStatus,
} from "@/constants/accounts";
import { getTenantProfile } from "@/constants/tenants";

const PLAN_VARIANT: Record<PlanCode, "muted" | "info" | "default"> = {
  light: "muted",
  standard: "info",
  premium: "default",
};

const STATUS_META: Record<
  TenantStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  active: { label: "稼働中", variant: "success" },
  trial: { label: "トライアル", variant: "warning" },
  suspended: { label: "停止中", variant: "destructive" },
};

export default function TenantsPage() {
  return (
    <OemOnly>
      <TenantsView />
    </OemOnly>
  );
}

function TenantsView() {
  const [notice, setNotice] = useState(false);

  const totalEmployees = TENANT_ACCOUNTS.reduce(
    (a, t) => a + t.employee_count,
    0,
  );
  const activeCount = TENANT_ACCOUNTS.filter(
    (t) => t.status === "active",
  ).length;

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              顧客・アカウント管理
            </h1>
            <p className="text-xs text-muted-foreground">
              システムを利用中の契約企業（テナント）
            </p>
          </div>
        </div>
        {/* ダミー：テナント開設ウィザードは未実装 */}
        <Button size="sm" className="gap-1.5" onClick={() => setNotice(true)}>
          <Plus className="size-3.5" />
          新規テナント開設
        </Button>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {notice && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm duration-200 animate-in fade-in">
            <Plus className="size-4 text-violet-600" />
            <span className="flex-1">
              テナント開設ウィザード（企業情報 → プラン →
              管理者招待）はプロトタイプでは未実装です。
            </span>
            <button
              type="button"
              onClick={() => setNotice(false)}
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
                <Building2 className="size-3.5" />
                契約企業数
              </CardDescription>
              <CardTitle className="text-2xl">
                {TENANT_ACCOUNTS.length} 社
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                稼働中
              </CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {activeCount} 社
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                総登録社員数
              </CardDescription>
              <CardTitle className="text-2xl">
                {totalEmployees.toLocaleString("ja-JP")} 名
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>契約企業一覧</CardTitle>
            <CardDescription>
              利用プラン・登録社員数・契約状況を確認できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企業名</TableHead>
                  <TableHead>利用プラン</TableHead>
                  <TableHead className="text-right">登録社員数</TableHead>
                  <TableHead>テナント管理者</TableHead>
                  <TableHead>契約更新日</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TENANT_ACCOUNTS.map((t) => {
                  const profile = getTenantProfile(t.tenant_id);
                  const status = STATUS_META[t.status];
                  return (
                    <TableRow key={t.tenant_id}>
                      <TableCell>
                        <span className="flex flex-col">
                          <span className="font-medium">
                            {profile?.name ?? t.tenant_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {profile?.industry}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PLAN_VARIANT[t.plan]}>
                          {PLAN_LABEL[t.plan]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.employee_count} 名
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.admin_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="size-3.5" />
                          {formatFullDate(parseDate(t.contract_renewal_on))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          <CheckCircle2 className="size-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
