/** Linked End Users sample data for Organization Admin (in-memory UI). */

export type OrganizationLinkStatus =
  | "unlinked"
  | "pending"
  | "linked"
  | "suspended"
  | "revoked"
  | "disabled"
  | "conflict";

export type OrganizationInviteStatus = "none" | "pending" | "accepted" | "expired" | "superseded";

export type OrganizationUserInvite = {
  inviteId: string;
  inviteUrl: string;
  qrPayloadStatus: "Ready" | "Pending rotation";
  expiresAt: string;
  issuedAt: string;
  /** Preview only — not a raw verification value */
  noncePreview: string;
  clientId: string;
};

export type VerificationOutcomeRow = {
  at: string;
  /** Sample log line — display via orgVerificationOutcomeLabel(). */
  outcome: "Verified" | "Failed" | "Expired";
};

/** Product-facing label for Linked End Users recent outcome list (mock). */
export function orgVerificationOutcomeLabel(outcome: VerificationOutcomeRow["outcome"]): string {
  const m: Record<VerificationOutcomeRow["outcome"], string> = {
    Verified: "ID Proof Pass",
    Failed: "ID Proof Fail",
    Expired: "Expired",
  };
  return m[outcome];
}

/** Derived risk signal — never raw VerifyMe legal name; compare happens server-side in production. */
export type NameMatchStatus =
  | "not_provided"
  | "not_checked"
  | "strong_match"
  | "partial_match"
  | "mismatch";

export type OrganizationUserRecord = {
  id: string;
  clientUserId: string;
  /** Optional organization-provided label for agent reference only — not verified identity. */
  customerDisplayName?: string | null;
  /** Optional org reference string (account ref, CRM note key, etc.). */
  customerReference?: string | null;
  /**
   * Optional organization-provided name used only for risk comparison with VerifyMe profile data.
   * Not exposed in Organization Admin UI.
   */
  customerNameForMatching?: string;
  nameMatchStatus?: NameMatchStatus;
  nameMatchScore?: number;
  /**
   * Mock-only key aligning to platform VerifyMe Users sample for **user risk status** (not link risk).
   * Organization Admin does not see cross-organization risk detail.
   */
  platformRiskVerifymeId?: string | null;
  linkStatus: OrganizationLinkStatus;
  inviteStatus: OrganizationInviteStatus;
  maskedVerifymeId: string | null;
  /** When linkStatus is conflict: second masked VerifyMe ID involved in the clash (mock). */
  conflictingMaskedVerifymeId?: string | null;
  /** Org admin marked conflict dialog as reviewed (mock UI only). */
  conflictReviewed?: boolean;
  lastVerifiedAt: string | null;
  invitedAt: string | null;
  createdAt: string;
  verificationCount: number;
  notificationPlaceholder: string | null;
  invite: OrganizationUserInvite | null;
  recentOutcomes: VerificationOutcomeRow[];
};

const primaryClientId = "ACME_CALLCENTER_PROD_001";

/** True when expires_at is in the past (mock clock). */
export function isInviteExpiredByClock(invite: OrganizationUserInvite): boolean {
  const t = Date.parse(invite.expiresAt);
  return !Number.isNaN(t) && t < Date.now();
}

export function createMockInvite(
  clientUserId: string,
  inviteId: string,
  opts?: { expired?: boolean },
): OrganizationUserInvite {
  const expired = Boolean(opts?.expired);
  return {
    inviteId,
    inviteUrl: `https://verifyme.qryptedtech.com/link/${inviteId}`,
    qrPayloadStatus: expired ? "Pending rotation" : "Ready",
    expiresAt: expired ? "2024-01-15T10:00:00Z" : "2026-05-04T10:00:00Z",
    issuedAt: expired ? "2024-01-10T10:00:00Z" : "2026-04-28T14:22:00Z",
    noncePreview: "nnc_****7f2a",
    clientId: primaryClientId,
  };
}

