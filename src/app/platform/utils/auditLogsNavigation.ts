import type { AuditEntityType, GovernanceCategory } from "../../shared/types/auditLog";

/** Query hints for `/audit-logs` deep links from entity detail pages (frontend-only). */
export type AuditLogsNavFilters = {
  verifymeId?: string;
  identityLinkId?: string;
  organizationId?: string;
  clientAppId?: string;
  verificationSessionId?: string;
  governanceCategory?: GovernanceCategory;
  entityType?: AuditEntityType;
  severity?: "Informational" | "Warning" | "High" | "Critical";
  riskEventsOnly?: boolean;
  conflictEventsOnly?: boolean;
};

export function auditLogsHref(filters: AuditLogsNavFilters): string {
  const p = new URLSearchParams();
  const {
    verifymeId,
    identityLinkId,
    organizationId,
    clientAppId,
    verificationSessionId,
    governanceCategory,
    entityType,
    severity,
    riskEventsOnly,
    conflictEventsOnly,
  } = filters;

  if (verifymeId) p.set("verifymeId", verifymeId);
  if (identityLinkId) p.set("identityLinkId", identityLinkId);
  if (organizationId) p.set("organizationId", organizationId);
  if (clientAppId) p.set("clientAppId", clientAppId);
  if (verificationSessionId) p.set("verificationSessionId", verificationSessionId);
  if (governanceCategory) p.set("governanceCategory", governanceCategory);
  if (entityType && entityType !== "other") p.set("entityType", entityType);
  if (severity) p.set("severity", severity.toLowerCase());
  if (riskEventsOnly) p.set("focus", "risk");
  if (conflictEventsOnly) p.set("focus", "conflict");

  const qs = p.toString();
  return qs.length > 0 ? `/audit-logs?${qs}` : "/audit-logs";
}
