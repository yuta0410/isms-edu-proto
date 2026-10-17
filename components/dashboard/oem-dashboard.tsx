"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gauge,
  Sparkles,
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Mail,
  Copy,
  Check,
  X,
  Building2,
  SquareKanban,
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
import { ENROLLMENTS } from "@/constants/enrollments";
import { getWeakness } from "@/constants/evidence";
import { visibleTenants } from "@/lib/scope";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import {
  CourseSummaryCards,
  EnrollmentTable,
  WeaknessMeters,
  severityOf,
  summarize,
} from "@/components/dashboard/shared";

/**
 * OEM（監査事業者）向け統括ダッシュボード。全テナントの健康状態を俯瞰し、
 * 選択した企業の弱点分析から追加コンサル提案（アップセル）へつなげる。
 */
export function OemDashboard() {
  const ws = useWorkspace();
  const tenants = visibleTenants(ws);
  const [corp, setCorp] = useState<string>(tenants[0].id);
  const [showUpsell, setShowUpsell] = useState(false);
  const [copied, setCopied] = useState(false);

  // 企業を切り替えたら、表示中の提案メールパネルを閉じる
  // （adjust-state-during-render パターンで effect の連鎖再レンダーを回避）。
  const [prevCorp, setPrevCorp] = useState(corp);
  if (corp !== prevCorp) {
    setPrevCorp(corp);
    setShowUpsell(false);
    setCopied(false);
  }

  const weakness = getWeakness(corp);
  const weakestRate = Math.max(
    ...weakness.categories.map((c) => c.incorrect_rate),
  );
  const companyName = tenants.find((t) => t.id === corp)?.name ?? "対象企業";
  const tenantRows = ENROLLMENTS.filter((r) => r.corp === corp);

  async function copyUpsellEmail() {
    try {
      await navigator.clipboard.writeText(weakness.upsell.email);
    } catch {
      /* clipboard may be unavailable in some contexts; ignore in prototype */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
            <Gauge className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              統括ダッシュボード
            </h1>
            <p className="text-xs text-muted-foreground">
              {ws.partner.name} / 全 {tenants.length} 社の契約企業
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/generate" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="size-3.5" />
              新しい教材を生成
            </Button>
          </Link>
          <label className="sr-only" htmlFor="oem-corp">
            対象企業
          </label>
          <select
            id="oem-corp"
            value={corp}
            onChange={(e) => setCorp(e.target.value)}
            className="hidden h-8 rounded-lg border border-input bg-transparent px-2.5 text-[0.8rem] text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:block dark:bg-input/30"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Link href={`/admin/evidence?corp=${corp}`} target="_blank">
            <Button size="sm" className="gap-1.5">
              <FileCheck2 className="size-3.5" />
              審査用 証跡PDF出力
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* ポートフォリオ：全テナントのヘルス */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-violet-600" />
              契約企業ポートフォリオ
            </CardTitle>
            <CardDescription>
              行をクリックすると、その企業の弱点分析・受講状況に切り替わります。
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企業名</TableHead>
                  <TableHead>業種</TableHead>
                  <TableHead>受講完了率</TableHead>
                  <TableHead>平均点</TableHead>
                  <TableHead>最弱点カテゴリ</TableHead>
                  <TableHead className="text-right">シグナル</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => {
                  const s = summarize(
                    ENROLLMENTS.filter((r) => r.corp === t.id),
                  );
                  const w = getWeakness(t.id);
                  const worst = Math.max(
                    ...w.categories.map((c) => c.incorrect_rate),
                  );
                  const sev = severityOf(worst);
                  const selected = t.id === corp;
                  return (
                    <TableRow
                      key={t.id}
                      onClick={() => setCorp(t.id)}
                      aria-selected={selected}
                      className={cn(
                        "cursor-pointer",
                        selected && "bg-violet-500/5",
                      )}
                    >
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          onClick={() => setCorp(t.id)}
                          className="text-left hover:underline"
                        >
                          {t.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.industry}
                      </TableCell>
                      <TableCell>{s.completionRate}%</TableCell>
                      <TableCell>
                        {s.avgScore !== null ? `${s.avgScore} 点` : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={sev.text}>
                          {w.upsell.weakest}（{worst}%）
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {worst >= 50 ? (
                          <Badge variant="destructive">
                            <Lightbulb className="size-3" />
                            提案機会あり
                          </Badge>
                        ) : worst >= 25 ? (
                          <Badge variant="warning">要フォロー</Badge>
                        ) : (
                          <Badge variant="success">良好</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <CourseSummaryCards rows={tenantRows} />

        {/* セキュリティ弱点・リスク分析（企業選択に連動） */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-destructive" />
                  セキュリティ弱点・リスク分析
                </CardTitle>
                <CardDescription className="mt-1">
                  <span className="font-medium text-foreground">
                    {companyName}
                  </span>
                  ｜カテゴリ別のクイズ不正解率から弱点を可視化します。
                </CardDescription>
              </div>
              <Badge
                variant={weakestRate >= 50 ? "destructive" : "warning"}
                className="w-fit"
              >
                <AlertTriangle className="size-3" />
                最弱点：{weakness.upsell.weakest}（{weakestRate}%）
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <WeaknessMeters
              weakness={weakness}
              renderAction={() => (
                <Button
                  size="sm"
                  onClick={() => setShowUpsell(true)}
                  className="gap-1.5"
                >
                  <Lightbulb className="size-3.5" />
                  追加対策を提案
                </Button>
              )}
            />

            {/* アップセル提案メール（フワッと表示） */}
            {showUpsell && (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 duration-300 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        追加提案メール テンプレート
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {weakness.upsell.option}｜そのまま顧客へ送付できます
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowUpsell(false)}
                    aria-label="閉じる"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border bg-card p-3 text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
                  {weakness.upsell.email}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="mr-auto text-xs text-muted-foreground">
                    ※
                    プロトタイプ：本文はコピーして任意のメールソフトに貼り付けできます。
                  </span>
                  <Link href="/admin/opportunities">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <SquareKanban className="size-3.5" />
                      提案パイプラインで管理
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUpsellEmail}
                    className="gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        コピーしました
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        メール本文をコピー
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <EnrollmentTable
          rows={ENROLLMENTS}
          showCompany
          description="全契約企業の受講状況です。教材名でフィルタできます。"
        />
      </div>
    </div>
  );
}
