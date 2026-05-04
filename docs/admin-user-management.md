# Admin user management (design phase)

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

**Suspend vs disable:** Roles permitted by policy may **suspend** an organization. **Only Super Admin** may **permanently disable or archive** an organization.

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

The React prototype may use sample labels. Role names in the UI should converge on the tables above as screens are refined.
