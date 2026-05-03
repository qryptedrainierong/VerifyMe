import { PortalPagePlaceholder } from "../../shared/components/PortalPagePlaceholder";

export function PlatformIdentityLinks() {
  return (
    <PortalPagePlaceholder
      title="Identity Links"
      description="View and manage mappings between organization client_user_id values and VerifyMe user identities."
      sections={[
        {
          title: "Link directory",
          description: "Searchable list of client_user_id ↔ VerifyMe identity pairs, link status, and last verification context.",
        },
        {
          title: "Conflict & review queue",
          description: "Planned surface for ambiguous or disputed links before they affect verification outcomes.",
        },
        {
          title: "Organization scope",
          description: "Filter and bulk actions scoped per organization for support and compliance workflows.",
        },
        {
          title: "Export & reporting",
          description: "Structured exports for audits without exposing raw secrets or one-time tokens in the UI.",
        },
      ]}
    />
  );
}

export function PlatformVerificationSessions() {
  return (
    <PortalPagePlaceholder
      title="Verification Sessions"
      description="Monitor verification attempts, outcomes, attempts used, billable status, OTP events, and session lifecycle."
      sections={[
        {
          title: "Live & recent sessions",
          description: "Timeline of OIDC-style verification flows from authorize through id_token issuance.",
        },
        {
          title: "Attempts & outcomes",
          description: "Per-session attempt counts, success/failure reasons, and token consumption.",
        },
        {
          title: "Billable events",
          description: "Which sessions counted toward credits, OTP surcharges, and organization pricing.",
        },
        {
          title: "OTP & device signals",
          description: "High-level OTP milestones only — no secret values or end-user credentials in the portal.",
        },
      ]}
    />
  );
}

export function PlatformClientApps() {
  return (
    <PortalPagePlaceholder
      title="Client Apps / API"
      description="Manage client applications, client IDs, secrets, redirect URIs, scopes, and integration status."
      sections={[
        {
          title: "Applications",
          description: "Register and rotate client credentials; show secret status (configured / needs rotation) without revealing values.",
        },
        {
          title: "Redirect URIs & scopes",
          description: "Allowed callbacks and requested scopes aligned with VerifyMe’s verification and token issuance model.",
        },
        {
          title: "Integration health",
          description: "Last successful token exchange, common misconfiguration hints, and environment separation (sandbox vs production).",
        },
        {
          title: "Documentation links",
          description: "Entry points to integration guides and OIDC-style flow diagrams for technical owners.",
        },
      ]}
    />
  );
}
