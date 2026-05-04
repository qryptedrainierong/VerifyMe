# QR Linking (Design Phase)

QR linking connects an organization’s **customer record** (e.g. CRM `client_user_id`) to a **VerifyMe user identity** without exposing raw PII in the QR beyond what the organization already controls.

## Generation

- The organization generates a QR or invite from:
  - Their **user account page** in internal systems, **or**
  - **Server-side API** (preferred for call-center scale).

## QR Content (Conceptual)

The QR encodes at least:

- **client_id** (external API identifier for the client application)
- **Encrypted payload** containing **`client_user_id`** and binding metadata

## Cryptography (Design Decisions)

- **Asymmetric encryption** for confidentiality and non-repudiation patterns.
- **VerifyMe public key** — Organization uses VerifyMe’s public key to **encrypt** payload material intended for VerifyMe to read.
- **Organization public key** — VerifyMe uses the organization’s public key to **verify signature** (or equivalent authenticity construct) on portions the org must vouch for.

## Payload Fields (Minimum Intent)

Include:

- **expiry** — TTL after which link attempt is rejected.
- **nonce** — Replay resistance.
- **issued_at** — Clock skew handling.
- **key_id** — Which key version was used (supports rotation).

Exact serialization (JSON vs CBOR), signing vs encrypting order, and binary vs URL-safe encoding are **implementation** concerns, not fixed here.

## User-Agent Behavior

1. **App installed:** **Deep link** opens VerifyMe mobile app directly into the link flow.
2. **App not installed:** Redirect to **app store / install**, then **resume** link flow.
3. **No VerifyMe account:** User completes **mobile signup** (see [`end-user-management.md`](./end-user-management.md)), then completes **link**.

## Admin Surfaces

- **Organization Admin Portal** — QR linking configuration, key exchange status, payload format reference, sample structure (no live secrets in UI; **no raw encrypted QR payload contents** surfaced for copy or download).
- **VerifyMe Admin Portal** — Global oversight of linking abuse, key rotation, and support tooling (design phase).
