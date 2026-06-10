/**
 * Per-company evidence (受講証明・実施報告) seed data for the審査用 PDF export.
 *
 * In production these rows come from Supabase (enrollments joined with
 * employees), scoped to the company selected on the dashboard. Here they are
 * static mock datasets keyed by a company identifier (`corp`).
 */

export interface EvidenceLearner {
  name: string;
  department: string;
  completed_at: string;
  score: number;
}

export interface EvidenceReport {
  corp: string;
  company: string;
  theme: string;
  period: string;
  material: string;
  supervisor: string;
  learners: EvidenceLearner[];
}

export const EVIDENCE_REPORTS: Record<string, EvidenceReport> = {
  "smart-flow": {
    corp: "smart-flow",
    company: "株式会社スマートフロー",
    theme: "標的型メール攻撃への対策",
    period: "2026年5月10日 〜 2026年5月22日",
    material:
      "「標的型メール攻撃への対策」スライド教材（E&Nコンサルティング監修）",
    supervisor: "E&Nコンサルティング株式会社",
    learners: [
      { name: "山田 太郎", department: "開発部", completed_at: "2026-05-12 10:24", score: 100 },
      { name: "鈴木 一郎", department: "営業部", completed_at: "2026-05-13 15:48", score: 90 },
      { name: "伊藤 健", department: "開発部", completed_at: "2026-05-15 09:10", score: 100 },
      { name: "渡辺 結衣", department: "カスタマーサクセス部", completed_at: "2026-05-18 14:02", score: 90 },
    ],
  },
  chiyoda: {
    corp: "chiyoda",
    company: "千代田コンサルティング株式会社",
    theme: "個人情報の適切な取り扱い",
    period: "2026年5月18日 〜 2026年5月30日",
    material:
      "「個人情報の適切な取り扱い」スライド教材（E&Nコンサルティング監修）",
    supervisor: "E&Nコンサルティング株式会社",
    learners: [
      { name: "佐藤 次郎", department: "総務部", completed_at: "2026-05-20 11:05", score: 90 },
      { name: "高橋 花子", department: "経理部", completed_at: "2026-05-21 16:30", score: 80 },
      { name: "田中 三郎", department: "総務部", completed_at: "2026-05-23 09:45", score: 90 },
      { name: "小林 桜", department: "人事部", completed_at: "2026-05-26 13:20", score: 90 },
      { name: "加藤 大輔", department: "経理部", completed_at: "2026-05-28 10:12", score: 90 },
    ],
  },
  default: {
    corp: "default",
    company: "A株式会社",
    theme: "個人情報の適切な取り扱い",
    period: "2026年5月25日 〜 2026年6月5日",
    material:
      "「個人情報の適切な取り扱い」スライド教材（E&Nコンサルティング監修）",
    supervisor: "E&Nコンサルティング株式会社",
    learners: [
      { name: "佐藤 健一", department: "情報システム部", completed_at: "2026-05-28 14:32", score: 100 },
      { name: "鈴木 美咲", department: "営業部", completed_at: "2026-05-29 10:15", score: 90 },
      { name: "田中 由美", department: "総務部", completed_at: "2026-06-01 09:15", score: 100 },
      { name: "中村 彩", department: "経理部", completed_at: "2026-06-02 11:40", score: 80 },
      { name: "高橋 大輔", department: "開発部", completed_at: "2026-06-03 16:20", score: 95 },
    ],
  },
};

/** Companies offered in the dashboard's evidence-export selector. */
export const EVIDENCE_COMPANIES = [
  { corp: "smart-flow", name: "株式会社スマートフロー" },
  { corp: "chiyoda", name: "千代田コンサルティング株式会社" },
  { corp: "default", name: "A株式会社（サンプル）" },
];

/** Resolve a report by corp; falls back to the default dataset. */
export function getEvidenceReport(corp: string | null | undefined): EvidenceReport {
  if (corp && EVIDENCE_REPORTS[corp]) return EVIDENCE_REPORTS[corp];
  return EVIDENCE_REPORTS.default;
}

// ---------------------------------------------------------------------------
// Weakness analysis (category-level quiz incorrect rates) used by the
// dashboard's アップセル提案 section. Keyed by the same `corp` identifier.
// ---------------------------------------------------------------------------

