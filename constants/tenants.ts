/**
 * テナント（契約企業）ディレクトリと OEM パートナー情報。
 *
 * 全データセット（受講記録・配信・社内規定・証跡など）はここで定義した
 * テナントID（`id`）をキーに紐づく。実運用では Supabase の `partners` /
 * `tenants` テーブルに相当し、データ分離は tenant_id + RLS で行う
 * （SAAS_ARCHITECTURE_DESIGN.md §4 参照）。
 */

/** OEM パートナー（監査事業会社）。テナントに見せるブランドはこちら。 */
export const PARTNER = {
  id: "en-consulting",
  name: "E&Nコンサルティング株式会社",
  brand_name: "E&N ISMSアカデミー",
} as const;

export interface TenantProfile {
  id: string; // テナントID（URL・データキー）
  name: string; // 表示名
  industry: string; // 業種（ベンチマーク等に利用）
}

export const TENANT_DIRECTORY: TenantProfile[] = [
  {
    id: "smart-flow",
    name: "株式会社スマートフロー",
    industry: "IT・ソフトウェア",
  },
  {
    id: "chiyoda",
    name: "千代田コンサルティング株式会社",
    industry: "専門サービス",
  },
  { id: "a-corp", name: "A株式会社", industry: "製造" },
];

/**
 * テナントモードでログインしている「自社」のテナントID。
 * プロトタイプでは固定。実運用ではセッション（JWT クレーム）から決定する。
 */
export const OWN_TENANT_ID = "smart-flow";

export function getTenantProfile(id: string): TenantProfile | undefined {
  return TENANT_DIRECTORY.find((t) => t.id === id);
}

export function tenantName(id: string): string {
  return getTenantProfile(id)?.name ?? id;
}
