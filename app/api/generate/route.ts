import type { NextRequest } from "next/server";
import type { SlideDeck } from "@/lib/types";

// import { supabase } from "@/lib/supabase";

/**
 * POST /api/generate
 *
 * Body: { keyword: string }
 * Returns: SlideDeck (3 slides + 1 four-choice quiz question)
 *
 * In production this endpoint performs a RAG pipeline:
 *   1. Embed the incoming keyword (OpenAI text-embedding-3-small).
 *   2. Pull similar IPA knowledge chunks from Supabase pgvector via the
 *      `match_ipa_knowledge` RPC.
 *   3. Feed those chunks to an LLM with Structured Outputs / JSON Mode to
 *      produce a strictly-typed SlideDeck.
 *
 * For this prototype steps 1-3 are mocked so the UI works end-to-end without
 * external credentials. The real-pipeline structure is sketched below.
 */
export async function POST(request: NextRequest) {
  let keyword = "";
  let instruction = "";

  try {
    const body = await request.json();
    keyword = (body?.keyword ?? "").toString().trim();
    // Optional free-text supplement (company-specific rules / extra guidance).
    // In production this is appended to the LLM prompt alongside the RAG context.
    instruction = (body?.instruction ?? "").toString().trim();
  } catch {
    return Response.json(
      { error: "Invalid JSON body. Expected { keyword: string }." },
      { status: 400 }
    );
  }

  if (!keyword) {
    return Response.json(
      { error: "`keyword` is required." },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------------
  // 1) Embed the keyword (real implementation)
  // ---------------------------------------------------------------------------
  // const embeddingRes = await openai.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: keyword,
  // });
  // const queryEmbedding = embeddingRes.data[0].embedding;

  // ---------------------------------------------------------------------------
  // 2) Vector search over IPA knowledge base in Supabase (real implementation)
  // ---------------------------------------------------------------------------
  // const { data: matches, error } = await supabase.rpc("match_ipa_knowledge", {
  //   query_embedding: queryEmbedding,
  //   match_threshold: 0.78,
  //   match_count: 5,
  // });
  // if (error) {
  //   return Response.json({ error: error.message }, { status: 500 });
  // }
  // const context = (matches ?? []).map((m) => m.content).join("\n\n");

  // ---------------------------------------------------------------------------
  // 3) Generate slides + quiz with Structured Outputs / JSON Mode
  //    (real implementation)
  // ---------------------------------------------------------------------------
  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4o-2024-08-06",
  //   response_format: { type: "json_schema", json_schema: SLIDE_DECK_SCHEMA },
  //   messages: [
  //     { role: "system", content: "You are an ISO27001 (ISMS) e-learning author." },
  //     { role: "user", content: `Keyword: ${keyword}\n\nContext:\n${context}` },
  //   ],
  // });
  // const deck: SlideDeck = JSON.parse(completion.choices[0].message.content);

  // ---------------------------------------------------------------------------
  // Prototype: deterministic mock that mimics the structured JSON output.
  // ---------------------------------------------------------------------------
  const deck = buildMockDeck(keyword, instruction);

  // Small artificial latency so the loading state is visible in the UI.
  await new Promise((resolve) => setTimeout(resolve, 800));

  return Response.json(deck);
}

function buildMockDeck(keyword: string, instruction = ""): SlideDeck {
  // Reflect the consultant's free-text supplement back into the deck so the
  // prototype visibly "uses" the extra instruction.
  const ruleSlide: SlideDeck["slides"] = instruction
    ? [
        {
          title: `自社ルール・追加方針（${keyword}）`,
          bullets: [
            "本スライドは管理者の追加指示を反映して生成されています",
            instruction,
            "上記ルールは全社員が遵守すべき自社独自の基準です",
          ],
          narration: `この内容は、貴社の管理者から指定された追加指示「${instruction}」を反映したものです。一般的なガイドラインに加え、自社固有のルールとして必ず守るようにしてください。`,
        },
      ]
    : [];

  return {
    keyword,
    slides: [
      ...ruleSlide,
      {
        title: `${keyword}とは何か`,
        bullets: [
          `${keyword}の定義と、ISMS（ISO/IEC 27001）における位置づけ`,
          `なぜ${keyword}を保護する必要があるのか（事業リスクの観点）`,
          `関連する法令・ガイドライン（個人情報保護法、IPAの手引き等）`,
        ],
        narration: `このスライドでは「${keyword}」の基本を確認します。${keyword}は組織の情報資産の一つであり、漏えいや改ざんが起きると顧客の信頼や事業継続に直接影響します。まずは全員が共通の定義を持つことが、適切な管理の第一歩です。`,
      },
      {
        title: `${keyword}に関する主なリスク`,
        bullets: [
          "外部からの攻撃（不正アクセス・フィッシング・マルウェア）",
          "内部要因（誤送信・置き忘れ・権限管理の不備）",
          "委託先・サプライチェーン経由での情報流出",
        ],
        narration: `${keyword}を脅かすリスクは外部攻撃だけではありません。実際のインシデントの多くは、メールの誤送信や端末の紛失といった内部のヒューマンエラーに起因します。技術的対策と運用ルールの両面で備えることが重要です。`,
      },
      {
        title: `${keyword}を守るための実務ルール`,
        bullets: [
          "アクセスは「必要最小限の原則」に基づき付与する",
          "持ち出し・共有時は暗号化と承認フローを徹底する",
          "インシデント発生時はただちに責任者へ報告（隠さない）",
        ],
        narration: `最後に、私たちが日々守るべきルールを確認します。アクセス権は必要な人だけに最小限で付与し、データの持ち出しには必ず暗号化と承認を行います。もし問題が起きたときは、隠さず即座に報告することが被害を最小化する最大のポイントです。`,
      },
    ],
    quiz: [
      {
        question: `ISMSにおいて「${keyword}」を取り扱う際の対応として、最も適切なものはどれですか？`,
        options: [
          "業務効率を優先し、アクセス権は全社員に一律で付与する",
          "必要最小限の原則に基づき、業務上必要な人にのみアクセス権を付与する",
          "インシデントが起きても、混乱を避けるため報告は四半期末にまとめて行う",
          "外部委託先のセキュリティは委託先任せにし、自社では確認しない",
        ],
        answer_index: 1,
        explanation:
          "ISMSではアクセス制御において「必要最小限の原則（need-to-know）」が基本です。インシデントは即時報告、委託先管理も自社の責任範囲に含まれます。",
      },
    ],
  };
}
