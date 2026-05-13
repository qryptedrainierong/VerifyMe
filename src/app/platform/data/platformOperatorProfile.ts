import { PLATFORM_PREVIEW_USER } from "../context/PlatformRoleContext";
import type { PlatformRole } from "../utils/platformRolePermissions";
import { platformRoleDescription, platformRoleLabel } from "../utils/platformRolePermissions";

export type OperatorSessionRow = {
  id: string;
  label: string;
  browserDevice: string;
  locationSummary: string;
  lastActivityAt: string;
  status: "current" | "active" | "revoked";
  isCurrent: boolean;
};

export type OperatorSecurityEvent = {
  id: string;
  kind: string;
  summary: string;
  timestamp: string;
};

export type OperatorActivityItem = {
  id: string;
  label: string;
  timestamp: string;
};

export type PlatformNotificationCategory =
  | "Risk"
  | "Identity Conflict"
  | "Billing"
  | "Integration"
  | "Security"
  | "Platform Settings"
  | "System Health";

export type PlatformNotificationSeverity = "critical" | "high" | "medium" | "low" | "info";

export type PlatformNotificationItem = {
  id: string;
  title: string;
  description: string;
  severity: PlatformNotificationSeverity;
  category: PlatformNotificationCategory;
  timestamp: string;
  link: string;
};

/** Static operator identity — aligns with preview account in the shell. */
export const PLATFORM_OPERATOR_ID = "pa-vm-48291";

export const platformOperatorActiveSessions: OperatorSessionRow[] = [
  {
    id: "sess-current",
    label: "This browser",
    browserDevice: "Chrome · macOS",
    locationSummary: "Singapore · Corporate network",
    lastActivityAt: "2026-05-12T14:22:00.000Z",
    status: "current",
    isCurrent: true,
  },
  {
    id: "sess-2",
    label: "Previous workstation",
    browserDevice: "Edge · Windows 11",
    locationSummary: "Singapore · VPN",
    lastActivityAt: "2026-05-11T09:40:00.000Z",
    status: "active",
    isCurrent: false,
  },
  {
    id: "sess-3",
    label: "Mobile review",
    browserDevice: "Safari · iOS",
    locationSummary: "Regional carrier · Approx. SG",
    lastActivityAt: "2026-05-09T16:05:00.000Z",
    status: "active",
    isCurrent: false,
  },
];

export const platformOperatorSecurityEvents: OperatorSecurityEvent[] = [
  {
    id: "se-1",
    kind: "Successful login",
    summary: "New session established from approved network range.",
    timestamp: "2026-05-12T06:15:00.000Z",
  },
  {
    id: "se-2",
    kind: "MFA challenge",
    summary: "Authenticator app challenge completed.",
    timestamp: "2026-05-12T06:15:12.000Z",
  },
  {
    id: "se-3",
    kind: "Failed login",
    summary: "Rejected attempt — unknown device fingerprint (blocked).",
    timestamp: "2026-05-10T22:01:00.000Z",
  },
  {
    id: "se-4",
    kind: "Session revoked",
    summary: "Operator ended a stale session from account security.",
    timestamp: "2026-05-08T11:30:00.000Z",
  },
  {
    id: "se-5",
    kind: "Password reset requested",
    summary: "Reset flow initiated; completion pending operator confirmation.",
    timestamp: "2026-04-28T08:00:00.000Z",
  },
];

export const platformOperatorRecentActivity: OperatorActivityItem[] = [
  { id: "oa-1", label: "Signed in to VerifyMe Admin Portal", timestamp: "2026-05-12T06:15:00.000Z" },
  { id: "oa-2", label: "Opened Audit Logs with governance filters", timestamp: "2026-05-12T06:42:00.000Z" },
  { id: "oa-3", label: "Reviewed risk escalation queue", timestamp: "2026-05-12T07:05:00.000Z" },
  { id: "oa-4", label: "Changed preview role", timestamp: "2026-05-12T07:18:00.000Z" },
  { id: "oa-5", label: "Opened Platform Settings — Verification policy", timestamp: "2026-05-12T08:01:00.000Z" },
];

