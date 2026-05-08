/**
 * Audit Log Type Definitions
 * 
 * This file defines all types for audit logs aligned with AuditLogsSchema.md
 * Provides type safety and IntelliSense for audit log operations
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ActorType {
  PLATFORM_ADMIN = "Platform Admin",
  ORGANIZATION_ADMIN = "Organization Admin",
  ORGANIZATION_OWNER = "Organization Owner",
  ORGANIZATION_MEMBER = "Organization Member",
  SYSTEM = "System",
}

export enum AuditStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PENDING = "pending",
  WARNING = "warning",
}

export enum ActionCategory {
  SUBSCRIPTION = "subscription",
  BILLING = "billing",
  USER = "user",
  API_KEY = "api_key",
  SSO = "sso",
  MFA = "mfa",
  ORGANIZATION = "organization",
  SEATS = "seats",
  DATA = "data",
  BACKUP = "backup",
  COMPLIANCE = "compliance",
  POLICY = "policy",
  SYSTEM = "system",
  ADMIN = "admin",
}

// ============================================================================
// ACTION TYPES (Union)
// ============================================================================

export type AuditAction =
  // Plan (legacy audit namespace `subscription.*`; UI labels use Plan / Credits wording)
  | "subscription.upgraded"
  | "subscription.downgraded"
  | "subscription.cancelled"
  | "subscription.renewed"
  | "plan.changed"
  | "credits.added"
  | "invoice.generated"
  | "refund.requested"
  // Billing
  | "billing.invoice_generated"
  | "billing.invoice_sent"
  | "billing.payment_received"
  | "billing.payment_failed"
  | "billing.payment_refunded"
  | "billing.invoice_action_required"
  // Platform admin governance
  | "platform_admin.invited"
  | "platform_admin.role_changed"
  | "platform_admin.suspended"
  | "platform_admin.reactivated"
  | "platform_admin.disabled"
  | "platform_admin.mfa_reset_requested"
  | "platform_admin.force_signed_out"
  | "platform_admin.login_failed"
  | "platform_admin.permission_changed"
  // User Management
  | "user.invited"
  | "user.joined"
  | "user.role_changed"
  | "user.removed"
  | "user.deactivated"
  | "user.password_reset"
  // Security & Access
  | "api_key.created"
  | "api_key.rotated"
  | "api_key.revoked"
  | "sso.configured"
  | "sso.updated"
  | "sso.disabled"
  | "mfa.enabled"
  | "mfa.disabled"
  // Organization
  | "organization.created"
  | "organization.updated"
  | "organization.suspended"
  | "organization.reactivated"
  | "organization.deleted"
  | "organization.disable_requested"
  | "organization.archive_requested"
  | "seats.increased"
  | "seats.decreased"
  // Data Management
  | "data.exported"
  | "data.imported"
  | "data.deleted"
  | "backup.created"
  | "backup.restored"
  // Compliance
  | "compliance.audit_initiated"
  | "compliance.audit_completed"
  | "policy.created"
  | "policy.updated"
  | "policy.acknowledged"
  // System
  | "system.configuration_changed"
  | "system.maintenance_started"
  | "system.maintenance_completed"
  | "admin.login"
  | "admin.logout"
  // VerifyMe User governance (platform)
  | "verifyme_user.suspended"
  | "verifyme_user.reactivated"
  | "verifyme_user.disabled"
  | "verifyme_user.restored"
  | "verifyme_user.recovery_reset_requested"
  | "verifyme_user.risk_level_changed"
  | "verifyme_user.risk_reviewed"
  // Client app & redirect URI governance
  | "client_app.created"
  | "client_app.secret_rotated"
  | "client_app.disabled"
  | "redirect_uri.added"
  | "redirect_uri.disabled"
  // Platform settings governance
  | "platform_settings.updated"
  | "verification_policy.updated"
  | "risk_policy.updated"
  | "organization_defaults.updated"
  | "billing_policy.updated"
  | "audit_policy.updated"
  | "feature_control.updated"
  // Identity links
  | "identity_link.created"
  | "identity_link.conflict_detected"
  | "identity_link.conflict_reviewed"
  | "identity_link.conflict_resolved"
  | "identity_link.conflict_reopened"
  | "identity_link.name_match_evaluated"
  | "identity_link.revoked"
  | "identity_link.suspended"
  // Verification session lifecycle
  | "verification_session.started"
  | "verification_session.verified"
  | "verification_session.failed"
  | "verification_session.completed"
  | "verification_session.expired"
  | "verification_session.error";

// ============================================================================
// BASE INTERFACES
// ============================================================================

/** Triage level for operators; distinct from outcome `status`. */
export type AuditSeverityLevel = "info" | "low" | "medium" | "high" | "critical";

