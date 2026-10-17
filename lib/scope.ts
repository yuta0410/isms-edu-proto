import { TENANT_DIRECTORY, type TenantProfile } from "@/constants/tenants";
import type { Workspace } from "@/lib/workspace";

/**
 * データスコープ層。画面はデータを直接 constants から読まず、ここを通して
 * 「現在のワークスペースが見てよい行」だけを受け取る。
 *
 * UI で要素を隠すだけでなくデータ自体を絞ることで、テナントモードの画面には
 * 他社の行がそもそも渡らない（実運用の RLS と同じ考え方）。
 */
type Scope = Pick<Workspace, "isOem" | "tenantId">;

/** 現在のワークスペースが参照できるテナント一覧。 */
export function visibleTenants(ws: Scope): TenantProfile[] {
  return ws.isOem
    ? TENANT_DIRECTORY
    : TENANT_DIRECTORY.filter((t) => t.id === ws.tenantId);
}

/** 行配列をテナント単位で絞り込む。 */
export function scopeByTenant<T>(
  ws: Scope,
  rows: readonly T[],
  tenantOf: (row: T) => string,
): T[] {
  return ws.isOem ? [...rows] : rows.filter((r) => tenantOf(r) === ws.tenantId);
}

/**
 * 外部から渡されたテナントID（URL パラメータ等）を解決する。
 * テナントモードでは入力を無視して常に自社に固定する。
 */
export function resolveTenantId(ws: Scope, requested: string | null): string {
  if (!ws.isOem) return ws.tenantId;
  return requested && TENANT_DIRECTORY.some((t) => t.id === requested)
    ? requested
    : TENANT_DIRECTORY[0].id;
}
