/**
 * Frontend preview only: role labels and coarse UI permissions for the VerifyMe Platform Admin portal.
 * Real authorization must be enforced by the backend.
 */

export const PLATFORM_ROLE_STORAGE_KEY = "verifyme_platform_role";

export type PlatformRole =
  | "super_admin"
  | "platform_admin"
  | "operations"
  | "risk_analyst"
  | "compliance_auditor"
  | "finance_billing"
  | "technical_api";

export const PLATFORM_ROLES: PlatformRole[] = [
  "super_admin",
  "platform_admin",
  "operations",
  "risk_analyst",
  "compliance_auditor",
  "finance_billing",
  "technical_api",
];

export type PlatformNavSection =
  | "dashboard"
  | "organizations"
  | "verifyme_users"
  | "identity_links"
  | "client_apps"
  | "verification_sessions"
  | "billing"
  | "audit_logs"
  | "platform_team"
  | "settings";

export type PlatformAction =
  | "view_billing"
  | "manage_billing"
  | "view_risk"
  | "review_conflict"
  | "manage_client_apps"
  | "rotate_secret"
  | "manage_platform_team"
  | "change_platform_settings"
  | "export_audit"
  | "suspend_user"
  | "disable_organization";

/** Attention queue items (dashboard surfaces at most these five; order and subset are role-specific). */
export type AttentionQueueCardId =
  | "critical_users"
  | "conflicts"
  | "invoices"
  | "integrations"
  | "services";

export type DashboardActivityFilter = "governance" | "operational" | "billing" | "technical" | "risk_compliance";

export type PlatformDashboardConfig = {
  attentionCardOrder: AttentionQueueCardId[];
  /** Platform Snapshot KPI row (max five metrics enabled per role). */
  showPlatformOverview: boolean;
  overviewShowActiveOrganizations: boolean;
  overviewShowActiveUsers: boolean;
  overviewShowVerificationSessions: boolean;
  overviewShowIdProofFail: boolean;
  overviewShowSpend: boolean;
  showGovernanceActivity: boolean;
  activitySectionTitle: string;
  activityFilter: DashboardActivityFilter;
};

const SUPER_NAV: PlatformNavSection[] = [
  "dashboard",
  "organizations",
  "verifyme_users",
  "identity_links",
  "client_apps",
  "verification_sessions",
  "billing",
  "audit_logs",
  "platform_team",
  "settings",
];

const OPERATIONS_NAV: PlatformNavSection[] = [
  "dashboard",
  "organizations",
  "verifyme_users",
  "identity_links",
  "verification_sessions",
  "audit_logs",
];

const RISK_COMPLIANCE_NAV: PlatformNavSection[] = [
  "dashboard",
  "verifyme_users",
  "identity_links",
  "verification_sessions",
  "audit_logs",
];

const FINANCE_NAV: PlatformNavSection[] = ["dashboard", "organizations", "billing", "audit_logs"];

const TECHNICAL_NAV: PlatformNavSection[] = [
  "dashboard",
  "organizations",
  "client_apps",
  "verification_sessions",
  "audit_logs",
  "settings",
];

const NAV_BY_ROLE: Record<PlatformRole, PlatformNavSection[]> = {
  super_admin: SUPER_NAV,
  platform_admin: SUPER_NAV,
  operations: OPERATIONS_NAV,
  risk_analyst: RISK_COMPLIANCE_NAV,
  compliance_auditor: RISK_COMPLIANCE_NAV,
  finance_billing: FINANCE_NAV,
  technical_api: TECHNICAL_NAV,
};

/**
 * Sections that may be opened by URL even when not in the sidebar (read-only pages).
 * Compliance / Auditor: billing, client apps, platform team for review only.
 */