export interface WeaknessCategory {
  category: string;
  /** Quiz incorrect rate, 0-100. Higher = weaker / riskier. */
  incorrect_rate: number;
}

export interface CompanyWeakness {
  corp: string;
  categories: WeaknessCategory[];
  /** One-click upsell email the consultant can send as-is. */
  upsell: {
    weakest: string;
    option: string;
    email: string;
  };
}

export const COMPANY_WEAKNESS: Record<string, CompanyWeakness> = {
  "smart-flow": {
    corp: "smart-flow",
    categories: [
      { category: "標的型メール・フィッシング", incorrect_rate: 78 },
      { category: "パスワード管理", incorrect_rate: 12 },
      { category: "PC・端末の紛失対策", incorrect_rate: 25 },
    ],
    upsell: {
      weakest: "標的型メール・フィッシング",
      option: "標的型メール抜き打ち訓練（追加オプション）",
      email: `株式会社スマートフロー ご担当者様

いつも大変お世話になっております。E&Nコンサルティングです。

先般実施いたしました情報セキュリティ教育の理解度テストを分析した結果、貴社は「標的型メール・フィッシング攻撃」への耐性が極めて低い状態であることが判明いたしました（当該カテゴリの不正解率：78%）。

つきましては来月、実戦形式の『標的型メール抜き打ち訓練（追加オプション）』の実施をご提案いたします。実際の業務を装った訓練メールを配信し、開封・クリック率の可視化と、その場での是正指導までを一気通貫で行うことで、従業員の「気づく力」を実地で養成いたします。

ご多忙のところ恐れ入りますが、ご検討のほど何卒よろしくお願い申し上げます。

E&Nコンサルティング株式会社`,
    },
  },
  chiyoda: {
    corp: "chiyoda",
    categories: [
      { category: "標的型メール・フィッシング", incorrect_rate: 15 },
      { category: "パスワード管理", incorrect_rate: 82 },
      { category: "PC・端末の紛失対策", incorrect_rate: 40 },
    ],
    upsell: {
      weakest: "パスワード管理",
      option: "パスワードマネージャー導入支援ワークショップ（追加オプション）",
      email: `千代田コンサルティング株式会社 ご担当者様

いつも大変お世話になっております。E&Nコンサルティングです。

先般実施いたしました情報セキュリティ教育の理解度テストを分析した結果、貴社は「パスワード管理」に関するリスクが高く、特にパスワードの使い回しが懸念される状態であることが判明いたしました（当該カテゴリの不正解率：82%）。

つきましては来月、全社的な『パスワードマネージャー導入支援ワークショップ（追加オプション）』の実施をご提案いたします。ツールの選定から初期設定、全社展開の運用ルール策定までをハンズオン形式でご支援し、属人的なパスワード管理から脱却する仕組みを構築いたします。

ご多忙のところ恐れ入りますが、ご検討のほど何卒よろしくお願い申し上げます。

E&Nコンサルティング株式会社`,
    },
  },
  default: {
    corp: "default",
    categories: [
      { category: "標的型メール・フィッシング", incorrect_rate: 35 },
      { category: "パスワード管理", incorrect_rate: 28 },
      { category: "PC・端末の紛失対策", incorrect_rate: 22 },
    ],
    upsell: {
      weakest: "標的型メール・フィッシング",
      option: "セキュリティ意識向上 継続教育プログラム（追加オプション）",
      email: `A株式会社 ご担当者様

いつも大変お世話になっております。E&Nコンサルティングです。

先般実施いたしました情報セキュリティ教育の理解度テストを分析した結果、全体として大きな弱点は見られないものの、「標的型メール・フィッシング」のカテゴリで一定の改善余地が確認されました（当該カテゴリの不正解率：35%）。

つきましては、定着度をさらに高めるための『セキュリティ意識向上 継続教育プログラム（追加オプション）』をご提案いたします。四半期ごとの小テストとフォローアップ教育により、教育効果の維持・向上を図ります。

ご多忙のところ恐れ入りますが、ご検討のほど何卒よろしくお願い申し上げます。

E&Nコンサルティング株式会社`,
    },
  },
};

/** Resolve weakness data by corp; falls back to the default dataset. */
export function getWeakness(corp: string | null | undefined): CompanyWeakness {
  if (corp && COMPANY_WEAKNESS[corp]) return COMPANY_WEAKNESS[corp];
  return COMPANY_WEAKNESS.default;
}
