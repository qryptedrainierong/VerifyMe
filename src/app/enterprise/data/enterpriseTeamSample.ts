export type EnterpriseTeamRole =
  | "Owner"
  | "Admin"
  | "Operations"
  | "Technical / API Manager"
  | "Finance / Billing"
  | "Compliance / Auditor";

export type EnterpriseTeamMemberStatus = "active" | "pending" | "suspended" | "disabled";

export type EnterpriseTeamMfaStatus = "enabled" | "reset_required" | "not_configured";

export type EnterpriseTeamMember = {
  id: string;
  fullName: string;
  email: string;
  role: EnterpriseTeamRole;
  department: string;
  status: EnterpriseTeamMemberStatus;
  joined: string;
  lastActive: string;
  lastLoginAt: string | null;
  mfaStatus: EnterpriseTeamMfaStatus;
  permissionsSummary: string;
  recentActivity: string[];
};

export const enterpriseTeamRoleOptions: EnterpriseTeamRole[] = [
  "Owner",
  "Admin",
  "Operations",
  "Technical / API Manager",
  "Finance / Billing",
  "Compliance / Auditor",
];

export const enterpriseTeamSample: EnterpriseTeamMember[] = [
  {
    id: "em-001",
    fullName: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Owner",
    department: "Marketing",
    status: "active",
    joined: "Jan 15, 2024",
    lastActive: "Online now",
    lastLoginAt: "2026-05-06T14:02:00Z",
    mfaStatus: "enabled",
    permissionsSummary: "Full organization controls, billing visibility, team administration, API configuration.",
    recentActivity: ["Opened billing", "Reviewed usage report", "Approved sandbox promotion"],
  },
  {
    id: "em-002",
    fullName: "Michael Chen",
    email: "michael@company.com",
    role: "Admin",
    department: "Engineering",
    status: "active",
    joined: "Jan 20, 2024",
    lastActive: "5 min ago",
    lastLoginAt: "2026-05-06T13:55:00Z",
    mfaStatus: "enabled",
    permissionsSummary: "User and link management, verification logs, API integration (non-destructive), team invites except Owner transfer.",
    recentActivity: ["Exported verification logs", "Updated redirect URI list view"],
  },
  {
    id: "em-003",
    fullName: "Emily Davis",
    email: "emily@company.com",
    role: "Operations",
    department: "Design",
    status: "active",
    joined: "Feb 1, 2024",
    lastActive: "1 hour ago",
    lastLoginAt: "2026-05-06T12:40:00Z",
    mfaStatus: "not_configured",
    permissionsSummary: "Linked end users, verification logs read-only, QR linking read-only.",
    recentActivity: ["Searched linked end users", "Opened dashboard"],
  },
  {
    id: "em-004",
    fullName: "James Wilson",
    email: "james@company.com",
    role: "Compliance / Auditor",
    department: "Sales",
    status: "suspended",
    joined: "Dec 10, 2023",
    lastActive: "2 days ago",
    lastLoginAt: "2026-05-04T09:00:00Z",
    mfaStatus: "enabled",
    permissionsSummary: "Read-only exports, audit-oriented views, no credential rotation.",
    recentActivity: ["Downloaded verification log export"],
  },
  {
    id: "em-005",
    fullName: "Lisa Anderson",
    email: "lisa@company.com",
    role: "Finance / Billing",
    department: "Operations",
    status: "active",
    joined: "Nov 5, 2023",
    lastActive: "10 min ago",
    lastLoginAt: "2026-05-06T13:48:00Z",
    mfaStatus: "reset_required",
    permissionsSummary: "Billing, invoices, usage and credits; no API secret rotation.",
    recentActivity: ["Opened invoice detail", "Reviewed credit utilization"],
  },
  {
    id: "em-006",
    fullName: "David Brown",
    email: "david@company.com",
    role: "Technical / API Manager",
    department: "Engineering",
    status: "active",
    joined: "Feb 15, 2024",
    lastActive: "30 min ago",
    lastLoginAt: "2026-05-06T13:30:00Z",
    mfaStatus: "enabled",
    permissionsSummary: "API integration, client credentials lifecycle, redirect URIs, OIDC reference access.",
    recentActivity: ["Viewed client application", "Checked secret rotation date"],
  },
  {
    id: "em-007",
    fullName: "Priya Kapoor",
    email: "priya@company.com",
    role: "Operations",
    department: "Support",
    status: "pending",
    joined: "Apr 2, 2024",
    lastActive: "Never",
    lastLoginAt: null,
    mfaStatus: "not_configured",
    permissionsSummary: "Pending activation — default Operations scope after first login.",
    recentActivity: [],
  },
  {
    id: "em-008",
    fullName: "Ramon Cruz",
    email: "ramon@company.com",
    role: "Admin",
    department: "Security",
    status: "disabled",
    joined: "Jan 3, 2024",
    lastActive: "Apr 12, 2024",
    lastLoginAt: "2026-04-12T16:00:00Z",
    mfaStatus: "enabled",
    permissionsSummary: "Account disabled — sign-in blocked until reactivated by Owner or VerifyMe support policy.",
    recentActivity: ["Last session before access disable"],
  },
];
