# Audit Logs UI

Current implementation reference for VerifyMe Admin audit logs.

Primary files:

- `src/app/platform/pages/PlatformAuditLogs.tsx`
- `src/app/shared/types/auditLog.ts`
- `src/app/platform/data/platformAuditLogsSample.ts`

Related docs:

- [`audit-logs-plan.md`](./audit-logs-plan.md)
- [`audit-logs-schema.md`](./audit-logs-schema.md)
- [`implementation-notes.md`](./implementation-notes.md)

## Operator model

Audit Logs is a read-only governance surface:

- No destructive row actions.
- Row click opens detail modal.
- Related entities are navigable from the modal where route-safe IDs exist.
- Sensitive payload fragments are redacted before display/export copy.

## Governance categories and severity

Rows are organized with governance semantics from `auditLog.ts`:

- Categories: Risk, Identity, Security, Verification, Governance, Billing.
- Severity: informational, warning, high, critical.
- Labels and chips are derived from action key helpers and optional per-row overrides.

## URL-driven filters

The page supports shareable query-driven filters, including:

- `search`
- `governanceCategory`
- `entityType`
- `focus` (`risk` or `conflict`)
- `verifymeId`
- `identityLinkId`
- `clientAppId`
- `verificationSessionId`
- `organizationId`
- `actor`
- `severity`
- `dateRange`

Deep links are generated via `auditLogsHref()` so entity pages can open pre-filtered governance context.

## Table and detail behavior

Table columns are operational context (timestamp, event, category, actor, target, organization, severity). Selecting a row opens a modal that follows this structure:

1. Summary
2. Context
3. Changes
4. Related entities
5. Technical details

Technical details are available for support/debug context, while sensitive values remain redacted.

## Modal interaction rules

- Open: row click.
- Close: explicit close controls and standard dialog close interactions.
- Actions in modal are non-destructive (copy/export-safe views, navigation, close).

## Related entity navigation

Where IDs are available and route-supported, modal links can navigate to:

- Organization detail
- VerifyMe User detail
- Identity Link detail
- Client App detail
- Verification Session context

## Sensitive data handling

UI must not expose raw secrets or private credentials, including:

- OTP, passcodes, biometrics
- raw `auth_code`, `id_token`, `access_token`
- raw `client_secret`
- private keys
- `Encrypted_Auth_Cred`
- `Transaction_Code`

Payload rendering applies redaction rules before values are shown or copied.

## Historical note

Older planning notes in this file described prototype checklists and partially implemented milestones. Those notes are superseded by the current implementation references above and retained in git history if needed.