export const inviteApiSampleRequest = `{
  "client_id": "${primaryClientId}",
  "client_user_id": "CUST12345",
  "customer_display_name": "John Tan",
  "customer_reference": "Account ending 0192"
}`;

export const inviteApiSampleResponse = `{
  "invite_id": "inv_123",
  "status": "pending",
  "invite_url": "https://verifyme.qryptedtech.com/link/inv_123",
  "qr_payload": "...",
  "expires_at": "2026-05-04T10:00:00Z"
}`;

export const bulkImportPreviewMock = {
  valid: 12,
  duplicateClientUserId: 2,
  alreadyLinked: 1,
  invalid: 3,
  previewRows: [
    { clientUserId: "CUST-9001", customerDisplayName: "A. Tan", customerReference: "REF-001", rowStatus: "valid" as const },
    { clientUserId: "CUST-9002", customerDisplayName: "B. Lim", customerReference: "", rowStatus: "valid" as const },
    { clientUserId: "jsmith", customerDisplayName: "Dup", customerReference: "", rowStatus: "duplicate" as const },
    { clientUserId: "jsmith", customerDisplayName: "Dup 2", customerReference: "", rowStatus: "duplicate" as const },
    {
      clientUserId: "jsmith",
      customerDisplayName: "Would be duplicate of existing",
      customerReference: "",
      rowStatus: "already_linked" as const,
      note: "client_user_id already has an active VerifyMe link for this organization.",
    },
    { clientUserId: "", customerDisplayName: "Bad", customerReference: "", rowStatus: "invalid" as const },
  ],
};

export const csvTemplateContent = `client_user_id,customer_display_name,customer_reference
CUST-10001,Jane Doe,CRM-ACC-99102
CUST-10002,,REF-BULK-220`;

export function nameConsistencyLabel(status: NameMatchStatus | undefined): string {
  switch (status) {
    case "strong_match":
      return "Strong match";
    case "partial_match":
      return "Partial match";
    case "mismatch":
      return "Mismatch";
    case "not_provided":
      return "Not available";
    case "not_checked":
    default:
      return "Not checked";
  }
}

/** Badge styles for Name consistency column (risk signal only). */
export function nameConsistencyBadgeClass(status: NameMatchStatus | undefined): string {
  switch (status) {
    case "strong_match":
      return "border-green-300 bg-green-500/10 text-green-800 dark:text-green-200";
    case "partial_match":
      return "border-amber-300 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    case "mismatch":
      return "border-red-300 bg-red-500/10 text-red-800 dark:text-red-200";
    case "not_provided":
    case "not_checked":
    default:
      return "border-border bg-muted/60 text-muted-foreground";
  }
}

