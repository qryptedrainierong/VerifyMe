/**
 * Design-phase mock verification sessions (platform + organization views).
 * No real secrets: timeline labels only; no OTP, token, Encrypted_Auth_Cred, Transaction_Code, auth_code, or id_token values.
 */

export type VerificationSessionLifecycle =
  | "initiated"
  | "challenge_dispatched"
  | "awaiting_token"
  | "verifying"
  | "verified"
  | "failed"
  | "expired"
  | "error"
  | "indeterminate"
  | "cancelled";

export type VerificationSessionOutcome =
  | "verified"
  | "failed"
  | "expired"
  | "error"
  | "indeterminate"
  | "cancelled"
  | "pending";

export type VerificationSessionChannel = "call" | "message" | "web";

export type VerificationTokenExchangeStatus = "not_started" | "success" | "failed";

export type SafeSessionTimelineEventName =
  | "Authorize request received"
  | "End-user mapping found"
  | "Email challenge sent"
  | "Awaiting verification token"
  | "Token submitted on Verification Page"
  | "Verification Service returned result"
  | "Authorization code issued"
  | "Token API exchange completed"
  | "Secure verification state rotated";

export type VerificationTimelineEvent = {
  at: string;
  label: SafeSessionTimelineEventName;
};

/** Final outcomes that incur a billable charge (single source of truth). */
export const BILLABLE_OUTCOMES = ["verified", "failed"] as const satisfies readonly VerificationSessionOutcome[];

export type MockVerificationSession = {
  sessionId: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  clientUserId: string;
  customerName: string;
  maskedVerifymeId: string | null;
  status: VerificationSessionLifecycle;
  outcome: VerificationSessionOutcome;
  method: "passcode_otp_biometric_token";
  channel: VerificationSessionChannel;
  attemptsUsed: number;
  maxAttempts: number;
  billable: boolean;
  cost: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  expiresAt: string;
  redirectUri: string;
  statePreview: string;
  noncePreview: string;
  authorizationCodeIssued: boolean;
  tokenExchangeStatus: VerificationTokenExchangeStatus;
  idTokenIssued: boolean;
  failureReason: string | null;
  timeline: VerificationTimelineEvent[];
};

export function isOutcomeBillable(outcome: VerificationSessionOutcome): boolean {
  return (BILLABLE_OUTCOMES as readonly VerificationSessionOutcome[]).includes(outcome);
}

function t(base: string, offsetMin: number): string {
  const d = new Date(base);
  d.setMinutes(d.getMinutes() + offsetMin);
  return d.toISOString();
}

const BASE = "2026-04-28T14:00:00.000Z";

function successTimeline(start: string): VerificationTimelineEvent[] {
  return [
    { at: t(start, 0), label: "Authorize request received" },
    { at: t(start, 1), label: "End-user mapping found" },
    { at: t(start, 2), label: "Email challenge sent" },
    { at: t(start, 4), label: "Awaiting verification token" },
    { at: t(start, 8), label: "Token submitted on Verification Page" },
    { at: t(start, 9), label: "Verification Service returned result" },
    { at: t(start, 10), label: "Authorization code issued" },
    { at: t(start, 11), label: "Token API exchange completed" },
    { at: t(start, 12), label: "Secure verification state rotated" },
  ];
}

function partialTimeline(start: string, upTo: SafeSessionTimelineEventName): VerificationTimelineEvent[] {
  const full = successTimeline(start);
  const idx = full.findIndex((e) => e.label === upTo);
  return idx >= 0 ? full.slice(0, idx + 1) : full;
}