const ROUTE_ACCESS_EXTRA: Record<PlatformRole, PlatformNavSection[]> = {
  super_admin: [],
  platform_admin: [],
  operations: [],
  risk_analyst: [],
  compliance_auditor: ["billing", "client_apps", "platform_team"],
  finance_billing: [],
  technical_api: [],
};

export function navSectionsForRole(role: PlatformRole): PlatformNavSection[] {
  return NAV_BY_ROLE[role];
}

export function canShowNavSection(role: PlatformRole, section: PlatformNavSection): boolean {
  return NAV_BY_ROLE[role].includes(section);
}

/** Route guard: sidebar sections + explicit read-only extras (e.g. Compliance bookmarking Billing). */
export function canAccessPlatformRoute(role: PlatformRole, section: PlatformNavSection): boolean {
  return canShowNavSection(role, section) || ROUTE_ACCESS_EXTRA[role].includes(section);
}

/** @deprecated Use canShowNavSection — kept for banner logic if needed */
export function canViewPlatformSection(role: PlatformRole, section: PlatformNavSection): boolean {
  return canAccessPlatformRoute(role, section);
}

export function pathnameToSection(pathname: string): PlatformNavSection | null {
  const path = pathname.split("?")[0] ?? pathname;
  const normalized = path.replace(/\/+$/, "") || "/";
  if (normalized === "" || normalized === "/") return "dashboard";
  if (normalized.startsWith("/organizations")) return "organizations";
  if (normalized.startsWith("/verifyme-users")) return "verifyme_users";
  if (normalized.startsWith("/identity-links")) return "identity_links";
  if (normalized.startsWith("/client-apps")) return "client_apps";
  if (normalized.startsWith("/verification-sessions")) return "verification_sessions";
  if (normalized.startsWith("/billing")) return "billing";
  if (normalized.startsWith("/audit-logs")) return "audit_logs";
  if (normalized.startsWith("/platform-team")) return "platform_team";
  if (normalized.startsWith("/settings")) return "settings";
  return null;
}

export function platformRoleLabel(role: PlatformRole): string {
  const m: Record<PlatformRole, string> = {
    super_admin: "Super Admin",
    platform_admin: "Platform Admin",
    operations: "Operations",
    risk_analyst: "Risk Analyst",
    compliance_auditor: "Compliance / Auditor",
    finance_billing: "Finance / Billing",
    technical_api: "Technical / API Manager",
  };
  return m[role];
}

export function platformRoleDescription(role: PlatformRole): string {
  const m: Record<PlatformRole, string> = {
    super_admin: "Full platform administration and configuration preview.",
    platform_admin: "Broad administrative access with typical production guardrails.",
    operations: "Day-two operations: tenants, sessions, identity workflows, and triage.",
    risk_analyst: "Risk posture, conflicts, proof outcomes, and governance signals.",
    compliance_auditor: "Audit history and read-only review of records and policy evidence.",
    finance_billing: "Spend, credits, invoices, and billing-related audit context.",
    technical_api: "Client apps, integrations, verification delivery, and service health.",
  };
  return m[role];
}

export function isReadOnlyPreviewRole(role: PlatformRole): boolean {
  return role === "compliance_auditor";
}

/** True when the role may open a section from the sidebar but only for review (no mutations). */
export function isReadOnlyRouteForRole(role: PlatformRole, section: PlatformNavSection): boolean {
  if (role !== "compliance_auditor") return false;
  return ROUTE_ACCESS_EXTRA.compliance_auditor.includes(section);
}

/** Operator self-service (profile / security / notifications UI). Not platform RBAC. */
export type OperatorSelfServiceAction =
  | "reset_mfa"
  | "request_password_reset"
  | "revoke_other_session"
  | "sign_out_all_other_sessions";

/**
 * Compliance / Auditor: read-oriented security posture; no credential or MFA reset requests from this UI.
 * Session revocation for other devices remains available as self-service where shown.
 */
