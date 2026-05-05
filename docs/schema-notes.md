# Schema notes (design phase)

**High-level table list only.** No SQL migrations, no ORM models, and no enforced constraints are delivered in this repository as part of this documentation step.

These names are **working** relational concepts for engineering alignment. Columns, indexes, and partitioning are intentionally omitted until backend design gates complete.

Terminology: [`glossary.md`](./glossary.md). Risk scoring (design): [`risk-scoring.md`](./risk-scoring.md). Audit storage detail: [`audit-logs-schema.md`](./audit-logs-schema.md), event catalog: [`audit-logs-plan.md`](./audit-logs-plan.md).

**Do not swap `verifyme_id` and `verifyme_user_id`.** `verifyme_users.id` is the UUID primary key. `verifyme_id` is the public `vmXXXXXX` display identifier. `verifyme_user_id` in other tables is only the foreign key to `verifyme_users.id`. Normal **VerifyMe Admin** screens show **VerifyMe ID** and masked email; UUID keys surface only in technical/debug contexts. Email is private login / recovery / OTP delivery — not a public display identity. VerifyMe does not use **username** or **handle** terminology.

## Core tenancy & clients

| Table | Purpose |
|-------|---------|
| **organizations** | Tenant: profile, **plan** tier, lifecycle status, timezone, currency, address. UI mocks use fields such as **organizationName**, **organizationCode**, **primaryClientId**, **creditBalance** (wallet), **seatLimit** / seats used, **paymentStanding** (invoice health, separate from lifecycle), **integrationStatus**, and lifecycle **status**. |
| **client_applications** | OIDC-style client apps: `client_id`, `organization_id` FK, `client_secret_hash`, `allowed_scopes`, `redirect_uris`, `environment`, `status`. |

## Admin users

| Table | Purpose |
|-------|---------|
| **verifyme_admin_users** | **VerifyMe Admin Portal** operators: `id` UUID PK, `email`, `role`, `status`, `last_login_at`. MFA enrollment references (no secrets); may alternatively be delegated to corporate IdP with shadow mapping. |
| **organization_admin_users** | **Organization Admin Portal** users: `id` UUID PK, `organization_id` FK, `email`, `role`, `status`, `last_login_at`. MFA enrollment references (no secrets). |

## VerifyMe Users & devices

| Table | Purpose |
|-------|---------|
| **verifyme_users** | `id` UUID primary key · `verifyme_id` unique not null (public `vmXXXXXX`) · `email` private login/recovery/OTP delivery · `email_verified` · `status` · `verifyme_id_rotated_at` nullable · `created_at` · `updated_at` |
| **user_devices** | `id` UUID PK · `verifyme_user_id` UNIQUE FK to `verifyme_users.id` (MVP: one active device per user; this column is unique for the MVP device model) · `device_label` · `device_platform` · `device_registered_at` · `last_verified_at` · `status` |
| **user_device_secure_state** | Device-bound material for the Verification Service. |

### MVP single-device rule

Each **VerifyMe user** can have only **one active device** in the current MVP. Registering a new device **replaces** the existing device and **rotates** associated secure state. Future multi-device support may be introduced with additional security controls and policies.

### `user_device_secure_state`

This row holds what the **Verification Service** needs to validate end-user actions **without** persisting human-readable secrets in the clear. It stores device-bound **Encrypted_Auth_Cred** and **Transaction_Code** (and related references such as cryptographic key references and rotation metadata)—**not** raw passcode, OTP seed, biometric templates, a copy of the one-time token shown to the org rep, raw **client_secret**, org **private keys**, or raw encrypted QR blobs. See [`glossary.md`](./glossary.md).

## Organization ↔ end-user linking

| Table | Purpose |
|-------|---------|
| **organization_user_links** | `id` UUID PK · `organization_id` FK to **organizations** · `client_user_id` organization-side customer identifier (required) · `verifyme_user_id` FK to **verifyme_users.id** · `link_status` · `invited_at` · `linked_at` · `suspended_at` · `revoked_at` · optional **`customer_display_name`** (nullable, org UI reference only) · optional **`customer_reference`** (nullable) · optional **`customer_name_for_matching_encrypted`** (nullable, **documentation only** — encrypted at rest in production; used only for internal risk comparison, **not** exposed in Organization Admin UI) · optional **`name_match_status`** (nullable, derived **signal** only) · optional **`name_match_score`** (nullable) · optional **conflict** fields (e.g. `conflict_status`, `conflict_reason`, `conflict_reviewed_at`, `conflict_resolution`) — **conflict resolution is auditable**; **no** separate primary **link risk score** in product terms (see [`risk-scoring.md`](./risk-scoring.md)) |

**`organization_user_links` — name fields (clarified):**

- **`customer_display_name`**: Optional organization-provided label for **agent reference** in Organization Admin. Not verified by VerifyMe as legal identity.
- **`customer_name_for_matching` / `customer_name_for_matching_encrypted`**: Optional value used **only** for back-end fraud/risk comparison with VerifyMe profile data. **Not** shown in Organization Admin UI; document storage as encrypted in production.
- **`name_match_status` / `name_match_score`**: **Derived** consistency signal between org-provided data and VerifyMe profile comparison — **risk signal only**, not proof of identity. VerifyMe does **not** verify legal identity via names in this model.

Rotation of **`verifyme_id`** (public display id) does **not** break organization links because links use internal **`verifyme_user_id`** FK.

## Risk snapshots (design)

**Purpose:** Persist **VerifyMe User** (platform) **risk_score** / **risk_level** as versioned, explainable snapshots. **Identity links** use **conflict** and **name consistency** on the link row — not a separate primary **link risk score** table. Full rules: **[`risk-scoring.md`](./risk-scoring.md)**.

| Table | Purpose |
|-------|---------|
| **verifyme_user_risk_snapshots** | `id` UUID PK · `verifyme_user_id` FK · `risk_score` (0–100) · `risk_level` · `risk_factors_json` · `calculation_version` · `calculated_at` |

## Verification & tokens

| Table | Purpose |
|-------|---------|
| **verification_sessions** | OIDC-style session: org, client, `client_user_id`, masked **VerifyMe ID** for admin display (not internal FK), lifecycle / **session status**, **ID proof result** (or fields from which it is derived), billable flags, timestamps. Product UI keeps **session status**, **ID proof result**, **billing**, and **user risk** as distinct concepts (see [`glossary.md`](./glossary.md)). |
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