/** Operator-facing governance bucket for filters and dashboards (distinct from legacy table facet). */
export type GovernanceCategory = "Risk" | "Identity" | "Security" | "Verification" | "Governance" | "Billing";

/** Four-level governance severity shown in VerifyMe Admin audit UI. */
export type GovernanceSeverityLabel = "Informational" | "Warning" | "High" | "Critical";

export interface AuditChangeTrackingEntry {
  /** Field or aspect that changed (no raw credential or comparison payloads). */
  label: string;
  before: string;
  after: string;
}

export interface BaseAuditLog {
  id: string; // LOG-XXXX format
  organizationId: string;
  organization: string;
  actor: string; // email or "system"
  actorType: ActorType;
  timestamp: string; // ISO 8601 UTC
  action: AuditAction;
  status: AuditStatus;
  ipAddress: string; // IP or "N/A"
  userAgent?: string;
  details: string; // Human-readable description
  payload?: Record<string, unknown>; // Action-specific data
  /** Primary subject shown in list/modal Target column (mask IDs where appropriate). */
  target?: string;
  /** Operator triage; optional — derived in UI when omitted. */
  severity?: AuditSeverityLevel;
  /** Explicit governance bucket; when omitted, {@link deriveGovernanceCategoryFromAction} is used. */
  governanceCategory?: GovernanceCategory;
  /** Safe before/after fields for accountable change review (never secrets). */
  changeTracking?: AuditChangeTrackingEntry[];
  requestRef?: string;
  sessionRef?: string;
  /** Deep links on detail modal when ids exist in the sample dataset */
  relatedVerifymeUserId?: string;
  /** Public VerifyMe ID for admin navigation (vm…) — preferred over internal UUID in UI. */
  relatedVerifymeId?: string;
  relatedClientAppId?: string;
  relatedIdentityLinkId?: string;
  relatedVerificationSessionId?: string;
  relatedPlatformAdminId?: string;
}

// ============================================================================
// Plan log interfaces (legacy `subscription.*` action strings)
// ============================================================================

export interface SubscriptionUpgradedLog extends BaseAuditLog {
  action: "subscription.upgraded";
  payload: {
    previousPlan: string;
    newPlan: string;
    billingChange?: number;
  };
}

export interface SubscriptionDowngradedLog extends BaseAuditLog {
  action: "subscription.downgraded";
  payload: {
    previousPlan: string;
    newPlan: string;
    refundAmount?: number;
  };
}

export interface SubscriptionCancelledLog extends BaseAuditLog {
  action: "subscription.cancelled";
  payload: {
    cancelledPlan: string;
    reason?: string;
    finalBillingAmount: number;
  };
}

export interface SubscriptionRenewedLog extends BaseAuditLog {
  action: "subscription.renewed";
  payload: {
    planType: string;
    billingPeriodFrom: string;
    billingPeriodTo: string;
    amountCharged: number;
    paymentMethod: string;
  };
}

// ============================================================================
// BILLING LOG INTERFACES
// ============================================================================

export interface InvoiceGeneratedLog extends BaseAuditLog {
  action: "billing.invoice_generated";
  payload: {
    invoiceId: string;
    amount: number;
    billingPeriodFrom: string;
    billingPeriodTo: string;
    invoiceStatus: "draft" | "sent" | "paid" | "overdue";
    lineItemsCount: number;
  };
}

export interface PaymentReceivedLog extends BaseAuditLog {
  action: "billing.payment_received";
  payload: {
    invoiceId?: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  };
}

