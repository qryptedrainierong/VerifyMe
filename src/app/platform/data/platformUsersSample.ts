export type PortalUserRole =
  | "Owner"
  | "Admin"
  | "Operations Manager"
  | "Support / Customer Success"
  | "Finance / Billing Admin"
  | "Security / Compliance Admin";
export type PortalUserStatus = "active" | "invited" | "suspended";

export type PlatformPortalUser = {
  id: string;
  name: string;
  email: string;
  role: PortalUserRole;
  status: PortalUserStatus;
  organizationScope: "All Organizations";
  created: string;
  lastLogin: string | null;
};

/** MVP: one active device per VerifyMe user; mock only. */
export type MockVerifymeUserDevice = {
  label: string;
  platform: string;
  status: "active" | "pending_enrollment";
  registeredAt: string;
  lastVerifiedAt: string | null;
  /** Summary only — no secrets or raw keys. */
  secureStateSummary: string;
};

/**
 * Organization ↔ VerifyMe user link (sample). Mirrors organization_user_links:
 * - verifymeUserId: FK to verifyme_users.id (internal)
 * - verifymeId: public vmXXXXXX display identifier (same for all rows of one user)
 * - clientUserId: organization-side customer identifier
 */
export type PlatformEndUserAssociation = {
  id: string;
  verifymeUserId: string;
  verifymeId: string;
  email: string;
  clientUserId: string;
  organization: string;
  organizationId: string;
  status: "active" | "pending" | "suspended" | "disabled";
  /** Billable verification sessions (sample aggregate per org link). */
  verificationSessions: number;
  lastActive: string | null;
  created: string;
  device: MockVerifymeUserDevice;
};

export const platformPortalUsers: PlatformPortalUser[] = [
  {
    id: "PLT-001",
    name: "Rainier Ong",
    email: "rainier@verifyme.com",
    role: "Owner",
    status: "active",
    organizationScope: "All Organizations",
    created: "2023-09-12",
    lastLogin: "2024-04-09T11:10:00",
  },
  {
    id: "PLT-002",
    name: "Alyssa Chua",
    email: "alyssa@verifyme.com",
    role: "Admin",
    status: "active",
    organizationScope: "All Organizations",
    created: "2023-11-03",
    lastLogin: "2024-04-09T09:55:00",
  },
  {
    id: "PLT-003",
    name: "Miguel Santos",
    email: "miguel@verifyme.com",
    role: "Operations Manager",
    status: "active",
    organizationScope: "All Organizations",
    created: "2024-01-08",
    lastLogin: "2024-04-09T08:42:00",
  },
  {
    id: "PLT-004",
    name: "Nicole Tan",
    email: "nicole@verifyme.com",
    role: "Support / Customer Success",
    status: "invited",
    organizationScope: "All Organizations",
    created: "2024-04-02",
    lastLogin: null,
  },
  {
    id: "PLT-005",
    name: "Paolo Reyes",
    email: "paolo@verifyme.com",
    role: "Finance / Billing Admin",
    status: "suspended",
    organizationScope: "All Organizations",
    created: "2024-02-11",
    lastLogin: "2024-03-30T15:20:00",
  },
  {
    id: "PLT-006",
    name: "Camille Dizon",
    email: "camille@verifyme.com",
    role: "Security / Compliance Admin",
    status: "active",
    organizationScope: "All Organizations",
    created: "2024-01-19",
    lastLogin: "2024-04-09T07:50:00",
  },
];

const d = (
  label: string,
  platform: string,
  status: MockVerifymeUserDevice["status"],
  registeredAt: string,
  lastVerifiedAt: string | null,
  secureStateSummary: string,
): MockVerifymeUserDevice => ({
  label,
  platform,
  status,
  registeredAt,
  lastVerifiedAt,
  secureStateSummary,
});

