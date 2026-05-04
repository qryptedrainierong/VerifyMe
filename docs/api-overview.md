# API Overview (Design Phase)

VerifyMe exposes **HTTP APIs** and **OIDC-style patterns** so organizations can integrate identity verification into call-center and messaging workflows. This document is a **conceptual** overview; OpenAPI URLs and exact paths are TBD when backend stubs ship.

## OIDC-Style Flow (Summary)

1. Organization initiates **authorization** (browser or system component) toward VerifyMe.
2. End-user completes **mobile app** steps and produces a **one-time verification token**; organization rep enters it on the **Verification Page**.
3. VerifyMe **Verification Service** validates the token.
4. VerifyMe returns an **auth_code** to the organization’s redirect URI.
5. Organization backend **exchanges** the auth_code for an **id_token** (and optionally other tokens per policy).

No request/response schemas are frozen in this repo during the design phase.

## MVP scopes

- **Enabled in MVP:** `openid` only.
- **Future (not enabled in MVP):** e.g. `profile`, `offline_access`, or product-specific scopes — rollout and labeling TBD.

## Client Applications

- One **organization** may register **multiple client applications** (different `client_id`s, redirect URIs, environments).
- **client_id** format and profile fields are defined in [`client-management.md`](./client-management.md).

## API Documentation (Product)

- **API documentation** is a first-class deliverable: integration guides, sequence diagrams, and **sample authorize requests** and **token exchange** examples (without real secrets).
- **Demo Enterprise Flow** uses sandbox credentials and fixed demo users where applicable.

## Security Posture (Design)

- **client_secret** (or mTLS, or private_key_jwt — TBD) is never shown in full in admin UIs after creation; only **status** (active, rotation due, not set). Design does **not** store raw **client_secret**, **private keys**, or **raw encrypted QR payload contents** for casual admin browsing or plaintext-at-rest export.
- Redirect URIs must match registered values exactly (path + query rules TBD).

## Verification Service Boundary

The **Verification Service** already exists and will be **plugged in** later. Admin portals in this repository do not invoke it during UI/UX phase work.

## Related

- [`qr-linking.md`](./qr-linking.md) — linking payloads and keys.
- [`billing-credits.md`](./billing-credits.md) — which API-driven events become billable.
