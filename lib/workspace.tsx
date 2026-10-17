"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  OWN_TENANT_ID,
  PARTNER,
  getTenantProfile,
  type TenantProfile,
} from "@/constants/tenants";

/**
 * ワークスペース（表示モード）のグローバル状態。
 *
 * - "tenant": 契約企業の管理者として、自社（OWN_TENANT_ID）のデータだけを扱う。
 * - "oem":    監査事業者（OEMパートナー）として、全テナントを横断して扱う。
 *
 * プロトタイプではクライアント側の切り替えだが、実運用ではモード＝ログイン中の
 * メンバーシップ（JWT クレーム）であり、データ分離は DB の RLS で強制する。
 */
export type WorkspaceMode = "tenant" | "oem";

const STORAGE_KEY = "isms-edu:workspace-mode";
const DEFAULT_MODE: WorkspaceMode = "tenant";

// --- tiny external store (memory first, localStorage as best-effort persistence) ---
const listeners = new Set<() => void>();
let currentMode: WorkspaceMode | null = null;

function parseMode(value: string | null): WorkspaceMode {
  return value === "oem" ? "oem" : DEFAULT_MODE;
}

function getSnapshot(): WorkspaceMode {
  if (currentMode === null) {
    try {
      currentMode = parseMode(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      currentMode = DEFAULT_MODE;
    }
  }
  return currentMode;
}

function getServerSnapshot(): WorkspaceMode {
  return DEFAULT_MODE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    currentMode = parseMode(e.newValue);
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeMode(mode: WorkspaceMode) {
  currentMode = mode;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage may be blocked (private mode etc.); memory state still works */
  }
  listeners.forEach((l) => l());
}

// --- context ---
export interface Workspace {
  mode: WorkspaceMode;
  isOem: boolean;
  /** テナントモード時の自社ID（OEMモードでも「自社」の参照用に保持）。 */
  tenantId: string;
  tenant: TenantProfile;
  partner: typeof PARTNER;
  setMode: (mode: WorkspaceMode) => void;
}

const WorkspaceContext = createContext<Workspace | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<Workspace>(() => {
    const tenant = getTenantProfile(OWN_TENANT_ID);
    if (!tenant) throw new Error(`Unknown tenant: ${OWN_TENANT_ID}`);
    return {
      mode,
      isOem: mode === "oem",
      tenantId: tenant.id,
      tenant,
      partner: PARTNER,
      setMode: writeMode,
    };
  }, [mode]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): Workspace {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within <WorkspaceProvider>");
  }
  return ctx;
}