export interface PaymentFailedLog extends BaseAuditLog {
  action: "billing.payment_failed";
  payload: {
    invoiceId?: string;
    attemptedAmount: number;
    paymentMethod: string;
    failureReason: string;
    retryCount: number;
  };
}

export interface PaymentRefundedLog extends BaseAuditLog {
  action: "billing.payment_refunded";
  payload: {
    originalTransactionId: string;
    refundAmount: number;
    reason: string;
  };
}

// ============================================================================
// USER MANAGEMENT LOG INTERFACES
// ============================================================================

export interface UserInvitedLog extends BaseAuditLog {
  action: "user.invited";
  payload: {
    invitedUserEmail: string;
    roleAssigned: string;
    invitationExpiryDate: string;
  };
}

export interface UserRoleChangedLog extends BaseAuditLog {
  action: "user.role_changed";
  payload: {
    userEmail: string;
    previousRole: string;
    newRole: string;
  };
}

export interface UserRemovedLog extends BaseAuditLog {
  action: "user.removed";
  payload: {
    userEmail: string;
    reason?: string;
  };
}

export interface UserPasswordResetLog extends BaseAuditLog {
  action: "user.password_reset";
  payload: {
    userEmail: string;
    resetLinkExpiry: string;
  };
}

// ============================================================================
// SECURITY & API KEY LOG INTERFACES
// ============================================================================

export interface ApiKeyCreatedLog extends BaseAuditLog {
  action: "api_key.created";
  payload: {
    keyId: string; // Masked
    keyName: string;
    scopes: string[];
    expiryDate?: string;
  };
}

export interface ApiKeyRotatedLog extends BaseAuditLog {
  action: "api_key.rotated";
  payload: {
    oldKeyId: string; // Masked
    newKeyId: string; // Masked
    reason?: string;
  };
}

export interface SsoConfiguredLog extends BaseAuditLog {
  action: "sso.configured";
  payload: {
    ssoProvider: string;
    enabled: boolean;
  };
}

export interface MfaEnabledLog extends BaseAuditLog {
  action: "mfa.enabled";
  payload: {
    userEmail?: string;
    mfaMethod: "sms" | "authenticator" | "email";
    scope: "organization" | "user";
  };
}

// ============================================================================
// ORGANIZATION LOG INTERFACES
// ============================================================================

export interface OrganizationCreatedLog extends BaseAuditLog {
  action: "organization.created";
  payload: {
    planType: string;
    adminEmail: string;
  };
}

export interface OrganizationSuspendedLog extends BaseAuditLog {
  action: "organization.suspended";
  payload: {
    reason: string;
    duration: "temporary" | "permanent";
  };
}

export interface SeatsChangedLog extends BaseAuditLog {
  action: "seats.increased" | "seats.decreased";
  payload: {
    previousSeatLimit: number;
    newSeatLimit: number;
    reason?: string;
  };
}

// ============================================================================
// DATA MANAGEMENT LOG INTERFACES
// ============================================================================

export interface DataExportedLog extends BaseAuditLog {
  action: "data.exported";
  payload: {
    exportScope: "all" | "specific_user" | "specific_data_type";
    dataTypes: string[];
    fileFormat: "csv" | "json" | "pdf";
    fileSize: number; // bytes
  };
}

export interface DataDeletedLog extends BaseAuditLog {
  action: "data.deleted";
  payload: {
    dataType: string;
    recordsAffected: number;
    reason?: string;
    backupCreated: boolean;
  };
}

export interface BackupRestoredLog extends BaseAuditLog {
  action: "backup.restored";
  payload: {
    backupId: string;
    backupDate: string;
    restoreScope: string;
    reason: string;
  };
}

// ============================================================================
// COMPLIANCE & POLICY LOG INTERFACES
// ============================================================================

export interface ComplianceAuditInitiatedLog extends BaseAuditLog {
  action: "compliance.audit_initiated";
  payload: {
    auditType: string;
    auditScope: string;
    expectedCompletion: string;
  };
}