const rawSessions: MockVerificationSession[] = [
  {
    sessionId: "vs-acme-240428-01",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    clientUserId: "jsmith",
    customerName: "John Smith",
    maskedVerifymeId: "vm_****3b9a",
    status: "verified",
    outcome: "verified",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: true,
    cost: 0.05,
    currency: "USD",
    createdAt: t(BASE, -120),
    updatedAt: t(BASE, -100),
    completedAt: t(BASE, -100),
    expiresAt: t(BASE, 30),
    redirectUri: "https://acme.com/auth/verifyme/callback",
    statePreview: "st_****91ab",
    noncePreview: "nc_****22f1",
    authorizationCodeIssued: true,
    tokenExchangeStatus: "success",
    idTokenIssued: true,
    failureReason: null,
    timeline: successTimeline(t(BASE, -120)),
  },
  {
    sessionId: "vs-acme-240428-02",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    clientUserId: "mchan",
    customerName: "Maria Chan",
    maskedVerifymeId: null,
    status: "failed",
    outcome: "failed",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 3,
    maxAttempts: 3,
    billable: true,
    cost: 0.05,
    currency: "USD",
    createdAt: t(BASE, -400),
    updatedAt: t(BASE, -360),
    completedAt: t(BASE, -360),
    expiresAt: t(BASE, -200),
    redirectUri: "https://demoenterprise.qryptedtech.com/callback",
    statePreview: "st_****77cc",
    noncePreview: "nc_****09aa",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: "Verification Service returned a negative result after maximum attempts (no secret values shown).",
    timeline: [
      ...partialTimeline(t(BASE, -400), "Token submitted on Verification Page"),
      { at: t(BASE, -361), label: "Verification Service returned result" },
    ],
  },
  {
    sessionId: "vs-acme-240427-09",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    clientUserId: "knguyen",
    customerName: "Kim Nguyen",
    maskedVerifymeId: null,
    status: "expired",
    outcome: "expired",
    method: "passcode_otp_biometric_token",
    channel: "message",
    attemptsUsed: 0,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "USD",
    createdAt: t(BASE, -3000),
    updatedAt: t(BASE, -2500),
    completedAt: t(BASE, -2500),
    expiresAt: t(BASE, -2520),
    redirectUri: "https://acme.com/auth/verifyme/callback",
    statePreview: "st_****44dd",
    noncePreview: "nc_****55ee",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: "Session TTL elapsed before a verification token was submitted.",
    timeline: partialTimeline(t(BASE, -3000), "Awaiting verification token"),
  },
  {
    sessionId: "vs-tech-240428-03",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientId: "TECHSTART_CALLCENTER_SANDBOX_001",
    clientUserId: "cust-8821",
    customerName: "Alex Rivera",
    maskedVerifymeId: "vm_****aa01",
    status: "verified",
    outcome: "verified",
    method: "passcode_otp_biometric_token",
    channel: "message",
    attemptsUsed: 2,
    maxAttempts: 3,
    billable: true,
    cost: 0.06,
    currency: "USD",
    createdAt: t(BASE, -80),
    updatedAt: t(BASE, -55),
    completedAt: t(BASE, -55),
    expiresAt: t(BASE, 40),
    redirectUri: "https://techstart.io/oauth/cb",
    statePreview: "st_****88ff",
    noncePreview: "nc_****11bb",
    authorizationCodeIssued: true,
    tokenExchangeStatus: "success",
    idTokenIssued: true,
    failureReason: null,
    timeline: successTimeline(t(BASE, -80)),
  },
  {
    sessionId: "vs-tech-240428-04",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientId: "TECHSTART_CALLCENTER_SANDBOX_001",
    clientUserId: "cust-9900",
    customerName: "Jamie Lee",
    maskedVerifymeId: "vm_****bb02",
    status: "error",
    outcome: "error",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "USD",
    createdAt: t(BASE, -2000),
    updatedAt: t(BASE, -1990),
    completedAt: t(BASE, -1990),
    expiresAt: t(BASE, -1800),
    redirectUri: "https://techstart.io/oauth/cb",
    statePreview: "st_****c0de",
    noncePreview: "nc_****feed",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: "Upstream integration fault — classified as error (not billable).",
    timeline: [
      { at: t(BASE, -2000), label: "Authorize request received" },
      { at: t(BASE, -1995), label: "End-user mapping found" },
      { at: t(BASE, -1992), label: "Verification Service returned result" },
    ],
  },
  {
    sessionId: "vs-global-240428-05",
    organizationId: "ORG-003",
    organizationName: "Global Ventures",
    clientId: "GLOBAL_MESSAGING_PROD_001",
    clientUserId: "gv-user-12",
    customerName: "Sam Patel",
    maskedVerifymeId: "vm_****cc03",
    status: "indeterminate",
    outcome: "indeterminate",
    method: "passcode_otp_biometric_token",
    channel: "message",
    attemptsUsed: 2,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "USD",
    createdAt: t(BASE, -6000),
    updatedAt: t(BASE, -5980),
    completedAt: t(BASE, -5980),
    expiresAt: t(BASE, -5800),
    redirectUri: "https://globalventures.com/vm/callback",
    statePreview: "st_****d1d1",
    noncePreview: "nc_****e2e2",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: "Outcome could not be classified conclusively for billing (support review).",
    timeline: partialTimeline(t(BASE, -6000), "Verification Service returned result"),
  },
  {
    sessionId: "vs-inno-240428-06",
    organizationId: "ORG-004",
    organizationName: "Innovation Labs",
    clientId: "INNO_CALLCENTER_PROD_001",
    clientUserId: "lab-441",
    customerName: "Chris Morgan",
    maskedVerifymeId: null,
    status: "challenge_dispatched",
    outcome: "pending",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 0,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "USD",
    createdAt: t(BASE, -15),
    updatedAt: t(BASE, -10),
    completedAt: null,
    expiresAt: t(BASE, 45),
    redirectUri: "https://innovationlabs.co/cb",
    statePreview: "st_****f3f3",
    noncePreview: "nc_****4040",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: null,
    timeline: partialTimeline(t(BASE, -15), "Email challenge sent"),
  },
  {
    sessionId: "vs-design-240427-07",
    organizationId: "ORG-005",
    organizationName: "Design Studio Pro",
    clientId: "DESIGN_CALLCENTER_PROD_001",
    clientUserId: "design-client-9",
    customerName: "Pat Kim",
    maskedVerifymeId: "vm_****dd04",
    status: "cancelled",
    outcome: "cancelled",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 0,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "EUR",
    createdAt: t(BASE, -8000),
    updatedAt: t(BASE, -7900),
    completedAt: t(BASE, -7900),
    expiresAt: t(BASE, -7800),
    redirectUri: "https://designstudio.io/auth/cb",
    statePreview: "st_****5050",
    noncePreview: "nc_****6161",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: "Cancelled by organization operator before completion.",
    timeline: [
      { at: t(BASE, -8000), label: "Authorize request received" },
      { at: t(BASE, -7950), label: "End-user mapping found" },
      { at: t(BASE, -7900), label: "Email challenge sent" },
    ],
  },
  {
    sessionId: "vs-finance-240428-08",
    organizationId: "ORG-006",
    organizationName: "Finance Corp",
    clientId: "FINANCE_CALLCENTER_PROD_001",
    clientUserId: "fc-trader-02",
    customerName: "Riley Ng",
    maskedVerifymeId: "vm_****ee05",
    status: "verified",
    outcome: "verified",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: true,
    cost: 0.04,
    currency: "USD",
    createdAt: t(BASE, -50),
    updatedAt: t(BASE, -35),
    completedAt: t(BASE, -35),
    expiresAt: t(BASE, 60),
    redirectUri: "https://financecorp.com/oauth/vm",
    statePreview: "st_****7272",
    noncePreview: "nc_****8383",
    authorizationCodeIssued: true,
    tokenExchangeStatus: "success",
    idTokenIssued: true,
    failureReason: null,
    timeline: successTimeline(t(BASE, -50)),
  },
  {
    sessionId: "vs-cloud-240428-09",
    organizationId: "ORG-007",
    organizationName: "CloudScale Systems",
    clientId: "CLOUD_MESSAGING_PROD_001",
    clientUserId: "cs-api-77",
    customerName: "Taylor Wu",
    maskedVerifymeId: "vm_****ff06",
    status: "verified",
    outcome: "verified",
    method: "passcode_otp_biometric_token",
    channel: "message",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: true,
    cost: 0.05,
    currency: "USD",
    createdAt: t(BASE, -30),
    updatedAt: t(BASE, -20),
    completedAt: t(BASE, -20),
    expiresAt: t(BASE, 90),
    redirectUri: "https://cloudscale.io/callback",
    statePreview: "st_****9494",
    noncePreview: "nc_****a5a5",
    authorizationCodeIssued: true,
    tokenExchangeStatus: "success",
    idTokenIssued: true,
    failureReason: null,
    timeline: successTimeline(t(BASE, -30)),
  },
  {
    sessionId: "vs-dataflow-240428-10",
    organizationId: "ORG-008",
    organizationName: "DataFlow Analytics",
    clientId: "DATAFLOW_CALLCENTER_PROD_001",
    clientUserId: "df-onboard-1",
    customerName: "Jordan Lee",
    maskedVerifymeId: null,
    status: "initiated",
    outcome: "pending",
    method: "passcode_otp_biometric_token",
    channel: "web",
    attemptsUsed: 0,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "SGD",
    createdAt: t(BASE, -5),
    updatedAt: t(BASE, -5),
    completedAt: null,
    expiresAt: t(BASE, 120),
    redirectUri: "https://dataflow.com/vm",
    statePreview: "st_****b6b6",
    noncePreview: "nc_****c7c7",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: null,
    timeline: [{ at: t(BASE, -5), label: "Authorize request received" }],
  },
  {
    sessionId: "vs-acme-240426-11",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    clientUserId: "bwong",
    customerName: "Ben Wong",
    maskedVerifymeId: "vm_****8c21",
    status: "verified",
    outcome: "verified",
    method: "passcode_otp_biometric_token",
    channel: "message",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: true,
    cost: 0.05,
    currency: "USD",
    createdAt: t(BASE, -9000),
    updatedAt: t(BASE, -8985),
    completedAt: t(BASE, -8985),
    expiresAt: t(BASE, -8800),
    redirectUri: "https://acme.com/auth/verifyme/callback",
    statePreview: "st_****d8d8",
    noncePreview: "nc_****e9e9",
    authorizationCodeIssued: true,
    tokenExchangeStatus: "failed",
    idTokenIssued: false,
    failureReason: "Authorization code issued, but Token API exchange failed at the organization integration (mock).",
    timeline: [
      { at: t(BASE, -9000), label: "Authorize request received" },
      { at: t(BASE, -8998), label: "End-user mapping found" },
      { at: t(BASE, -8996), label: "Email challenge sent" },
      { at: t(BASE, -8990), label: "Awaiting verification token" },
      { at: t(BASE, -8988), label: "Token submitted on Verification Page" },
      { at: t(BASE, -8987), label: "Verification Service returned result" },
      { at: t(BASE, -8986), label: "Authorization code issued" },
      { at: t(BASE, -8985), label: "Token API exchange completed" },
    ],
  },
  {
    sessionId: "vs-acme-240425-12",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    clientUserId: "olee",
    customerName: "Olivia Lee",
    maskedVerifymeId: null,
    status: "verifying",
    outcome: "pending",
    method: "passcode_otp_biometric_token",
    channel: "call",
    attemptsUsed: 1,
    maxAttempts: 3,
    billable: false,
    cost: 0,
    currency: "USD",
    createdAt: t(BASE, -8),
    updatedAt: t(BASE, -2),
    completedAt: null,
    expiresAt: t(BASE, 100),
    redirectUri: "https://acme.com/auth/verifyme/callback",
    statePreview: "st_****f0f0",
    noncePreview: "nc_****0101",
    authorizationCodeIssued: false,
    tokenExchangeStatus: "not_started",
    idTokenIssued: false,
    failureReason: null,
    timeline: partialTimeline(t(BASE, -8), "Token submitted on Verification Page"),
  },
];

