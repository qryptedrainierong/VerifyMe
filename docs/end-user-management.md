# VerifyMe End-User Management (Design Phase)

**VerifyMe end-users** are people who install the **VerifyMe mobile app** and hold a verified identity used when organizations run **OIDC-style verification** flows. They are **not** the same as **organization portal admins** (who use the Organization Admin Portal).

## Onboarding Channel

- End-users **onboard only through the VerifyMe mobile app** (no self-serve web signup path for MVP in this design).

## Signup & Device Binding (MVP)

1. **Email + full name** registration.
2. **Email OTP** to verify mailbox ownership.
3. **Passcode** setup (app PIN).
4. **Biometric** setup where the device supports it.

### Single Active Device (MVP)

- MVP allows **only one active device** per VerifyMe user.
- **Setting up a new device revokes** the previous device’s sessions and keys (design intent: reduce account sharing and simplify support).

## Account Recovery

- **Email-based recovery** is the primary path (OTP and/or secure link policy TBD at implementation).

## Organization ↔ End-User Relationship

Organizations do **not** “own” VerifyMe accounts. They link to them.

- Organizations may **invite** end-users via:
  - **Single invite**
  - **Bulk invite** (CSV or campaign tooling — product TBD)
  - **Automated invite API** (server-to-server; rate limits and consent UX TBD)
- Organizations may **create or invite records** in their systems (e.g. CRM `client_user_id`), but **only the end-user** can complete **cryptographic linking** in the VerifyMe app (see [`qr-linking.md`](./qr-linking.md)).

## Terminology

Prefer **VerifyMe user** or **end-user** over generic “customer user” when the subject is the mobile identity. Prefer **linked end user** or **organization user record** when the subject is the enterprise’s view of that relationship.
