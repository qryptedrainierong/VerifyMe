import type { IntegrationStatus } from "./platformOrganizationsSample";

export type ClientAppEnvironment = "sandbox" | "production";
export type RedirectUriStatus = "configured" | "missing";
export type QrKeyReadiness = "ready" | "missing";
export type ClientSecretStatus = "configured" | "rotation_due";

export type PlatformClientAppRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  appName: string;
  appType: string;
  environment: ClientAppEnvironment;
  /** MVP: openid only in production UI. */
  enabledScopes: string[];
  /** Design-phase: additional scopes not yet enabled. */
  futureScopes?: string[];
  /** Registered callback URLs for this client (sample). */
  registeredRedirectUris: string[];
  redirectUriStatus: RedirectUriStatus;
  qrKeyReadiness: QrKeyReadiness;
  secretStatus: ClientSecretStatus;
  lastUsed: string | null;
  integrationStatus: IntegrationStatus;
};

export const platformClientApps: PlatformClientAppRow[] = [
  {
    id: "APP-001",
    organizationId: "ORG-001",
    organizationName: "Acme Corporation",
    clientId: "ACME_CALLCENTER_PROD_001",
    appName: "Call Center Console",
    appType: "Web",
    environment: "production",
    enabledScopes: ["openid"],
    futureScopes: ["profile", "email"],
    registeredRedirectUris: ["https://acme.com/auth/verifyme/callback"],
    redirectUriStatus: "configured",
    qrKeyReadiness: "ready",
    secretStatus: "configured",
    lastUsed: "2024-04-09T10:30:00",
    integrationStatus: "production_active",
  },
  {
    id: "APP-002",
    organizationId: "ORG-002",
    organizationName: "TechStart Inc.",
    clientId: "TECHSTART_CALLCENTER_SANDBOX_001",
    appName: "Support Portal",
    appType: "Web",
    environment: "sandbox",
    enabledScopes: ["openid"],
    registeredRedirectUris: ["https://app.techstart.io/oauth/callback", "https://sandbox.techstart.io/oauth/callback"],
    redirectUriStatus: "configured",
    qrKeyReadiness: "ready",
    secretStatus: "rotation_due",
    lastUsed: "2024-04-08T16:10:00",
    integrationStatus: "sandbox_active",
  },
  {
    id: "APP-003",
    organizationId: "ORG-003",
    organizationName: "Global Ventures",
    clientId: "GV_MOBILE_IOS_002",
    appName: "GV Mobile",
    appType: "Native",
    environment: "production",
    enabledScopes: ["openid"],
    registeredRedirectUris: [],
    redirectUriStatus: "missing",
    qrKeyReadiness: "ready",
    secretStatus: "configured",
    lastUsed: "2024-04-01T09:00:00",
    integrationStatus: "missing_redirect_uri",
  },
  {
    id: "APP-004",
    organizationId: "ORG-005",
    organizationName: "Design Studio Pro",
    clientId: "DSP_WEB_001",
    appName: "Contractor Access",
    appType: "Web",
    environment: "production",
    enabledScopes: ["openid"],
    registeredRedirectUris: ["https://designstudio.io/app/oauth/cb"],
    redirectUriStatus: "configured",
    qrKeyReadiness: "missing",
    secretStatus: "configured",
    lastUsed: "2024-04-07T12:00:00",
    integrationStatus: "missing_keys",
  },
  {
    id: "APP-005",
    organizationId: "ORG-007",
    organizationName: "CloudScale Systems",
    clientId: "CS_API_GATEWAY_01",
    appName: "API Gateway",
    appType: "Service",
    environment: "production",
    enabledScopes: ["openid"],
    registeredRedirectUris: ["https://api.cloudscale.io/oauth2/cb"],
    redirectUriStatus: "configured",
    qrKeyReadiness: "ready",
    secretStatus: "rotation_due",
    lastUsed: "2024-04-09T06:45:00",
    integrationStatus: "production_active",
  },
  {
    id: "APP-006",
    organizationId: "ORG-004",
    organizationName: "Innovation Labs",
    clientId: "ILAB_SANDBOX_001",
    appName: "Lab Sandbox",
    appType: "Web",
    environment: "sandbox",
    enabledScopes: ["openid"],
    registeredRedirectUris: [],
    redirectUriStatus: "missing",
    qrKeyReadiness: "missing",
    secretStatus: "configured",
    lastUsed: null,
    integrationStatus: "not_configured",
  },
  {
    id: "APP-007",
    organizationId: "ORG-003",
    organizationName: "Global Ventures",
    clientId: "GV_LEGACY_WEB_001",
    appName: "Legacy Web Client",
    appType: "Web",
    environment: "production",
    enabledScopes: ["openid"],
    futureScopes: ["offline_access"],
    registeredRedirectUris: ["https://globalventures.com/auth/callback"],
    redirectUriStatus: "configured",
    qrKeyReadiness: "ready",
    secretStatus: "configured",
    lastUsed: null,
    integrationStatus: "error",
  },
];
