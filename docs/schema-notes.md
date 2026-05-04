# Schema notes (design phase)

**High-level table list only.** No SQL migrations, no ORM models, and no enforced constraints are delivered in this repository as part of this documentation step.

These names are **working** relational concepts for engineering alignment. Columns, indexes, and partitioning are intentionally omitted until backend design gates complete.

Terminology: [`glossary.md`](./glossary.md). Audit storage detail: [`audit-logs-schema.md`](./audit-logs-schema.md), event catalog: [`audit-logs-plan.md`](./audit-logs-plan.md).

## Core tenancy & clients

| Table | Purpose |
|-------|---------|
| **organizations** | Tenant: profile, **plan** tier, lifecycle status, timezone, currency, address. UI mocks use fields such as **organizationName**, **organizationCode**, **primaryClientId**, **creditBalance** (wallet), **seatLimit** / seats used, **paymentStanding** (invoice health, separate from lifecycle), **integrationStatus**, and lifecycle **status**. |
| **client_applications** | OIDC-style client apps: `client_id`, env, redirect URIs, scopes, **secret hashes / metadata** (not raw `client_secret` in plaintext at rest), org FK. |

## Admin users

| Table | Purpose |
|-------|---------|
| **verifyme_platform_admin_users** *(name TBD)* | **VerifyMe Admin Portal** operators, roles, MFA enrollment handles (no secrets); may alternatively be delegated to corporate IdP with shadow mapping table. |
| **organization_admin_users** | **Organization Admin Portal** users, roles, MFA enrollment handles (no secrets). |

## VerifyMe Users & devices

| Table | Purpose |
|-------|---------|
| **verifyme_users** | Mobile identity: email, name, status, recovery handles. |
| **user_devices** | Device binding, active device flag (MVP single device). |
| **user_device_secure_state** | Device-bound material for the Verification Service. |

### `user_device_secure_state`

This row holds what the **Verification Service** needs to validate end-user actions **without** persisting human-readable secrets in the clear. It stores device-bound **Encrypted_Auth_Cred** and **Transaction_Code** (and related references such as key handles and rotation metadata)—**not** raw passcode, OTP seed, biometric templates, a copy of the one-time token shown to the org rep, raw **client_secret**, org **private keys**, or raw encrypted QR blobs. See [`glossary.md`](./glossary.md).

## Organization ↔ end-user linking

| Table | Purpose |
|-------|---------|
| **organization_user_records** | Org-side CRM row: `client_user_id`, display name, invite state. |
| **organization_user_mappings** | Successful link between record and `verifyme_user_id`. |
| **organization_invites** | Single, bulk, or API-driven invites and lifecycle. |

## Verification & tokens

| Table | Purpose |
|-------|---------|
| **verification_sessions** | OIDC-style session: state, org, client, outcome, billable flags, timestamps. |
| **token_verification_attempts** | Individual token checks, OTP steps, errors (for support; not for storing OTP secrets). |
| **authorization_codes** | Issued auth codes pending exchange (hashes or opaque IDs at rest—not raw codes in admin UI). |
| **issued_tokens** | References to issued id_tokens / access tokens (hashes or opaque IDs—not raw tokens in admin UI). |

## Usage & money

| Table | Purpose |
|-------|---------|
| **usage_events** | Deduped billable and non-billable events for analytics and invoices. |
| **credit_wallets** | Monetary balance per org (and possibly per sub-wallet for promos). |
| **credit_transactions** | Top-ups, debits, adjustments, expiry rules. |

## Compliance

| Table | Purpose |
|-------|---------|
| **audit_logs** | Platform and org actions, security-sensitive changes, API lifecycle — see [`audit-logs-plan.md`](./audit-logs-plan.md), [`audit-logs-schema.md`](./audit-logs-schema.md), [`audit-logs-ui.md`](./audit-logs-ui.md). |

## Next steps (not now)

- Entity-relationship diagram
- Migration ordering
- PII retention and encryption-at-rest policy per column
- Event sourcing vs CRUD for `verification_sessions`
