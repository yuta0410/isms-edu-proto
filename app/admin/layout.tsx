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
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/generate", label: "スライド生成", icon: Presentation },
  { href: "/admin/materials", label: "参考資料管理", icon: FolderOpen },
  { href: "/admin/distribution", label: "配信・進捗管理", icon: Send },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/30 print:block print:bg-white">
      {/* Fixed cockpit sidebar — collapses to icons under md, hidden on print */}
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r bg-card md:w-60 print:hidden">
        {/* Brand */}
        <Link
          href="/"
          className="flex h-16 items-center gap-2.5 border-b px-4 md:px-5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="hidden flex-col leading-tight md:flex">
            <span className="font-heading text-sm font-semibold">
              ISMS 教育管理
            </span>
            <span className="text-[0.7rem] text-muted-foreground">
              管理コンソール
            </span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
          <p className="hidden px-2 pt-2 pb-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground/70 uppercase md:block">
            メニュー
          </p>
          {NAV.map((item) => {
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
                    ? "bg-primary/10 font-medium text-foreground ring-1 ring-primary/15"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "size-[1.15rem] shrink-0",
                    active && "text-primary"
                  )}
                />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer links: jump out to learner-facing views */}
        <div className="flex flex-col gap-1 border-t p-2 md:p-3">
          <Link
            href="/pages/course"
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
