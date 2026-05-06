export type PlatformTeamRole =
  | "Super Admin"
  | "Platform Admin"
  | "Operations"
  | "Risk Analyst"
  | "Compliance / Auditor"
  | "Finance / Billing"
  | "Technical / API Manager";

export type PlatformTeamStatus = "active" | "pending" | "suspended" | "disabled";
export type PlatformMfaStatus = "enabled" | "reset_required" | "not_configured";

export type PlatformTeamMember = {
  id: string;
  platformAdminId: string;
  fullName: string;
  email: string;
  role: PlatformTeamRole;
  status: PlatformTeamStatus;
  mfaStatus: PlatformMfaStatus;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  invitedBy: string;
  permissionsSummary: string;
  recentActivity: string[];
  activeSessionCount: number;
  lastKnownDeviceSummary: string;
  lastKnownIp: string | null;
  restrictedAreas: string[];
};

export const platformTeamSample: PlatformTeamMember[] = [
  {
    id: "pa-01",
    platformAdminId: "pa000001",
    fullName: "Rainier Ong",
    email: "rainier@verifyme.com",
    role: "Super Admin",
    status: "active",
    mfaStatus: "enabled",
    lastLoginAt: "2024-04-12T08:10:00Z",
    lastActivityAt: "2024-04-12T09:20:00Z",
    createdAt: "2023-09-12",
    invitedBy: "system@verifyme.com",
    permissionsSummary: "Full platform control, including team and organization lifecycle controls.",
    recentActivity: ["Role changed", "Reviewed risk", "Accessed audit logs"],
    activeSessionCount: 2,
    lastKnownDeviceSummary: "MacBook Pro · Chrome",
    lastKnownIp: "192.168.1.100",
    restrictedAreas: [],
  },
  {
    id: "pa-02",
    platformAdminId: "pa000002",
    fullName: "Alyssa Chua",
    email: "alyssa@verifyme.com",
    role: "Platform Admin",
    status: "active",
    mfaStatus: "enabled",
    lastLoginAt: "2024-04-12T07:20:00Z",
    lastActivityAt: "2024-04-12T08:55:00Z",
    createdAt: "2023-11-03",
    invitedBy: "pa000001",
    permissionsSummary: "Broad platform administration excluding highest-risk controls.",
    recentActivity: ["Reviewed risk", "Accessed audit logs"],
    activeSessionCount: 1,
    lastKnownDeviceSummary: "Windows 11 · Edge",
    lastKnownIp: "192.168.1.112",
    restrictedAreas: ["Permanent organization disable/archive"],
  },
  {
    id: "pa-03",
    platformAdminId: "pa000003",
    fullName: "Miguel Santos",
    email: "miguel@verifyme.com",
    role: "Operations",
    status: "active",
    mfaStatus: "enabled",
    lastLoginAt: "2024-04-12T06:50:00Z",
    lastActivityAt: "2024-04-12T08:40:00Z",
    createdAt: "2024-01-08",
    invitedBy: "pa000002",
    permissionsSummary: "Session operations and support workflows.",
    recentActivity: ["login", "reviewed risk"],
    activeSessionCount: 1,
    lastKnownDeviceSummary: "MacBook Air · Chrome",
    lastKnownIp: "192.168.1.118",
    restrictedAreas: ["Team role changes", "Organization lifecycle controls"],
  },
  {
    id: "pa-04",
    platformAdminId: "pa000004",
    fullName: "Nicole Tan",
    email: "nicole@verifyme.com",
    role: "Risk Analyst",
    status: "pending",
    mfaStatus: "not_configured",
    lastLoginAt: null,
    lastActivityAt: null,
    createdAt: "2024-04-02",
    invitedBy: "pa000001",
    permissionsSummary: "Risk review, conflict analysis, and governance review access.",
    recentActivity: ["invited"],
    activeSessionCount: 0,
    lastKnownDeviceSummary: "Not available",
    lastKnownIp: null,
    restrictedAreas: ["Billing and credits controls", "Team management"],
  },
  {
    id: "pa-05",
    platformAdminId: "pa000005",
    fullName: "Paolo Reyes",
    email: "paolo@verifyme.com",
    role: "Compliance / Auditor",
    status: "suspended",
    mfaStatus: "reset_required",
    lastLoginAt: "2024-03-30T15:20:00Z",
    lastActivityAt: "2024-04-01T10:00:00Z",
    createdAt: "2024-02-11",
    invitedBy: "pa000001",
    permissionsSummary: "Read-only access to audit and governance views.",
    recentActivity: ["accessed audit logs", "login failed"],
    activeSessionCount: 0,
    lastKnownDeviceSummary: "Linux · Firefox",
    lastKnownIp: "192.168.1.122",
    restrictedAreas: ["State-changing controls", "Team management"],
  },
  {
    id: "pa-06",
    platformAdminId: "pa000006",
    fullName: "Camille Dizon",
    email: "camille@verifyme.com",
    role: "Finance / Billing",
    status: "active",
    mfaStatus: "enabled",
    lastLoginAt: "2024-04-12T07:50:00Z",
    lastActivityAt: "2024-04-12T08:12:00Z",
    createdAt: "2024-01-19",
    invitedBy: "pa000001",
    permissionsSummary: "Billing, invoices, and credit operations access.",
    recentActivity: ["login", "accessed billing"],
    activeSessionCount: 1,
    lastKnownDeviceSummary: "Mac mini · Safari",
    lastKnownIp: "192.168.1.123",
    restrictedAreas: ["Risk controls", "Team management"],
  },
  {
    id: "pa-07",
    platformAdminId: "pa000007",
    fullName: "David Lim",
    email: "david.lim@verifyme.com",
    role: "Technical / API Manager",
    status: "disabled",
    mfaStatus: "reset_required",
    lastLoginAt: "2024-03-21T03:40:00Z",
    lastActivityAt: "2024-03-21T04:00:00Z",
    createdAt: "2024-01-29",
    invitedBy: "pa000002",
    permissionsSummary: "Client apps, integration health, and key lifecycle workflows.",
    recentActivity: ["rotated client secret", "login failed"],
    activeSessionCount: 0,
    lastKnownDeviceSummary: "Windows 10 · Chrome",
    lastKnownIp: "192.168.1.140",
    restrictedAreas: ["Risk controls", "Organization lifecycle controls"],
  },
];

