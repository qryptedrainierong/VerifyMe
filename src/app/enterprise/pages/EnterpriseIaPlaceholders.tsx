import { PortalPagePlaceholder } from "../../shared/components/PortalPagePlaceholder";

export function EnterpriseVerificationLogs() {
  return (
    <PortalPagePlaceholder
      title="Verification Logs"
      description="Review all verification sessions for this organization, including result, attempts used, billable status, cost, and timestamp."
      sections={[
        {
          title: "Session list",
          description: "Filterable log of verification sessions with outcome, duration, and billable classification.",
        },
        {
          title: "Cost & credits",
          description: "Per-session estimated cost against credits, including OTP-related line items where applicable.",
        },
        {
          title: "Drill-down",
          description: "Planned detail drawer for attempt history without exposing end-user secrets or raw id_token contents.",
        },
        {
          title: "Exports",
          description: "Compliance-friendly exports with redacted identifiers suitable for operations and audit teams.",
        },
      ]}
    />
  );
}

export function EnterpriseApiIntegration() {
  return (
    <PortalPagePlaceholder
      title="API Integration"
      description="View client ID, client secret status, redirect URI configuration, API documentation, sample authorize request, and token exchange guidance."
      sections={[
        {
          title: "Credentials overview",
          description: "Client ID in full; secret shown only as configured / not set / rotation due — never the secret string.",
        },
        {
          title: "Redirect URIs",
          description: "Registered callback URLs validated against your VerifyMe client configuration.",
        },
        {
          title: "Sample authorize URL",
          description: "Templated authorize request highlighting response_type, scope, state, and nonce placeholders.",
        },
        {
          title: "Token exchange",
          description: "Step-by-step guidance for exchanging codes for id_token in line with VerifyMe’s verification flow.",
        },
      ]}
    />
  );
}

export function EnterpriseQrLinking() {
  return (
    <PortalPagePlaceholder
      title="QR Linking"
      description="Configure QR-based linking between organization customer records and VerifyMe users. Include key exchange status, payload format, expiry, and sample QR structure."
      sections={[
        {
          title: "Key exchange status",
          description: "Indicator of whether cryptographic material for QR payloads is provisioned and healthy.",
        },
        {
          title: "Payload format",
          description: "Versioned schema reference for what the mobile app and organization systems exchange.",
        },
        {
          title: "Expiry & rotation",
          description: "TTL defaults, renewal policies, and safe rotation without breaking in-flight linking.",
        },
        {
          title: "Sample QR structure",
          description: "Non-sensitive example layout for documentation and call-center scripting.",
        },
      ]}
    />
  );
}
