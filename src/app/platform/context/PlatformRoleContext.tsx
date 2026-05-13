import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  PLATFORM_ROLE_STORAGE_KEY,
  PLATFORM_ROLES,
  type PlatformRole,
  parseStoredPlatformRole,
} from "../utils/platformRolePermissions";

export type { PlatformRole } from "../utils/platformRolePermissions";

export const PLATFORM_PREVIEW_USER = {
  displayName: "Alex Tan",
  email: "alex.tan@verifyme.com",
} as const;

type PlatformRoleContextValue = {
  role: PlatformRole;
  setRole: (role: PlatformRole) => void;
};

const PlatformRoleContext = createContext<PlatformRoleContextValue | null>(null);

const defaultRole: PlatformRole = "super_admin";

function readRoleFromStorage(): PlatformRole {
  if (typeof window === "undefined") return defaultRole;
  try {
    const parsed = parseStoredPlatformRole(window.localStorage.getItem(PLATFORM_ROLE_STORAGE_KEY));
    return parsed ?? defaultRole;
  } catch {
    return defaultRole;
  }
}

let clientRole: PlatformRole = readRoleFromStorage();
const listeners = new Set<() => void>();

function subscribeRole(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getRoleSnapshot() {
  return clientRole;
}

function getServerSnapshot() {
  return defaultRole;
}

function emit() {
  listeners.forEach((l) => l());
}

function persistRole(role: PlatformRole) {
  clientRole = role;
  try {
    window.localStorage.setItem(PLATFORM_ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore quota / private mode */
  }
  emit();
}

export function PlatformRoleProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribeRole, getRoleSnapshot, getServerSnapshot);

  const setRole = useCallback((next: PlatformRole) => {
    if (!PLATFORM_ROLES.includes(next)) return;
    persistRole(next);
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <PlatformRoleContext.Provider value={value}>{children}</PlatformRoleContext.Provider>;
}

export function usePlatformRole(): PlatformRoleContextValue {
  const ctx = useContext(PlatformRoleContext);
  if (!ctx) {
    throw new Error("usePlatformRole must be used within PlatformRoleProvider");
  }
  return ctx;
}
