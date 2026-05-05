import { platformIdentityLinks, type PlatformIdentityLinkRow } from "./platformIdentityLinksSample";

let rows: PlatformIdentityLinkRow[] = [...platformIdentityLinks];
let storeVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  storeVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeIdentityLinksListeners(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getIdentityLinksStoreVersion() {
  return storeVersion;
}

export function getIdentityLinkRows(): PlatformIdentityLinkRow[] {
  return rows;
}

export function getIdentityLinkById(id: string | undefined): PlatformIdentityLinkRow | undefined {
  if (!id) return undefined;
  return rows.find((r) => r.id === id);
}

export function updateIdentityLinkRow(id: string, patch: Partial<PlatformIdentityLinkRow>) {
  rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emit();
}
