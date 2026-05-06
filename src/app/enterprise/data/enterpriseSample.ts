import {
  formatIntegrationStatus,
  getSampleOrganizationById,
  getVerificationSpend,
  planDefaults,
} from "../../platform/data/platformOrganizationsSample";
import { platformEndUserAssociations } from "../../platform/data/platformUsersSample";

const associatedOrganization = getSampleOrganizationById("ORG-001");

if (!associatedOrganization) {
  throw new Error("Associated enterprise organization sample is missing.");
}

export const enterpriseOrganization = associatedOrganization;
export const enterpriseUsageLimit = planDefaults[enterpriseOrganization.plan].usage;
export const enterpriseUsageSpend = getVerificationSpend(enterpriseOrganization);
export const enterpriseCreditRemaining = Math.max(enterpriseOrganization.creditBalance - enterpriseUsageSpend, 0);
export const enterpriseCreditUtilizationPct =
  enterpriseOrganization.creditBalance > 0 ? (enterpriseUsageSpend / enterpriseOrganization.creditBalance) * 100 : 0;
export const enterpriseUsagePct =
  enterpriseUsageLimit > 0 ? (enterpriseOrganization.usage / enterpriseUsageLimit) * 100 : 0;

export const enterpriseEndUsers = platformEndUserAssociations.filter(
  (user) => user.organizationId === enterpriseOrganization.id,
);
export const enterpriseActiveEndUsers = enterpriseEndUsers.filter((user) => user.status === "active").length;

export const enterpriseUsageTrend = Array.from({ length: 9 }, (_, index) => ({
  date: `Apr ${index + 1}`,
  usage: Math.round((enterpriseOrganization.usage / 9) * (0.88 + index * 0.03)),
}));

export const enterpriseInvoices = [
  {
    id: `INV-${enterpriseOrganization.id}-0424`,
    date: "Apr 1, 2024",
    amount: enterpriseUsageSpend,
    status:
      enterpriseOrganization.paymentStanding === "current"
        ? "success"
        : enterpriseOrganization.paymentStanding === "overdue"
          ? "pending"
          : "failed",
    period: "Apr 2024",
    actionRequired: enterpriseOrganization.paymentStanding !== "current",
  },
  {
    id: `INV-${enterpriseOrganization.id}-0324`,
    date: "Mar 1, 2024",
    amount: Math.round(enterpriseUsageSpend * 0.87),
    status: "success",
    period: "Mar 2024",
    actionRequired: false,
  },
  {
    id: `INV-${enterpriseOrganization.id}-0224`,
    date: "Feb 1, 2024",
    amount: Math.round(enterpriseUsageSpend * 0.81),
    status: "success",
    period: "Feb 2024",
    actionRequired: false,
  },
  {
    id: `INV-${enterpriseOrganization.id}-0124`,
    date: "Jan 1, 2024",
    amount: Math.round(enterpriseUsageSpend * 0.78),
    status: "pending",
    period: "Jan 2024",
    actionRequired: true,
  },
  {
    id: `INV-${enterpriseOrganization.id}-1223`,
    date: "Dec 1, 2023",
    amount: Math.round(enterpriseUsageSpend * 0.75),
    status: "failed",
    period: "Dec 2023",
    actionRequired: true,
  },
  {
    id: `INV-${enterpriseOrganization.id}-1123`,
    date: "Nov 1, 2023",
    amount: Math.round(enterpriseUsageSpend * 0.7),
    status: "warning",
    period: "Nov 2023",
    actionRequired: true,
  },
];

/** Design-phase: some steps incomplete so dashboard checklist is visible (UI only). */
export type EnterpriseSetupStepId =
  | "profile"
  | "api"
  | "redirect"
  | "qr"
  | "verification"
  | "test";

export type EnterpriseSetupStep = {
  id: EnterpriseSetupStepId;
  title: string;
  description: string;
  complete: boolean;
  ctaLabel: string;
  href: string;
};

export const enterpriseSetupSteps: EnterpriseSetupStep[] = [
  {
    id: "profile",
    title: "Complete organization profile",
    description:
      "Confirm legal name, organization type, industry, company size, address, timezone, currency, and key contacts.",
    complete: true,
    ctaLabel: "Review profile",
    href: "/settings",
  },
  {
    id: "api",
    title: "Configure API integration",
    description:
      "Review your client application, allowed scopes, and OIDC-style endpoints. Rotate credentials on a schedule.",
    complete: true,
    ctaLabel: "Open API integration",
    href: "/api-integration",
  },
  {
    id: "redirect",
    title: "Add redirect URI",
    description:
      "Configure the callback URL used after VerifyMe returns the OIDC authorization code. Only registered URIs can receive codes.",
    complete: false,
    ctaLabel: "Configure redirect URI",
    href: "/api-integration#redirect-uris",
  },
  {
    id: "qr",
    title: "Configure QR linking keys",
    description:
      "Upload your organization public key and confirm VerifyMe key material so QR and deep links can be issued safely.",
    complete: false,
    ctaLabel: "Open QR linking",
    href: "/qr-linking",
  },
  {
    id: "verification",
    title: "Configure verification settings",
    description:
      "Set verification attempts, session timeout, and resend behavior within platform limits for your organization.",
    complete: false,
    ctaLabel: "Open verification settings",
    href: "/settings#verification-settings",
  },
  {
    id: "test",
    title: "Test integration",
    description:
      "Run a sandbox verification through your callback and linking flow before enabling production traffic.",
    complete: false,
    ctaLabel: "View testing checklist",
    href: "/api-integration",
  },
];

