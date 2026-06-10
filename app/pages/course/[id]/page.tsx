"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ListChecks,
  RotateCcw,
  PartyPopper,
  Send,
  AlertTriangle,
  Award,
  Printer,
  X,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCourse } from "@/constants/courses";
import { getTenant } from "@/constants/distribution";
import type { Course } from "@/lib/types";

function formatJpDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

type Phase = "slides" | "quiz" | "done";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const course = getCourse(id);

  const [phase, setPhase] = useState<Phase>("slides");
  const [current, setCurrent] = useState(0);
  const [maxReached, setMaxReached] = useState(0); // furthest slide viewed

  // --- not found ---
  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-200">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold">教材が見つかりません</h1>
        <p className="max-w-md text-slate-400">
          指定された教材ID「{id}」は存在しないか、公開が終了しています。
          教材一覧から選び直してください。
        </p>
        <Link href="/pages/course">
          <Button className="mt-2 gap-2">
            <ChevronLeft className="size-4" />
            教材一覧へ戻る
          </Button>
        </Link>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <QuizView
        course={course}
        onPass={() => setPhase("done")}
        onBack={() => setPhase("slides")}
      />
    );
  }

  if (phase === "done") {
    return <CompletionView course={course} />;
  }

  // --- slides phase ---
  const slide = course.slides[current];
  const isLast = current === course.slides.length - 1;
  const reachedEnd = maxReached >= course.slides.length - 1;

  function go(next: number) {
    const clamped = Math.max(0, Math.min(course!.slides.length - 1, next));
    setCurrent(clamped);
    setMaxReached((m) => Math.max(m, clamped));
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* progress bar */}
      <div className="h-1 w-full bg-slate-800">
        <div
          className="h-full bg-sky-400 transition-all"
          style={{
            width: `${((current + 1) / course.slides.length) * 100}%`,
          }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
          <Link href="/pages/course" className="hover:text-slate-200">
            ← 教材一覧
          </Link>
          <span>
            {course.title} ・ スライド {current + 1} / {course.slides.length}
          </span>
        </div>

        {/* slide */}
        <div className="flex flex-1 flex-col rounded-2xl bg-slate-900 p-8 ring-1 ring-white/10">
          <h2 className="mb-6 font-heading text-3xl font-bold leading-tight">
            {slide.title}
          </h2>
          <ul className="flex flex-col gap-4">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-lg">
                <span className="mt-2.5 size-2 shrink-0 rounded-full bg-sky-400" />
                <span className="text-slate-200">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="mb-1.5 text-xs font-medium text-sky-400">
                🎙 講師ナレーション
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {slide.narration}
              </p>
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => go(current - 1)}
            className="gap-1 border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
          >
            <ChevronLeft className="size-4" />
            前へ
          </Button>

          {!isLast ? (
            <Button onClick={() => go(current + 1)} className="gap-1">
              次へ
              <ChevronRight className="size-4" />
            </Button>
          ) : reachedEnd ? (
            <Button
              onClick={() => setPhase("quiz")}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
            >
              <ListChecks className="size-4" />
              確認テストに進む
            </Button>
          ) : (
            <span className="text-xs text-slate-500">
              最後まで読み進めてください
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz view: every question must be answered correctly (100%) to pass.
// ---------------------------------------------------------------------------
function QuizView({
  course,
  onPass,
  onBack,
}: {
  course: Course;
  onPass: () => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => course.quiz.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = useMemo(
    () =>
      course.quiz.reduce(
        (acc, q, i) => acc + (answers[i] === q.answer_index ? 1 : 0),
        0
      ),
    [answers, course.quiz]
  );
  const passed = submitted && correctCount === course.quiz.length;
  const failed = submitted && correctCount < course.quiz.length;

  function select(qIndex: number, oIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? oIndex : a)));
  }

  function retry() {
    setAnswers(course.quiz.map(() => null));
    setSubmitted(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <ListChecks className="size-5 text-sky-400" />
          <h1 className="font-heading text-xl font-bold">確認テスト</h1>
          <span className="ml-auto text-xs text-slate-400">全問正解で合格</span>
        </div>

        <div className="flex flex-col gap-8">
          {course.quiz.map((q, qi) => (
            <div key={qi}>
              <p className="mb-4 text-lg font-medium leading-relaxed">
                Q{qi + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2.5">
                {q.options.map((o, oi) => {
                  const selected = answers[qi] === oi;
                  const isAnswer = q.answer_index === oi;
                  let cls =
                    "border-slate-700 bg-slate-900 hover:border-sky-500/60";
                  if (submitted && isAnswer)
                    cls = "border-emerald-500 bg-emerald-500/10";
                  else if (submitted && selected && !isAnswer)
                    cls = "border-rose-500 bg-rose-500/10";
                  else if (selected) cls = "border-sky-500 bg-sky-500/10";

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => select(qi, oi)}
                      disabled={submitted}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${cls}`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                          selected
                            ? "border-sky-400 bg-sky-400 text-slate-900"
                            : "border-slate-600 text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-slate-200">{o}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <p className="mt-2 text-xs text-slate-400">💡 {q.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {/* result banner */}
        {failed && (
          <div className="mt-8 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-center">
            <p className="font-medium text-rose-300">
              不合格：正答率{" "}
              {Math.round((correctCount / course.quiz.length) * 100)}%
            </p>
            <p className="mt-1 text-sm text-slate-400">
              全問正解が必要です。もう一度挑戦してください。
            </p>
          </div>
        )}

        {/* actions */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <ChevronLeft className="size-4" />
            スライドに戻る
          </Button>

          {!submitted ? (
            <Button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="gap-2"
            >
              <Send className="size-4" />
              回答を送信
            </Button>
          ) : passed ? (
            <Button
              onClick={onPass}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
            >
              受講完了へ
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={retry}
              className="gap-2 bg-rose-600 text-white hover:bg-rose-600/90"
            >
              <RotateCcw className="size-4" />
              不合格：もう一度挑戦する
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Completion screen
// ---------------------------------------------------------------------------
function CompletionView({ course }: { course: Course }) {
  const params = useSearchParams();
  const tenant = getTenant(params.get("corp"));
  const [showCert, setShowCert] = useState(false);

  return (
    <>
      <div
        className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-slate-950 px-6 text-center text-slate-100 ${
          showCert ? "print:hidden" : ""
        }`}
      >
        <div className="flex size-24 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30">
          <PartyPopper className="size-12 text-emerald-400" />
        </div>
        <h1 className="mt-8 font-heading text-4xl font-bold">受講完了！</h1>
        <p className="mt-3 max-w-md text-lg text-slate-300">
          「{course.title}」の教育コースを全問正解で修了しました。
          お疲れさまでした。
        </p>
        <p className="mt-2 text-sm text-emerald-400">テスト正解率：100%</p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={() => setShowCert(true)}
            className="gap-2 bg-amber-400 text-amber-950 hover:bg-amber-300"
          >
            <Award className="size-4" />
            受講修了証を表示
          </Button>
          <Link href="/pages/course">
            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
            >
              他の教材を受講する
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              ホームへ戻る
            </Button>
          </Link>
        </div>
      </div>

      {showCert && (
        <CertificateModal
          course={course}
          companyName={tenant?.name}
          onClose={() => setShowCert(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Personal completion certificate (表彰状風). Rendered as a full-screen overlay
// so that, on print, the background completion view is hidden (print:hidden)
// and only this certificate sheet remains.
// ---------------------------------------------------------------------------
function CertificateModal({
  course,
  companyName,
  onClose,
}: {
  course: Course;
  companyName?: string;
  onClose: () => void;
}) {
  // Sample recipient — in production this is the authenticated learner.
  const recipient = "山田 太郎";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 print:static print:overflow-visible print:bg-white">
      {/* Toolbar — never printed */}
      <div className="flex items-center justify-end gap-2 p-4 print:hidden">
        <Button
          onClick={() => window.print()}
          className="gap-2 bg-amber-400 text-amber-950 hover:bg-amber-300"
        >
          <Printer className="size-4" />
          PDF保存 / 印刷
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          className="gap-1.5 text-slate-200 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
          閉じる
        </Button>
      </div>

      {/* Certificate sheet */}
      <div className="flex justify-center px-4 pb-12 print:p-0">
        <div className="relative w-full max-w-2xl bg-white p-3 shadow-2xl print:max-w-none print:shadow-none">
          <div className="rounded-sm border-[6px] border-double border-amber-600/70 px-8 py-10 text-center text-slate-800 sm:px-12 sm:py-14">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <ShieldCheck className="size-5" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase">
                Certificate of Completion
              </span>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-[0.15em] text-slate-900">
              受講修了証
            </h1>
            <div className="mx-auto mt-3 h-0.5 w-20 bg-amber-600/70" />

            {/* Recipient */}
            <p className="mt-8 text-sm text-slate-500">
              {companyName ?? ""}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-slate-900">
              {recipient}　殿
            </p>

            {/* Statement */}
            <p className="mx-auto mt-6 max-w-md text-sm leading-loose text-slate-700">
              あなたは、当社の情報セキュリティ教育課程
              <br />
              「<span className="font-medium text-slate-900">{course.title}</span>」
              を受講し、
              <br />
              所定の理解度テストに全問合格して、これを修了されました。
              <br />
              ここにその努力を称え、本証を授与します。
            </p>

            {/* Score */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Award className="size-4" />
              理解度テスト正解率：100%
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-end justify-between">
              <div className="text-left text-xs text-slate-500">
                <p suppressHydrationWarning>
                  発行日：{formatJpDate(new Date())}
                </p>
                <p className="mt-1">証明番号：CERT-{course.id}-0001</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex size-16 rotate-[-8deg] items-center justify-center rounded-full border-2 border-amber-600/70 text-amber-700">
                  <Award className="size-7" />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700">
                  ISMS教育事務局
                </p>
                <p className="text-[10px] text-slate-500">
                  E&Nコンサルティング監修
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
