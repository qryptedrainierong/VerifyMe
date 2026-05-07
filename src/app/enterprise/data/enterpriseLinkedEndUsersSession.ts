import { getInitialOrganizationUserRecords, type OrganizationUserRecord } from "./enterpriseLinkedEndUsersMock";

let rows: OrganizationUserRecord[] = [...getInitialOrganizationUserRecords()];
let storeVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  storeVersion += 1;
  for (const listener of listeners) listener();
}

export function subscribeLinkedEndUsersListeners(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getLinkedEndUsersStoreVersion() {
  return storeVersion;
}

export function getLinkedEndUserRecords(): OrganizationUserRecord[] {
  return rows;
}

export function getLinkedEndUserRecordById(id: string | undefined): OrganizationUserRecord | undefined {
  if (!id) return undefined;
  return rows.find((r) => r.id === id);
}

export function setLinkedEndUserRecords(
  next: OrganizationUserRecord[] | ((prev: OrganizationUserRecord[]) => OrganizationUserRecord[]),
) {
  rows = typeof next === "function" ? next(rows) : next;
  emit();
}

export function updateLinkedEndUserRecord(id: string, patch: Partial<OrganizationUserRecord>) {
  rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
  emit();
}

export function resetLinkedEndUsersToSample() {
  rows = [...getInitialOrganizationUserRecords()];
  emit();
}
