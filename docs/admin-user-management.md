# Admin User Management (Design Phase)

This document covers **human operators** of the two admin portals: who they are, how they authenticate (design intent), and what powers they have over organizations. It is not an implementation spec for auth providers or password policies.

## VerifyMe Admin Portal — Platform Roles

These roles apply to **internal** Qrypted / VerifyMe staff operating the **VerifyMe Admin Portal**:

| Role | Typical scope |
|------|----------------|
| **Super Admin** | Full platform control, including **permanent disable / archive** of organizations; sensitive defaults; irreversible actions. |
| **Admin** | Broad operations; **cannot** permanently disable or archive organizations. |
| **Operations** | Day-to-day monitoring, investigations, support escalations; limited configuration. |
| **Technical / API Manager** | Client applications, redirect URIs, integration health, technical incident response. |
| **Finance / Billing** | Credit wallets, pricing, invoices, top-ups, revenue recognition inputs. |
| **Compliance / Auditor** | Read-heavy access to audit trails, verification metadata, export for regulators. |

**Suspend vs disable:** Any admin role permitted by policy may **suspend** an organization for operations or risk. **Only Super Admin** may **permanently disable or archive** an organization.

## Organization Admin Portal — Tenant Roles

These roles apply to **customer** staff operating the **Organization Admin Portal**:

| Role | Typical scope |
|------|----------------|
| **Owner** | Full control within the tenant; billing delegation; cannot override VerifyMe platform suspension alone. |
| **Admin** | User and configuration management except where Owner-only locks apply. |
| **Operations** | Verification queues, call-center tooling, exception handling. |
| **Technical / API Manager** | API integration, client IDs, secrets **status** (not secret display), QR linking configuration. |
| **Finance / Billing** | Credits, usage views, invoices, payment methods. |
| **Compliance / Auditor** | Read-only verification logs and exports appropriate to the tenant. |

## Authentication (Design Intent)

- **Mechanism:** Admin login uses **email + password + email OTP** (second factor on each sign-in or per policy).
- **Not in scope for this repo today:** No real IdP, no SMS OTP for admins in MVP design (SMS may appear later for other channels per [`billing-credits.md`](./billing-credits.md)).

## Relationship To End-Users

- **Admin users** are **not** VerifyMe end-users. They use web portals.
- **VerifyMe end-users** use the **mobile app** only for onboarding and verification identity; see [`end-user-management.md`](./end-user-management.md).

## UI / Codebase Note

The React prototype may use sample labels (e.g. “Acme Corp”) for the Organization Admin Portal. Role names in the UI should converge on the tables above as screens are refined.