export const INITIAL_PLATFORM_NOTIFICATIONS: PlatformNotificationItem[] = [
  {
    id: "notif-risk-1",
    title: "Risk band change — High",
    description: "VerifyMe user vm-7f2a escalated to High based on proof and session signals.",
    severity: "high",
    category: "Risk",
    timestamp: "2026-05-12T13:10:00.000Z",
    link: "/verifyme-users",
  },
  {
    id: "notif-id-1",
    title: "Identity conflict awaiting review",
    description: "Pending review on cross-organization name consistency.",
    severity: "medium",
    category: "Identity Conflict",
    timestamp: "2026-05-12T12:40:00.000Z",
    link: "/identity-links?conflict=active",
  },
  {
    id: "notif-bill-1",
    title: "Invoice requires operator follow-up",
    description: "Payment standing flagged for billing review.",
    severity: "high",
    category: "Billing",
    timestamp: "2026-05-12T11:55:00.000Z",
    link: "/billing?requiresAction=true",
  },
  {
    id: "notif-int-1",
    title: "Client app integration degraded",
    description: "Redirect URI validation errors detected for a production client.",
    severity: "medium",
    category: "Integration",
    timestamp: "2026-05-12T10:20:00.000Z",
    link: "/client-apps",
  },
  {
    id: "notif-sec-1",
    title: "Sign-in from new device class",
    description: "Session allowed after MFA; review if unexpected.",
    severity: "low",
    category: "Security",
    timestamp: "2026-05-11T19:02:00.000Z",
    link: "/platform-security",
  },
  {
    id: "notif-set-1",
    title: "Platform settings updated",
    description: "Verification retention window adjusted.",
    severity: "low",
    category: "Platform Settings",
    timestamp: "2026-05-11T15:00:00.000Z",
    link: "/settings",
  },
  {
    id: "notif-sys-1",
    title: "Service health — degraded dependency",
    description: "Notification delivery reported elevated latency.",
    severity: "medium",
    category: "System Health",
    timestamp: "2026-05-11T08:30:00.000Z",
    link: "/audit-logs",
  },
  {
    id: "notif-risk-2",
    title: "Governance digest — risk",
    description: "Weekly summary: 3 accounts moved bands; no Critical opens.",
    severity: "info",
    category: "Risk",
    timestamp: "2026-05-10T07:00:00.000Z",
    link: "/audit-logs",
  },
];

/** Ids left unread on first visit (stable demo). */
export const DEFAULT_UNREAD_NOTIFICATION_IDS = ["notif-risk-1", "notif-bill-1", "notif-int-1"] as const;

export type OperatorDisplayPreferences = {
  theme: "system" | "light" | "dark";
  density: "comfortable" | "compact";
  tableDensity: "default" | "compact";
  dashboardDensity: "focused" | "expanded";
};

export type OperatorLocalizationPreferences = {
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currencyDisplay: string;
};

export type OperatorDefaultViewPreferences = {
  defaultLandingPage: string;
  defaultDashboardScope: string;
  defaultAuditFilter: string;
};

export type OperatorAccessibilityPreferences = {
  reduceMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
};

export type OperatorNotificationChannelPreferences = {
  governanceAlerts: boolean;
  riskEscalations: boolean;
  billingAlerts: boolean;
  integrationAlerts: boolean;
  systemHealthAlerts: boolean;
  platformSettingsChanges: boolean;
  deliveryInApp: boolean;
  deliveryEmail: boolean;
  deliveryDigest: boolean;
};

export const DEFAULT_OPERATOR_DISPLAY: OperatorDisplayPreferences = {
  theme: "system",
  density: "comfortable",
  tableDensity: "default",
  dashboardDensity: "focused",
};

export const DEFAULT_OPERATOR_LOCALIZATION: OperatorLocalizationPreferences = {
  timezone: "Asia/Singapore",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "1,234.56",
  currencyDisplay: "USD · symbol prefix",
};

export const DEFAULT_OPERATOR_DEFAULT_VIEWS: OperatorDefaultViewPreferences = {
  defaultLandingPage: "Dashboard",
  defaultDashboardScope: "Platform-wide",
  defaultAuditFilter: "Last 7 days · governance",
};

export const DEFAULT_OPERATOR_ACCESSIBILITY: OperatorAccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  largerText: false,
};

export const DEFAULT_OPERATOR_NOTIFICATION_CHANNELS: OperatorNotificationChannelPreferences = {
  governanceAlerts: true,
  riskEscalations: true,
  billingAlerts: true,
  integrationAlerts: true,
  systemHealthAlerts: true,
  platformSettingsChanges: true,
  deliveryInApp: true,
  deliveryEmail: true,
  deliveryDigest: false,
};

export function buildPlatformOperatorProfile(role: PlatformRole) {
  return {
    platformAdminId: PLATFORM_OPERATOR_ID,
    fullName: PLATFORM_PREVIEW_USER.displayName,
    email: PLATFORM_PREVIEW_USER.email,
    roleLabel: platformRoleLabel(role),
    roleKey: role,
    roleDescription: platformRoleDescription(role),
    department: "Platform Operations",
    status: "active" as const,
    timezone: DEFAULT_OPERATOR_LOCALIZATION.timezone,
    dateFormat: DEFAULT_OPERATOR_LOCALIZATION.dateFormat,
    defaultLandingPage: DEFAULT_OPERATOR_DEFAULT_VIEWS.defaultLandingPage,
    dashboardDensity: DEFAULT_OPERATOR_DISPLAY.dashboardDensity,
    mfaStatus: "enabled" as const,
    passwordLastChangedAt: "2025-11-02T08:00:00.000Z",
    recoveryStatus: "configured" as const,
    lastLoginAt: "2026-05-12T06:15:00.000Z",
    lastActivityAt: "2026-05-12T14:22:00.000Z",
    activeSessions: platformOperatorActiveSessions,
    securityEvents: platformOperatorSecurityEvents,
    recentOperatorActivity: platformOperatorRecentActivity,
  };
}

export function formatOperatorTimestamp(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return iso;
  return (
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(d)) + " UTC"
  );
}
