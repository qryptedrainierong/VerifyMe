# Admin user management

Human operators of the two admin portals: who they are, how they authenticate (design intent), and what they can do. Not an implementation spec for auth providers or password policies.

Terms: [`glossary.md`](./glossary.md).

## VerifyMe Admin Portal — platform roles

Internal Qrypted / VerifyMe staff operating the **VerifyMe Admin Portal**:

| Role | Typical scope |
|------|----------------|
| **Super Admin** | Full platform control, including **permanent disable / archive** of organizations; sensitive defaults; irreversible actions. |
| **Admin** | Broad operations; **cannot** permanently disable or archive organizations. |
| **Operations** | Day-to-day monitoring, investigations, support escalations; limited configuration. |
| **Technical / API Manager** | Client applications, redirect URIs, integration health, technical incident response. |
| **Finance / Billing** | **Credit** wallets, pricing, invoices, top-ups. |
| **Compliance / Auditor** | Read-heavy access to audit trails, **verification session** metadata, export for regulators. |

The VerifyMe Admin SPA also ships a **Preview role** control (top bar). It persists in browser `localStorage` (`verifyme_platform_role`) and changes what operators **see** in the shell: permitted sidebar sections only, role-scoped dashboard content, hidden or disabled controls when an action is not allowed for that role, and a dedicated access-denied screen when a URL is not permitted for the preview role (without rendering the real page behind it). **None of this is proof of identity or server-side authorization** — **UI filtering is not a security boundary.** Wire real roles from your IdP and enforce RBAC on every API in production.

**Suspend vs disable:** Roles permitted by policy may **suspend** an organization. **Only Super Admin** may **permanently disable or archive** an organization.

### Platform operator account (VerifyMe Admin shell)

Staff using the VerifyMe Admin Portal also have an **operator account** workspace in the UI: profile, security, notification center, and preferences (`/platform-profile`, `/platform-security`, `/platform-notifications`, `/platform-preferences`). This is **only** for **platform administrators** (Qrypted / VerifyMe staff), not **VerifyMe Users** and not **Organization Admin** users.

- In this repository, identity is **not** wired to an IdP: **Sign out** is disabled with copy that **backend authentication** is required.
- Preferences, notification read state, and “session revoked” markers are **browser-local** until backend persistence and audit exist.
- **Compliance / Auditor** preview role: credential-changing actions (e.g. MFA reset, password reset request) are disabled in the security UI; notification preferences and read-only review remain available where implemented (`canPerformOperatorSecurityAction` in `platformRolePermissions.ts`).

## Organization Admin Portal — tenant roles

Customer staff operating the **Organization Admin Portal**:

| Role | Typical scope |
|------|----------------|
| **Owner** | Full control within the tenant; billing delegation; cannot override VerifyMe platform suspension alone. |
| **Admin** | User and configuration management except Owner-only locks. |
| **Operations** | Verification queues, call-center tooling, exception handling. |
| **Technical / API Manager** | API integration, client IDs, secret **status** (not secret display), QR linking configuration. |
| **Finance / Billing** | **Credits**, usage views, invoices, payment methods. |
| **Compliance / Auditor** | Read-only **verification** logs and exports appropriate to the tenant. |

Each organization portal user has **one primary role** at a time in the MVP design.

## Authentication (design intent)

- **Mechanism:** Admin login uses **email + password + email OTP** (second factor per policy).
- **Not in MVP design for this repo:** SMS OTP for admins (SMS for other channels may appear later per [`billing-credits.md`](./billing-credits.md)).

## Relationship to VerifyMe Users

- **Organization portal admins** are **not** **VerifyMe Users**. They use web portals.
- **VerifyMe Users** use the **mobile app** only for onboarding and verification identity; see [`end-user-management.md`](./end-user-management.md).

## UI / codebase note

Role names in the UI should remain aligned with the tables above.
