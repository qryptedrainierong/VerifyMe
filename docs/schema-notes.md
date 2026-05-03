# Schema Notes (Design Phase)

**High-level table list only.** No SQL migrations, no ORM models, and no enforced constraints are delivered in this repository as part of this documentation step.

These names are **working** relational concepts for engineering alignment. Columns, indexes, and partitioning are intentionally omitted until backend design gates complete.

## Core Tenancy & Clients

| Table | Purpose |
|-------|---------|
| **organizations** | Tenant: profile, plan tier, status (active / suspended / archived), timezone, currency, address. |
| **client_applications** | OIDC-style client apps: `client_id`, env, redirect URIs, scopes, secret metadata, org FK. |

## Admin Users

| Table | Purpose |
|-------|---------|
| **verifyme_platform_admin_users** *(name TBD)* | Internal VerifyMe Admin Portal operators, roles, MFA enrollment handles (no secrets); may alternatively be delegated to corporate IdP with shadow mapping table. |
| **organization_admin_users** | Organization Admin Portal users, roles, MFA enrollment handles (no secrets). |

## VerifyMe Users & Devices

| Table | Purpose |
|-------|---------|
| **verifyme_users** | Mobile identity: email, name, status, recovery handles. |
| **user_devices** | Device binding, active device flag (MVP single device). |
| **user_device_secure_state** | Device-bound secrets required by the Verification Service (see subsection below). |

### `user_device_secure_state` (privacy-preserving design)

This row holds material the **VerifyMe Verification Service** needs to validate end-user actions **without** persisting human-readable secrets or biometrics in the clear.

It stores device-bound **Encrypted_Auth_Cred** and **Transaction_Code** (and related references such as key handles and rotation metadata) as required by the VerifyMe Verification Service.

**Explicitly not stored** in this secure state (or elsewhere as plaintext at rest in this design):

- No **passcode**
- No **OTP** value or OTP seed
- No **biometric** template or raw biometric data
- No **generated one-time verification token** (the token is generated and consumed in the flow; storage is limited to what the Verification Service needs for validation, not a copy of the token shown to the org rep)

Wording intent: **privacy-preserving** — only the minimum device-bound cryptographic material needed for the service to function.

## Organization ↔ End-User Linking

| Table | Purpose |
|-------|---------|
| **organization_user_records** | Org-side CRM row: `client_user_id`, display name, invite state. |
| **organization_user_mappings** | Successful link between record and `verifyme_user_id`. |
| **organization_invites** | Single / bulk / API-driven invites and lifecycle. |

## Verification & Tokens

| Table | Purpose |
|-------|---------|
| **verification_sessions** | OIDC-style session: state, org, client, outcome, billable flags, timestamps. |
| **token_verification_attempts** | Individual token checks, OTP steps, errors (for support, not for storing OTP secrets). |
| **authorization_codes** | Issued auth codes pending exchange. |
| **issued_tokens** | References to issued id_tokens / access tokens (store hashes or opaque IDs, not raw tokens). |

## Usage & Money

| Table | Purpose |
|-------|---------|
| **usage_events** | Deduped billable and non-billable events for analytics and invoices. |
| **credit_wallets** | Monetary balance per org (and possibly per sub-wallet for promos). |
| **credit_transactions** | Top-ups, debits, adjustments, expiry rules. |

## Compliance

| Table | Purpose |
|-------|---------|
| **audit_logs** | Platform and org actions, security-sensitive changes, API lifecycle (see existing audit log design notes under `documentation/`). |

## Next Steps (Not Now)

- Entity-relationship diagram
- Migration ordering
- PII retention and encryption-at-rest policy per column
- Event sourcing vs CRUD for `verification_sessions`
