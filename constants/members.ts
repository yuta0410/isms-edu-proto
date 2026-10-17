import type { DeliveryGroup } from "@/lib/types";

/**
 * テナントの受講者（社員）名簿のシードデータ。キーはテナントID
 * （constants/tenants.ts）。氏名は constants/enrollments.ts の受講記録と揃えている。
 *
 * 実運用では `members` テーブル（tenant_id 付き・RLS 対象）に相当し、
 * 招待メール送信で `invited` → 初回アクセスで `active` に遷移する。
 */

export type MemberStatus = "active" | "invited" | "inactive";

export interface Member {
  id: string;
  corp: string;
  name: string;
  email: string;
  department: string;
  /** 所属グループ。全員が「全社員」に属し、必要に応じて追加グループを持つ。 */
  groups: DeliveryGroup[];
  status: MemberStatus;
  last_access: string | null; // "2026/10/12"
}

export const MEMBER_STATUS_META: Record<
  MemberStatus,
  { label: string; variant: "success" | "warning" | "muted" }
> = {
  active: { label: "有効", variant: "success" },
  invited: { label: "招待中", variant: "warning" },
  inactive: { label: "無効", variant: "muted" },
};

export const MEMBERS: Member[] = [
  // 株式会社スマートフロー
  {
    id: "mb-sf-1",
    corp: "smart-flow",
    name: "山田 太郎",
    email: "t.yamada@smart-flow.example",
    department: "情報システム部",
    groups: ["全社員", "管理職"],
    status: "active",
    last_access: "2026/10/16",
  },
  {
    id: "mb-sf-2",
    corp: "smart-flow",
    name: "佐藤 健一",
    email: "k.sato@smart-flow.example",
    department: "開発部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/10/14",
  },
  {
    id: "mb-sf-3",
    corp: "smart-flow",
    name: "鈴木 美咲",
    email: "m.suzuki@smart-flow.example",
    department: "営業部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/10/09",
  },
  {
    id: "mb-sf-4",
    corp: "smart-flow",
    name: "高橋 大輔",
    email: "d.takahashi@smart-flow.example",
    department: "開発部",
    groups: ["全社員", "管理職"],
    status: "active",
    last_access: "2026/10/02",
  },
  {
    id: "mb-sf-5",
    corp: "smart-flow",
    name: "小林 直樹",
    email: "n.kobayashi@smart-flow.example",
    department: "カスタマーサクセス部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/09/28",
  },
  {
    id: "mb-sf-6",
    corp: "smart-flow",
    name: "森 優花",
    email: "y.mori@smart-flow.example",
    department: "開発部",
    groups: ["全社員", "新入社員"],
    status: "invited",
    last_access: null,
  },
  {
    id: "mb-sf-7",
    corp: "smart-flow",
    name: "井上 隼人",
    email: "h.inoue@smart-flow.example",
    department: "営業部",
    groups: ["全社員"],
    status: "inactive",
    last_access: "2026/06/30",
  },

  // 千代田コンサルティング株式会社
  {
    id: "mb-ch-1",
    corp: "chiyoda",
    name: "田中 由美",
    email: "y.tanaka@chiyoda-consulting.example",
    department: "経営企画部",
    groups: ["全社員", "管理職"],
    status: "active",
    last_access: "2026/10/15",
  },
  {
    id: "mb-ch-2",
    corp: "chiyoda",
    name: "伊藤 翔",
    email: "s.ito@chiyoda-consulting.example",
    department: "コンサルティング第一部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/10/11",
  },
  {
    id: "mb-ch-3",
    corp: "chiyoda",
    name: "渡辺 七海",
    email: "n.watanabe@chiyoda-consulting.example",
    department: "コンサルティング第二部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/10/07",
  },
  {
    id: "mb-ch-4",
    corp: "chiyoda",
    name: "中村 彩",
    email: "a.nakamura@chiyoda-consulting.example",
    department: "総務部",
    groups: ["全社員", "新入社員"],
    status: "invited",
    last_access: null,
  },

  // A株式会社
  {
    id: "mb-ac-1",
    corp: "a-corp",
    name: "山本 拓也",
    email: "t.yamamoto@a-corp.example",
    department: "製造部",
    groups: ["全社員", "管理職"],
    status: "active",
    last_access: "2026/10/13",
  },
  {
    id: "mb-ac-2",
    corp: "a-corp",
    name: "加藤 さくら",
    email: "s.kato@a-corp.example",
    department: "品質保証部",
    groups: ["全社員"],
    status: "active",
    last_access: "2026/10/08",
  },
  {
    id: "mb-ac-3",
    corp: "a-corp",
    name: "吉田 亮",
    email: "r.yoshida@a-corp.example",
    department: "製造部",
    groups: ["全社員", "新入社員"],
    status: "active",
    last_access: "2026/10/01",
  },
];
