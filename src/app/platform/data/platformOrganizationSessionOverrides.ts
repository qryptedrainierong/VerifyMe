import type { PlatformOrganization } from "./platformOrganizationsSample";
import { getSampleOrganizationById } from "./platformOrganizationsSample";

/** UI-only: org rows merged on read until reload. */
const overridesById = new Map<string, PlatformOrganization>();

let storeVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  storeVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribePlatformOrganizationListeners(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getPlatformOrganizationStoreVersion() {
  return storeVersion;
}

export function registerPlatformOrganizationOverride(organization: PlatformOrganization) {
  const sessionUpdatedAt = new Date().toISOString();
  overridesById.set(organization.id, { ...organization, sessionUpdatedAt });
  emit();
}

/** Apply a partial update to an organization by id (sample row or existing override). Notifies listeners. */
export function patchPlatformOrganization(id: string, patch: Partial<PlatformOrganization>) {
  const base = overridesById.get(id) ?? getSampleOrganizationById(id);
  if (!base) return;

  if (patch.status !== undefined && patch.status !== base.status) {
    if (patch.status === "suspended") {
      if (base.status !== "active") return;
    } else if (patch.status === "active") {
      if (base.status !== "suspended") return;
    } else {
      return;
    }
  }

  const sessionUpdatedAt = new Date().toISOString();
  overridesById.set(id, { ...base, ...patch, sessionUpdatedAt });
  emit();
}

export function getPlatformOrganizationForDetail(id: string | undefined): PlatformOrganization | undefined {
  if (!id) {
    return undefined;
  }
  return overridesById.get(id) ?? getSampleOrganizationById(id);
}

/** Merge list row with session override when present (for Organizations table display). */
export function mergeOrganizationWithSessionOverride(org: PlatformOrganization): PlatformOrganization {
  return overridesById.get(org.id) ?? org;
}
