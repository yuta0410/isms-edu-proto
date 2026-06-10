"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ListChecks,
  CheckCircle2,
  Presentation,
  FileSearch,
  Database,
  FileOutput,
  FolderOpen,
  Send,
  FileText,
  UploadCloud,
  ScanSearch,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DistributionModal } from "@/components/distribution-modal";
import { COURSES } from "@/constants/courses";
import {
  POLICY_PROFILES,
  SAMPLE_POLICIES,
  POLICY_ANALYSIS_STEPS,
  getSlideHighlight,
} from "@/constants/local-rules";
import type { SlideDeck } from "@/lib/types";

// Hybrid input: a curated set of common ISMS topics + a free-text option.
// `keyword` is the concise term fed to the generation pipeline.
const TOPIC_OPTIONS = [
  {
    value: "personal-info",
    label: "個人情報の適切な取り扱い（Pマーク/ISMS準拠）",
    keyword: "個人情報",
  },
  {
    value: "password-mfa",
    label: "パスワード管理と多要素認証",
    keyword: "パスワード管理",
  },
  {
    value: "phishing",
    label: "標的型メール攻撃への対策",
    keyword: "標的型メール攻撃",
  },
  { value: "other", label: "その他（自由入力）", keyword: "" },
] as const;

// Rich loading sequence that mimics the RAG pipeline reading uploaded
// materials, cross-checking IPA data, and emitting the deck.
const BASE_LOADING_STEPS = [
  { icon: FolderOpen, text: "参考資料を解析中..." },
  { icon: FileSearch, text: "アップロード資料をベクトル検索中..." },
  { icon: Database, text: "IPA・JIPDECデータと照合中..." },
  { icon: FileOutput, text: "スライドとテストを出力中..." },
] as const;

// Extra steps prepended when a 社内規定PDF is loaded, so the pipeline visibly
// reads the company's local rules before generating.
const POLICY_LOADING_STEPS = [
  { icon: FileText, text: "社内規定PDFを解析中..." },
  { icon: ScanSearch, text: "ローカルルールを抽出中..." },
] as const;

type LoadingStep = { icon: typeof FolderOpen; text: string };

function buildLoadingSteps(hasPolicy: boolean): LoadingStep[] {
  return hasPolicy
    ? [...POLICY_LOADING_STEPS, ...BASE_LOADING_STEPS]
    : [...BASE_LOADING_STEPS];
}

const STEP_DURATION = 1100; // ms per loading message
const POLICY_STEP_DURATION = 850; // ms per policy-extraction message

