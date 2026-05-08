# API overview

VerifyMe exposes **HTTP APIs** and **OIDC-style patterns** so organizations can integrate identity verification into call-center and messaging workflows. This document is **conceptual**; OpenAPI URLs and exact paths are TBD when backend stubs ship.

Terms: [`glossary.md`](./glossary.md). Flow detail: [`verification-flow.md`](./verification-flow.md).

**VerifyMe Admin** treats **VerifyMe ID** (`vm…`) as the primary user-facing identifier for VerifyMe Users; internal UUIDs (`verifyme_user_id`) are not displayed as primary identifiers in normal operator UI.

## OIDC-style flow (summary)

1. Organization initiates **`/authorize`** toward VerifyMe.
2. **VerifyMe User** completes **VerifyMe mobile app** steps; see [`verification-flow.md`](./verification-flow.md).
3. Organization rep enters the one-time token on the **VerifyMe Verification Page**; **Handle Authorization** validates **before** returning **`auth_code`** to **`redirect_uri`**.
4. Organization backend exchanges **`auth_code`** on **`/token`**.
5. For **MVP**, **`id_token`** is the primary token consumed; other token types are secondary unless product extends scope.

No request/response schemas are frozen in this repository yet.

## MVP scopes

- **Enabled in MVP:** `openid` **only**.
- **Future (not MVP):** e.g. `profile`, `offline_access`, or product-specific scopes — must be labeled **future** wherever referenced.

## Client applications

- One **organization** may register **multiple client applications** (different `client_id` values, redirect URIs, environments).
- **`client_id`** format: `<ORG_CODE>_<APP_TYPE>_<ENV>_<SEQ>` — see [`client-management.md`](./client-management.md).

## Identifiers (disambiguation)

- **`client_id`** — OIDC/API **client application** identifier (per registered app).
- **`client_user_id`** — Organization-side **customer / user record** identifier (per org; carried in authorize context and linking).
- **`verifyme_id`** — Public **VerifyMe user** display id (`vmXXXXXX`); not a foreign key.
- **`verifyme_user_id`** — Internal **FK** to `verifyme_users.id` in linking and device tables; not used as primary display in admin UI.

## API documentation (product)

First-class deliverables include integration guides, sequence diagrams, and sample authorize and token requests **without** real secrets.

## Security posture (design)

- **client_secret** (or mTLS, or `private_key_jwt` — TBD) is never shown in full in admin UIs after creation; only **status** (active, rotation due, not set).
- Design does **not** call for storing or displaying raw **client_secret**, **private keys**, or **raw encrypted QR payload** contents for casual browsing or plaintext-at-rest export.
- Redirect URIs must match registered values exactly (path + query rules TBD).

## Verification Service boundary

The **Verification Service** already exists and will be integrated later. Admin portals in this repository do not invoke it during UI/UX phase work.

## Session status, ID proof, billing, and risk (product)

- **Session status** is the operational state of a verification session (e.g. Pending, Verified, Not verified).
- **ID proof result** states whether the user proved identity for that session (**ID Proof Pass** / **ID Proof Fail** / Unavailable / Indeterminate).
- **Billing** follows completed proof attempts: **ID Proof Pass** and **ID Proof Fail** are billable; **Expired**, **Error**, **Indeterminate**, **Cancelled**, **Pending**, and **Awaiting verification** are not. See [`billing-credits.md`](./billing-credits.md).
- **Risk** on the **VerifyMe User** is modeled separately; repeated **ID Proof Fail** may increase platform risk, and **ID Proof Pass** does not automatically clear high risk. See [`risk-scoring.md`](./risk-scoring.md).

## Related

- [`qr-linking.md`](./qr-linking.md) — linking payloads and keys.
- [`billing-credits.md`](./billing-credits.md) — billable **verification session** outcomes.
