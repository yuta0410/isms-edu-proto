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