export function getInitialOrganizationUserRecords(): OrganizationUserRecord[] {
  return [
    {
      id: "ou-001",
      clientUserId: "jsmith",
      customerDisplayName: "John Smith",
      customerReference: "Retail onboarding",
      customerNameForMatching: "John A Smith",
      nameMatchStatus: "strong_match",
      nameMatchScore: 0.94,
      platformRiskVerifymeId: "vm07f9a2",
      linkStatus: "linked",
      inviteStatus: "accepted",
      maskedVerifymeId: "vm_****3b9a",
      lastVerifiedAt: "2024-04-09T10:30:00Z",
      invitedAt: "2024-01-10T09:00:00Z",
      createdAt: "2024-01-15",
      verificationCount: 24,
      notificationPlaceholder: "SMS ending ••0142",
      invite: null,
      recentOutcomes: [
        { at: "2024-04-09T10:30:00Z", outcome: "Verified" },
        { at: "2024-04-02T08:12:00Z", outcome: "Verified" },
        { at: "2024-03-28T16:40:00Z", outcome: "Failed" },
      ],
    },
    {
      id: "ou-002",
      clientUserId: "mchan",
      customerDisplayName: "Maria Chan",
      customerReference: "Pending KYC bucket",
      customerNameForMatching: "Maria Chan",
      nameMatchStatus: "not_checked",
      platformRiskVerifymeId: null,
      linkStatus: "pending",
      inviteStatus: "pending",
      maskedVerifymeId: null,
      lastVerifiedAt: null,
      invitedAt: "2026-04-27T11:00:00Z",
      createdAt: "2026-04-27",
      verificationCount: 0,
      notificationPlaceholder: "email ••@acmepartners.sg",
      invite: createMockInvite("mchan", "inv_acme_mchan_01"),
      recentOutcomes: [],
    },
    {
      id: "ou-003",
      clientUserId: "knguyen",
      customerDisplayName: null,
      customerReference: "Awaiting re-invite",
      nameMatchStatus: "not_provided",
      platformRiskVerifymeId: null,
      linkStatus: "unlinked",
      inviteStatus: "expired",
      maskedVerifymeId: null,
      lastVerifiedAt: null,
      invitedAt: "2026-03-01T12:00:00Z",
      createdAt: "2026-02-20",
      verificationCount: 0,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [],
    },
    {
      id: "ou-004",
      clientUserId: "bwong",
      customerDisplayName: "Ben Wong",
      customerReference: "Fraud review hold",
      customerNameForMatching: "Benjamin Wong",
      nameMatchStatus: "partial_match",
      nameMatchScore: 0.72,
      platformRiskVerifymeId: "vmee90cd",
      linkStatus: "suspended",
      inviteStatus: "accepted",
      maskedVerifymeId: "vm_****8c21",
      lastVerifiedAt: "2024-03-15T09:00:00Z",
      invitedAt: "2024-01-05T10:00:00Z",
      createdAt: "2024-01-08",
      verificationCount: 6,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [{ at: "2024-03-15T09:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-005",
      clientUserId: "olee",
      customerDisplayName: "Olivia Lee",
      customerReference: "User requested unlink",
      customerNameForMatching: "Olivia Li",
      nameMatchStatus: "mismatch",
      nameMatchScore: 0.41,
      platformRiskVerifymeId: null,
      linkStatus: "revoked",
      inviteStatus: "superseded",
      maskedVerifymeId: null,
      lastVerifiedAt: "2024-02-01T14:00:00Z",
      invitedAt: "2023-12-01T08:00:00Z",
      createdAt: "2023-11-28",
      verificationCount: 3,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [{ at: "2024-02-01T14:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-006",
      clientUserId: "padmin",
      customerDisplayName: "Policy Admin",
      customerReference: "Disabled pending compliance review",
      nameMatchStatus: "strong_match",
      nameMatchScore: 0.91,
      platformRiskVerifymeId: "vmdd78ab",
      linkStatus: "disabled",
      inviteStatus: "accepted",
      maskedVerifymeId: "vm_****1d44",
      lastVerifiedAt: null,
      invitedAt: "2023-10-01T10:00:00Z",
      createdAt: "2023-09-22",
      verificationCount: 0,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [],
    },
    {
      id: "ou-007",
      clientUserId: "dup-cust-01",
      customerDisplayName: "Duplicate scenario",
      customerReference: "Conflict sample",
      customerNameForMatching: "Dup Scenario",
      nameMatchStatus: "not_checked",
      platformRiskVerifymeId: "vmconflict1",
      linkStatus: "conflict",
      inviteStatus: "pending",
      maskedVerifymeId: "vm_****9e01",
      conflictingMaskedVerifymeId: "vm_****2a77",
      lastVerifiedAt: "2026-04-20T12:00:00Z",
      invitedAt: "2026-04-25T09:30:00Z",
      createdAt: "2026-04-18",
      verificationCount: 1,
      notificationPlaceholder: null,
      invite: createMockInvite("dup-cust-01", "inv_acme_dup_02"),
      recentOutcomes: [{ at: "2026-04-20T12:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-008",
      clientUserId: "lexpired",
      customerDisplayName: "Lee Expired-invite",
      customerReference: "Sample: invite past expiry",
      nameMatchStatus: "not_provided",
      platformRiskVerifymeId: null,
      linkStatus: "pending",
      inviteStatus: "expired",
      maskedVerifymeId: null,
      lastVerifiedAt: null,
      invitedAt: "2024-01-10T09:00:00Z",
      createdAt: "2024-01-08",
      verificationCount: 0,
      notificationPlaceholder: null,
      invite: createMockInvite("lexpired", "inv_acme_lexpired_01", { expired: true }),
      recentOutcomes: [],
    },
    {
      id: "ou-009",
      clientUserId: "conf-resolved",
      customerDisplayName: "Conflict reviewed row",
      customerReference: "Support ticket CL-9921",
      customerNameForMatching: "Conflict Reviewed",
      nameMatchStatus: "not_checked",
      platformRiskVerifymeId: "vmconflict1",
      linkStatus: "conflict",
      inviteStatus: "pending",
      maskedVerifymeId: "vm_****9e01",
      conflictingMaskedVerifymeId: "vm_****2a77",
      conflictReviewed: true,
      lastVerifiedAt: "2026-04-18T11:00:00Z",
      invitedAt: "2026-04-19T08:00:00Z",
      createdAt: "2026-04-17",
      verificationCount: 2,
      notificationPlaceholder: null,
      invite: createMockInvite("conf-resolved", "inv_acme_conf_res_01"),
      recentOutcomes: [{ at: "2026-04-18T11:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-010",
      clientUserId: "risk-crit-demo",
      customerDisplayName: null,
      customerReference: "REF-ONLY-CRIT-DEMO",
      customerNameForMatching: "Risk Demo",
      nameMatchStatus: "mismatch",
      platformRiskVerifymeId: "vmorgdemo99",
      linkStatus: "linked",
      inviteStatus: "accepted",
      maskedVerifymeId: "vm_****d199",
      lastVerifiedAt: "2026-05-01T16:00:00Z",
      invitedAt: "2026-03-10T10:00:00Z",
      createdAt: "2026-03-08",
      verificationCount: 18,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [
        { at: "2026-05-01T16:00:00Z", outcome: "Failed" },
        { at: "2026-04-30T14:00:00Z", outcome: "Failed" },
        { at: "2026-04-29T09:00:00Z", outcome: "Failed" },
        { at: "2026-04-28T11:00:00Z", outcome: "Failed" },
        { at: "2026-04-27T08:00:00Z", outcome: "Verified" },
      ],
    },
    {
      id: "ou-011",
      clientUserId: "norecent",
      customerDisplayName: "No recent verification",
      customerReference: "Quiet account",
      nameMatchStatus: "strong_match",
      platformRiskVerifymeId: "vm07f9a2",
      linkStatus: "linked",
      inviteStatus: "accepted",
      maskedVerifymeId: "vm_****3b9a",
      lastVerifiedAt: "2023-08-01T10:00:00Z",
      invitedAt: "2023-07-01T09:00:00Z",
      createdAt: "2023-06-15",
      verificationCount: 2,
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [],
    },
  ];
}

export function linkStatusLabel(s: OrganizationLinkStatus): string {
  const m: Record<OrganizationLinkStatus, string> = {
    unlinked: "Unlinked",
    pending: "Pending",
    linked: "Linked",
    suspended: "Suspended",
    revoked: "Revoked",
    disabled: "Disabled",
    conflict: "Conflict",
  };
  return m[s];
}

export function inviteStatusLabel(s: OrganizationInviteStatus): string {
  const m: Record<OrganizationInviteStatus, string> = {
    none: "No invite",
    pending: "Pending",
    accepted: "Accepted",
    expired: "Expired",
    superseded: "Superseded",
  };
  return m[s];
}