export function canPerformOperatorSecurityAction(role: PlatformRole, action: OperatorSelfServiceAction): boolean {
  if (role === "compliance_auditor") {
    return action === "revoke_other_session" || action === "sign_out_all_other_sessions";
  }
  return true;
}

export function canPerformPlatformAction(role: PlatformRole, action: PlatformAction): boolean {
  if (role === "compliance_auditor") {
    return action === "export_audit" || action === "view_risk" || action === "view_billing";
  }
  if (role === "finance_billing") {
    return ["view_billing", "manage_billing", "export_audit"].includes(action);
  }
  if (role === "technical_api") {
    return ["manage_client_apps", "rotate_secret", "change_platform_settings", "export_audit"].includes(action);
  }
  if (role === "risk_analyst") {
    return ["view_risk", "review_conflict", "export_audit"].includes(action);
  }
  if (role === "operations") {
    return ["view_risk", "review_conflict", "export_audit", "suspend_user"].includes(action);
  }
  if (role === "platform_admin") {
    if (action === "manage_platform_team") return false;
    return true;
  }
  return true;
}

export function getPlatformDashboardConfig(role: PlatformRole): PlatformDashboardConfig {
  if (role === "super_admin" || role === "platform_admin") {
    return {
      attentionCardOrder: ["critical_users", "conflicts", "invoices", "integrations", "services"],
      showPlatformOverview: true,
      overviewShowActiveOrganizations: true,
      overviewShowActiveUsers: true,
      overviewShowVerificationSessions: true,
      overviewShowIdProofFail: true,
      overviewShowSpend: true,
      showGovernanceActivity: true,
      activitySectionTitle: "Recent Governance Activity",
      activityFilter: "governance",
    };
  }

  if (role === "operations") {
    return {
      attentionCardOrder: ["critical_users", "conflicts", "integrations", "services"],
      showPlatformOverview: true,
      overviewShowActiveOrganizations: true,
      overviewShowActiveUsers: true,
      overviewShowVerificationSessions: true,
      overviewShowIdProofFail: true,
      overviewShowSpend: false,
      showGovernanceActivity: true,
      activitySectionTitle: "Recent Operational Activity",
      activityFilter: "operational",
    };
  }

  if (role === "risk_analyst") {
    return {
      attentionCardOrder: ["critical_users", "conflicts"],
      showPlatformOverview: true,
      overviewShowActiveOrganizations: false,
      overviewShowActiveUsers: true,
      overviewShowVerificationSessions: true,
      overviewShowIdProofFail: true,
      overviewShowSpend: false,
      showGovernanceActivity: true,
      activitySectionTitle: "Recent Governance Activity",
      activityFilter: "risk_compliance",
    };
  }

  if (role === "compliance_auditor") {
    return {
      attentionCardOrder: [],
      showPlatformOverview: true,
      overviewShowActiveOrganizations: true,
      overviewShowActiveUsers: true,
      overviewShowVerificationSessions: true,
      overviewShowIdProofFail: true,
      overviewShowSpend: false,
      showGovernanceActivity: true,
      activitySectionTitle: "Recent Governance Activity",
      activityFilter: "risk_compliance",
    };
  }

  if (role === "finance_billing") {
    return {
      attentionCardOrder: ["invoices"],
      showPlatformOverview: true,
      overviewShowActiveOrganizations: true,
      overviewShowActiveUsers: false,
      overviewShowVerificationSessions: true,
      overviewShowIdProofFail: false,
      overviewShowSpend: true,
      showGovernanceActivity: true,
      activitySectionTitle: "Recent Billing-Related Activity",
      activityFilter: "billing",
    };
  }

  // technical_api
  return {
    attentionCardOrder: ["integrations", "services"],
    showPlatformOverview: true,
    overviewShowActiveOrganizations: true,
    overviewShowActiveUsers: false,
    overviewShowVerificationSessions: true,
    overviewShowIdProofFail: false,
    overviewShowSpend: false,
    showGovernanceActivity: true,
    activitySectionTitle: "Recent Technical Activity",
    activityFilter: "technical",
  };
}

