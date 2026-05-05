# VerifyMe end-user management (design phase)

**VerifyMe Users** are people who install the **VerifyMe mobile app** and hold a verified identity used when organizations run OIDC-style **verification sessions**. They are **not** the same as **Organization Admin Portal** users.

Terms: [`glossary.md`](./glossary.md). QR and invites: [`qr-linking.md`](./qr-linking.md).

**VerifyMe Admin (operators)** should use **VerifyMe ID** (`vm…`) for user-facing references; internal UUIDs (`verifyme_user_id`) belong in backend joins and optional technical/debug surfaces only.

**Risk:** **Risk score / risk level** belong to the **VerifyMe User** (platform-wide). **Identity links** focus on **conflict**, **resolution**, and **name consistency** — not a separate primary link risk score. **Organization Admin** may see a **User risk status** indicator only, not cross-organization detail. See **[`risk-scoring.md`](./risk-scoring.md)**.

**Verification wording:** **Session status** and **ID proof result** (**ID Proof Pass** / **ID Proof Fail**, etc.) are separate from **risk status**. **Name mismatch** is a contextual signal: a link can show **name consistency** mismatch while the latest session still has **ID Proof Pass** — operators review conflict and context, not the proof label alone. See **[`glossary.md`](./glossary.md)** and **[`billing-credits.md`](./billing-credits.md)**.

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

### Linked End Users — customer fields (design)

- **`client_user_id`** is **required** on each organization-side record.
- **`customer_display_name`** is **optional**. It is organization-provided **visual context for agents only**; VerifyMe does **not** validate or verify it as legal identity.
- **Name comparison** (when enabled in product) produces **`name_match_status`** as a **risk signal only** — not proof that the organization’s label matches a legal name.
- **Privacy (Organization Admin):** Do **not** display VerifyMe **full name** in Organization UIs. Do **not** show organization name and VerifyMe profile name **side-by-side**. Agents see optional **customer display name** and the **name consistency** (match status) signal only — not raw matching inputs. See [`schema-notes.md`](./schema-notes.md) and [`glossary.md`](./glossary.md).

## Linked End Users — link status (UI alignment)

Organization Admin **Linked End Users** mocks use **linkStatus** values:

`unlinked` · `pending` · `linked` · `suspended` · `revoked` · `disabled` · `conflict`

Invite envelope state (separate from link) may include `none`, `pending`, `accepted`, `expired`, `superseded` for invite lifecycle.

## Terminology

Prefer **VerifyMe User** when the subject is the mobile identity. Prefer **Linked End User** (or organization user record) when the subject is the enterprise’s view of that relationship.

Public display for a VerifyMe User in admin/support contexts is the **VerifyMe ID** (`verifyme_id`, `vmXXXXXX`). Internal joins use **`verifyme_user_id`** → `verifyme_users.id`. The organization’s customer key is **`client_user_id`**. **Email** is private account email, not a username.
