# Glossary

Canonical terminology for VerifyMe docs and UI copy. Other documents should **link here** instead of redefining these terms.

## Portals and people

**VerifyMe Admin Portal**  
Internal Qrypted / VerifyMe operator console: organizations, VerifyMe Users, identity links, verification sessions, client apps / API, billing & credits, audit logs, platform settings.

**Organization Admin Portal**  
Customer tenant console: Linked End Users, verification logs, API integration, QR linking, team & roles, usage & credits, billing, settings.

**VerifyMe User**  
A person who installs the **VerifyMe mobile app**, completes onboarding there, and holds the device-bound identity used in verification. Not the same as an organization portal admin.

**Linked End User**  
The organization’s view of a relationship between an **organization user record** (CRM / `client_user_id`) and a **VerifyMe User** after successful linking. Status is tracked in the Organization Admin Portal (see [`end-user-management.md`](./end-user-management.md)).

## Identifiers

**organization_id**  
Internal immutable identifier (e.g. UUID) for the organization tenant record. Distinct from customer-facing codes.

**organization_code**  
Short stable **ORG_CODE** segment used in human-readable references and as the first segment of **`client_id`** (see [`client-management.md`](./client-management.md)).

**client_id**  
External API identifier for a **client application** (OIDC-style). Format (design anchor):

`<ORG_CODE>_<APP_TYPE>_<ENV>_<SEQ>`

**client_user_id**  
Organization-owned customer record key carried in invites / QR payloads and verification context. Unique within an **organization**; not globally unique. Not a VerifyMe User identifier by itself until linked.

**id** (generic)  
Internal UUID primary key for a table unless a document names a specific table.

**verifyme_id**  
Public, privacy-safe **VerifyMe user** identifier in **`vmXXXXXX`** form (six alphanumeric characters after the prefix). **Generated at VerifyMe account creation** with a random, non-PII suffix: unique, stable, **not** derived from email, name, phone, organization, or `client_user_id`. Used for admin and support display. **Not** a relational foreign key and **not** interchangeable with `verifyme_user_id`. **Rotation** (support-controlled) changes the public id only through a defined admin workflow and **does not** break organization links because links use internal **`verifyme_user_id`**.

**verifyme_user_id**  
Foreign key to **`verifyme_users.id`** when used **outside** the `verifyme_users` table (e.g. on **organization_user_links**, **user_devices**). Internal relationship field only; do not use as primary human-facing identity in UI.

**email** (VerifyMe User)  
Private **login**, **recovery**, and **OTP delivery** identifier for the VerifyMe mobile account. **Not** a username, **not** public display identity; admin UIs should mask or restrict display.

**admin_user_id**  
Internal UUID for a **VerifyMe Admin Portal** or **Organization Admin Portal** staff user row when a doc needs a generic admin FK label.

**Device**  
Registered **VerifyMe User** device that holds secure verification state. In the **current MVP**, each VerifyMe user is limited to a **single active device**. Registering a new device replaces the existing device and rotates the associated secure state. Future versions may support multiple devices per user, subject to additional security controls and policies.

**Deprecated terminology**  
VerifyMe does **not** use **username**, **handle**, or **VerifyMe Handle** for end-user identity. Use **VerifyMe ID** (`verifyme_id`) for public display and **`client_user_id`** on the organization side.

## Verification and tokens

**verification session**  
One OIDC-style authorization attempt from `/authorize` through token exchange, with lifecycle states (e.g. initiated, challenge_dispatched, awaiting_token) and a final **outcome** (see [`verification-flow.md`](./verification-flow.md) and mock types in `src/app/shared/data/verificationSessionsMock.ts`).

**verification token**  
Short-lived **one-time** value generated in the VerifyMe app after passcode + OTP + biometric steps, entered by an organization representative on the **VerifyMe Verification Page**. Docs must **not** describe storing or displaying this token in admin UIs.

**Encrypted_Auth_Cred**  
Device-bound secret material required by the Verification Service. Stored only in appropriate secure state (see **user_device_secure_state** in [`schema-notes.md`](./schema-notes.md)). **Raw** values are not documented as stored or shown in portals.

**Transaction_Code**  
Material used with the Verification Service for challenges / rotation; paired with **Encrypted_Auth_Cred** in secure device state. **Raw** values are not documented as stored or shown in portals.

**auth_code**  
OAuth-style authorization code returned to the organization’s **redirect_uri** **after** successful token validation. Admin UIs must not display raw auth codes.

**id_token**  
OIDC-style identity token from the `/token` exchange. **MVP:** only **id_token** is relied on for the integration story; other token types may exist but are not the product focus. Raw tokens are not shown in admin UIs.

## Commercial model

**credits**  
Monetary value in an organization **credit wallet** (not an abstract “API quota”). Consumed according to plan and **billable outcomes**.

**billable outcome**  
A **final** verification session outcome that incurs a charge. **Billable:** Verified, Failed. **Not billable:** Expired, Error, Indeterminate, Cancelled, Pending. See [`billing-credits.md`](./billing-credits.md).

## Invites and linking

**organization invite**  
Organization-initiated path to associate a record with a VerifyMe User: single invite, bulk invite, or **Invite API**. The organization creates or invites records; the **end-user completes linking in the VerifyMe app** (no silent account creation).

**QR linking**  
Asymmetric payload / deep-link flow to bind `client_user_id` (and metadata) to a VerifyMe User. See [`qr-linking.md`](./qr-linking.md).
