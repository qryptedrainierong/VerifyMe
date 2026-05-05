import { platformClientApps, type PlatformClientAppRow } from "./platformClientAppsSample";

let rows: PlatformClientAppRow[] = [...platformClientApps];
let storeVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  storeVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeClientAppsListeners(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getClientAppsStoreVersion() {
  return storeVersion;
}

export function getClientAppRows(): PlatformClientAppRow[] {
  return rows;
}

export function getClientAppById(id: string | undefined): PlatformClientAppRow | undefined {
  if (!id) return undefined;
  return rows.find((r) => r.id === id);
}

export function updateClientAppRow(id: string, patch: Partial<PlatformClientAppRow>) {
  rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emit();
}
