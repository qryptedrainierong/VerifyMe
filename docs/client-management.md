# Client & Organization Management (Design Phase)

## Core Mapping

- **Client = Organization** in product language. “Client” is how integrators often think about API credentials; “organization” is how admins manage tenancy, billing, and policies. Both refer to the same business entity.

## Identifiers

| Concept | Description |
|--------|-------------|
| **organization_id** | Internal immutable **UUID** for the organization record. Never exposed as the primary customer-facing API identifier. |
| **client_id** | External **API identifier** for a **client application** (OIDC-style integration). One organization can have **many** client applications. |

## client_id Format

External `client_id` values are structured as four underscore-separated segments. Placeholder names below describe each segment (they are not HTML).

**Pattern** (read left to right, underscores between segments):

```text
<ORG_CODE>_<APP_TYPE>_<ENV>_<SEQ>
```

**Example:**

```text
DEMO_CALLCENTER_PROD_001
```

Segment meanings:

- **ORG_CODE** — Short, stable code for the organization (not the UUID).
- **APP_TYPE** — Logical application class (e.g. `CALLCENTER`, `MESSAGING`, `BACKOFFICE`).
- **ENV** — `PROD`, `STAGING`, `SANDBOX`, etc.
- **SEQ** — Zero-padded sequence when multiple apps share type + env.

Exact validation rules (length, charset, reserved words) are TBD at implementation time; this format is the **design anchor**.

## Organization Profile (VerifyMe Admin)

Organization profile is expected to include at least:

- Organization **type** and **industry**
- **Company size** band
- **Full address** (structured fields for invoicing and compliance)
- **Timezone** and **currency** (for credits, invoices, and reporting)

## Lifecycle: VerifyMe Admin Creates Organization

VerifyMe Admin Portal flow (design intent):

1. **Profile** — Legal name, codes, industry, address, timezone, currency.
2. **Initial organization admin** — First Organization Admin Portal user (Owner-equivalent access to complete setup).
3. **Plan & credits** — Starter / Professional / Enterprise tier, initial credit wallet, per-organization verification pricing hooks (see [`billing-credits.md`](./billing-credits.md)).

## Lifecycle: Organization Admin Completes Setup

In the **Organization Admin Portal**, the customer completes remaining configuration:

1. **Complete profile** — Any optional fields, branding, contacts.
2. **Configure API integration** — Client applications, redirect URIs, environments (see [`api-overview.md`](./api-overview.md)).
3. **Add redirect URI** — Allowed callbacks for OIDC-style return paths.
4. **Configure QR linking keys** — Asymmetric keys for payloads (see [`qr-linking.md`](./qr-linking.md)).
5. **Configure verification settings** — Limits, session timeouts, OTP policy flags (design-time; no enforcement in this repo yet).
6. **Test integration** — Demo flow or sandbox verification against Verification Service (when wired).

## Administrative Controls (Product Rules)

- **Suspend** — VerifyMe admins (and appropriately scoped roles) may **suspend** an organization (temporary, reversible operational state).
- **Permanent disable / archive** — Only **Super Admin** (VerifyMe platform role) may permanently disable or archive an organization. Regular admins cannot irreversibly remove a tenant.

See [`admin-user-management.md`](./admin-user-management.md) for role matrices.
