# API overview (design phase)

VerifyMe exposes **HTTP APIs** and **OIDC-style patterns** so organizations can integrate identity verification into call-center and messaging workflows. This document is **conceptual**; OpenAPI URLs and exact paths are TBD when backend stubs ship.

Terms: [`glossary.md`](./glossary.md). Flow detail: [`verification-flow.md`](./verification-flow.md).

## OIDC-style flow (summary)

1. Organization initiates **`/authorize`** toward VerifyMe.
2. **VerifyMe User** completes **VerifyMe mobile app** steps; see [`verification-flow.md`](./verification-flow.md).
3. Organization rep enters the one-time token on the **VerifyMe Verification Page**; **Handle Authorization** validates **before** returning **`auth_code`** to **`redirect_uri`**.
4. Organization backend exchanges **`auth_code`** on **`/token`**.
5. For **MVP**, **`id_token`** is the primary token consumed; other token types are secondary unless product extends scope.

No request/response schemas are frozen in this repo during the design phase.

## MVP scopes

- **Enabled in MVP:** `openid` **only**.
- **Future (not MVP):** e.g. `profile`, `offline_access`, or product-specific scopes — must be labeled **future** wherever referenced.

## Client applications

- One **organization** may register **multiple client applications** (different `client_id` values, redirect URIs, environments).
- **`client_id`** format: `<ORG_CODE>_<APP_TYPE>_<ENV>_<SEQ>` — see [`client-management.md`](./client-management.md).

## API documentation (product)

First-class deliverables include integration guides, sequence diagrams, and sample authorize and token requests **without** real secrets.

## Security posture (design)

- **client_secret** (or mTLS, or `private_key_jwt` — TBD) is never shown in full in admin UIs after creation; only **status** (active, rotation due, not set).
- Design does **not** call for storing or displaying raw **client_secret**, **private keys**, or **raw encrypted QR payload** contents for casual browsing or plaintext-at-rest export.
- Redirect URIs must match registered values exactly (path + query rules TBD).

## Verification Service boundary

The **Verification Service** already exists and will be integrated later. Admin portals in this repository do not invoke it during UI/UX phase work.

## Related

- [`qr-linking.md`](./qr-linking.md) — linking payloads and keys.
- [`billing-credits.md`](./billing-credits.md) — billable **verification session** outcomes.
