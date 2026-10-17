"use client";

import { Building2, Briefcase, ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace, type WorkspaceMode } from "@/lib/workspace";

const OPTIONS: {
  mode: WorkspaceMode;
  label: string;
  icon: typeof Building2;
}[] = [
  { mode: "tenant", label: "契約企業", icon: Building2 },
  { mode: "oem", label: "監査事業者", icon: Briefcase },
];

/**
 * サイドバー下部の表示モード切替。
 * md 以上はセグメントスイッチ、アイコンのみのサイドバー（md 未満）ではトグルボタン。
 */
export function ModeSwitch() {
  const { mode, isOem, setMode } = useWorkspace();
  const next: WorkspaceMode = isOem ? "tenant" : "oem";

  return (
    <div className="flex flex-col gap-1.5">
      <p className="hidden px-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground/70 md:block">
        表示モード（デモ用）
      </p>

      {/* md+: segmented control */}
      <div
        role="radiogroup"
        aria-label="表示モード"
        className="hidden grid-cols-2 gap-1 rounded-lg bg-muted p-1 md:grid"
      >
        {OPTIONS.map((o) => {
          const active = mode === o.mode;
          const Icon = o.icon;
          return (
            <button
              key={o.mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(o.mode)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                active
                  ? o.mode === "oem"
                    ? "bg-violet-600 font-medium text-white shadow-sm"
                    : "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {o.label}
            </button>
          );
        })}
      </div>

      {/* < md: icon toggle */}
      <button
        type="button"
        onClick={() => setMode(next)}
        title={`表示モードを切替（現在：${isOem ? "監査事業者" : "契約企業"}）`}
        aria-label="表示モードを切替"
        className={cn(
          "flex items-center justify-center rounded-lg px-2.5 py-2 md:hidden",
          isOem ? "bg-violet-600 text-white" : "bg-muted text-foreground",
        )}
      >
        <ArrowLeftRight className="size-[1.15rem]" />
      </button>
    </div>
  );
}
