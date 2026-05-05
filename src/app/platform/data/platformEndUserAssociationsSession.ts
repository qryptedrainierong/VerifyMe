import { platformEndUserAssociations, type PlatformEndUserAssociation } from "./platformUsersSample";

let rows: PlatformEndUserAssociation[] = [...platformEndUserAssociations];
let storeVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  storeVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeEndUserAssociationListeners(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getEndUserAssociationStoreVersion() {
  return storeVersion;
}

export function getEndUserAssociations(): PlatformEndUserAssociation[] {
  return rows;
}

export function setEndUserAssociations(
  next: PlatformEndUserAssociation[] | ((prev: PlatformEndUserAssociation[]) => PlatformEndUserAssociation[]),
) {
  rows = typeof next === "function" ? next(rows) : next;
  emit();
}
