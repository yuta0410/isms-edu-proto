"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Presentation,
  Send,
  GraduationCap,
  LogOut,
  Loader2,
  Layers,
  Gauge,
  ScrollText,
  FileCheck2,
  Building2,
  CalendarRange,
  SquareKanban,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  useSession,
  type Workspace,
  type WorkspaceMode,
} from "@/lib/workspace";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

// Navigation per workspace mode. Tenant admins get a task-oriented console for
// their own company; the OEM gets the cross-tenant consulting cockpit.
const NAV: Record<WorkspaceMode, NavItem[]> = {
  tenant: [
    { href: "/admin/dashboard", label: "ホーム", icon: LayoutDashboard },
    { href: "/admin/generate", label: "教材をつくる", icon: Presentation },
    { href: "/admin/courses", label: "教材ライブラリ", icon: Layers },
    { href: "/admin/distribution", label: "配信と進捗", icon: Send },
    { href: "/admin/members", label: "受講者管理", icon: Users },
    { href: "/admin/materials", label: "社内規定", icon: ScrollText },
    { href: "/admin/evidence", label: "証跡・記録", icon: FileCheck2 },
  ],
  oem: [
    { href: "/admin/dashboard", label: "統括ダッシュボード", icon: Gauge },
    { href: "/admin/tenants", label: "顧客・アカウント管理", icon: Building2 },
    { href: "/admin/schedule", label: "監査スケジュール", icon: CalendarRange },
    { href: "/admin/opportunities", label: "提案パイプライン", icon: SquareKanban },
    { href: "/admin/courses", label: "監修教材ライブラリ", icon: Layers },
  ],
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status, workspace, signOut } = useSession();

  // Auth guard. "loading" (server render / hydration) never redirects, so a
  // signed-in user is not bounced to the login page before the client
  // snapshot is read.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  if (!workspace) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  function handleLogout() {
    // Navigate first so the guard above doesn't race the redirect, then clear.
    router.replace("/");
    signOut();
  }

  return (
    <AdminShell workspace={workspace} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}

function AdminShell({
  workspace,
  onLogout,
  children,
}: {
  workspace: Workspace;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { mode, isOem, tenant, partner } = workspace;

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
              {tenant ? tenant.name : partner.brand_name}
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

        {/* Footer: signed-in account, learner portal, logout */}
        <div className="flex flex-col gap-1 border-t p-2 md:p-3">
          <div className="mb-1 hidden items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-2 md:flex">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                isOem ? "bg-violet-600" : "bg-primary"
              )}
            >
              {isOem ? "O" : "T"}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-medium">
                {tenant ? tenant.name : partner.name}
              </span>
              <span className="text-[0.7rem] text-muted-foreground">
                {isOem ? "OEM管理者" : "テナント管理者"}
              </span>
            </span>
          </div>
          <Link
            href={tenant ? `/pages/course?corp=${tenant.id}` : "/pages/course"}
            className="flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:justify-start md:px-3"
            title="受講ポータル"
          >
            <GraduationCap className="size-[1.15rem] shrink-0" />
            <span className="hidden md:inline">受講ポータル</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive md:justify-start md:px-3"
            title="ログアウト"
          >
            <LogOut className="size-[1.15rem] shrink-0" />
            <span className="hidden md:inline">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
