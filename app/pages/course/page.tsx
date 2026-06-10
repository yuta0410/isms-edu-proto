"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  KeyRound,
  Lock,
  BadgeCheck,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { COURSES } from "@/constants/courses";
import { getTenant } from "@/constants/distribution";
import type { Tenant } from "@/lib/types";

// Per-tenant accent styling. Classes are written out in full so Tailwind keeps
// them in the production build.
const ACCENT: Record<
  Tenant["accent"],
  { icon: string; badge: string; ring: string }
> = {
  sky: {
    icon: "bg-sky-500/10 text-sky-600",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    ring: "hover:ring-sky-500/30",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    ring: "hover:ring-violet-500/30",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    ring: "hover:ring-emerald-500/30",
  },
};

export default function CourseSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <Portal />
    </Suspense>
  );
}

function Portal() {
  const params = useSearchParams();
  const corp = params.get("corp");
  const token = params.get("token");
  const tenant = getTenant(corp);

  // Magic-link auto authentication: when a token is present we skip the login
  // screen and briefly show a "verifying" state, then reveal the portal.
  // `verifying` starts true only when a token exists, so the effect never has
  // to set it synchronously (which would cause a cascading render).
  const [authed, setAuthed] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => {
      setVerifying(false);
      setAuthed(true);
    }, 1300);
    return () => clearTimeout(t);
  }, [token]);

  // Courses visible to this portal: tenant-filtered, or the full catalog when
  // no tenant is specified.
  const courses = tenant
    ? COURSES.filter((c) => tenant.course_ids.includes(c.id))
    : COURSES;

  // Preserve tenant context when navigating into a course.
  const courseHref = (id: string) => {
    const qs = new URLSearchParams();
    if (corp) qs.set("corp", corp);
    if (token) qs.set("token", token);
    const s = qs.toString();
    return `/pages/course/${id}${s ? `?${s}` : ""}`;
  };

  // --- magic link being verified ---
  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-7" />
        </div>
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="font-heading text-base font-medium">
          マジックリンクを検証しています...
        </p>
        <p className="text-sm text-muted-foreground">
          {tenant ? `${tenant.name}の専用ポータルに接続中` : "受講ポータルに接続中"}
        </p>
      </div>
    );
  }

  // --- no token & not authed: show a (mock) login screen ---
  if (!token && !authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="size-5" />
            </div>
            <CardTitle>
              {tenant ? tenant.portal_label : "受講者ログイン"}
            </CardTitle>
            <CardDescription>
              管理者から配信された受講案内のマジックリンクからアクセスするか、
              メールアドレスでログインしてください。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="you@example.com" type="email" />
            <Button onClick={() => setAuthed(true)} className="gap-2">
              ログインして受講する
              <ArrowRight className="size-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ※ プロトタイプのため認証は擬似的に行われます。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accent = tenant ? ACCENT[tenant.accent] : ACCENT.sky;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${accent.icon}`}
          >
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              {tenant ? tenant.portal_label : "教材を選択"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {tenant
                ? `${tenant.logo_label}`
                : "一般社員向け / 受講する教材を選んでください"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {token && (
            <Badge variant="success">
              <BadgeCheck className="size-3" />
              マジックリンク認証済み
            </Badge>
          )}
          <Link href="/">
            <Button variant="ghost" size="sm">
              ホーム
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {tenant && (
          <div className={`mb-6 rounded-xl px-4 py-3 ${accent.badge}`}>
            <p className="text-sm font-medium">
              {tenant.logo_label}（{courses.length} 件）
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              貴社向けに配信された教材のみ表示しています。
            </p>
          </div>
        )}

        {!tenant && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            <span>受講可能な教材：{courses.length} 件</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-muted/30 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/50">
              <GraduationCap className="size-8" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-heading text-base font-medium text-foreground/80">
                現在受講できる教材はありません
              </p>
              <p className="text-sm text-muted-foreground">
                新しい教材が配信されると、ここに表示されます。
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="flex h-full flex-col gap-5 py-6 transition-shadow hover:shadow-md"
              >
                <CardHeader className="gap-2 px-6">
                  <Badge variant="info" className="w-fit">
                    ISMS 教育
                  </Badge>
                  <CardTitle className="mt-1 text-xl leading-snug">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-sm">
                    <Clock className="size-4" />
                    約 {course.estimated_minutes} 分 ・ スライド{" "}
                    {course.slides.length} 枚
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 px-6 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {course.description}
                </CardContent>
                <CardFooter className="px-6">
                  <Link href={courseHref(course.id)} className="w-full">
                    <Button size="lg" className="w-full gap-2 text-base">
                      受講を開始する
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
