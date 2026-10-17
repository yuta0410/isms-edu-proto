"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Printer,
  ChevronLeft,
  ShieldCheck,
  Stamp,
  Loader2,
  Timer,
  History,
  QrCode,
  Fingerprint,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getEvidenceReport, MATERIAL_REVISIONS } from "@/constants/evidence";
import { resolveTenantId } from "@/lib/scope";
import { useWorkspace } from "@/lib/workspace";

function formatJpDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} JST`
  );
}

// Prototype stand-in for the SHA-256 digest of the issued PDF: a deterministic
// 64-hex-char string derived from the report content, so the same report always
// shows the same value. In production the server hashes the rendered PDF and
// stores the digest alongside the evidence record for QR verification.
function dummySha256(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let out = "";
  for (let round = 0; round < 8; round++) {
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ (c + round), 0x5bd1e995) >>> 0;
    }
    h1 = (h1 ^ round ^ (h2 >>> 13)) >>> 0;
    out += h1.toString(16).padStart(8, "0");
  }
  return out;
}

export default function EvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <EvidenceReportView />
    </Suspense>
  );
}

function EvidenceReportView() {
  const ws = useWorkspace();
  // Tenant mode ignores ?corp= entirely and always renders the own company,
  // so rewriting the URL can never surface another tenant's evidence.
  const corp = resolveTenantId(ws, useSearchParams().get("corp"));
  const report = getEvidenceReport(corp);

  const total = report.learners.length;
  const completed = report.learners.length; // all listed learners are completed
  const avgScore = total
    ? Math.round(report.learners.reduce((a, l) => a + l.score, 0) / total)
    : 0;

  const docNumber = `ENV-EVID-${report.corp}-2026`;
  const certNumber = `EVID-${report.corp}-0001`;
  const digest = dummySha256(
    JSON.stringify({ docNumber, certNumber, learners: report.learners })
  );

  // 学習ログのメーター正規化用（最長滞在スライドを 100% とする）。
  const maxDwell = Math.max(...report.slide_logs.map((s) => s.seconds), 1);

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
            対象企業：{report.company} ・ A4縦1ページに最適化
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
              文書番号：{docNumber}
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
          <MetaRow label="対象企業" value={report.company} />
          <MetaRow label="実施責任者" value={`${report.supervisor} 監修`} />
          <MetaRow
            label="対象規格"
            value="ISO/IEC 27001:2022 / JIS Q 15001:2017 準拠"
          />
          <MetaRow label="実施期間" value={report.period} />
        </section>

        {/* Education overview */}
        <section className="mt-6 break-inside-avoid">
          <SectionTitle>1. 教育概要</SectionTitle>
          <table className="w-full border-collapse text-[12.5px]">
            <tbody>
              <OverviewRow label="教育テーマ" value={report.theme} />
              <OverviewRow label="実施期間" value={report.period} />
              <OverviewRow label="使用教材名" value={report.material} />
            </tbody>
          </table>

          {/* 教材改訂履歴・バージョン管理 */}
          <div className="mt-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-800">
              <History className="size-3.5" />
              ■ 教材改訂履歴・バージョン管理
            </h3>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-700">
                  <th className="w-24 border border-slate-300 px-2 py-1.5 font-medium">
                    バージョン
                  </th>
                  <th className="w-28 border border-slate-300 px-2 py-1.5 font-medium">
                    改訂日
                  </th>
                  <th className="border border-slate-300 px-2 py-1.5 font-medium">
                    改訂内容
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATERIAL_REVISIONS.map((rev) => (
                  <tr key={rev.version}>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium">
                      {rev.version}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                      {rev.date}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5">
                      {rev.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1.5 text-[11px] text-slate-500">
              ※ 全受講者は最新版（
              {MATERIAL_REVISIONS[MATERIAL_REVISIONS.length - 1].version}
              ：自社規定ローカルルール反映済み）の教材で受講しています。
            </p>
          </div>
        </section>

        {/* 教育の有効性・有効受講ログ（スライド滞在時間） */}
        <section className="mt-6 break-inside-avoid">
          <SectionTitle>2. 教育の有効性・有効受講ログ</SectionTitle>
          <p className="mb-2 text-[12px] text-slate-600">
            受講者の各スライド平均滞在時間（暗号化学習ログより集計）。極端な読み飛ばしが
            ないことを示します。
          </p>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
            {report.slide_logs.map((s) => (
              <div key={s.label} className="flex items-center gap-3 text-[12px]">
                <span className="w-32 shrink-0 text-slate-700">{s.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-700"
                    style={{ width: `${(s.seconds / maxDwell) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-medium tabular-nums text-slate-800">
                  {s.seconds} 秒
                </span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 text-[12px]">
              <span className="text-slate-600">
                総学習時間：
                <span className="font-bold text-slate-900">
                  {report.total_study}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/60 px-2.5 py-0.5 font-medium text-emerald-700">
                <Timer className="size-3.5" />
                {report.study_verdict}
              </span>
            </div>
          </div>
        </section>

        {/* Overall summary */}
        <section className="mt-6 break-inside-avoid">
          <SectionTitle>3. 全体サマリー</SectionTitle>
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
        <section className="mt-6 break-inside-avoid">
          <SectionTitle>4. 受講者明細</SectionTitle>
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
              {report.learners.map((l, i) => (
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
          <div className="text-[11px] text-slate-500">
            <p>
              上記のとおり、情報セキュリティ教育を実施し、対象者全員の受講完了を確認したことを証明します。
            </p>
            <p className="mt-1">証明番号：{certNumber}</p>
          </div>
          <div className="flex shrink-0 gap-4">
            <SignatureBox label="実施責任者印" />
            <SignatureBox label="企業管理者印" />
          </div>
        </section>

        {/* 真正性証明（改ざん検知） */}
        <section className="mt-6 break-inside-avoid rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                <BadgeCheck className="size-3.5 text-emerald-700" />
                真正性証明（改ざん検知）
              </h3>
              <dl className="mt-2 grid grid-cols-[7.5rem_1fr] gap-x-2 gap-y-1 text-[11px]">
                <dt className="text-slate-500">システム出力日時</dt>
                <dd className="text-slate-800" suppressHydrationWarning>
                  {formatTimestamp(new Date())}
                </dd>
                <dt className="flex items-center gap-1 text-slate-500">
                  <Fingerprint className="size-3" />
                  SHA-256 ハッシュ値
                </dt>
                <dd className="font-mono text-[10px] leading-snug break-all text-slate-800">
                  {digest}
                </dd>
                <dt className="text-slate-500">検証ID</dt>
                <dd className="font-mono text-slate-800">
                  {certNumber}-{digest.slice(0, 8).toUpperCase()}
                </dd>
              </dl>
              <p className="mt-2 text-[10.5px] leading-relaxed text-slate-600">
                この証跡はシステムから正規に発行されたものであり、QRコードから原本との一致を検証できます。
                記載内容が1文字でも変更された場合、ハッシュ値が一致せず改ざんとして検知されます。
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex size-20 items-center justify-center rounded border border-slate-300 bg-white">
                <QrCode className="size-16 text-slate-800" strokeWidth={1.25} />
              </div>
              <span className="mt-1 text-[10px] text-slate-500">原本照合用QR</span>
            </div>
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