export function getVerificationSessionsMock(): MockVerificationSession[] {
  return rawSessions.map((s) => ({
    ...s,
    billable: isOutcomeBillable(s.outcome),
  }));
}

export function getOrgVerificationSessions(organizationId: string): MockVerificationSession[] {
  return getVerificationSessionsMock().filter((s) => s.organizationId === organizationId);
}

export function channelLabel(channel: VerificationSessionChannel): string {
  const m: Record<VerificationSessionChannel, string> = {
    call: "Call",
    message: "Message",
    web: "Web",
  };
  return m[channel];
}

export function lifecycleLabel(status: VerificationSessionLifecycle): string {
  const m: Record<VerificationSessionLifecycle, string> = {
    initiated: "Initiated",
    challenge_dispatched: "Challenge dispatched",
    awaiting_token: "Awaiting token",
    verifying: "Verifying",
    verified: "Verified",
    failed: "Failed",
    expired: "Expired",
    error: "Error",
    indeterminate: "Indeterminate",
    cancelled: "Cancelled",
  };
  return m[status];
}

export function outcomeLabel(outcome: VerificationSessionOutcome): string {
  const m: Record<VerificationSessionOutcome, string> = {
    verified: "Verified",
    failed: "Failed",
    expired: "Expired",
    error: "Error",
    indeterminate: "Indeterminate",
    cancelled: "Cancelled",
    pending: "Pending",
  };
  return m[outcome];
}

export function tokenExchangeLabel(s: VerificationTokenExchangeStatus): string {
  const m: Record<VerificationTokenExchangeStatus, string> = {
    not_started: "Not started",
    success: "Success",
    failed: "Failed",
  };
  return m[s];
}