export interface PolicyCreatedLog extends BaseAuditLog {
  action: "policy.created";
  payload: {
    policyName: string;
    policyType: string;
    policyVersion: string;
    effectiveDate: string;
  };
}

// ============================================================================
// SYSTEM & ADMIN LOG INTERFACES
// ============================================================================

export interface SystemConfigurationLog extends BaseAuditLog {
  action: "system.configuration_changed";
  payload: {
    configurationItem: string;
    previousValue: string;
    newValue: string;
    changeReason?: string;
  };
}

export interface AdminLoginLog extends BaseAuditLog {
  action: "admin.login";
  payload: {
    adminEmail: string;
    mfaUsed: boolean;
    browser?: string;
  };
}

// ============================================================================
// UNION TYPE FOR ALL AUDIT LOGS
// ============================================================================

export type AuditLog = BaseAuditLog;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get action category from action type (legacy coloring bucket).
 * Prefer {@link getCategoryColorForAction} for UI accents — unknown namespaces resolve safely.
 */
export function getActionCategory(action: AuditAction): ActionCategory {
  const [category] = action.split(".");
  const legacyMap: Record<string, ActionCategory> = {
    subscription: ActionCategory.SUBSCRIPTION,
    billing: ActionCategory.BILLING,
    plan: ActionCategory.SUBSCRIPTION,
    credits: ActionCategory.BILLING,
    invoice: ActionCategory.BILLING,
    refund: ActionCategory.BILLING,
    user: ActionCategory.USER,
    organization: ActionCategory.ORGANIZATION,
    api_key: ActionCategory.API_KEY,
    sso: ActionCategory.SSO,
    mfa: ActionCategory.MFA,
    admin: ActionCategory.ADMIN,
    system: ActionCategory.SYSTEM,
  };
  return legacyMap[category] ?? ActionCategory.SYSTEM;
}

