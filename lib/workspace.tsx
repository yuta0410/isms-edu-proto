"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  PARTNER,
  getTenantProfile,
  type TenantProfile,
} from "@/constants/tenants";

/**
 * ワークスペース（ログインセッション）のグローバル状態。
 *
 * - "tenant": 契約企業の管理者として、自社（tenantId）のデータだけを扱う。
 * - "oem":    監査事業者（OEMパートナー）として、全テナントを横断して扱う。
 *
 * プロトタイプではログイン画面のデモアカウントでセッションをセットする。
 * 実運用ではセッション＝認証済みメンバーシップ（JWT クレーム）であり、
 * データ分離は DB の RLS で強制する。
 */
export type WorkspaceMode = "tenant" | "oem";

export type Session = { mode: "oem" } | { mode: "tenant"; tenantId: string };

const STORAGE_KEY = "isms-edu:session";

// --- tiny external store (memory first, localStorage as best-effort persistence) ---
const listeners = new Set<() => void>();
// undefined = not read yet; null = signed out.
let currentSession: Session | null | undefined;

function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Session> & { tenantId?: unknown };
    if (v.mode === "oem") return { mode: "oem" };
    if (
      v.mode === "tenant" &&
      typeof v.tenantId === "string" &&
      getTenantProfile(v.tenantId)
    ) {
      return { mode: "tenant", tenantId: v.tenantId };
    }
  } catch {
    /* corrupted value → treat as signed out */
  }
  return null;
}

function getSnapshot(): Session | null {
  if (currentSession === undefined) {
    try {
      currentSession = parseSession(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      currentSession = null;
    }
  }
  return currentSession;
}

// The server cannot know the session. `undefined` means "still resolving", so
// guards wait for the client snapshot instead of redirecting during hydration.
function getServerSnapshot(): Session | null | undefined {
  return undefined;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep multiple tabs in sync (e.g. logging out in one tab).
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    currentSession = parseSession(e.newValue);
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeSession(session: Session | null) {
  currentSession = session;
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* storage may be blocked (private mode etc.); memory state still works */
  }
  listeners.forEach((l) => l());
}

// --- context ---
interface WorkspaceBase {
  partner: typeof PARTNER;
}

export type Workspace = WorkspaceBase &
  (
    | { mode: "oem"; isOem: true; tenantId: null; tenant: null }
    | { mode: "tenant"; isOem: false; tenantId: string; tenant: TenantProfile }
  );

export type TenantWorkspace = Extract<Workspace, { mode: "tenant" }>;

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  status: SessionStatus;
  workspace: Workspace | null;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function toWorkspace(session: Session): Workspace | null {
  if (session.mode === "oem") {
    return {
      mode: "oem",
      isOem: true,
      tenantId: null,
      tenant: null,
      partner: PARTNER,
    };
  }
  const tenant = getTenantProfile(session.tenantId);
  if (!tenant) return null;
  return {
    mode: "tenant",
    isOem: false,
    tenantId: tenant.id,
    tenant,
    partner: PARTNER,
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore<Session | null | undefined>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo<SessionContextValue>(() => {
    const workspace = session ? toWorkspace(session) : null;
    return {
      status:
        session === undefined
          ? "loading"
          : workspace
            ? "authenticated"
            : "unauthenticated",
      workspace,
      signIn: writeSession,
      signOut: () => writeSession(null),
    };
  }, [session]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** ログイン状態と signIn / signOut。ログイン画面や認証ガードで使う。 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within <WorkspaceProvider>");
  }
  return ctx;
}

/**
 * 認証済みワークスペース。管理画面は layout の認証ガード配下でのみ描画される
 * ため、ここでは必ずセッションが存在する。
 */
export function useWorkspace(): Workspace {
  const { workspace } = useSession();
  if (!workspace) {
    throw new Error("useWorkspace requires an authenticated session");
  }
  return workspace;
}

/** テナント専用画面向け：テナントモードであることを保証して返す。 */
export function useTenantWorkspace(): TenantWorkspace {
  const ws = useWorkspace();
  if (ws.isOem) {
    throw new Error("useTenantWorkspace requires a tenant session");
  }
  return ws;
}
