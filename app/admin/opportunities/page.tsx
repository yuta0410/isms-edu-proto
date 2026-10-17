"use client";

import { useState } from "react";
import {
  SquareKanban,
  ArrowRight,
  ArrowLeft,
  Mail,
  ShieldAlert,
  CalendarClock,
  CircleDollarSign,
  Handshake,
  Copy,
  Check,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { OemOnly } from "@/components/oem-only";
import {
  OPPORTUNITIES,
  STAGES,
  formatYen,
  parseDate,
  formatFullDate,
  type Opportunity,
  type OpportunityStage,
} from "@/constants/accounts";
import { getWeakness } from "@/constants/evidence";
import { tenantName } from "@/constants/tenants";
import { cn } from "@/lib/utils";

const STAGE_STYLE: Record<OpportunityStage, { dot: string; column: string }> = {
  not_proposed: { dot: "bg-muted-foreground/50", column: "bg-muted/40" },
  proposing: {
    dot: "bg-amber-500",
    column: "bg-amber-50/50 dark:bg-amber-950/10",
  },
  won: {
    dot: "bg-emerald-500",
    column: "bg-emerald-50/50 dark:bg-emerald-950/10",
  },
};

export default function OpportunitiesPage() {
  return (
    <OemOnly>
      <PipelineView />
    </OemOnly>
  );
}

function PipelineView() {
  // Prototype: stage changes live in local state. In production this is a
  // partner-scoped `opportunities` table (and a webhook to n8n / CRM).
  const [items, setItems] = useState<Opportunity[]>(OPPORTUNITIES);
  const [emailFor, setEmailFor] = useState<Opportunity | null>(null);
  const [copied, setCopied] = useState(false);

  function move(id: string, dir: 1 | -1) {
    setItems((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = STAGES.findIndex((s) => s.id === o.stage);
        const next =
          STAGES[Math.min(STAGES.length - 1, Math.max(0, idx + dir))];
        return { ...o, stage: next.id };
      }),
    );
  }

  async function copyEmail(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be unavailable; ignore in prototype */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const total = (stage: OpportunityStage) =>
    items
      .filter((o) => o.stage === stage)
      .reduce((a, o) => a + o.amount_yen, 0);
  const openAmount = total("not_proposed") + total("proposing");
  const emailText = emailFor
    ? getWeakness(emailFor.tenant_id).upsell.email
    : "";

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center gap-3 border-b bg-card px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
          <SquareKanban className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-base font-semibold">
            提案パイプライン
          </h1>
          <p className="text-xs text-muted-foreground">
            弱点分析・審査スケジュールから生まれた追加コンサル提案の進捗
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <SquareKanban className="size-3.5" />
                進行中の提案
              </CardDescription>
              <CardTitle className="text-2xl">
                {items.filter((o) => o.stage !== "won").length} 件
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <CircleDollarSign className="size-3.5" />
                見込み金額（未提案＋提案中）
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatYen(openAmount)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Handshake className="size-3.5" />
                受注金額
              </CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {formatYen(total("won"))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STAGES.map((stage, stageIdx) => {
            const cards = items.filter((o) => o.stage === stage.id);
            const style = STAGE_STYLE[stage.id];
            return (
              <section
                key={stage.id}
                aria-label={stage.label}
                className={cn(
                  "flex flex-col gap-3 rounded-xl p-3",
                  style.column,
                )}
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("size-2 rounded-full", style.dot)} />
                    {stage.label}
                    <Badge variant="muted">{cards.length}</Badge>
                  </h2>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatYen(total(stage.id))}
                  </span>
                </div>

                {cards.map((o) => (
                  <article
                    key={o.id}
                    className="flex flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {tenantName(o.tenant_id)}
                      </p>
                      {o.source === "weakness" ? (
                        <Badge variant="destructive">
                          <ShieldAlert className="size-3" />
                          弱点分析
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <CalendarClock className="size-3" />
                          審査起点
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-snug font-medium">
                      {o.title}
                    </p>
                    {o.weak_category && (
                      <p className="text-xs text-muted-foreground">
                        根拠：{o.weak_category}（不正解率 {o.incorrect_rate}%）
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold tabular-nums">
                        {formatYen(o.amount_yen)}
                      </span>
                      <span className="text-muted-foreground">
                        起票 {formatFullDate(parseDate(o.created_on))}
                      </span>
                    </div>
                    <p className="rounded-md bg-muted/60 px-2 py-1 text-xs">
                      次のアクション：{o.next_action}
                    </p>
                    <div className="flex items-center gap-1.5 border-t pt-2.5">
                      {o.source === "weakness" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setCopied(false);
                            setEmailFor(o);
                          }}
                        >
                          <Mail className="size-3.5" />
                          提案メール
                        </Button>
                      )}
                      <div className="ml-auto flex gap-1">
                        {stageIdx > 0 && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => move(o.id, -1)}
                            aria-label={`${STAGES[stageIdx - 1].label}に戻す`}
                            title={`${STAGES[stageIdx - 1].label}に戻す`}
                          >
                            <ArrowLeft className="size-3.5" />
                          </Button>
                        )}
                        {stageIdx < STAGES.length - 1 && (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => move(o.id, 1)}
                          >
                            {STAGES[stageIdx + 1].label}へ
                            <ArrowRight className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {cards.length === 0 && (
                  <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    該当する提案はありません
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* 提案メール（ダッシュボードの弱点分析と同じテンプレート） */}
      <Dialog open={!!emailFor} onOpenChange={(o) => !o && setEmailFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              追加提案メール テンプレート
            </DialogTitle>
            <DialogDescription>
              {emailFor &&
                `${tenantName(emailFor.tenant_id)}｜${emailFor.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-[13px] leading-relaxed whitespace-pre-wrap">
            {emailText}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => copyEmail(emailText)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
