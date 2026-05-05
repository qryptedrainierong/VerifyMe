# VerifyMe end-user management (design phase)

**VerifyMe Users** are people who install the **VerifyMe mobile app** and hold a verified identity used when organizations run OIDC-style **verification sessions**. They are **not** the same as **Organization Admin Portal** users.

Terms: [`glossary.md`](./glossary.md). QR and invites: [`qr-linking.md`](./qr-linking.md).

## Onboarding channel

- **VerifyMe Users** onboard **only through the VerifyMe mobile app** (no self-serve web signup path for MVP in this design).

## Signup & device binding (MVP)

1. **Email + full name** registration.
2. **Email OTP** to verify mailbox ownership.
3. **Passcode** setup (app PIN).
4. **Biometric** setup where the device supports it.

Documentation must not imply storing or displaying raw passcode, **OTP** values, or raw biometric samples in admin portals.

### Single active device (MVP)

In the current MVP, each VerifyMe user is limited to a **single active device**. Registering a new device **replaces** the existing device and **rotates** the associated secure state. Future versions may support multiple devices per user, subject to additional security controls and policies.

## Account recovery

- **Email-based recovery** is the primary path (OTP and/or secure link policy TBD at implementation).

## Organization ↔ VerifyMe User relationship

Organizations do **not** own VerifyMe accounts. They link to them.

- Organizations may **invite** **VerifyMe Users** via **single invite**, **bulk invite**, or **automated Invite API** (server-to-server; rate limits and consent UX TBD).
- Organizations **create or invite records** (e.g. CRM **`client_user_id`**), but **only the end-user** completes **cryptographic linking** in the **VerifyMe app**.
- **No silent account creation:** a **VerifyMe User** must complete app onboarding and linking; the org cannot silently instantiate a VerifyMe user account.

## Linked End Users — link status (UI alignment)

Organization Admin **Linked End Users** mocks use **linkStatus** values:

`unlinked` · `pending` · `linked` · `suspended` · `revoked` · `disabled` · `conflict`

Invite envelope state (separate from link) may include `none`, `pending`, `accepted`, `expired`, `superseded` for invite lifecycle.

## Terminology

Prefer **VerifyMe User** when the subject is the mobile identity. Prefer **Linked End User** (or organization user record) when the subject is the enterprise’s view of that relationship.

Public display for a VerifyMe User in admin/support contexts is the **VerifyMe ID** (`verifyme_id`, `vmXXXXXX`). Internal joins use **`verifyme_user_id`** → `verifyme_users.id`. The organization’s customer key is **`client_user_id`**. **Email** is private account email, not a username.
