"use client";

import Link from "next/link";
import { Printer, ChevronLeft, ShieldCheck, Stamp } from "lucide-react";

import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Sample evidence data. In production these rows come from Supabase
// (enrollments joined with employees), scoped to the selected company/course.
// ---------------------------------------------------------------------------
const REPORT = {
  company: "A株式会社",
  theme: "個人情報の適切な取り扱い",
  period: "2026年5月25日 〜 2026年6月5日",
  material: "「個人情報の適切な取り扱い」スライド教材（E&Nコンサルティング監修）",
  supervisor: "E&Nコンサルティング株式会社",
};

interface Learner {
  name: string;
  department: string;
  completed_at: string;
  score: number;
}

const LEARNERS: Learner[] = [
  { name: "佐藤 健一", department: "情報システム部", completed_at: "2026-05-28 14:32", score: 100 },
  { name: "鈴木 美咲", department: "営業部", completed_at: "2026-05-29 10:15", score: 90 },
  { name: "田中 由美", department: "総務部", completed_at: "2026-06-01 09:15", score: 100 },
  { name: "中村 彩", department: "経理部", completed_at: "2026-06-02 11:40", score: 80 },
  { name: "高橋 大輔", department: "開発部", completed_at: "2026-06-03 16:20", score: 95 },
];

function formatJpDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function EvidencePage() {
  const total = LEARNERS.length;
  const completed = LEARNERS.length; // all listed learners are completed
  const avgScore = Math.round(
    LEARNERS.reduce((a, l) => a + l.score, 0) / LEARNERS.length
  );

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Control bar — never printed */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card px-6 py-3 print:hidden">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="size-4" />
            ダッシュボードへ戻る
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            A4縦・1ページに最適化されています
          </span>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="size-4" />
            このページをPDFとして保存 / 印刷
          </Button>
        </div>
      </div>

      {/* A4 sheet */}
      <div className="mx-auto my-8 w-full max-w-[210mm] bg-white p-[16mm] text-[13px] leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200 print:my-0 print:p-[14mm] print:shadow-none print:ring-0">
        {/* Document header */}
        <header className="border-b-2 border-slate-800 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="size-5" />
              <span className="text-xs font-medium tracking-wide">
                ISMS 教育資料管理ツール
              </span>
            </div>
            <div className="text-right text-xs text-slate-600">
              文書番号：EDU-CERT-2026-001
              <br />
              <span suppressHydrationWarning>
                報告日：{formatJpDate(new Date())}
              </span>
            </div>
          </div>
          <h1 className="mt-4 text-center font-heading text-xl font-bold tracking-wide text-slate-900">
            情報セキュリティ教育 受講完了証明書
          </h1>
          <p className="mt-1 text-center text-sm font-medium text-slate-600">
            （兼 実施報告書）
          </p>
        </header>

        {/* Official meta block */}
        <section className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
          <MetaRow label="対象企業" value={REPORT.company} />
          <MetaRow label="実施責任者" value={`${REPORT.supervisor} 監修`} />
          <MetaRow
            label="対象規格"
            value="ISO/IEC 27001:2022 / JIS Q 15001:2017 準拠"
          />
          <MetaRow label="実施期間" value={REPORT.period} />
        </section>

        {/* Education overview */}
        <section className="mt-6">
          <SectionTitle>1. 教育概要</SectionTitle>
          <table className="w-full border-collapse text-[12.5px]">
            <tbody>
              <OverviewRow label="教育テーマ" value={REPORT.theme} />
              <OverviewRow label="実施期間" value={REPORT.period} />
              <OverviewRow label="使用教材名" value={REPORT.material} />
            </tbody>
          </table>
        </section>

        {/* Overall summary */}
        <section className="mt-6">
          <SectionTitle>2. 全体サマリー</SectionTitle>
          <div className="flex items-stretch gap-4">
            <div className="grid flex-1 grid-cols-3 gap-3">
              <SummaryStat label="対象者数" value={`${total} 名`} />
              <SummaryStat label="受講完了者数" value={`${completed} 名`} />
              <SummaryStat label="平均テスト点数" value={`${avgScore} 点`} />
            </div>
            {/* 修了判定 stamp */}
            <div className="flex w-36 flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
              <span className="text-[11px] text-slate-500">修了判定</span>
              <div className="relative mt-1 flex size-20 items-center justify-center">
                <span className="flex size-20 rotate-[-12deg] flex-col items-center justify-center rounded-full border-[3px] border-rose-600 text-rose-600">
                  <Stamp className="size-4" />
                  <span className="font-heading text-xl font-bold leading-none">
                    適合
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Learner detail table */}
        <section className="mt-6">
          <SectionTitle>3. 受講者明細</SectionTitle>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-700">
                <th className="border border-slate-300 px-2 py-1.5 font-medium">
                  No.
                </th>
                <th className="border border-slate-300 px-2 py-1.5 font-medium">
                  社員名
                </th>
                <th className="border border-slate-300 px-2 py-1.5 font-medium">
                  所属部署
                </th>
                <th className="border border-slate-300 px-2 py-1.5 font-medium">
                  受講完了日時
                </th>
                <th className="border border-slate-300 px-2 py-1.5 text-right font-medium">
                  最終得点
                </th>
                <th className="border border-slate-300 px-2 py-1.5 text-center font-medium">
                  判定
                </th>
              </tr>
            </thead>
            <tbody>
              {LEARNERS.map((l, i) => (
                <tr key={l.name}>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500">
                    {i + 1}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 font-medium">
                    {l.name}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {l.department}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {l.completed_at}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums">
                    {l.score} 点
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-medium text-emerald-700">
                    合格
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-500">
            ※ 本教育では理解度テスト全問正解（100点満点中の合格基準を充足）をもって
            「合格」と判定しています。
          </p>
        </section>

        {/* Signature footer */}
        <section className="mt-10 flex items-end justify-between gap-6">
          <p className="text-[11px] text-slate-500">
            上記のとおり、情報セキュリティ教育を実施し、対象者全員の受講完了を確認したことを証明します。
          </p>
          <div className="flex shrink-0 gap-4">
            <SignatureBox label="実施責任者印" />
            <SignatureBox label="企業管理者印" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 font-medium text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-l-4 border-slate-800 pl-2 font-heading text-sm font-bold text-slate-900">
      {children}
    </h2>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-32 border border-slate-300 bg-slate-50 px-2 py-1.5 text-left font-medium text-slate-600">
        {label}
      </th>
      <td className="border border-slate-300 px-2 py-1.5 text-slate-800">
        {value}
      </td>
    </tr>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-center">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="mt-1 font-heading text-lg font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function SignatureBox({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex size-16 items-center justify-center rounded border border-dashed border-slate-400 text-[10px] text-slate-400">
        印
      </div>
      <span className="mt-1 text-[10px] text-slate-500">{label}</span>
    </div>
  );
}
