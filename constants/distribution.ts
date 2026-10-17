import { TENANT_DIRECTORY, tenantName } from "@/constants/tenants";
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
export const COMPANIES = TENANT_DIRECTORY.map((t) => ({
  corp: t.id,
  name: t.name,
}));

/** Target groups within a company. */
export const GROUPS: DeliveryGroup[] = ["全社員", "新入社員", "管理職"];

/**
 * Per-tenant portal config. `course_ids` decides which courses each company
 * sees — this is the (pseudo) multi-tenant filtering on the learner portal.
 */
export const TENANTS: Record<string, Tenant> = {
  "smart-flow": {
    corp: "smart-flow",
    name: "株式会社スマートフロー",
    portal_label: "株式会社スマートフロー様 専用ポータル",
    logo_label: "スマートフロー様 配信中教材",
    accent: "violet",
    course_ids: ["password-mfa", "phishing"],
  },
  chiyoda: {
    corp: "chiyoda",
    name: "千代田コンサルティング株式会社",
    portal_label: "千代田コンサルティング株式会社様 専用ポータル",
    logo_label: "千代田コンサルティング様 配信中教材",
    accent: "emerald",
    course_ids: ["personal-info"],
  },
  "a-corp": {
    corp: "a-corp",
    name: "A株式会社",
    portal_label: "A株式会社様 専用ポータル",
    logo_label: "A社様 配信中教材",
    accent: "sky",
    course_ids: ["personal-info", "password-mfa", "phishing"],
  },
};

/** Resolve a tenant by its `corp` code; undefined for unknown / no tenant. */
export function getTenant(corp: string | null | undefined): Tenant | undefined {
  if (!corp) return undefined;
  return TENANTS[corp.toLowerCase()];
}

/** Seed rows for the distribution dashboard. */
export const DISTRIBUTIONS: DistributionRecord[] = [
  {
    id: "d1",
    course_id: "personal-info",
    course_title: "個人情報の適切な取り扱い",
    corp: "a-corp",
    corp_name: tenantName("a-corp"),
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
    corp: "a-corp",
    corp_name: tenantName("a-corp"),
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
    corp: "smart-flow",
    corp_name: tenantName("smart-flow"),
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
    corp: "smart-flow",
    corp_name: tenantName("smart-flow"),
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
    corp: "chiyoda",
    corp_name: tenantName("chiyoda"),
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
