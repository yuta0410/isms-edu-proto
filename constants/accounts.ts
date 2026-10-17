/**
 * OEM（監査事業者）向けの顧客アカウント・審査スケジュール・提案パイプラインの
 * シードデータ。キーはテナントID（constants/tenants.ts）。
 *
 * 実運用では `tenants`（契約情報）・`audits`（審査予定）・`opportunities`
 * （提案機会）テーブルに相当し、Partner スコープのデータとして扱う。
 */

export type PlanCode = "light" | "standard" | "premium";
export type TenantStatus = "active" | "trial" | "suspended";

export const PLAN_LABEL: Record<PlanCode, string> = {
  light: "ライト",
  standard: "スタンダード",
  premium: "プレミアム",
};

export interface TenantAccount {
  tenant_id: string;
  plan: PlanCode;
  employee_count: number;
  status: TenantStatus;
  contract_started_on: string; // YYYY-MM-DD
  contract_renewal_on: string; // システム契約更新日
  audit_on: string; // 次回審査予定日
  audit_type: string; // 例: ISMS 定期審査
  admin_name: string; // テナント管理者
}

export const TENANT_ACCOUNTS: TenantAccount[] = [
  {
    tenant_id: "smart-flow",
    plan: "standard",
    employee_count: 48,
    status: "active",
    contract_started_on: "2026-04-01",
    contract_renewal_on: "2027-03-31",
    audit_on: "2026-11-15",
    audit_type: "ISMS 定期審査",
    admin_name: "山田 太郎",
  },
  {
    tenant_id: "chiyoda",
    plan: "premium",
    employee_count: 120,
    status: "active",
    contract_started_on: "2025-07-01",
    contract_renewal_on: "2027-06-30",
    audit_on: "2027-02-20",
    audit_type: "ISMS 更新審査",
    admin_name: "佐藤 次郎",
  },
  {
    tenant_id: "a-corp",
    plan: "light",
    employee_count: 22,
    status: "active",
    contract_started_on: "2026-01-01",
    contract_renewal_on: "2026-12-31",
    audit_on: "2027-05-18",
    audit_type: "Pマーク 更新審査",
    admin_name: "佐藤 健一",
  },
];

/** 審査の何ヶ月前を「直前対策の提案タイミング」とするか。 */
export const PROPOSAL_LEAD_MONTHS = 3;

// ---------------------------------------------------------------------------
// 提案パイプライン
// ---------------------------------------------------------------------------

export type OpportunityStage = "not_proposed" | "proposing" | "won";

export const STAGES: { id: OpportunityStage; label: string }[] = [
  { id: "not_proposed", label: "未提案" },
  { id: "proposing", label: "提案中" },
  { id: "won", label: "受注完了" },
];

export interface Opportunity {
  id: string;
  tenant_id: string;
  title: string;
  /** 根拠となった弱点カテゴリ（審査起点の提案は null）。 */
  weak_category: string | null;
  incorrect_rate: number | null;
  /** 発生源：弱点分析 or 審査スケジュール */
  source: "weakness" | "audit";
  amount_yen: number;
  stage: OpportunityStage;
  created_on: string;
  next_action: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    tenant_id: "smart-flow",
    title: "標的型メール抜き打ち訓練（追加オプション）",
    weak_category: "標的型メール・フィッシング",
    incorrect_rate: 78,
    source: "weakness",
    amount_yen: 450000,
    stage: "proposing",
    created_on: "2026-09-28",
    next_action: "10/24 先方情シス部長と打合せ",
  },
  {
    id: "opp-2",
    tenant_id: "smart-flow",
    title: "ISMS定期審査 直前対策パック",
    weak_category: null,
    incorrect_rate: null,
    source: "audit",
    amount_yen: 300000,
    stage: "not_proposed",
    created_on: "2026-08-15",
    next_action: "審査まで1ヶ月：至急提案",
  },
  {
    id: "opp-3",
    tenant_id: "chiyoda",
    title: "パスワードマネージャー導入支援ワークショップ",
    weak_category: "パスワード管理",
    incorrect_rate: 82,
    source: "weakness",
    amount_yen: 380000,
    stage: "not_proposed",
    created_on: "2026-10-10",
    next_action: "提案メール送付",
  },
  {
    id: "opp-4",
    tenant_id: "a-corp",
    title: "セキュリティ意識向上 継続教育プログラム",
    weak_category: "標的型メール・フィッシング",
    incorrect_rate: 35,
    source: "weakness",
    amount_yen: 240000,
    stage: "won",
    created_on: "2026-07-02",
    next_action: "11月より四半期テスト開始",
  },
];

// ---------------------------------------------------------------------------
// Date helpers (dates are plain YYYY-MM-DD strings interpreted in local time)
// ---------------------------------------------------------------------------

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatFullDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatYen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}
