export type IdentityLinkStatus =
  | "unlinked"
  | "pending"
  | "linked"
  | "suspended"
  | "revoked"
  | "disabled";

export type IdentityLinkConflictStatus = "none" | "pending_review" | "resolved";

export type NameMatchStatus =
  | "not_provided"
  | "not_checked"
  | "strong_match"
  | "partial_match"
  | "mismatch";

export type VerifymeAccountStatusLabel = "Active" | "Pending" | "Suspended" | "Disabled";

export type PlatformIdentityLinkRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientUserId: string;
  customerDisplayName: string;
  /** Organization CRM / external reference when provided */
  customerReference?: string | null;
  /** Public VerifyMe identifier — primary display id for admins */
  verifymeId: string;
  linkStatus: IdentityLinkStatus;
  lastVerified: string | null;
  createdLinkedAt: string;
  conflictStatus: IdentityLinkConflictStatus;
  nameMatchStatus: NameMatchStatus;
  verifymeAccountStatus: VerifymeAccountStatusLabel;
  deviceStatusSummary: string;
  lastVerificationResult?: string | null;
  /** Operator / workflow notes — may surface in conflict review (sample). */
  riskNotes?: string | null;
  inviteRiskNotes?: string | null;
  /** Human-readable conflict driver when conflict review is active (sample). */
  conflictReason?: string | null;
  /** Mock reviewer id/email fragment when conflict was resolved. */
  conflictReviewedBy?: string | null;
  conflictReviewedAt?: string | null;
  conflictResolution?: string | null;
  /** 0–1 consistency signal (sample); not proof of identity. */
  nameMatchScore?: number | null;
};

