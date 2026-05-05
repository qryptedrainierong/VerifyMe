import type { PlatformEndUserAssociation } from "../data/platformUsersSample";
import type { GroupedEndUserRowStatus } from "../data/groupEndUsers";

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (!local || local.length <= 1) return `***@${domain}`;
  return `${local[0]}***@${domain}`;
}

export function displayClientUserId(clientUserId: string, organizationId: string): string {
  const v = clientUserId.trim();
  return v.length > 0 ? v : `(unassigned · ${organizationId})`;
}

export function rowStatusLabel(
  status: GroupedEndUserRowStatus | PlatformEndUserAssociation["status"],
): string {
  if (status === "active") return "Active";
  if (status === "pending") return "Pending";
  if (status === "suspended") return "Suspended";
  return "Disabled";
}
