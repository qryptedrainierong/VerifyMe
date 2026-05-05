export type IdentityLinkStatus = "linked" | "pending" | "suspended" | "disabled";
export type IdentityLinkConflictStatus = "none" | "pending_review" | "resolved";

export type PlatformIdentityLinkRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientUserId: string;
  customerDisplayName: string;
  /** Masked public VerifyMe ID (`verifyme_id`) — never raw values in UI. */
  maskedVerifymeId: string;
  linkStatus: IdentityLinkStatus;
  lastVerified: string | null;
  createdLinkedAt: string;
  conflictStatus: IdentityLinkConflictStatus;
};

export const platformIdentityLinks: PlatformIdentityLinkRow[] = [
  {
    id: "IL-1001",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientUserId: "cust_acme_88291",
    customerDisplayName: "Jordan Lee",
    maskedVerifymeId: "vmid••••9f2a",
    linkStatus: "linked",
    lastVerified: "2024-04-09T10:12:00",
    createdLinkedAt: "2024-01-10",
    conflictStatus: "none",
  },
  {
    id: "IL-1002",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientUserId: "cust_acme_99102",
    customerDisplayName: "Priya Nair",
    maskedVerifymeId: "vmid••••1c88",
    linkStatus: "linked",
    lastVerified: "2024-04-08T18:40:00",
    createdLinkedAt: "2024-02-02",
    conflictStatus: "none",
  },
  {
    id: "IL-1003",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientUserId: "ts_user_441",
    customerDisplayName: "Alex Kim",
    maskedVerifymeId: "vmid••••77bd",
    linkStatus: "pending",
    lastVerified: null,
    createdLinkedAt: "2024-04-01",
    conflictStatus: "pending_review",
  },
  {
    id: "IL-1004",
    organizationId: "ORG-003",
    organizationName: "Global Ventures",
    clientUserId: "gv_portal_0092",
    customerDisplayName: "Sam Rivera",
    maskedVerifymeId: "vmid••••aa01",
    linkStatus: "linked",
    lastVerified: "2024-04-09T09:05:00",
    createdLinkedAt: "2023-12-20",
    conflictStatus: "resolved",
  },
  {
    id: "IL-1005",
    organizationId: "ORG-005",
    organizationName: "Design Studio Pro",
    clientUserId: "dsp_contractor_12",
    customerDisplayName: "Morgan Blake",
    maskedVerifymeId: "vmid••••4e33",
    linkStatus: "suspended",
    lastVerified: "2024-03-20T14:00:00",
    createdLinkedAt: "2024-01-28",
    conflictStatus: "none",
  },
  {
    id: "IL-1006",
    organizationId: "ORG-007",
    organizationName: "CloudScale Systems",
    clientUserId: "cs_ops_771",
    customerDisplayName: "Casey Wu",
    maskedVerifymeId: "vmid••••b902",
    linkStatus: "disabled",
    lastVerified: "2024-02-11T11:30:00",
    createdLinkedAt: "2024-02-01",
    conflictStatus: "none",
  },
  {
    id: "IL-1007",
    organizationId: "ORG-008",
    organizationName: "DataFlow Analytics",
    clientUserId: "dfa_analyst_03",
    customerDisplayName: "Riley Chen",
    maskedVerifymeId: "vmid••••c0de",
    linkStatus: "linked",
    lastVerified: "2024-04-09T07:55:00",
    createdLinkedAt: "2024-03-06",
    conflictStatus: "pending_review",
  },
];