/** Human-readable event label for tables and modal headers. */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "subscription.upgraded": "Plan upgraded",
    "subscription.downgraded": "Plan downgraded",
    "subscription.cancelled": "Plan cancelled",
    "subscription.renewed": "Plan renewed",
    "plan.changed": "Plan changed",
    "credits.added": "Credits added",
    "invoice.generated": "Invoice generated",
    "refund.requested": "Refund requested",
    "billing.invoice_generated": "Invoice generated",
    "billing.invoice_sent": "Invoice Sent",
    "billing.payment_received": "Payment Received",
    "billing.payment_failed": "Payment Failed",
    "billing.payment_refunded": "Payment Refunded",
    "billing.invoice_action_required": "Invoice action required",
    "platform_admin.invited": "Platform admin invited",
    "platform_admin.role_changed": "Platform admin role changed",
    "platform_admin.suspended": "Platform admin suspended",
    "platform_admin.reactivated": "Platform admin reactivated",
    "platform_admin.disabled": "Platform admin disabled",
    "platform_admin.mfa_reset_requested": "Platform admin MFA reset requested",
    "platform_admin.force_signed_out": "Platform admin force signed out",
    "platform_admin.login_failed": "Platform admin login failed",
    "platform_admin.permission_changed": "Platform admin permission changed",
    "user.invited": "User Invited",
    "user.joined": "User Joined",
    "user.role_changed": "Role Changed",
    "user.removed": "User Removed",
    "user.deactivated": "User Deactivated",
    "user.password_reset": "Password Reset",
    "api_key.created": "API Key Created",
    "api_key.rotated": "API Key Rotated",
    "api_key.revoked": "API Key Revoked",
    "sso.configured": "SSO Configured",
    "sso.updated": "SSO Updated",
    "sso.disabled": "SSO Disabled",
    "mfa.enabled": "MFA Enabled",
    "mfa.disabled": "MFA Disabled",
    "organization.created": "Organization created",
    "organization.updated": "Organization updated",
    "organization.suspended": "Organization suspended",
    "organization.reactivated": "Organization reactivated",
    "organization.deleted": "Organization deleted",
    "organization.disable_requested": "Organization disable requested",
    "organization.archive_requested": "Organization archive requested",
    "seats.increased": "Seats Increased",
    "seats.decreased": "Seats Decreased",
    "data.exported": "Data Exported",
    "data.imported": "Data Imported",
    "data.deleted": "Data Deleted",
    "backup.created": "Backup Created",
    "backup.restored": "Backup Restored",
    "compliance.audit_initiated": "Audit Initiated",
    "compliance.audit_completed": "Audit Completed",
    "policy.created": "Policy Created",
    "policy.updated": "Policy Updated",
    "policy.acknowledged": "Policy Acknowledged",
    "system.configuration_changed": "Configuration Changed",
    "system.maintenance_started": "Maintenance Started",
    "system.maintenance_completed": "Maintenance Completed",
    "admin.login": "Admin login",
    "admin.logout": "Admin logout",
    "verifyme_user.suspended": "VerifyMe user suspended",
    "verifyme_user.reactivated": "VerifyMe user reactivated",
    "verifyme_user.disabled": "VerifyMe user disabled",
    "verifyme_user.restored": "VerifyMe user restored",
    "verifyme_user.recovery_reset_requested": "VerifyMe recovery reset requested",
    "verifyme_user.risk_level_changed": "VerifyMe risk level changed",
    "verifyme_user.risk_reviewed": "VerifyMe risk reviewed",
    "client_app.created": "Client app created",
    "client_app.secret_rotated": "Client secret rotated",
    "client_app.disabled": "Client app disabled",
    "redirect_uri.added": "Redirect URI added",
    "redirect_uri.disabled": "Redirect URI disabled",
    "platform_settings.updated": "Platform settings updated",
    "verification_policy.updated": "Verification policy updated",
    "risk_policy.updated": "Risk policy updated",
    "organization_defaults.updated": "Organization defaults updated",
    "billing_policy.updated": "Billing policy updated",
    "audit_policy.updated": "Audit policy updated",
    "feature_control.updated": "Feature control updated",
    "identity_link.created": "Identity link created",
    "identity_link.conflict_detected": "Identity link conflict detected",
    "identity_link.conflict_reviewed": "Identity link conflict reviewed",
    "identity_link.conflict_resolved": "Identity link conflict resolved",
    "identity_link.conflict_reopened": "Identity link conflict reopened",
    "identity_link.name_match_evaluated": "Identity link name match evaluated",
    "identity_link.revoked": "Identity link revoked",
    "identity_link.suspended": "Identity link suspended",
    "verification_session.started": "Verification session started",
    "verification_session.verified": "Verification session verified",
    "verification_session.failed": "Verification session failed",
    "verification_session.completed": "Verification session completed",
    "verification_session.expired": "Verification session expired",
    "verification_session.error": "Verification session error",
  };
  return labels[action] ?? action.replace(/\./g, " · ");
}

/** Filter / table facet — product-facing category column. */
export function getAuditTableCategory(action: string): string {
  if (action.startsWith("organization.")) return "Organization";
  if (
    action.startsWith("platform_settings.") ||
    action.startsWith("verification_policy.") ||
    action.startsWith("risk_policy.") ||
    action.startsWith("organization_defaults.") ||
    action.startsWith("billing_policy.") ||
    action.startsWith("audit_policy.") ||
    action.startsWith("feature_control.")
  ) {
    return "Platform settings";
  }
  if (action.startsWith("verifyme_user.")) return "VerifyMe User";
  if (action.startsWith("platform_admin.")) return "Platform admin";
  if (action.startsWith("client_app.") || action.startsWith("redirect_uri.")) return "Client app / API";
  if (action.startsWith("identity_link.")) return "Identity link";
  if (action.startsWith("verification_session.")) return "Verification session";
  if (
    action.startsWith("subscription.") ||
    action.startsWith("billing.") ||
    action.startsWith("plan.") ||
    action.startsWith("credits.") ||
    action.startsWith("invoice.") ||
    action.startsWith("refund.")
  ) {
    return "Billing & credits";
  }
  if (action.startsWith("mfa.") || action.startsWith("api_key.") || action.startsWith("sso.")) return "Security";
  if (action.startsWith("user.")) return "Org users";
  if (action.startsWith("admin.") || action.startsWith("system.")) return "System & admin";
  return "Other";
}

