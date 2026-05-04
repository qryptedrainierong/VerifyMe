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
  // Plan (legacy audit namespace `subscription.*`)
  | "subscription.upgraded"
  | "subscription.downgraded"
  | "subscription.cancelled"
  | "subscription.renewed"
  // Billing
  | "billing.invoice_generated"
  | "billing.invoice_sent"
  | "billing.payment_received"
  | "billing.payment_failed"
  | "billing.payment_refunded"
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
  | "admin.logout";

// ============================================================================
// BASE INTERFACES
// ============================================================================

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
 * Get action category from action type
 */
export function getActionCategory(action: AuditAction): ActionCategory {
  const [category] = action.split(".");
  return category as ActionCategory;
}

/**
 * Get human-readable action name
 */
export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    "subscription.upgraded": "Plan Upgraded",
    "subscription.downgraded": "Plan Downgraded",
    "subscription.cancelled": "Plan Cancelled",
    "subscription.renewed": "Plan Renewed",
    "billing.invoice_generated": "Invoice Generated",
    "billing.invoice_sent": "Invoice Sent",
    "billing.payment_received": "Payment Received",
    "billing.payment_failed": "Payment Failed",
    "billing.payment_refunded": "Payment Refunded",
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
    "organization.created": "Organization Created",
    "organization.updated": "Organization Updated",
    "organization.suspended": "Organization Suspended",
    "organization.reactivated": "Organization Reactivated",
    "organization.deleted": "Organization Deleted",
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
    "admin.login": "Admin Login",
    "admin.logout": "Admin Logout",
  };
  return labels[action] || action;
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
