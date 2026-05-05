import type { PlatformEndUserAssociation } from "./platformUsersSample";

export type GroupedEndUserRowStatus = "active" | "pending" | "suspended" | "disabled";

export type GroupedEndUser = {
  verifymeUserId: string;
  verifymeId: string;
  email: string;
  memberships: PlatformEndUserAssociation[];
  /** Worst-wins across memberships: Disabled > Suspended > Pending > Active */
  rowStatus: GroupedEndUserRowStatus;
  totalVerificationSessions: number;
  lastActiveMax: string | null;
};

function aggregateRowStatus(memberships: PlatformEndUserAssociation[]): GroupedEndUserRowStatus {
  if (memberships.some((m) => m.status === "disabled")) return "disabled";
  if (memberships.some((m) => m.status === "suspended")) return "suspended";
  if (memberships.some((m) => m.status === "pending")) return "pending";
  return "active";
}

function maxLastActive(memberships: PlatformEndUserAssociation[]): string | null {
  let best: string | null = null;
  let bestMs = 0;
  for (const m of memberships) {
    if (!m.lastActive) continue;
    const ms = new Date(`${m.lastActive}Z`).getTime();
    if (ms >= bestMs) {
      bestMs = ms;
      best = m.lastActive;
    }
  }
  return best;
}

export function groupAssociationsByVerifymeUserId(
  associations: PlatformEndUserAssociation[],
): GroupedEndUser[] {
  const byUser = new Map<string, PlatformEndUserAssociation[]>();
  for (const a of associations) {
    const list = byUser.get(a.verifymeUserId) ?? [];
    list.push(a);
    byUser.set(a.verifymeUserId, list);
  }

  const groups: GroupedEndUser[] = [];
  for (const [verifymeUserId, memberships] of byUser) {
    const sorted = [...memberships].sort((a, b) =>
      a.organization.localeCompare(b.organization),
    );
    const first = sorted[0];
    const email = first?.email ?? "";
    const verifymeId = first?.verifymeId ?? "";
    groups.push({
      verifymeUserId,
      verifymeId,
      email,
      memberships: sorted,
      rowStatus: aggregateRowStatus(sorted),
      totalVerificationSessions: sorted.reduce((s, m) => s + m.verificationSessions, 0),
      lastActiveMax: maxLastActive(sorted),
    });
  }

  return groups.sort((a, b) => a.verifymeId.localeCompare(b.verifymeId));
}

export function resolveSelectedOrganizationId(
  verifymeUserId: string,
  memberships: PlatformEndUserAssociation[],
  stored: Record<string, string | undefined>,
): string {
  const storedId = stored[verifymeUserId];
  if (storedId && memberships.some((m) => m.organizationId === storedId)) {
    return storedId;
  }
  return memberships[0]?.organizationId ?? "";
}