export const platformIdentityLinks: PlatformIdentityLinkRow[] = [
  {
    id: "IL-1001",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientUserId: "cust_acme_88291",
    customerDisplayName: "Jordan Lee",
    customerReference: "CRM-ACME-88291",
    verifymeId: "vm07f9a2",
    linkStatus: "linked",
    lastVerified: "2024-04-09T10:12:00",
    createdLinkedAt: "2024-01-10",
    conflictStatus: "none",
    nameMatchStatus: "strong_match",
    nameMatchScore: 0.94,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Bound · one active device",
    lastVerificationResult: "ID Proof Pass",
    riskNotes: null,
    inviteRiskNotes: null,
  },
  {
    id: "IL-1002",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientUserId: "cust_acme_99102",
    customerDisplayName: "Priya Nair",
    customerReference: "EXT-PO-4401",
    verifymeId: "vm91b3c4",
    linkStatus: "linked",
    lastVerified: "2024-04-08T18:40:00",
    createdLinkedAt: "2024-02-02",
    conflictStatus: "none",
    nameMatchStatus: "partial_match",
    nameMatchScore: 0.78,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Bound · one active device",
    lastVerificationResult: "ID Proof Pass",
    riskNotes: null,
    inviteRiskNotes: null,
  },
  {
    id: "IL-1003",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientUserId: "ts_user_441",
    customerDisplayName: "Alex Kim",
    customerReference: null,
    verifymeId: "vm77bd01",
    linkStatus: "pending",
    lastVerified: null,
    createdLinkedAt: "2024-04-01",
    conflictStatus: "pending_review",
    nameMatchStatus: "not_checked",
    verifymeAccountStatus: "Pending",
    deviceStatusSummary: "Enrollment not completed",
    lastVerificationResult: null,
    riskNotes: "Customer display name differs from verified profile — review recommended.",
    inviteRiskNotes: "Invite opened from low-trust channel.",
    conflictReason: "Display name and invite channel raised consistency flags — pending operator review.",
  },
  {
    id: "IL-1004",
    organizationId: "ORG-003",
    organizationName: "Global Ventures",
    clientUserId: "gv_portal_0092",
    customerDisplayName: "Sam Rivera",
    customerReference: "GV-END-0092",
    verifymeId: "vmaa01bb",
    linkStatus: "linked",
    lastVerified: "2024-04-09T09:05:00",
    createdLinkedAt: "2023-12-20",
    conflictStatus: "resolved",
    nameMatchStatus: "strong_match",
    nameMatchScore: 0.92,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Bound · one active device",
    lastVerificationResult: "ID Proof Pass",
    riskNotes: null,
    inviteRiskNotes: null,
    conflictReviewedBy: "ops@verifyme.com",
    conflictReviewedAt: "2024-03-01T15:00:00Z",
    conflictResolution: "Prior label variance cleared after CRM update — no further action.",
  },
  {
    id: "IL-1005",
    organizationId: "ORG-005",
    organizationName: "Design Studio Pro",
    clientUserId: "dsp_contractor_12",
    customerDisplayName: "Morgan Blake",
    customerReference: null,
    verifymeId: "vm4e33cc",
    linkStatus: "suspended",
    lastVerified: "2024-03-20T14:00:00",
    createdLinkedAt: "2024-01-28",
    conflictStatus: "none",
    nameMatchStatus: "mismatch",
    nameMatchScore: 0.38,
    verifymeAccountStatus: "Suspended",
    deviceStatusSummary: "Bound · account suspended",
    lastVerificationResult: "ID Proof Fail",
    riskNotes: "Historical name mismatch flagged before suspension.",
    inviteRiskNotes: null,
  },
  {
    id: "IL-1006",
    organizationId: "ORG-007",
    organizationName: "CloudScale Systems",
    clientUserId: "cs_ops_771",
    customerDisplayName: "Casey Wu",
    customerReference: "CS-OPS-771",
    verifymeId: "vmb902dd",
    linkStatus: "disabled",
    lastVerified: "2024-02-11T11:30:00",
    createdLinkedAt: "2024-02-01",
    conflictStatus: "none",
    nameMatchStatus: "not_provided",
    verifymeAccountStatus: "Disabled",
    deviceStatusSummary: "Binding inactive",
    lastVerificationResult: null,
    riskNotes: null,
    inviteRiskNotes: null,
  },
  {
    id: "IL-1007",
    organizationId: "ORG-008",
    organizationName: "DataFlow Analytics",
    clientUserId: "dfa_analyst_03",
    customerDisplayName: "Riley Chen",
    customerReference: "DFA-REF-03",
    verifymeId: "vmc0deee",
    linkStatus: "linked",
    lastVerified: "2024-04-09T07:55:00",
    createdLinkedAt: "2024-03-06",
    conflictStatus: "pending_review",
    nameMatchStatus: "partial_match",
    nameMatchScore: 0.71,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Bound · one active device",
    lastVerificationResult: "ID Proof Pass",
    riskNotes: "Partial display-name match — monitoring.",
    inviteRiskNotes: null,
    conflictReason: "Partial name consistency while verification outcomes are passing — review for false comfort.",
  },
  {
    id: "IL-1008",
    organizationId: "ORG-004",
    organizationName: "Innovation Labs",
    clientUserId: "inno_beta_77",
    customerDisplayName: "Taylor Singh",
    customerReference: null,
    verifymeId: "vmready01",
    linkStatus: "unlinked",
    lastVerified: null,
    createdLinkedAt: "2024-04-02",
    conflictStatus: "none",
    nameMatchStatus: "not_provided",
    verifymeAccountStatus: "Pending",
    deviceStatusSummary: "No device bound",
    lastVerificationResult: null,
    riskNotes: null,
    inviteRiskNotes: "Customer abandoned invite before linking.",
  },
  {
    id: "IL-1009",
    organizationId: "ORG-006",
    organizationName: "Finance Corp",
    clientUserId: "fc_advisor_02",
    customerDisplayName: "Riley Ng",
    customerReference: "FC-ADV-02",
    verifymeId: "vmee05ee",
    linkStatus: "revoked",
    lastVerified: "2024-03-01T09:00:00",
    createdLinkedAt: "2023-10-15",
    conflictStatus: "resolved",
    nameMatchStatus: "strong_match",
    nameMatchScore: 0.9,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Revoked — prior binding cleared",
    lastVerificationResult: null,
    riskNotes: "Revoked per customer request; no open conflict.",
    inviteRiskNotes: null,
    conflictReviewedBy: "support@verifyme.com",
    conflictReviewedAt: "2024-03-02T10:00:00Z",
    conflictResolution: "Revocation confirmed; link closed with customer acknowledgment.",
  },
  {
    id: "IL-1010",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientUserId: "ts_contractor_901",
    customerDisplayName: "Jamie Park",
    customerReference: null,
    verifymeId: "vmconflict1",
    linkStatus: "linked",
    lastVerified: "2024-04-07T16:20:00",
    createdLinkedAt: "2024-03-18",
    conflictStatus: "pending_review",
    nameMatchStatus: "mismatch",
    nameMatchScore: 0.44,
    verifymeAccountStatus: "Active",
    deviceStatusSummary: "Bound · one active device",
    lastVerificationResult: "ID Proof Pass",
    riskNotes: "Organization label mismatch vs verified identity — conflict queue.",
    inviteRiskNotes: null,
    conflictReason:
      "Conflict reopened: customer-facing label remains inconsistent with verified VerifyMe profile after a later review.",
  },
];