export const enterprisePortalSetupIncomplete = enterpriseSetupSteps.some((s) => !s.complete);

export const enterpriseMockClientApplication = {
  clientId: enterpriseOrganization.primaryClientId,
  name: "Call Center Production",
  environment: "PROD" as const,
  secretStatus: "Secret active" as const,
  lastRotated: "2024-03-01",
  /** MVP: openid only. */
  allowedScopes: ["openid"],
  /** Not enabled for MVP — shown separately in the portal UI. */
  futureScopes: ["profile", "offline_access", "verifyme:verification"],
  integrationStatusLabel: formatIntegrationStatus(enterpriseOrganization.integrationStatus),
};

export const enterpriseApiIntegrationScenarios = [
  { id: "not_configured", label: "Not configured" },
  { id: "missing_redirect_uri", label: "Missing redirect URI" },
  { id: "missing_keys", label: "Missing keys" },
  { id: "ready_for_testing", label: "Ready for testing" },
  { id: "sandbox_active", label: "Sandbox active" },
  { id: "production_active", label: "Production active" },
  { id: "error", label: "Error" },
  { id: "disabled_app", label: "Disabled app" },
  { id: "secret_rotation_due", label: "Secret rotation due" },
];

export type EnterpriseMockRedirectUri = {
  id: string;
  redirectUri: string;
  environment: string;
  status: "active" | "disabled";
  created: string;
};

export const enterpriseMockRedirectUris: EnterpriseMockRedirectUri[] = [
  {
    id: "ru-1",
    redirectUri: "https://demoenterprise.qryptedtech.com/callback",
    environment: "PROD",
    status: "active",
    created: "2024-02-10",
  },
  {
    id: "ru-2",
    redirectUri: "https://acme.com/auth/verifyme/callback",
    environment: "PROD",
    status: "active",
    created: "2024-01-20",
  },
];

export type EnterpriseApiDocCard = {
  id: string;
  title: string;
  purpose: string;
  parametersSummary: string;
  readiness: "Ready" | "Configure redirect URI" | "Review scopes";
};

export const enterpriseApiDocCards: EnterpriseApiDocCard[] = [
  {
    id: "authorize",
    title: "Authorize",
    purpose: "Start the OIDC authorization request and send the end user to VerifyMe for verification.",
    parametersSummary: "response_type=code, client_id, redirect_uri, scope, state, nonce (recommended)",
    readiness: "Ready",
  },
  {
    id: "handle-auth",
    title: "Handle authorization",
    purpose:
      "Your organization’s representative enters the one-time verification token on the VerifyMe Verification Page. Handle Authorization validates the token; on success it returns auth_code, state, and redirect_uri so the flow can continue and your registered redirect_uri receives the authorization code only after validation succeeds.",
    parametersSummary:
      "Invoked from the Verification Page with the verification token; on success returns auth_code, state, redirect_uri.",
    readiness: "Configure redirect URI",
  },
  {
    id: "token",
    title: "Token",
    purpose: "Exchange the authorization code for tokens using client authentication (confidential client).",
    parametersSummary: "grant_type=authorization_code, code, redirect_uri, client_id",
    readiness: "Ready",
  },
];

export const enterpriseQrKeyRow = {
  verifyMePublicKeyStatus: "Active" as const,
  organizationPublicKeyStatus: "Missing" as const,
  keyId: "org-key-acme-2024-01",
  algorithm: "RSA-4096 / SHA-256 (sample)",
  lastRotated: "—",
};

export const enterpriseOrganizationProfileExtended = {
  fullAddress: "500 Howard Street, San Francisco, CA 94105, United States",
  primaryContact: { name: "Jordan Lee", email: "jordan.lee@acme.com", phone: "+1 (415) 555-0142" },
  technicalContact: { name: "Sam Rivera", email: "sam.rivera@acme.com", phone: "+1 (415) 555-0198" },
  billingContact: { name: "Alex Morgan", email: "billing@acme.com", phone: "+1 (415) 555-0100" },
  securityContact: { name: "Casey Kim", email: "security@acme.com", phone: "+1 (415) 555-0177" },
};

export const enterpriseVerificationSettingsMock = {
  maxAttemptsPerVerification: 8,
  verificationSessionTimeoutSeconds: 300,
  allowVerificationResend: true,
  maxResendCount: 3,
  platformMaxAttempts: 10,
  platformMaxTimeoutSeconds: 600,
};
