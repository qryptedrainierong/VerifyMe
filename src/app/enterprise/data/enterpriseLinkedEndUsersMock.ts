/** Design-phase mock data for Organization Admin → Linked End Users. UI only. */

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
  outcome: "Verified" | "Failed" | "Expired";
};

export type OrganizationUserRecord = {
  id: string;
  clientUserId: string;
  displayName: string;
  linkStatus: OrganizationLinkStatus;
  inviteStatus: OrganizationInviteStatus;
  maskedVerifymeUserId: string | null;
  /** When linkStatus is conflict: second masked identity involved in the clash (mock). */
  conflictingMaskedVerifymeUserId?: string | null;
  /** Org admin marked conflict dialog as reviewed (mock UI only). */
  conflictReviewed?: boolean;
  lastVerifiedAt: string | null;
  invitedAt: string | null;
  createdAt: string;
  verificationCount: number;
  customerNotes: string | null;
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
  "display_name": "John Tan"
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
    { clientUserId: "CUST-9001", displayName: "A. Tan", rowStatus: "valid" as const },
    { clientUserId: "CUST-9002", displayName: "B. Lim", rowStatus: "valid" as const },
    { clientUserId: "jsmith", displayName: "Dup", rowStatus: "duplicate" as const },
    { clientUserId: "jsmith", displayName: "Dup 2", rowStatus: "duplicate" as const },
    {
      clientUserId: "jsmith",
      displayName: "Would be duplicate of existing",
      rowStatus: "already_linked" as const,
      note: "client_user_id already has an active VerifyMe link for this organization.",
    },
    { clientUserId: "", displayName: "Bad", rowStatus: "invalid" as const },
  ],
};

export const csvTemplateContent = `client_user_id,display_name,optional_email,optional_phone
CUST-10001,Jane Doe,jane@example.com,+15550001111
CUST-10002,Sam Lee,,+15550002222`;

export function getInitialOrganizationUserRecords(): OrganizationUserRecord[] {
  return [
    {
      id: "ou-001",
      clientUserId: "jsmith",
      displayName: "John Smith",
      linkStatus: "linked",
      inviteStatus: "accepted",
      maskedVerifymeUserId: "vm_****3b9a",
      lastVerifiedAt: "2024-04-09T10:30:00Z",
      invitedAt: "2024-01-10T09:00:00Z",
      createdAt: "2024-01-15",
      verificationCount: 24,
      customerNotes: "Retail onboarding",
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
      displayName: "Maria Chan",
      linkStatus: "pending",
      inviteStatus: "pending",
      maskedVerifymeUserId: null,
      lastVerifiedAt: null,
      invitedAt: "2026-04-27T11:00:00Z",
      createdAt: "2026-04-27",
      verificationCount: 0,
      customerNotes: null,
      notificationPlaceholder: "email ••@acmepartners.sg",
      invite: createMockInvite("mchan", "inv_acme_mchan_01"),
      recentOutcomes: [],
    },
    {
      id: "ou-003",
      clientUserId: "knguyen",
      displayName: "Kim Nguyen",
      linkStatus: "unlinked",
      inviteStatus: "expired",
      maskedVerifymeUserId: null,
      lastVerifiedAt: null,
      invitedAt: "2026-03-01T12:00:00Z",
      createdAt: "2026-02-20",
      verificationCount: 0,
      customerNotes: "Awaiting re-invite",
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [],
    },
    {
      id: "ou-004",
      clientUserId: "bwong",
      displayName: "Ben Wong",
      linkStatus: "suspended",
      inviteStatus: "accepted",
      maskedVerifymeUserId: "vm_****8c21",
      lastVerifiedAt: "2024-03-15T09:00:00Z",
      invitedAt: "2024-01-05T10:00:00Z",
      createdAt: "2024-01-08",
      verificationCount: 6,
      customerNotes: "Fraud review hold",
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [{ at: "2024-03-15T09:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-005",
      clientUserId: "olee",
      displayName: "Olivia Lee",
      linkStatus: "revoked",
      inviteStatus: "superseded",
      maskedVerifymeUserId: null,
      lastVerifiedAt: "2024-02-01T14:00:00Z",
      invitedAt: "2023-12-01T08:00:00Z",
      createdAt: "2023-11-28",
      verificationCount: 3,
      customerNotes: "User requested unlink",
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [{ at: "2024-02-01T14:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-006",
      clientUserId: "padmin",
      displayName: "Policy Admin",
      linkStatus: "disabled",
      inviteStatus: "accepted",
      maskedVerifymeUserId: "vm_****1d44",
      lastVerifiedAt: null,
      invitedAt: "2023-10-01T10:00:00Z",
      createdAt: "2023-09-22",
      verificationCount: 0,
      customerNotes: "Disabled pending compliance review",
      notificationPlaceholder: null,
      invite: null,
      recentOutcomes: [],
    },
    {
      id: "ou-007",
      clientUserId: "dup-cust-01",
      displayName: "Duplicate scenario",
      linkStatus: "conflict",
      inviteStatus: "pending",
      maskedVerifymeUserId: "vm_****9e01",
      conflictingMaskedVerifymeUserId: "vm_****2a77",
      lastVerifiedAt: "2026-04-20T12:00:00Z",
      invitedAt: "2026-04-25T09:30:00Z",
      createdAt: "2026-04-18",
      verificationCount: 1,
      customerNotes: "Two VerifyMe identities attempted link",
      notificationPlaceholder: null,
      invite: createMockInvite("dup-cust-01", "inv_acme_dup_02"),
      recentOutcomes: [{ at: "2026-04-20T12:00:00Z", outcome: "Verified" }],
    },
    {
      id: "ou-008",
      clientUserId: "lexpired",
      displayName: "Lee Expired-invite",
      linkStatus: "pending",
      inviteStatus: "expired",
      maskedVerifymeUserId: null,
      lastVerifiedAt: null,
      invitedAt: "2024-01-10T09:00:00Z",
      createdAt: "2024-01-08",
      verificationCount: 0,
      customerNotes: "Sample: invite past expiry",
      notificationPlaceholder: null,
      invite: createMockInvite("lexpired", "inv_acme_lexpired_01", { expired: true }),
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
