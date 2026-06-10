"use client";

import { useState } from "react";
import {
  Send,
  Building2,
  Users,
  Loader2,
  CheckCircle2,
  Link2,
  Copy,
  Check,
  MessageCircle,
  Hash,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { COMPANIES, GROUPS } from "@/constants/distribution";
import type { DeliveryGroup, NotifyChannel } from "@/lib/types";

type Phase = "config" | "sending" | "done";

// Channel send steps shown during the pseudo notification animation.
const SEND_STEPS = [
  { text: "受講用マジックリンクを発行中...", icon: Link2 },
  { text: "配信先テナントにコンテンツを割り当て中...", icon: Building2 },
  { text: "LINE / Slack へ通知を送信しています...", icon: Send },
  { text: "配信を確定しています...", icon: CheckCircle2 },
] as const;
const STEP_MS = 900;

// Lightweight toggle switch (no dedicated UI primitive in this project).
function Toggle({
  checked,
  onChange,
  label,
  icon: Icon,
  tint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon: typeof MessageCircle;
  tint: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
        checked ? "border-primary/40 bg-primary/5" : "border-input"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className={`size-4 ${checked ? tint : "text-muted-foreground"}`} />
        {label}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function DistributionModal({
  open,
  onOpenChange,
  courseTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
}) {
  const [phase, setPhase] = useState<Phase>("config");
  const [step, setStep] = useState(0);
  const [corps, setCorps] = useState<string[]>(["A"]);
  const [group, setGroup] = useState<DeliveryGroup>("全社員");
  const [channels, setChannels] = useState<Record<NotifyChannel, boolean>>({
    line: true,
    slack: false,
  });
  const [copied, setCopied] = useState(false);

  // Reset the flow back to the config step whenever the modal transitions to
  // open. Using the "adjust state during render" pattern (tracking the previous
  // `open` value) avoids a cascading effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhase("config");
      setStep(0);
      setCopied(false);
    }
  }

  const primaryCorp = corps[0] ?? "A";
  const magicLink = `http://localhost:3000/pages/course?token=magic123&corp=${primaryCorp}`;

  function toggleCorp(corp: string) {
    setCorps((prev) =>
      prev.includes(corp) ? prev.filter((c) => c !== corp) : [...prev, corp]
    );
  }

  function handleDistribute() {
    if (corps.length === 0) return;
    setPhase("sending");
    setStep(0);
    const timer = setInterval(() => {
      setStep((s) => {
        if (s >= SEND_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => setPhase("done"), STEP_MS);
          return s;
        }
        return s + 1;
      });
    }, STEP_MS);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(magicLink);
    } catch {
      /* clipboard may be unavailable; ignore in prototype */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const activeChannels = (Object.keys(channels) as NotifyChannel[]).filter(
    (c) => channels[c]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* -------- CONFIG -------- */}
        {phase === "config" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="size-4 text-primary" />
                配信設定
              </DialogTitle>
              <DialogDescription>
                教材「{courseTitle}」を配信する企業・グループと通知方法を選択します。
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              {/* Companies (multi-select) */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Building2 className="size-3.5" />
                  配信先企業（複数選択可）
                </label>
                <div className="flex flex-col gap-2">
                  {COMPANIES.map((c) => {
                    const active = corps.includes(c.corp);
                    return (
                      <button
                        key={c.corp}
                        type="button"
                        onClick={() => toggleCorp(c.corp)}
                        aria-pressed={active}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-input text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {active && <Check className="size-3" />}
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group (single-select) */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Users className="size-3.5" />
                  配信対象グループ
                </label>
                <div className="flex flex-wrap gap-2">
                  {GROUPS.map((g) => {
                    const active = group === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGroup(g)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-input text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification channels */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  通知設定
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Toggle
                    checked={channels.line}
                    onChange={(v) => setChannels((p) => ({ ...p, line: v }))}
                    label="LINE通知を送る"
                    icon={MessageCircle}
                    tint="text-green-600"
                  />
                  <Toggle
                    checked={channels.slack}
                    onChange={(v) => setChannels((p) => ({ ...p, slack: v }))}
                    label="Slack通知を送る"
                    icon={Hash}
                    tint="text-violet-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between gap-3 border-t pt-4">
              <span className="text-xs text-muted-foreground">
                {corps.length} 社 ・ {group}
              </span>
              <Button
                onClick={handleDistribute}
                disabled={corps.length === 0}
                className="gap-2"
              >
                <Send className="size-4" />
                配信実行
              </Button>
            </div>
          </>
        )}

        {/* -------- SENDING -------- */}
        {phase === "sending" && (
          <div className="flex flex-col items-center gap-5 py-4">
            <DialogHeader>
              <DialogTitle className="text-center">配信処理中...</DialogTitle>
              <DialogDescription className="text-center">
                チャットツールと連携し、受講案内を送信しています。
              </DialogDescription>
            </DialogHeader>

            {/* Channel icons "pinging" */}
            <div className="flex items-center gap-4">
              {channels.line && (
                <span className="flex size-11 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                  <MessageCircle className="size-5 animate-pulse" />
                </span>
              )}
              {channels.slack && (
                <span className="flex size-11 items-center justify-center rounded-full bg-violet-500/15 text-violet-600">
                  <Hash className="size-5 animate-pulse" />
                </span>
              )}
              {activeChannels.length === 0 && (
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Link2 className="size-5 animate-pulse" />
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((step + 1) / SEND_STEPS.length) * 100}%`,
                  }}
                />
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {SEND_STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li
                      key={s.text}
                      className={`flex items-center gap-2 transition-colors ${
                        active
                          ? "text-foreground"
                          : done
                            ? "text-emerald-600"
                            : "text-muted-foreground/40"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : active ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <span className="size-4 rounded-full border border-current" />
                      )}
                      {s.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* -------- DONE -------- */}
        {phase === "done" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 pt-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="size-7" />
              </span>
              <DialogTitle className="text-lg">配信完了！</DialogTitle>
              <DialogDescription>
                受講用リンクを発行しました。下記のマジックリンクを対象者に共有してください。
              </DialogDescription>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {corps.map((c) => {
                const company = COMPANIES.find((x) => x.corp === c);
                return (
                  <Badge key={c} variant="muted">
                    {company?.name ?? c}
                  </Badge>
                );
              })}
              <Badge variant="muted">{group}</Badge>
              {channels.line && (
                <Badge variant="success">
                  <MessageCircle className="size-3" />
                  LINE通知済み
                </Badge>
              )}
              {channels.slack && (
                <Badge variant="success">
                  <Hash className="size-3" />
                  Slack通知済み
                </Badge>
              )}
            </div>

            {/* Magic link with copy */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Link2 className="size-3.5" />
                受講用マジックリンク
              </label>
              <div className="flex items-center gap-2">
                <Input readOnly value={magicLink} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="shrink-0 gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                ※ このリンクを開くとログイン不要で「{COMPANIES.find((x) => x.corp === primaryCorp)?.name}」の専用ポータルが開きます。
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={() => setPhase("config")}>
                続けて他社に配信
              </Button>
              <Button onClick={() => onOpenChange(false)}>閉じる</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
