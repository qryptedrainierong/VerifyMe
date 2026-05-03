/** Design-phase mock data for Organization Detail tabs (VerifyMe Admin Portal). No secrets or private keys. */

export type MockClientApplication = {
  id: string;
  clientId: string;
  name: string;
  appType: string;
  environment: string;
  status: "active" | "inactive";
  lastUsed: string | null;
  secretStatus: "Secret active" | "Rotation due";
  lastRotated: string;
};

export type MockRedirectUri = {
  id: string;
  clientId: string;
  redirectUri: string;
  environment: string;
  status: "active" | "disabled";
};

export type MockQrKeyRow = {
  id: string;
  label: string;
  keyId: string;
  algorithm: string;
  verifyMePublicKeyStatus: "active" | "pending";
  orgPublicKeyStatus: "active" | "missing" | "pending";
  created: string;
  rotated: string | null;
  status: "active" | "rotation_pending";
};

export type MockVerificationSettings = {
  maxTokenAttempts: number;
  verificationTimeoutSeconds: number;
  allowOtpResend: boolean;
  maxOtpResends: number;
  platformMaxTokenAttempts: number;
  platformMaxTimeoutSeconds: number;
};

export type MockCreditTransaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  at: string;
};

export type MockVerificationSessionRow = {
  id: string;
  clientUserId: string;
  outcome: "Verified" | "Failed" | "Expired" | "Error" | "Indeterminate";
  billable: boolean;
  cost: number;
  at: string;
};

export type MockAuditRow = {
  id: string;
  event: string;
  actor: string;
  target: string;
  at: string;
};

const clientAppsByOrg: Record<string, MockClientApplication[]> = {
  "ORG-001": [
    {
      id: "ca-1",
      clientId: "ACME_CALLCENTER_PROD_001",
      name: "Call Center Production",
      appType: "CALLCENTER",
      environment: "PROD",
      status: "active",
      lastUsed: "2024-04-09T14:22:00Z",
      secretStatus: "Secret active",
      lastRotated: "2024-03-01",
    },
    {
      id: "ca-2",
      clientId: "ACME_MESSAGING_SANDBOX_001",
      name: "Messaging Sandbox",
      appType: "MESSAGING",
      environment: "SANDBOX",
      status: "active",
      lastUsed: "2024-04-08T09:10:00Z",
      secretStatus: "Rotation due",
      lastRotated: "2024-01-15",
    },
  ],
};

const defaultClientApps: MockClientApplication[] = [
  {
    id: "ca-def",
    clientId: "DEMO_CALLCENTER_PROD_001",
    name: "Primary integration",
    appType: "CALLCENTER",
    environment: "PROD",
    status: "active",
    lastUsed: null,
    secretStatus: "Secret active",
    lastRotated: "2024-04-01",
  },
];

export function getMockClientApplications(organizationId: string): MockClientApplication[] {
  return clientAppsByOrg[organizationId] ?? defaultClientApps;
}

const redirectUrisByOrg: Record<string, MockRedirectUri[]> = {
  "ORG-001": [
    {
      id: "ru-1",
      clientId: "ACME_CALLCENTER_PROD_001",
      redirectUri: "https://demoenterprise.qryptedtech.com/callback",
      environment: "PROD",
      status: "active",
    },
    {
      id: "ru-2",
      clientId: "ACME_CALLCENTER_PROD_001",
      redirectUri: "https://acme.com/auth/verifyme/callback",
      environment: "PROD",
      status: "active",
    },
  ],
};

const defaultRedirects: MockRedirectUri[] = [
  {
    id: "ru-def",
    clientId: "DEMO_CALLCENTER_PROD_001",
    redirectUri: "https://demoenterprise.qryptedtech.com/callback",
    environment: "PROD",
    status: "active",
  },
];

export function getMockRedirectUris(organizationId: string): MockRedirectUri[] {
  return redirectUrisByOrg[organizationId] ?? defaultRedirects;
}

export function getMockQrKeys(_organizationId: string): MockQrKeyRow[] {
  return [
    {
      id: "qk-1",
      label: "Primary QR signing",
      keyId: "vm-pub-2024-03",
      algorithm: "RSA-OAEP-256 / ECDSA P-256",
      verifyMePublicKeyStatus: "active",
      orgPublicKeyStatus: "active",
      created: "2024-01-20",
      rotated: "2024-03-10",
      status: "active",
    },
  ];
}

export function getMockVerificationSettings(_organizationId: string): MockVerificationSettings {
  return {
    maxTokenAttempts: 5,
    verificationTimeoutSeconds: 420,
    allowOtpResend: true,
    maxOtpResends: 3,
    platformMaxTokenAttempts: 10,
    platformMaxTimeoutSeconds: 900,
  };
}

export function getMockCreditTransactions(organizationId: string): MockCreditTransaction[] {
  return [
    { id: "tx-1", type: "Top-up", amount: 250, balanceAfter: 750, at: "2024-04-01T10:00:00Z" },
    { id: "tx-2", type: "Verification debit (billable)", amount: -12.5, balanceAfter: 737.5, at: "2024-04-05T16:30:00Z" },
    { id: "tx-3", type: "Email OTP (configurable)", amount: -0.5, balanceAfter: 737, at: "2024-04-06T11:12:00Z" },
  ];
}

export function getMockVerificationSessions(organizationId: string): MockVerificationSessionRow[] {
  return [
    {
      id: "VS-10021",
      clientUserId: "crm_user_8821",
      outcome: "Verified",
      billable: true,
      cost: 0.35,
      at: "2024-04-09T12:01:00Z",
    },
    {
      id: "VS-10022",
      clientUserId: "crm_user_9012",
      outcome: "Failed",
      billable: true,
      cost: 0.35,
      at: "2024-04-09T11:40:00Z",
    },
    {
      id: "VS-10023",
      clientUserId: "crm_user_7731",
      outcome: "Expired",
      billable: false,
      cost: 0,
      at: "2024-04-09T10:05:00Z",
    },
  ];
}

export function getMockAuditRows(organizationId: string): MockAuditRow[] {
  return [
    {
      id: "al-1",
      event: "client_app.created",
      actor: "ops@verifyme.com",
      target: organizationId,
      at: "2024-04-08T09:00:00Z",
    },
    {
      id: "al-2",
      event: "redirect_uri.added",
      actor: "owner@tenant.com",
      target: "PROD callback",
      at: "2024-04-07T15:22:00Z",
    },
  ];
}
