"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Presentation,
  FolderOpen,
  Send,
  GraduationCap,
  Home,
  Layers,
  Gauge,
  ScrollText,
  FileCheck2,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace, type WorkspaceMode } from "@/lib/workspace";
import { ModeSwitch } from "@/components/mode-switch";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

// Navigation per workspace mode. Tenant admins get a task-oriented console for
// their own company; the OEM gets the cross-tenant consulting cockpit.
const NAV: Record<WorkspaceMode, NavItem[]> = {
  tenant: [
    { href: "/admin/dashboard", label: "ホーム", icon: LayoutDashboard },
    { href: "/admin/generate", label: "教材をつくる", icon: Presentation },
    { href: "/admin/courses", label: "教材ライブラリ", icon: Layers },
    { href: "/admin/distribution", label: "配信と進捗", icon: Send },
    { href: "/admin/materials", label: "社内規定", icon: ScrollText },
    { href: "/admin/evidence", label: "証跡・記録", icon: FileCheck2 },
  ],
  oem: [
    { href: "/admin/dashboard", label: "統括ダッシュボード", icon: Gauge },
    { href: "/admin/generate", label: "教材スタジオ", icon: Presentation },
    { href: "/admin/courses", label: "監修教材ライブラリ", icon: Layers },
    { href: "/admin/materials", label: "ナレッジ・規定管理", icon: FolderOpen },
    { href: "/admin/distribution", label: "全社配信状況", icon: Send },
  ],
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { mode, isOem, tenant, partner } = useWorkspace();

  return (
    <div className="flex min-h-screen bg-muted/30 print:block print:bg-white">
      {/* Fixed cockpit sidebar — collapses to icons under md, hidden on print */}
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r bg-card md:w-60 print:hidden">
        {/* Brand: tenant mode shows the company under the partner's brand */}
        <Link
          href="/"
          className="flex h-16 items-center gap-2.5 border-b px-4 md:px-5"
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg text-white",
              isOem ? "bg-violet-600" : "bg-primary text-primary-foreground"
            )}
          >
            {isOem ? (
              <ShieldCheck className="size-5" />
            ) : (
              <Building2 className="size-5" />
            )}
          </span>
          <span className="hidden min-w-0 flex-col leading-tight md:flex">
            <span className="truncate font-heading text-sm font-semibold">
              {isOem ? partner.brand_name : tenant.name}
            </span>
            <span className="truncate text-[0.7rem] text-muted-foreground">
              {isOem ? "統括コックピット（OEM）" : `${partner.brand_name} 管理画面`}
            </span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 md:p-3">
          <p className="hidden px-2 pt-2 pb-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground/70 uppercase md:block">
            {isOem ? "コンサルティング" : "メニュー"}
          </p>
          {NAV[mode].map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors md:px-3",
                  "justify-center md:justify-start",
                  active
                    ? isOem
                      ? "bg-violet-500/10 font-medium text-foreground ring-1 ring-violet-500/20"
                      : "bg-primary/10 font-medium text-foreground ring-1 ring-primary/15"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "size-[1.15rem] shrink-0",
                    active && (isOem ? "text-violet-600" : "text-primary")
                  )}
                />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: mode switch + jump out to learner-facing views */}
        <div className="flex flex-col gap-1 border-t p-2 md:p-3">
          <div className="mb-2">
            <ModeSwitch />
          </div>
          <Link
            href={isOem ? "/pages/course" : `/pages/course?corp=${tenant.id}`}
            className="flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:justify-start md:px-3"
            title="受講ポータル"
          >
            <GraduationCap className="size-[1.15rem] shrink-0" />
            <span className="hidden md:inline">受講ポータル</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:justify-start md:px-3"
            title="ホーム"
          >
            <Home className="size-[1.15rem] shrink-0" />
            <span className="hidden md:inline">ホーム</span>
          </Link>
        </div>
      </aside>

      {/* Page content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
