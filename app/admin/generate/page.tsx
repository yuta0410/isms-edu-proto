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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { COURSES } from "@/constants/courses";
import type { SlideDeck } from "@/lib/types";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("個人情報");
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [current, setCurrent] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleGenerate() {
    if (!keyword.trim()) return;
    setLoading(true);
    setDeck(null);
    setAdded(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: SlideDeck = await res.json();
      setDeck(data);
      setCurrent(0);
    } catch (err) {
      console.error(err);
      alert("スライド生成に失敗しました。コンソールを確認してください。");
    } finally {
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
      alert(
        `✅ 教材「${deck.keyword}」を教材リストに追加しました。\n` +
          `現在の公開教材数：${COURSES.length + 1} 件（受講画面に表示されます）`
      );
    } finally {
      setPublishing(false);
    }
  }

  const slide = deck?.slides[current];
  const quiz = deck?.quiz[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
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
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              進捗ダッシュボード
            </Button>
          </Link>
          <Link href="/pages/course">
            <Button variant="ghost" size="sm">
              受講画面プレビュー
            </Button>
          </Link>
        </nav>
      </header>

      {/* Keyword input */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              キーワード
            </label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例：個人情報、パスワード管理、標的型攻撃"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="gap-2">
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

      {/* Empty / loading state */}
      {!deck && (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p>RAGで関連知識を検索し、スライドを生成しています...</p>
            </>
          ) : (
            <>
              <Sparkles className="size-8 opacity-40" />
              <p>キーワードを入力して「スライド生成」を押してください。</p>
            </>
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
                <ul className="flex flex-1 flex-col gap-3">
                  {slide.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.95rem]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-400" />
                      <span className="text-slate-200">{b}</span>
                    </li>
                  ))}
                </ul>
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
                <Link href="/pages/course">
                  <Button variant="outline" className="gap-2">
                    受講画面で確認する
                  </Button>
                </Link>
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
    </div>
  );
}
