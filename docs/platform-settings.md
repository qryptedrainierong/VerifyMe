# Platform settings

Global governance and operational policy center for the VerifyMe Admin Portal.

## Scope

Platform Settings is for platform-wide policy and defaults. It is not a tenant preference page and not a developer debug console.

Settings categories:

1. General Platform
2. Verification Policy
3. Risk & Governance
4. Organization Defaults
5. Billing & Credits Policy
6. Audit & Retention
7. Platform Team & Access Policy
8. Feature Controls
9. Developer / Internal (Super Admin only)

## Policy ownership

- Platform policy owners (Super Admin, approved platform admins) update global policy values.
- Organization admins do not edit platform policy directly.
- Organization portals consume defaults and limits from platform policy.

## Platform-enforced limits vs organization-configurable values

Use this model consistently:

- **Platform-enforced limits**: global upper/lower bounds (for example max retries, max timeout, retention bounds).
- **Organization-configurable values**: tenant-level operational values constrained by platform limits.

Examples:

- Platform sets maximum retries to 3.
- Organization can set retries to 1-3, not 4+.
- Platform controls billable outcome policy globally.
- Organization controls local operational preferences that do not violate global policy.

## Verification policy model

Verification policy defines:

- Session timeout bounds
- Retry and resend bounds
- Channel availability (call/message/web)
- Operator guidance toggles
- Billable vs non-billable outcome treatment

Billing policy must remain aligned with:

- Billable: ID Proof Pass, ID Proof Fail
- Non-billable: expired, cancelled, indeterminate, error

## Risk and governance model

Risk settings use safe operational controls only. The UI and docs must not expose:

- raw scoring weights
- internal fraud heuristics
- cross-organization detection internals

Risk remains a VerifyMe User platform posture; identity links focus on conflict and name consistency workflow.

## Audit behavior

Risky policy changes require confirmation and include the audit hint:

`This action will be recorded in audit logs.`

Settings-related audit actions:

- `platform_settings.updated`
- `verification_policy.updated`
- `risk_policy.updated`
- `organization_defaults.updated`
- `billing_policy.updated`
- `audit_policy.updated`
- `feature_control.updated`

Navigation affordance: Platform Settings includes a lightweight “View related audit logs” link to open governance-focused audit context; this is an investigation aid, not persistence proof of newly-created events in this frontend-only bundle.

## Future backend expectations

Current repository behavior is frontend/mock-only. Backend integration should:

- persist category-level policy revisions
- enforce platform limit constraints server-side
- store policy version/effective date/change actor metadata
- write settings audit events with governance category + severity

## Privacy and security restrictions

Platform Settings must never expose raw secrets or credential material, including:

- OTP, passcode, biometrics
- `client_secret`
- token material (`auth_code`, `id_token`, `access_token`)
- `Encrypted_Auth_Cred`
- `Transaction_Code`
- private keys

Developer/Internal diagnostics are Super Admin-only and still subject to redaction rules.