/** Which summary card on the Audit Logs page (mutually exclusive buckets). */
export type AuditSummaryBucket = "security" | "admin" | "integration" | "billing";

export function getAuditSummaryBucket(action: string): AuditSummaryBucket {
  if (/^(subscription\.|billing\.|plan\.|credits\.|invoice\.|refund\.)/.test(action)) return "billing";
  if (/^(mfa\.|api_key\.|sso\.|admin\.login|admin\.logout)/.test(action)) return "security";
  if (/^(client_app\.|redirect_uri\.|identity_link\.|verification_session\.)/.test(action)) return "integration";
  if (/^platform_admin\./.test(action)) return "admin";
  if (
    /^(platform_settings\.|verification_policy\.|risk_policy\.|organization_defaults\.|billing_policy\.|audit_policy\.|feature_control\.)/.test(
      action,
    )
  ) {
    return "admin";
  }
  return "admin";
}

/** Tailwind text color for event label by action namespace. */
export function getCategoryColorForAction(action: string): string {
  const prefix = action.split(".")[0] ?? "";
  const map: Record<string, string> = {
    subscription: "text-blue-600",
    billing: "text-emerald-600",
    plan: "text-blue-600",
    credits: "text-emerald-600",
    invoice: "text-emerald-600",
    refund: "text-emerald-600",
    user: "text-purple-600",
    verifyme_user: "text-violet-600",
    platform_admin: "text-fuchsia-600",
    organization: "text-indigo-600",
    client_app: "text-cyan-600",
    redirect_uri: "text-cyan-600",
    identity_link: "text-teal-600",
    verification_session: "text-sky-600",
    platform_settings: "text-violet-600",
    verification_policy: "text-violet-600",
    risk_policy: "text-violet-600",
    organization_defaults: "text-violet-600",
    billing_policy: "text-violet-600",
    audit_policy: "text-violet-600",
    feature_control: "text-violet-600",
    api_key: "text-red-600",
    sso: "text-red-600",
    mfa: "text-red-600",
    admin: "text-slate-600",
    system: "text-slate-500",
    compliance: "text-amber-600",
    policy: "text-amber-600",
    seats: "text-indigo-600",
    data: "text-cyan-600",
    backup: "text-cyan-600",
  };
  return map[prefix] ?? "text-foreground";
}

const SENSITIVE_PAYLOAD_KEY_PARTS = [
  "otp",
  "verification_token",
  "verificationtoken",
  "encrypted_auth_cred",
  "transaction_code",
  "client_secret",
  "private_key",
  "auth_code",
  "id_token",
  "qr_payload",
  "raw_",
] as const;

export function isSensitivePayloadKey(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_PAYLOAD_KEY_PARTS.some((frag) => k.includes(frag));
}

export function redactPayloadForDisplay(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!payload) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    out[key] = isSensitivePayloadKey(key) ? "[redacted]" : value;
  }
  return out;
}

export function deriveAuditSeverity(log: BaseAuditLog): AuditSeverityLevel {
  if (log.severity) return log.severity;
  if (log.status === AuditStatus.FAILED) return "high";
  if (log.status === AuditStatus.WARNING) return "medium";
  if (log.status === AuditStatus.PENDING) return "low";
  return "info";
}

/** Maps internal triage bands to governance severity labels for operators. */
export function deriveGovernanceSeverityLabel(log: BaseAuditLog): GovernanceSeverityLabel {
  const internal = deriveAuditSeverity(log);
  if (internal === "info" || internal === "low") return "Informational";
  if (internal === "medium") return "Warning";
  if (internal === "high") return "High";
  return "Critical";
}

/** Primary governance category for filtering and KPIs (overridable per log row). */
export function getGovernanceCategoryForLog(log: BaseAuditLog): GovernanceCategory {
  if (log.governanceCategory) return log.governanceCategory;
  return deriveGovernanceCategoryFromAction(log.action);
}

