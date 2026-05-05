import { Search, Filter, Download, Calendar, ArrowUpDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Card } from "../../shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import {
  AuditLog,
  ActorType,
  AuditStatus,
  getActionCategory,
  getActionLabel,
  getCategoryColor,
} from "../../shared/types/auditLog";
import { PortalPageFrame } from "../../shared/components/PortalPageFrame";

/**
 * Utility Functions
 */

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
};

const getStatusBadgeColor = (status: AuditStatus) => {
  switch (status) {
    case AuditStatus.SUCCESS:
      return "bg-green-500/10 text-green-700 border-green-200";
    case AuditStatus.FAILED:
      return "bg-red-500/10 text-red-700 border-red-200";
    case AuditStatus.PENDING:
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case AuditStatus.WARNING:
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getStatusLabel = (status: AuditStatus) => {
  const labels: Record<AuditStatus, string> = {
    [AuditStatus.SUCCESS]: "Success",
    [AuditStatus.FAILED]: "Failed",
    [AuditStatus.PENDING]: "Pending",
    [AuditStatus.WARNING]: "Warning",
  };
  return labels[status];
};

const AUDIT_LOGS_PER_PAGE = 10;

const createMockAuditLog = (log: AuditLog): AuditLog => ({
  userAgent: log.actor === "system" ? undefined : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  ...log,
});

const auditLogs: AuditLog[] = [
  createMockAuditLog({
    id: "LOG-8944",
    timestamp: "2024-04-12T16:45:12Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "subscription.upgraded",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.100",
    details: "Upgraded from Professional to Enterprise",
    payload: { previousPlan: "Professional", newPlan: "Enterprise", billingChange: 500 },
  }),
  createMockAuditLog({
    id: "LOG-8943",
    timestamp: "2024-04-12T16:18:44Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Beacon Health",
    organizationId: "ORG-008",
    action: "subscription.downgraded",
    status: AuditStatus.WARNING,
    ipAddress: "192.168.1.101",
    details: "Downgraded plan after usage review",
    payload: { previousPlan: "Enterprise", newPlan: "Professional", refundAmount: 200 },
  }),
  createMockAuditLog({
    id: "LOG-8942",
    timestamp: "2024-04-12T15:57:09Z",
    actor: "owner@northstar.io",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Northstar Retail",
    organizationId: "ORG-009",
    action: "subscription.cancelled",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.15",
    details: "Cancelled plan at renewal boundary",
    payload: {
      cancelledPlan: "Starter",
      reason: "Migrated to annual reseller contract",
      finalBillingAmount: 199,
    },
  }),
  createMockAuditLog({
    id: "LOG-8941",
    timestamp: "2024-04-12T15:21:33Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    action: "subscription.renewed",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Annual enterprise plan renewed automatically",
    payload: {
      planType: "Enterprise",
      billingPeriodFrom: "2024-04-12",
      billingPeriodTo: "2025-04-11",
      amountCharged: 12000,
      paymentMethod: "ACH",
    },
  }),
  createMockAuditLog({
    id: "LOG-8940",
    timestamp: "2024-04-12T14:58:26Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "billing.invoice_generated",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Monthly invoice generated automatically",
    payload: {
      invoiceId: "INV-2024-0501",
      amount: 2500,
      billingPeriodFrom: "2024-03-12",
      billingPeriodTo: "2024-04-11",
      invoiceStatus: "draft",
      lineItemsCount: 4,
    },
  }),
  createMockAuditLog({
    id: "LOG-8939",
    timestamp: "2024-04-12T14:43:17Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "billing.invoice_sent",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Invoice sent to billing contacts",
    payload: { invoiceId: "INV-2024-0501", recipients: 3, deliveryMethod: "email" },
  }),
  createMockAuditLog({
    id: "LOG-8938",
    timestamp: "2024-04-12T14:19:02Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    action: "billing.payment_received",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Invoice paid successfully",
    payload: {
      invoiceId: "INV-2024-0492",
      amount: 1250,
      paymentMethod: "Wire transfer",
      transactionId: "txn_01HXS4Q8ZD2",
    },
  }),
  createMockAuditLog({
    id: "LOG-8937",
    timestamp: "2024-04-12T13:51:11Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Global Ventures",
    organizationId: "ORG-003",
    action: "billing.payment_failed",
    status: AuditStatus.FAILED,
    ipAddress: "N/A",
    details: "Payment method declined",
    payload: {
      invoiceId: "INV-2024-0488",
      attemptedAmount: 2500,
      paymentMethod: "Credit Card (****4242)",
      failureReason: "Card declined",
      retryCount: 1,
    },
  }),
  createMockAuditLog({
    id: "LOG-8936",
    timestamp: "2024-04-12T13:24:48Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Northstar Retail",
    organizationId: "ORG-009",
    action: "billing.payment_refunded",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.102",
    details: "Issued goodwill refund after support escalation",
    payload: {
      originalTransactionId: "txn_01HXS2Q7AA9",
      refundAmount: 149,
      reason: "Duplicate charge",
    },
  }),
  createMockAuditLog({
    id: "LOG-8935",
    timestamp: "2024-04-12T13:01:34Z",
    actor: "john@acme.com",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "user.invited",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.45",
    details: "Invited new user with Admin role",
    payload: {
      invitedUserEmail: "sarah@acme.com",
      roleAssigned: "Administrator",
      invitationExpiryDate: "2024-04-19T13:01:34Z",
    },
  }),
  createMockAuditLog({
    id: "LOG-8934",
    timestamp: "2024-04-12T12:47:21Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "user.joined",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Invited user accepted and joined workspace",
    payload: { userEmail: "sarah@acme.com", onboardingMethod: "email_invite" },
  }),
  createMockAuditLog({
    id: "LOG-8933",
    timestamp: "2024-04-12T12:33:56Z",
    actor: "michael@global.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Global Ventures",
    organizationId: "ORG-003",
    action: "user.role_changed",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.23",
    details: "Promoted analyst to workspace admin",
    payload: {
      userEmail: "alex@global.com",
      previousRole: "Analyst",
      newRole: "Administrator",
    },
  }),
  createMockAuditLog({
    id: "LOG-8932",
    timestamp: "2024-04-12T12:02:18Z",
    actor: "owner@beaconhealth.com",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Beacon Health",
    organizationId: "ORG-008",
    action: "user.removed",
    status: AuditStatus.WARNING,
    ipAddress: "198.51.100.54",
    details: "Removed contractor account after project end",
    payload: { userEmail: "contractor@vendor.com", reason: "Contract completed" },
  }),
  createMockAuditLog({
    id: "LOG-8931",
    timestamp: "2024-04-12T11:38:45Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    action: "user.deactivated",
    status: AuditStatus.WARNING,
    ipAddress: "N/A",
    details: "Dormant account automatically deactivated",
    payload: { userEmail: "olduser@designpro.com", inactivityDays: 120 },
  }),
  createMockAuditLog({
    id: "LOG-8930",
    timestamp: "2024-04-12T11:14:39Z",
    actor: "lisa@financecorp.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "user.password_reset",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.67",
    details: "Password reset initiated for locked account",
    payload: {
      userEmail: "james@financecorp.com",
      resetLinkExpiry: "2024-04-12T12:14:39Z",
    },
  }),
  createMockAuditLog({
    id: "LOG-8929",
    timestamp: "2024-04-12T10:49:50Z",
    actor: "devops@cloudscale.io",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    action: "api_key.created",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.89",
    details: "Created new staging API key",
    payload: {
      keyId: "sk_stage_****1029",
      keyName: "Staging automation",
      scopes: ["audit:read", "user:write"],
      expiryDate: "2025-04-12",
    },
  }),
  createMockAuditLog({
    id: "LOG-8928",
    timestamp: "2024-04-12T10:23:12Z",
    actor: "michael@global.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Global Ventures",
    organizationId: "ORG-003",
    action: "api_key.rotated",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.23",
    details: "Rotated production API key",
    payload: {
      oldKeyId: "sk_prod_****wxyz",
      newKeyId: "sk_prod_****abcd",
      reason: "Scheduled security rotation",
    },
  }),
  createMockAuditLog({
    id: "LOG-8927",
    timestamp: "2024-04-12T10:01:07Z",
    actor: "owner@northstar.io",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Northstar Retail",
    organizationId: "ORG-009",
    action: "api_key.revoked",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.15",
    details: "Revoked vendor integration key after incident review",
    payload: { keyId: "sk_live_****7788", reason: "Third-party integration retired" },
  }),
  createMockAuditLog({
    id: "LOG-8926",
    timestamp: "2024-04-12T09:37:33Z",
    actor: "lisa@financecorp.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "sso.configured",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.67",
    details: "Configured Okta SSO integration",
    payload: { ssoProvider: "okta", enabled: true },
  }),
  createMockAuditLog({
    id: "LOG-8925",
    timestamp: "2024-04-12T09:14:56Z",
    actor: "lisa@financecorp.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "sso.updated",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.67",
    details: "Updated SSO certificate and callback URL",
    payload: { ssoProvider: "okta", fieldsChanged: ["certificate", "acsUrl"] },
  }),
  createMockAuditLog({
    id: "LOG-8924",
    timestamp: "2024-04-12T08:52:40Z",
    actor: "owner@beaconhealth.com",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Beacon Health",
    organizationId: "ORG-008",
    action: "sso.disabled",
    status: AuditStatus.WARNING,
    ipAddress: "198.51.100.54",
    details: "Disabled SSO during identity provider maintenance",
    payload: { ssoProvider: "azuread", temporary: true },
  }),
  createMockAuditLog({
    id: "LOG-8923",
    timestamp: "2024-04-12T08:29:18Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    action: "mfa.enabled",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.100",
    details: "Organization-wide MFA enforcement enabled",
    payload: { mfaMethod: "authenticator", scope: "organization" },
  }),
  createMockAuditLog({
    id: "LOG-8922",
    timestamp: "2024-04-12T08:03:27Z",
    actor: "owner@northstar.io",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Northstar Retail",
    organizationId: "ORG-009",
    action: "mfa.disabled",
    status: AuditStatus.WARNING,
    ipAddress: "203.0.113.15",
    details: "Temporarily disabled MFA for executive account recovery",
    payload: { userEmail: "ceo@northstar.io", reason: "Recovery workflow" },
  }),
  createMockAuditLog({
    id: "LOG-8921",
    timestamp: "2024-04-12T07:44:11Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Innovation Labs",
    organizationId: "ORG-004",
    action: "organization.created",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.103",
    details: "New organization created with Starter plan",
    payload: { planType: "Starter", adminEmail: "founder@innovationlabs.io" },
  }),
  createMockAuditLog({
    id: "LOG-8920",
    timestamp: "2024-04-12T07:22:58Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    action: "organization.updated",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.104",
    details: "Updated organization billing and support contacts",
    payload: { fieldsChanged: ["billingEmail", "supportContact"], source: "admin_console" },
  }),
  createMockAuditLog({
    id: "LOG-8919",
    timestamp: "2024-04-12T07:04:16Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    action: "organization.suspended",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.104",
    details: "Suspended due to payment failure",
    payload: {
      reason: "Payment failure - 3 consecutive failed transactions",
      duration: "temporary",
    },
  }),
  createMockAuditLog({
    id: "LOG-8918",
    timestamp: "2024-04-12T06:51:32Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    action: "organization.reactivated",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.104",
    details: "Reactivated organization after successful payment collection",
    payload: { reactivatedBy: "Collections team", note: "Account restored" },
  }),
  createMockAuditLog({
    id: "LOG-8917",
    timestamp: "2024-04-12T06:28:44Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Sunset Ventures",
    organizationId: "ORG-010",
    action: "organization.deleted",
    status: AuditStatus.WARNING,
    ipAddress: "192.168.1.105",
    details: "Deleted sandbox organization after retention period",
    payload: { deletionReason: "Sandbox expiry", dataRetentionDays: 30 },
  }),
  createMockAuditLog({
    id: "LOG-8916",
    timestamp: "2024-04-12T06:11:05Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    action: "seats.increased",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.100",
    details: "Increased seat limit from 75 to 100",
    payload: {
      previousSeatLimit: 75,
      newSeatLimit: 100,
      reason: "Growth expansion - new hiring planned",
    },
  }),
  createMockAuditLog({
    id: "LOG-8915",
    timestamp: "2024-04-12T05:48:28Z",
    actor: "owner@beaconhealth.com",
    actorType: ActorType.ORGANIZATION_OWNER,
    organization: "Beacon Health",
    organizationId: "ORG-008",
    action: "seats.decreased",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.54",
    details: "Reduced unused seats after department merger",
    payload: { previousSeatLimit: 150, newSeatLimit: 110, reason: "License consolidation" },
  }),
  createMockAuditLog({
    id: "LOG-8914",
    timestamp: "2024-04-12T05:19:13Z",
    actor: "david@cloudscale.io",
    actorType: ActorType.ORGANIZATION_MEMBER,
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    action: "data.exported",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.89",
    details: "Exported all user data",
    payload: {
      exportScope: "all",
      dataTypes: ["user_profiles", "audit_logs", "transaction_history"],
      fileFormat: "csv",
      fileSize: 2457600,
    },
  }),
  createMockAuditLog({
    id: "LOG-8913",
    timestamp: "2024-04-12T04:58:21Z",
    actor: "ops@techstart.io",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    action: "data.imported",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.94",
    details: "Imported customer records from CSV",
    payload: { importedRecords: 1240, fileFormat: "csv", initiatedBy: "bulk_import_tool" },
  }),
  createMockAuditLog({
    id: "LOG-8912",
    timestamp: "2024-04-12T04:36:55Z",
    actor: "compliance@beaconhealth.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Beacon Health",
    organizationId: "ORG-008",
    action: "data.deleted",
    status: AuditStatus.SUCCESS,
    ipAddress: "198.51.100.77",
    details: "Deleted expired patient export package",
    payload: {
      dataType: "export_package",
      recordsAffected: 18,
      reason: "Retention policy cleanup",
      backupCreated: true,
    },
  }),
  createMockAuditLog({
    id: "LOG-8911",
    timestamp: "2024-04-12T04:12:42Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    action: "backup.created",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Nightly backup snapshot completed",
    payload: { backupId: "bkp_2024_04_12_001", region: "ap-southeast-1", sizeGb: 84 },
  }),
  createMockAuditLog({
    id: "LOG-8910",
    timestamp: "2024-04-12T03:49:36Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    action: "backup.restored",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.106",
    details: "Restored backup to recover deleted records",
    payload: {
      backupId: "bkp_2024_04_11_001",
      backupDate: "2024-04-11T02:00:00Z",
      restoreScope: "customer_records",
      reason: "Recovery after accidental deletion",
    },
  }),
  createMockAuditLog({
    id: "LOG-8909",
    timestamp: "2024-04-12T03:20:19Z",
    actor: "compliance@financecorp.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "compliance.audit_initiated",
    status: AuditStatus.PENDING,
    ipAddress: "203.0.113.67",
    details: "Started SOC 2 evidence collection",
    payload: {
      auditType: "SOC 2 Type II",
      auditScope: "access_controls",
      expectedCompletion: "2024-04-26T17:00:00Z",
    },
  }),
  createMockAuditLog({
    id: "LOG-8908",
    timestamp: "2024-04-12T02:58:07Z",
    actor: "compliance@financecorp.com",
    actorType: ActorType.ORGANIZATION_ADMIN,
    organization: "Finance Corp",
    organizationId: "ORG-006",
    action: "compliance.audit_completed",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.67",
    details: "Closed internal retention compliance review",
    payload: { auditType: "Retention Policy", findings: 0, approvedBy: "Legal Ops" },
  }),
  createMockAuditLog({
    id: "LOG-8907",
    timestamp: "2024-04-12T02:34:45Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "policy.created",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.100",
    details: "Created data retention policy",
    payload: {
      policyName: "Data Retention",
      policyType: "compliance",
      policyVersion: "1.0",
      effectiveDate: "2024-04-15",
    },
  }),
  createMockAuditLog({
    id: "LOG-8906",
    timestamp: "2024-04-12T02:12:53Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "policy.updated",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.100",
    details: "Updated policy retention period and exception handling",
    payload: { policyName: "Data Retention", policyVersion: "1.1", changes: 2 },
  }),
  createMockAuditLog({
    id: "LOG-8905",
    timestamp: "2024-04-12T01:51:28Z",
    actor: "sarah@acme.com",
    actorType: ActorType.ORGANIZATION_MEMBER,
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    action: "policy.acknowledged",
    status: AuditStatus.SUCCESS,
    ipAddress: "203.0.113.201",
    details: "User acknowledged revised retention policy",
    payload: { policyName: "Data Retention", policyVersion: "1.1", acknowledgedAt: "2024-04-12T01:51:28Z" },
  }),
  createMockAuditLog({
    id: "LOG-8904",
    timestamp: "2024-04-12T01:28:14Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Platform Configuration",
    organizationId: "ORG-SYS",
    action: "system.configuration_changed",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.110",
    details: "Updated default session timeout",
    payload: {
      configurationItem: "sessionTimeoutMinutes",
      previousValue: "30",
      newValue: "45",
      changeReason: "Security hardening",
    },
  }),
  createMockAuditLog({
    id: "LOG-8903",
    timestamp: "2024-04-12T01:05:39Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Platform Operations",
    organizationId: "ORG-SYS",
    action: "system.maintenance_started",
    status: AuditStatus.WARNING,
    ipAddress: "N/A",
    details: "Scheduled maintenance window started",
    payload: { windowId: "mw_2024_04_12", expectedDurationMinutes: 45 },
  }),
  createMockAuditLog({
    id: "LOG-8902",
    timestamp: "2024-04-12T00:41:52Z",
    actor: "system",
    actorType: ActorType.SYSTEM,
    organization: "Platform Operations",
    organizationId: "ORG-SYS",
    action: "system.maintenance_completed",
    status: AuditStatus.SUCCESS,
    ipAddress: "N/A",
    details: "Scheduled maintenance finished successfully",
    payload: { windowId: "mw_2024_04_12", completedInMinutes: 38 },
  }),
  createMockAuditLog({
    id: "LOG-8901",
    timestamp: "2024-04-12T00:18:26Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Platform Operations",
    organizationId: "ORG-SYS",
    action: "admin.login",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.111",
    details: "Platform administrator signed in",
    payload: { adminEmail: "admin@platform.com", mfaUsed: true, browser: "Chrome" },
  }),
  createMockAuditLog({
    id: "LOG-8900",
    timestamp: "2024-04-11T23:54:03Z",
    actor: "admin@platform.com",
    actorType: ActorType.PLATFORM_ADMIN,
    organization: "Platform Operations",
    organizationId: "ORG-SYS",
    action: "admin.logout",
    status: AuditStatus.SUCCESS,
    ipAddress: "192.168.1.111",
    details: "Platform administrator signed out",
    payload: { adminEmail: "admin@platform.com", sessionDurationMinutes: 143 },
  }),
];

export function PlatformAuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLogs = normalizedQuery
    ? auditLogs.filter((log) =>
        [
          log.action,
          getActionLabel(log.action),
          log.actor,
          log.organization,
          log.details,
          log.organizationId,
          log.id,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    : auditLogs;

  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / AUDIT_LOGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * AUDIT_LOGS_PER_PAGE;
  const endIndex = Math.min(startIndex + AUDIT_LOGS_PER_PAGE, totalLogs);
  const visibleLogs = filteredLogs.slice(startIndex, endIndex);

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setTimeout(() => setSelectedLog(null), 300);
  };

  return (
    <>
      <PortalPageFrame
        variant="fill"
        rootClassName="h-full"
        title="Audit Logs"
        description="Admin actions, API events, linking events, verification lifecycle events, and security-sensitive changes."
        headerActions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        }
        headerExtra={
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by action, actor, or organization..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 bg-background"
            />
          </div>

          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              {/* <SelectItem value="90days">Last 90 days</SelectItem> */}
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-actors">
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All Actors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-actors">All Actors</SelectItem>
              <SelectItem value="platform-admin">Platform Admin</SelectItem>
              <SelectItem value="org-owner">Organization Owner</SelectItem>
              <SelectItem value="org-admin">Organization Admin</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-orgs">
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="search">... search</SelectItem>
              <SelectItem value="all-orgs">All Organizations</SelectItem>
              {/* <SelectItem value="acme">Acme Corporation</SelectItem>
              <SelectItem value="global">Global Ventures</SelectItem>
              <SelectItem value="finance">Finance Corp</SelectItem> */}
            </SelectContent>
          </Select>

          <Select defaultValue="all-actions">
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-actions">All Actions</SelectItem>
              <SelectItem value="subscription">Plan</SelectItem>
              <SelectItem value="user">User Management</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        }
      >
        <Card className="border border-border shadow-sm">

          {/* Pagination */}
          <div className="p-4 border-border flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground">
              {totalLogs === 0
                ? "Showing 0 audit log entries"
                : `Showing ${startIndex + 1}-${endIndex} of ${totalLogs} audit log entries`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="text-[13px] text-muted-foreground px-2">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === totalPages || totalLogs === 0}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-accent/5 sticky top-0">
                <tr>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Timestamp
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Actor
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Organization
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Details
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-[13px] font-medium text-muted-foreground">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-[13px] text-foreground">
                            {formatDateTime(log.timestamp)}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {log.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] text-foreground">{log.actor}</p>
                      <p className="text-[11px] text-muted-foreground">{log.actorType}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] text-foreground">{log.organization}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {log.organizationId}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className={`text-[13px] font-mono font-medium ${getCategoryColor(getActionCategory(log.action))}`}>
                        {getActionLabel(log.action)}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] text-foreground">{log.details}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium border ${getStatusBadgeColor(
                          log.status
                        )}`}
                      >
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-[12px] text-muted-foreground">{log.ipAddress}</p>
                    </td>
                  </tr>
                ))}
                {visibleLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground sm:px-8">
                      No audit logs match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground">
              {totalLogs === 0
                ? "Showing 0 audit log entries"
                : `Showing ${startIndex + 1}-${endIndex} of ${totalLogs} audit log entries`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="text-[13px] text-muted-foreground px-2">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === totalPages || totalLogs === 0}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div> */}
        </Card>
      </PortalPageFrame>

      {/* Details Modal */}
      {isDetailsOpen && selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          isOpen={isDetailsOpen}
          onClose={closeDetails}
        />
      )}
    </>
  );
}

/**
 * Audit Log Details Modal Component
 * Displays full details of a selected audit log with action-specific layouts
 */
interface AuditLogDetailsModalProps {
  log: AuditLog;
  isOpen: boolean;
  onClose: () => void;
}

function AuditLogDetailsModal({
  log,
  isOpen,
  onClose,
}: AuditLogDetailsModalProps) {
  if (!isOpen) return null;

  const renderPayloadDetails = () => {
    if (!log.payload) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(log.payload).map(([key, value]) => {
            let displayValue: React.ReactNode = value as React.ReactNode;
            if (typeof value === "number") {
              displayValue = key.includes("Amount") || key.includes("Limit")
                ? `$${value}`
                : value.toLocaleString();
            } else if (typeof value === "boolean") {
              displayValue = value ? "Yes" : "No";
            } else if (typeof value === "object") {
              displayValue = JSON.stringify(value, null, 2);
            }

            return (
              <div key={key}>
                <p className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-sm text-foreground font-medium">
                  {displayValue as React.ReactNode}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        // onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border bg-accent/5 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-2">

                <span
                  className={`inline-flex py-1 rounded text-2xl font-medium ${getCategoryColor(getActionCategory(log.action))}`}
                >
                  {getActionLabel(log.action)}
                </span>
              </div>
               <span className="text-sm font-mono text-muted-foreground">
                  {log.id}
                </span>
              <span className="px-3 text-sm text-muted-foreground">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getStatusBadgeColor(
                  log.status
                )}`}
              >
                {getStatusLabel(log.status)}
              </span>
            </div>

            {/* Organization */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Organization
                </p>
                <p className="text-sm text-foreground font-medium">
                  {log.organization}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {log.organizationId}
                </p>
              </div>

              {/* Actor */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Actor</p>
                <p className="text-sm text-foreground font-medium">
                  {log.actor}
                </p>
                <p className="text-xs text-muted-foreground">
                  {log.actorType}
                </p>
              </div>
            </div>

            {/* Context Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  IP Address
                </p>
                <p className="text-sm text-foreground font-mono">
                  {log.ipAddress}
                </p>
              </div>

              {log.userAgent && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    User Agent
                  </p>
                  <p className="text-xs text-foreground truncate">
                    {log.userAgent}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Description</p>
              <p className="text-sm text-foreground bg-accent/5 rounded p-3 border border-border">
                {log.details}
              </p>
            </div>

            {/* Payload Details */}
            {renderPayloadDetails()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-accent/5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(log, null, 2));
              }}
            >
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
