# QR linking (design phase)

QR linking connects an organization’s **customer record** (e.g. CRM **`client_user_id`**) to a **VerifyMe User** without exposing unnecessary PII in the QR beyond what the organization already controls.

Terms: [`glossary.md`](./glossary.md). End-user and invite rules: [`end-user-management.md`](./end-user-management.md).

## Generation

The organization generates a QR or invite from:

- Their **user account** flows in internal systems, **or**
- **Server-side Invite API** (preferred for call-center scale).

## QR content (conceptual)

The QR encodes at least:

- **`client_id`** (external API identifier for the client application)
- **Encrypted payload** containing **`client_user_id`** and binding metadata

## Cryptography (design decisions)

- **Asymmetric encryption** for confidentiality and authenticity patterns.
- **VerifyMe public key** — Organization uses VerifyMe’s public key to encrypt payload material intended for VerifyMe.
- **Organization public key** — VerifyMe uses the organization’s public key to verify signature (or equivalent) on portions the org must vouch for.

Exact serialization, signing order, and encoding are **implementation** concerns, not fixed here.

## Payload fields (minimum intent)

Include **expiry**, **nonce**, **issued_at**, **key_id** (rotation). Do not document storage or display of **raw encrypted QR payload** contents in admin portals.

## User-agent behavior

1. **App installed:** **Deep link** opens VerifyMe mobile app directly into the link flow.
2. **App not installed:** Redirect to app store, then resume link flow.
3. **No VerifyMe account:** User completes **mobile signup**, then completes link.

## Admin surfaces

- **Organization Admin Portal** — QR linking configuration, key exchange status, payload format reference, sample structure (**no** live secrets; **no** raw ciphertext for copy or download).
- **VerifyMe Admin Portal** — Global oversight of linking abuse, key rotation, and support tooling (design phase).