export function dashboardDrilldownLabel(
  role: PlatformRole,
  kind:
    | "open_list"
    | "open_audit"
    | "review_conflict"
    | "open_billing"
    | "open_org"
    | "view_detail"
    | "review_integrations",
): string {
  if (role === "compliance_auditor") {
    const m = {
      open_list: "View record",
      open_audit: "View audit log",
      review_conflict: "Review history",
      open_billing: "View audit log",
      open_org: "View record",
      view_detail: "View record",
      review_integrations: "View record",
    } as const;
    return m[kind];
  }
  const m = {
    open_list: "Open",
    open_audit: "View audit logs",
    review_conflict: "Review conflicts",
    open_billing: "Open billing",
    open_org: "Open organizations",
    view_detail: "View details",
    review_integrations: "Review integrations",
  } as const;
  return m[kind];
}

export function parseStoredPlatformRole(raw: string | null): PlatformRole | null {
  if (!raw) return null;
  return PLATFORM_ROLES.includes(raw as PlatformRole) ? (raw as PlatformRole) : null;
}

const BILLING_ACTION_PREFIXES = ["billing.", "invoice", "refund", "credits.", "plan."];

function isBillingAuditAction(action: string): boolean {
  const a = action.toLowerCase();
  return BILLING_ACTION_PREFIXES.some((p) => a.startsWith(p) || a.includes("invoice") || a.includes("payment"));
}

function isTechnicalAuditAction(action: string): boolean {
  const a = action.toLowerCase();
  return (
    a.startsWith("client_app.") ||
    a.startsWith("api_key.") ||
    a.startsWith("redirect_uri.") ||
    a.startsWith("verification_session.") ||
    a.startsWith("system.")
  );
}

function isOperationalAuditAction(action: string): boolean {
  const a = action.toLowerCase();
  return (
    a.startsWith("organization.") ||
    a.startsWith("identity_link.") ||
    a.startsWith("verifyme_user.") ||
    a.startsWith("verification_session.") ||
    a.startsWith("verification_policy.") ||
    a.startsWith("platform_settings.")
  );
}

function isRiskComplianceAuditAction(action: string): boolean {
  const a = action.toLowerCase();
  return (
    a.includes("risk") ||
    a.includes("conflict") ||
    a.startsWith("verifyme_user.") ||
    a.startsWith("identity_link.") ||
    a.startsWith("audit_policy.") ||
    a.startsWith("risk_policy.")
  );
}

/** Filter audit log actions for dashboard activity tables by preview role. */
export function auditActionVisibleInDashboardActivity(filter: DashboardActivityFilter, action: string): boolean {
  switch (filter) {
    case "governance":
      return true;
    case "operational":
      return isOperationalAuditAction(action) && !isBillingAuditAction(action);
    case "billing":
      return isBillingAuditAction(action);
    case "technical":
      return isTechnicalAuditAction(action);
    case "risk_compliance":
      return isRiskComplianceAuditAction(action);
    default:
      return true;
  }
}

export type PlatformSettingsCategoryId =
  | "general"
  | "verification_policy"
  | "risk_governance"
  | "organization_defaults"
  | "billing_policy"
  | "audit_retention"
  | "platform_team_policy"
  | "feature_controls"
  | "developer_internal";

export function settingsCategoriesForRole(role: PlatformRole): PlatformSettingsCategoryId[] | "all" {
  if (role === "super_admin") return "all";
  if (role === "platform_admin") {
    return [
      "general",
      "verification_policy",
      "risk_governance",
      "organization_defaults",
      "billing_policy",
      "audit_retention",
      "platform_team_policy",
      "feature_controls",
    ];
  }
  if (role === "technical_api") {
    return ["general", "verification_policy", "feature_controls"];
  }
  return [];
}
