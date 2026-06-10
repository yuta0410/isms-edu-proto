import Link from "next/link";
import {
  Presentation,
  LayoutDashboard,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Send,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const LINKS = [
  {
    href: "/admin/generate",
    icon: Presentation,
    title: "スライド生成・直感編集",
    desc: "テーマ選択と補足指示から、参考資料を踏まえたスライドと確認テストを自動生成し、リアルタイム編集・公開します。",
    role: "管理者",
  },
  {
    href: "/admin/materials",
    icon: FolderOpen,
    title: "参考資料管理（AI学習用）",
    desc: "PマークやJIPDECなどの受領資料をAI学習用に登録・管理します。スライド生成時の参照元（RAG）になります。",
    role: "管理者 / コンサル",
  },
  {
    href: "/admin/distribution",
    icon: Send,
    title: "配信・進捗管理",
    desc: "教材を企業・グループ別に配信し、マジックリンクを発行。企業ごとの受講完了率の確認とリマインド送信を行います。",
    role: "管理者 / コンサル",
  },
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    title: "受講進捗ダッシュボード",
    desc: "顧客企業ごとの社員の受講ステータス・完了日時・テスト正解率を一覧で確認します。",
    role: "コンサル / 企業管理者",
  },
  {
    href: "/pages/course",
    icon: GraduationCap,
    title: "教材選択＆受講",
    desc: "社員が教材を選び、スライドを読み進め、全問正解するまで挑戦する確認テストを受験します。",
    role: "一般社員",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background px-6 py-16">
      <div className="w-full max-w-5xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            ISMS 教育資料管理ツール
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            ISO/IEC 27001 に対応した教育コンテンツを、生成 AI と RAG で作成・配信・進捗管理するためのプロトタイプ（MVP）です。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} className="group">
                <Card className="h-full transition-shadow hover:ring-primary/30 hover:ring-2">
                  <CardHeader>
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-5" />
                    </div>
                    <CardDescription className="text-xs">
                      {l.role}
                    </CardDescription>
                    <CardTitle className="flex items-center gap-1">
                      {l.title}
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {l.desc}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
