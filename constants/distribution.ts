import type {
  Tenant,
  DeliveryGroup,
  DistributionRecord,
} from "@/lib/types";

/**
 * Tenant catalog + distribution seed data for the ISMS education tool.
 *
 * In production these are Supabase rows authored from the admin distribution
 * flow. Here they are static so the learner portal, the distribution modal and
 * the distribution dashboard all share one source of truth.
 */

/** Companies selectable as distribution targets. */
export const COMPANIES = [
  { corp: "A", name: "A株式会社" },
  { corp: "B", name: "B合同会社" },
  { corp: "C", name: "Cクリニック（医療法人）" },
] as const;

/** Target groups within a company. */
export const GROUPS: DeliveryGroup[] = ["全社員", "新入社員", "管理職"];

/**
 * Per-tenant portal config. `course_ids` decides which courses each company
 * sees — this is the (pseudo) multi-tenant filtering on the learner portal.
 */
export const TENANTS: Record<string, Tenant> = {
  A: {
    corp: "A",
    name: "A株式会社",
    portal_label: "A株式会社様 専用ポータル",
    logo_label: "A社様 配信中教材",
    accent: "sky",
    course_ids: ["personal-info", "password-mfa", "phishing"],
  },
  B: {
    corp: "B",
    name: "B合同会社",
    portal_label: "B合同会社様 専用ポータル",
    logo_label: "B社様 配信中教材",
    accent: "violet",
    course_ids: ["password-mfa", "phishing"],
  },
  C: {
    corp: "C",
    name: "Cクリニック（医療法人）",
    portal_label: "Cクリニック様 専用ポータル",
    logo_label: "Cクリニック様 配信中教材",
    accent: "emerald",
    course_ids: ["personal-info"],
  },
};

/** Resolve a tenant by its `corp` code; undefined for unknown / no tenant. */
export function getTenant(corp: string | null | undefined): Tenant | undefined {
  if (!corp) return undefined;
  return TENANTS[corp.toUpperCase()];
}

/** Seed rows for the distribution dashboard. */
export const DISTRIBUTIONS: DistributionRecord[] = [
  {
    id: "d1",
    course_id: "personal-info",
    course_title: "個人情報の適切な取り扱い",
    corp: "A",
    corp_name: "A株式会社",
    group: "全社員",
    distributed_at: "2026-05-25 09:00",
    total_count: 48,
    completed_count: 41,
    channels: ["line", "slack"],
  },
  {
    id: "d2",
    course_id: "password-mfa",
    course_title: "パスワード管理と多要素認証",
    corp: "A",
    corp_name: "A株式会社",
    group: "新入社員",
    distributed_at: "2026-05-28 10:30",
    total_count: 12,
    completed_count: 7,
    channels: ["slack"],
  },
  {
    id: "d3",
    course_id: "phishing",
    course_title: "標的型メール攻撃への対策",
    corp: "B",
    corp_name: "B合同会社",
    group: "全社員",
    distributed_at: "2026-06-01 13:15",
    total_count: 30,
    completed_count: 9,
    channels: ["line"],
  },
  {
    id: "d4",
    course_id: "password-mfa",
    course_title: "パスワード管理と多要素認証",
    corp: "B",
    corp_name: "B合同会社",
    group: "管理職",
    distributed_at: "2026-06-02 08:45",
    total_count: 8,
    completed_count: 8,
    channels: ["line", "slack"],
  },
  {
    id: "d5",
    course_id: "personal-info",
    course_title: "個人情報の適切な取り扱い",
    corp: "C",
    corp_name: "Cクリニック（医療法人）",
    group: "全社員",
    distributed_at: "2026-06-05 17:00",
    total_count: 22,
    completed_count: 5,
    channels: ["line"],
  },
];

/** Completion rate (0-100) for a distribution row. */
export function completionRate(r: DistributionRecord): number {
  return r.total_count
    ? Math.round((r.completed_count / r.total_count) * 100)
    : 0;
}