export default function GeneratePage() {
  const [topic, setTopic] = useState<string>("personal-info");
  const [customKeyword, setCustomKeyword] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [current, setCurrent] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [added, setAdded] = useState(false);
  const [distOpen, setDistOpen] = useState(false);

  // --- 社内規定PDF（ローカルルール）---
  const [policyId, setPolicyId] = useState<string>(""); // "" = none, "d", "e"
  const [policyAnalyzing, setPolicyAnalyzing] = useState(false);
  const [policyAnalyzed, setPolicyAnalyzed] = useState(false);
  const [policyStep, setPolicyStep] = useState(0);

  const selectedPolicy = policyId ? POLICY_PROFILES[policyId] : null;

  const selectedTopic =
    TOPIC_OPTIONS.find((t) => t.value === topic) ?? TOPIC_OPTIONS[0];
  const isOther = topic === "other";
  // The keyword sent to the pipeline: preset term, or the free-text entry.
  const resolvedKeyword = isOther ? customKeyword.trim() : selectedTopic.keyword;

  const loadingSteps = buildLoadingSteps(Boolean(selectedPolicy));

  // Simulate parsing & extracting local rules from the selected policy PDF.
  function handleSelectPolicy(id: string) {
    setPolicyId(id);
    setPolicyAnalyzed(false);
    if (!id) {
      setPolicyAnalyzing(false);
      return;
    }
    setPolicyAnalyzing(true);
    setPolicyStep(0);
    const timer = setInterval(() => {
      setPolicyStep((s) => Math.min(s + 1, POLICY_ANALYSIS_STEPS.length - 1));
    }, POLICY_STEP_DURATION);
    setTimeout(() => {
      clearInterval(timer);
      setPolicyAnalyzing(false);
      setPolicyAnalyzed(true);
    }, POLICY_ANALYSIS_STEPS.length * POLICY_STEP_DURATION + 250);
  }

  function clearPolicy() {
    setPolicyId("");
    setPolicyAnalyzing(false);
    setPolicyAnalyzed(false);
  }

  async function handleGenerate() {
    if (!resolvedKeyword) return;
    const steps = buildLoadingSteps(Boolean(selectedPolicy));
    setLoading(true);
    setLoadingStep(0);
    setDeck(null);
    setAdded(false);

    // Advance the loading message every STEP_DURATION ms.
    const stepTimer = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, steps.length - 1));
    }, STEP_DURATION);

    try {
      // Run the (mocked) generation alongside a minimum visible duration so the
      // multi-step loading effect always plays through.
      const [data] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: resolvedKeyword,
            instruction: instruction.trim() || undefined,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json() as Promise<SlideDeck>;
        }),
        new Promise((r) => setTimeout(r, steps.length * STEP_DURATION)),
      ]);
      setDeck(data);
      setCurrent(0);
      // Ensure the extracted-rules card is shown after generation, too.
      if (selectedPolicy) setPolicyAnalyzed(true);
    } catch (err) {
      console.error(err);
      alert("スライド生成に失敗しました。コンソールを確認してください。");
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  }

  // --- live editing helpers (mutate deck immutably so preview re-renders) ---
  function updateSlide(
    field: "title" | "narration",
    value: string
  ) {
    if (!deck) return;
    setDeck({
      ...deck,
      slides: deck.slides.map((s, i) =>
        i === current ? { ...s, [field]: value } : s
      ),
    });
  }

  function updateBullet(index: number, value: string) {
    if (!deck) return;
    setDeck({
      ...deck,
      slides: deck.slides.map((s, i) =>
        i === current
          ? { ...s, bullets: s.bullets.map((b, bi) => (bi === index ? value : b)) }
          : s
      ),
    });
  }

  function updateQuiz(
    field: "question",
    value: string
  ) {
    if (!deck) return;
    setDeck({
      ...deck,
      quiz: deck.quiz.map((q, i) => (i === 0 ? { ...q, [field]: value } : q)),
    });
  }

  function updateQuizOption(index: number, value: string) {
    if (!deck) return;
    setDeck({
      ...deck,
      quiz: deck.quiz.map((q, i) =>
        i === 0
          ? { ...q, options: q.options.map((o, oi) => (oi === index ? value : o)) }
          : q
      ),
    });
  }

  function setCorrectAnswer(index: number) {
    if (!deck) return;
    setDeck({
      ...deck,
      quiz: deck.quiz.map((q, i) =>
        i === 0 ? { ...q, answer_index: index } : q
      ),
    });
  }

  async function handlePublish() {
    if (!deck) return;
    setPublishing(true);
    try {
      // Simulate appending the reviewed deck to the existing course catalog.
      // In production: persist to Supabase, then it appears in constants/courses.
      // await supabase.from("courses").insert({
      //   title: deck.keyword,
      //   keyword: deck.keyword,
      //   slides: deck.slides,
      //   quiz: deck.quiz,
      // });
      await new Promise((r) => setTimeout(r, 700));
      setAdded(true);
      // After publishing, immediately open the distribution settings modal so
      // the consultant can deliver the new course to client companies.
      setDistOpen(true);
    } finally {
      setPublishing(false);
    }
  }

  const slide = deck?.slides[current];
  const quiz = deck?.quiz[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Presentation className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              スライド生成・直感編集
            </h1>
            <p className="text-xs text-muted-foreground">
              管理者向け / ISMS教育コンテンツ作成
            </p>
          </div>
        </div>
        <Link href="/admin/materials" className="hidden sm:block">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FolderOpen className="size-3.5" />
            参考資料を確認
          </Button>
        </Link>
      </header>

      {/* Hybrid input: topic selection + free-text supplement */}
      <div className="border-b bg-muted/30 px-6 py-5">
        <div className="flex flex-col gap-4">
          {/* Topic selection (radio-style choices) */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              教育テーマを選択
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map((t) => {
                const active = topic === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTopic(t.value)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-input text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {active && (
                        <span className="size-2 rounded-full bg-primary" />
                      )}
                    </span>
                    {t.label}
                  </button>
                );
              })}
            </div>
            {isOther && (
              <Input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="例：クリアデスク・クリアスクリーン、情報資産の分類 など"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="mt-2"
              />
            )}
          </div>

          {/* 社内規定PDF（ローカルルール）のアップロード／学習 */}
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-input bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                <UploadCloud className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  社内規定PDF（ローカルルール）の学習
                </p>
                <p className="text-xs text-muted-foreground">
                  アップロードした自社規定を、一般論（IPA）より優先してAIが適用します。
                  プロトタイプではサンプル規定を選択できます。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="policy-file">
                サンプル規定ファイル
              </label>
              <select
                id="policy-file"
                value={policyId}
                onChange={(e) => handleSelectPolicy(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-[0.8rem] text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-xs dark:bg-input/30"
              >
                <option value="">サンプル規定ファイルを選択...</option>
                {SAMPLE_POLICIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.file_name}
                  </option>
                ))}
              </select>

              {selectedPolicy && (
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <FileText className="size-4 shrink-0 text-rose-500" />
                  <span className="truncate text-muted-foreground">
                    {selectedPolicy.file_name}
                  </span>
                  {policyAnalyzing ? (
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-amber-600">
                      <Loader2 className="size-3.5 animate-spin" />
                      {POLICY_ANALYSIS_STEPS[policyStep]}
                    </span>
                  ) : policyAnalyzed ? (
                    <Badge variant="success">
                      <CheckCircle2 className="size-3" />
                      抽出完了
                    </Badge>
                  ) : null}
                  <button
                    type="button"
                    onClick={clearPolicy}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="社内規定を解除"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Free-text supplement */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              AIへの追加指示・自社独自ルールの補足（任意）
            </label>
            <Textarea
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例：我が社ではパスワードは15文字以上、JIPDECの最新動画の内容を反映させる、など"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading || !resolvedKeyword}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  スライド生成
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* AIが抽出した独自ルール（優先適用）— 解析完了後にフワッと表示 */}
      {selectedPolicy && policyAnalyzed && !policyAnalyzing && (
        <div className="border-b bg-amber-50/50 px-6 py-4 duration-300 animate-in fade-in slide-in-from-top-2 dark:bg-amber-950/20">
          <div className="rounded-xl border border-amber-300/70 bg-card p-4 dark:border-amber-800/50">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 font-heading text-sm font-semibold">
                🔍 AIが抽出した独自ルール（優先適用）
              </span>
              <Badge variant="warning">
                {selectedPolicy.company} / {selectedPolicy.file_name}
              </Badge>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                💡 一般論（IPA）に優先して適用
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {selectedPolicy.rules.map((r) => (
                <div
                  key={r.label}
                  className="flex items-start gap-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-sm dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <span className="font-medium">{r.label}：</span>
                    <span className="text-muted-foreground">{r.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty / loading state */}
      {!deck && (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-6 text-center text-muted-foreground">
          {loading ? (
            <>
              <div className="relative flex size-16 items-center justify-center">
                <Loader2 className="absolute size-16 animate-spin text-primary/30" />
                {(() => {
                  const StepIcon = loadingSteps[loadingStep].icon;
                  return <StepIcon className="size-7 text-primary" />;
                })()}
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="font-heading text-base font-medium text-foreground">
                  {loadingSteps[loadingStep].text}
                </p>
                {/* Step checklist */}
                <ul className="flex flex-col gap-1.5 text-left text-sm">
                  {loadingSteps.map((step, i) => {
                    const done = i < loadingStep;
                    const active = i === loadingStep;
                    return (
                      <li
                        key={step.text}
                        className={`flex items-center gap-2 transition-colors ${
                          active
                            ? "text-foreground"
                            : done
                              ? "text-emerald-600"
                              : "text-muted-foreground/40"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : active ? (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        ) : (
                          <span className="size-4 rounded-full border border-current" />
                        )}
                        {step.text}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">
                  「{resolvedKeyword}」の教材を、登録済みの参考資料をもとに生成しています…
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl border border-dashed bg-muted/40 text-muted-foreground/50">
                <Presentation className="size-9" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <p className="font-heading text-base font-medium text-foreground/80">
                  ここに生成されたスライドが表示されます
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  上で教育テーマを選び、必要に応じて補足を入力してから
                  <span className="font-medium text-foreground/70">
                    「スライド生成」
                  </span>
                  を押してください。
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Split view */}
      {deck && slide && quiz && (
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* LEFT: learner-facing preview (dark theme) */}
          <section className="flex flex-col gap-4 border-r bg-muted/20 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                受講者プレビュー（本番同様）
              </span>
              <span className="text-xs text-muted-foreground">
                {current + 1} / {deck.slides.length}
              </span>
            </div>

            {/* Slide canvas (dark) */}
            <div className="aspect-video w-full rounded-xl bg-slate-900 p-8 text-slate-100 shadow-lg ring-1 ring-black/20">
              <div className="flex h-full flex-col">
                <div className="mb-1 text-xs font-medium tracking-wider text-sky-400/80 uppercase">
                  {deck.keyword} · ISMS 教育
                </div>
                <h2 className="mb-5 font-heading text-2xl font-bold leading-tight">
                  {slide.title || "（タイトル未入力）"}
                </h2>
                <ul className="flex flex-col gap-3">
                  {slide.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.95rem]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-400" />
                      <span className="text-slate-200">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* 一般論(IPA) × 自社規定 のハイブリッド適用ハイライト */}
                {(() => {
                  const slideText = `${slide.title} ${slide.bullets.join(
                    " "
                  )} ${slide.narration}`;
                  const hl = getSlideHighlight(slideText, selectedPolicy);
                  if (!hl) return null;
                  return hl.applied ? (
                    <div className="mt-4 rounded-lg border border-amber-400/50 bg-amber-400/10 p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        💡 自社規定を適用済み
                      </span>
                      <p className="mt-1.5 text-sm font-semibold leading-snug text-amber-100">
                        {hl.text}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                      <p className="text-sm leading-snug text-slate-300">
                        {hl.text}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Narration */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4 text-slate-200">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-sky-400">
                <span>🎙 講師ナレーション</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {slide.narration || "（ナレーション未入力）"}
              </p>
            </div>

            {/* Slide nav */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={current === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                前へ
              </Button>
              <div className="flex gap-1.5">
                {deck.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`size-2 rounded-full transition-colors ${
                      i === current ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    aria-label={`スライド ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={current === deck.slides.length - 1}
                onClick={() =>
                  setCurrent((c) => Math.min(deck.slides.length - 1, c + 1))
                }
                className="gap-1"
              >
                次へ
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </section>

          {/* RIGHT: editor */}
          <section className="p-6">
            <Tabs defaultValue="slide">
              <TabsList>
                <TabsTrigger value="slide" className="gap-1.5">
                  <Pencil className="size-3.5" />
                  スライド編集
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-1.5">
                  <ListChecks className="size-3.5" />
                  確認テスト
                </TabsTrigger>
              </TabsList>

              {/* Slide editor */}
              <TabsContent value="slide" className="mt-4 flex flex-col gap-5">
                <p className="text-xs text-muted-foreground">
                  現在表示中のスライド（{current + 1}枚目）を編集します。
                  入力すると左のプレビューに即時反映されます。
                </p>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    タイトル
                  </label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    箇条書き
                  </label>
                  <div className="flex flex-col gap-2">
                    {slide.bullets.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {i + 1}.
                        </span>
                        <Input
                          value={b}
                          onChange={(e) => updateBullet(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    講師ナレーション
                  </label>
                  <Textarea
                    rows={5}
                    value={slide.narration}
                    onChange={(e) => updateSlide("narration", e.target.value)}
                  />
                </div>
              </TabsContent>

              {/* Quiz editor */}
              <TabsContent value="quiz" className="mt-4 flex flex-col gap-5">
                <p className="text-xs text-muted-foreground">
                  受講後に出題される4択問題を確認・編集します。
                  正解の選択肢をクリックで切り替えできます。
                </p>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    設問
                  </label>
                  <Textarea
                    rows={3}
                    value={quiz.question}
                    onChange={(e) => updateQuiz("question", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    選択肢（正解にチェック）
                  </label>
                  <div className="flex flex-col gap-2">
                    {quiz.options.map((o, i) => {
                      const isCorrect = quiz.answer_index === i;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectAnswer(i)}
                            className={`flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              isCorrect
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-input text-transparent hover:border-emerald-400"
                            }`}
                            aria-label={`選択肢${i + 1}を正解にする`}
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                          <Input
                            value={o}
                            onChange={(e) => updateQuizOption(i, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    現在の正解：選択肢 {quiz.answer_index + 1}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Publish / add to catalog */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t pt-5">
              <div className="text-xs text-muted-foreground">
                {added ? (
                  <>
                    <Badge variant="success">
                      <CheckCircle2 className="size-3" />
                      教材リストに追加済み
                    </Badge>
                    <span className="ml-2">
                      受講画面の教材一覧に表示されます。
                    </span>
                  </>
                ) : (
                  <>
                    <Badge variant="muted">下書き</Badge>
                    <span className="ml-2">
                      現在の公開教材：{COURSES.length} 件。確認後に追加してください。
                    </span>
                  </>
                )}
              </div>
              {added ? (
                <div className="flex items-center gap-2">
                  <Link href="/pages/course">
                    <Button variant="outline" className="gap-2">
                      受講画面で確認する
                    </Button>
                  </Link>
                  <Button onClick={() => setDistOpen(true)} className="gap-2">
                    <Send className="size-4" />
                    配信設定
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
                >
                  {publishing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  確認OK：既存の教材リストに追加する
                </Button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Distribution settings modal (opens automatically after publishing) */}
      <DistributionModal
        open={distOpen}
        onOpenChange={setDistOpen}
        courseTitle={deck?.keyword ?? ""}
      />
    </div>
  );
}