export function deriveGovernanceCategoryFromAction(action: string): GovernanceCategory {
  if (action === "verifyme_user.risk_level_changed") return "Risk";
  if (action === "verifyme_user.risk_reviewed") return "Risk";
  if (/^platform_admin\.(mfa_reset_requested|force_signed_out|login_failed|suspended|disabled|reactivated)/.test(action)) {
    return "Security";
  }
  if (
    /^(platform_settings\.|verification_policy\.|risk_policy\.|organization_defaults\.|billing_policy\.|audit_policy\.|feature_control\.)/.test(
      action,
    )
  ) {
    return "Governance";
  }
  if (/^platform_admin\./.test(action)) return "Governance";
  if (
    /^billing\.|^subscription\.|^plan\.|^credits\.|^invoice\.|^refund\./.test(action)
  ) {
    return "Billing";
  }
  if (action.startsWith("identity_link.")) return "Identity";
  if (action.startsWith("verification_session.")) return "Verification";
  if (/^(mfa\.|api_key\.|sso\.|admin\.login|admin\.logout)/.test(action)) return "Security";
  return "Governance";
}

/** Entity facet for cross-linking from detail pages to audit logs. */
export type AuditEntityType =
  | "organization"
  | "verifyme_user"
  | "platform_admin"
  | "identity_link"
  | "client_app"
  | "verification_session"
  | "billing"
  | "other";

export function deriveAuditEntityType(log: BaseAuditLog): AuditEntityType {
  const a = log.action;
  if (/^organization\.|^seats\./.test(a)) return "organization";
  if (/^verifyme_user\./.test(a)) return "verifyme_user";
  if (/^platform_admin\./.test(a)) return "platform_admin";
  if (/^identity_link\./.test(a)) return "identity_link";
  if (/^client_app\.|^redirect_uri\./.test(a)) return "client_app";
  if (/^verification_session\./.test(a)) return "verification_session";
  if (/^billing\.|^subscription\.|^plan\.|^credits\.|^invoice\.|^refund\./.test(a)) return "billing";
  return "other";
}

const CONFLICT_WORKFLOW_ACTIONS: ReadonlySet<string> = new Set([
  "identity_link.conflict_detected",
  "identity_link.conflict_reviewed",
  "identity_link.conflict_resolved",
  "identity_link.conflict_reopened",
]);

export function isConflictWorkflowAuditEvent(log: BaseAuditLog): boolean {
  return CONFLICT_WORKFLOW_ACTIONS.has(log.action);
}

export function isRiskGovernanceAuditEvent(log: BaseAuditLog): boolean {
  return getGovernanceCategoryForLog(log) === "Risk";
}

export function governanceSeverityBadgeClass(label: GovernanceSeverityLabel): string {
  const map: Record<GovernanceSeverityLabel, string> = {
    Informational: "bg-slate-500/10 text-slate-700 border-slate-200",
    Warning: "bg-amber-500/10 text-amber-800 border-amber-200",
    High: "bg-orange-500/10 text-orange-800 border-orange-200",
    Critical: "bg-red-500/10 text-red-800 border-red-200",
  };
  return map[label];
}

/**
 * Get color for action category
 */
export function getCategoryColor(category: ActionCategory): string {
  const colors: Record<ActionCategory, string> = {
    [ActionCategory.SUBSCRIPTION]: "text-blue-600",
    [ActionCategory.BILLING]: "text-green-600",
    [ActionCategory.USER]: "text-purple-600",
    [ActionCategory.API_KEY]: "text-indigo-600",
    [ActionCategory.SSO]: "text-red-600",
    [ActionCategory.MFA]: "text-red-600",
    [ActionCategory.ORGANIZATION]: "text-red-600",
    [ActionCategory.SEATS]: "text-indigo-600",
    [ActionCategory.DATA]: "text-cyan-600",
    [ActionCategory.BACKUP]: "text-cyan-600",
    [ActionCategory.COMPLIANCE]: "text-amber-600",
    [ActionCategory.POLICY]: "text-amber-600",
    [ActionCategory.SYSTEM]: "text-gray-600",
    [ActionCategory.ADMIN]: "text-gray-600",
  };
  return colors[category] || "text-foreground";
}
