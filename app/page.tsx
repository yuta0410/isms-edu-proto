"use client";

import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Briefcase,
  Building2,
  ChevronRight,
  LogIn,
  KeyRound,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PARTNER, tenantName } from "@/constants/tenants";
import { useSession, type Session } from "@/lib/workspace";
import { cn } from "@/lib/utils";

// Demo accounts: each one maps to a workspace session (role + tenant).
const DEMO_ACCOUNTS: {
  key: string;
  label: string;
  sub: string;
  session: Session;
  icon: typeof Briefcase;
  tint: string;
}[] = [
  {
    key: "oem",
    label: "監査事業会社（OEM管理者）としてログイン",
    sub: PARTNER.name,
    session: { mode: "oem" },
    icon: Briefcase,
    tint: "bg-violet-500/10 text-violet-600",
  },
  {
    key: "smart-flow",
    label: "契約企業：スマートフロー（テナント管理者）としてログイン",
    sub: tenantName("smart-flow"),
    session: { mode: "tenant", tenantId: "smart-flow" },
    icon: Building2,
    tint: "bg-primary/10 text-primary",
  },
  {
    key: "chiyoda",
    label: "契約企業：千代田コンサル（テナント管理者）としてログイン",
    sub: tenantName("chiyoda"),
    session: { mode: "tenant", tenantId: "chiyoda" },
    icon: Building2,
    tint: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();

  function quickLogin(session: Session) {
    // The store updates synchronously, so the admin layout's auth guard sees
    // the new session on its first render after navigation.
    signIn(session);
    router.push("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-semibold">
              ISMS教育資料管理ツール ログイン
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {PARTNER.brand_name} 管理コンソール
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>管理者ログイン</CardTitle>
            <CardDescription>
              発行されたIDとパスワードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mock form: submitting does nothing in the prototype */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-id"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                >
                  <User className="size-3.5" />
                  ログインID
                </label>
                <Input
                  id="login-id"
                  name="login_id"
                  autoComplete="username"
                  placeholder="admin@example.co.jp"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-password"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                >
                  <KeyRound className="size-3.5" />
                  パスワード
                </label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <LogIn className="size-4" />
                ログイン
              </Button>
            </form>
          </CardContent>

          {/* Demo quick login */}
          <CardFooter className="flex-col items-stretch gap-3 border-t">
            <p className="text-sm font-medium">
              💡 デモ用：テストアカウントでログイン
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => quickLogin(a.session)}
                    className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        a.tint,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm leading-snug font-medium">
                        {a.label}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {a.sub}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          ※一般受講者（社員）の方は、管理者から案内された専用URL（マジックリンク）から直接アクセスしてください。
        </p>
      </div>
    </main>
  );
}