/** Sample organization–user links (same verifymeUserId repeats when one user links to multiple orgs). */
export const platformEndUserAssociations: PlatformEndUserAssociation[] = [
  {
    id: "link-usr-00145-acme",
    verifymeUserId: "a0000001-0000-4000-8000-000000000001",
    verifymeId: "vm07f9a2",
    email: "john.smith@gmail.com",
    clientUserId: "cust_acme_jsmith",
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    status: "active",
    verificationSessions: 2450,
    lastActive: "2024-04-09T10:30:00",
    created: "2024-01-15",
    device: d("iPhone 15 Pro", "iOS", "active", "2024-01-15T09:00:00Z", "2024-04-09T10:30:00Z", "Bound · step-up OK (sample)"),
  },
  {
    id: "link-usr-00145-dsp",
    verifymeUserId: "a0000001-0000-4000-8000-000000000001",
    verifymeId: "vm07f9a2",
    email: "john.smith@gmail.com",
    clientUserId: "cust_dsp_johns",
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    status: "active",
    verificationSessions: 980,
    lastActive: "2024-04-08T11:20:00",
    created: "2024-02-19",
    device: d("iPhone 15 Pro", "iOS", "active", "2024-01-15T09:00:00Z", "2024-04-09T10:30:00Z", "Bound · step-up OK (sample)"),
  },
  {
    id: "link-usr-00238",
    verifymeUserId: "a0000002-0000-4000-8000-000000000002",
    verifymeId: "vm91b3c4",
    email: "sarah.johnson@outlook.com",
    clientUserId: "cust_ts_sjohnson",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    status: "active",
    verificationSessions: 1823,
    lastActive: "2024-04-09T09:15:00",
    created: "2024-02-03",
    device: d("Pixel 8", "Android", "active", "2024-02-03T14:20:00Z", "2024-04-09T09:15:00Z", "Bound · healthy (sample)"),
  },
  {
    id: "link-usr-00421-gv",
    verifymeUserId: "a0000003-0000-4000-8000-000000000003",
    verifymeId: "vm44d5e6",
    email: "michael.chen88@gmail.com",
    clientUserId: "cust_gv_mchen",
    organization: "Global Ventures",
    organizationId: "ORG-003",
    status: "active",
    verificationSessions: 3912,
    lastActive: "2024-04-09T10:15:00",
    created: "2023-12-08",
    device: d("Galaxy S24", "Android", "active", "2023-12-08T11:00:00Z", "2024-04-09T10:15:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-00421-cs",
    verifymeUserId: "a0000003-0000-4000-8000-000000000003",
    verifymeId: "vm44d5e6",
    email: "michael.chen88@gmail.com",
    clientUserId: "cust_cs_mchen",
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    status: "active",
    verificationSessions: 1245,
    lastActive: "2024-04-09T11:00:00",
    created: "2024-02-10",
    device: d("Galaxy S24", "Android", "active", "2023-12-08T11:00:00Z", "2024-04-09T10:15:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-00892",
    verifymeUserId: "a0000004-0000-4000-8000-000000000004",
    verifymeId: "vmaa12bc",
    email: "emily.davis@yahoo.com",
    clientUserId: "",
    organization: "Innovation Labs",
    organizationId: "ORG-004",
    status: "pending",
    verificationSessions: 0,
    lastActive: null,
    created: "2024-03-22",
    device: d("Pending device", "—", "pending_enrollment", "2024-03-22T08:00:00Z", null, "Enrollment not completed (sample)"),
  },
  {
    id: "link-usr-00893",
    verifymeUserId: "a0000005-0000-4000-8000-000000000005",
    verifymeId: "vmbb34de",
    email: "robert.martinez@outlook.com",
    clientUserId: "",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    status: "pending",
    verificationSessions: 0,
    lastActive: null,
    created: "2024-04-01",
    device: d("Pending device", "—", "pending_enrollment", "2024-04-01T10:00:00Z", null, "Enrollment not completed (sample)"),
  },
  {
    id: "link-usr-01204",
    verifymeUserId: "a0000006-0000-4000-8000-000000000006",
    verifymeId: "vmcc56ef",
    email: "jameswilson@icloud.com",
    clientUserId: "cust_dsp_jwilson",
    organization: "Design Studio Pro",
    organizationId: "ORG-005",
    status: "active",
    verificationSessions: 5234,
    lastActive: "2024-04-08T16:45:00",
    created: "2024-01-28",
    device: d("iPhone 14", "iOS", "active", "2024-01-28T13:00:00Z", "2024-04-08T16:45:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-01567",
    verifymeUserId: "a0000007-0000-4000-8000-000000000007",
    verifymeId: "vmdd78ab",
    email: "lisa.anderson@gmail.com",
    clientUserId: "cust_fc_landerson",
    organization: "Finance Corp",
    organizationId: "ORG-006",
    status: "active",
    verificationSessions: 1567,
    lastActive: "2024-04-09T08:20:00",
    created: "2023-11-12",
    device: d("iPhone 13", "iOS", "active", "2023-11-12T15:30:00Z", "2024-04-09T08:20:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-01892",
    verifymeUserId: "a0000008-0000-4000-8000-000000000008",
    verifymeId: "vmee90cd",
    email: "davidbrown@hotmail.com",
    clientUserId: "cust_cs_dbrown",
    organization: "CloudScale Systems",
    organizationId: "ORG-007",
    status: "suspended",
    verificationSessions: 892,
    lastActive: "2024-03-15T14:30:00",
    created: "2024-02-14",
    device: d("Pixel 7", "Android", "active", "2024-02-14T09:45:00Z", "2024-03-15T14:30:00Z", "Suspended account · device frozen (sample)"),
  },
  {
    id: "link-usr-02134",
    verifymeUserId: "a0000009-0000-4000-8000-000000000009",
    verifymeId: "vmff01ef",
    email: "ana.rodriguez@gmail.com",
    clientUserId: "cust_dfa_arodriguez",
    organization: "DataFlow Analytics",
    organizationId: "ORG-008",
    status: "active",
    verificationSessions: 2981,
    lastActive: "2024-04-09T07:50:00",
    created: "2024-03-05",
    device: d("iPhone 15", "iOS", "active", "2024-03-05T12:00:00Z", "2024-04-09T07:50:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-conflict1-ts",
    verifymeUserId: "a0000011-0000-4000-8000-000000000011",
    verifymeId: "vmconflict1",
    email: "conflict.sample@example.com",
    clientUserId: "ts_contractor_901",
    organization: "TechStart Inc.",
    organizationId: "ORG-002",
    status: "active",
    verificationSessions: 142,
    lastActive: "2024-04-07T16:20:00",
    created: "2024-03-18",
    device: d("iPhone 15", "iOS", "active", "2024-03-18T12:00:00Z", "2024-04-07T16:20:00Z", "Bound (sample)"),
  },
  {
    id: "link-usr-03001-disabled",
    verifymeUserId: "a0000012-0000-4000-8000-000000000012",
    verifymeId: "vmzz12xy",
    email: "disabled.user@example.com",
    clientUserId: "cust_acme_disabled_01",
    organization: "Acme Corporation",
    organizationId: "ORG-001",
    status: "disabled",
    verificationSessions: 64,
    lastActive: "2024-03-01T10:15:00",
    created: "2024-02-21",
    device: d("iPhone 12", "iOS", "active", "2024-02-21T07:15:00Z", "2024-03-01T10:15:00Z", "Device replaced; previous binding revoked"),
  },
  {
    id: "link-usr-03002-unassigned",
    verifymeUserId: "a0000013-0000-4000-8000-000000000013",
    verifymeId: "vmorphan1",
    email: "pending.link@example.com",
    clientUserId: "not_available",
    organization: "Not linked",
    organizationId: "ORG-UNASSIGNED",
    status: "pending",
    verificationSessions: 0,
    lastActive: null,
    created: "2024-04-10",
    device: d("Enrollment pending", "—", "pending_enrollment", "2024-04-10T02:00:00Z", null, "Awaiting enrollment"),
  },
];
