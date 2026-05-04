# Client & organization management (design phase)

Terms: [`glossary.md`](./glossary.md). Verification flow: [`verification-flow.md`](./verification-flow.md). Billing: [`billing-credits.md`](./billing-credits.md).

## Core mapping

- **Client = organization** in product language. “Client” is how integrators think about API credentials; **organization** is how admins manage tenancy, **plans**, and policies. Both refer to the same business entity.

## Identifiers

| Concept | Description |
|--------|-------------|
| **organization_id** | Internal immutable identifier for the organization record (e.g. UUID). |
| **organization_code** | Short stable **ORG_CODE** (shown as **organizationCode** in UI mocks). |
| **client_id** | External API identifier for a **client application**. One organization can have **many** client applications. |

## `client_id` format (design anchor)

```text
<ORG_CODE>_<APP_TYPE>_<ENV>_<SEQ>
```

**Example:** `ACME_CALLCENTER_PROD_001`

- **ORG_CODE** — Matches **organization_code**.
- **APP_TYPE** — Logical application class (e.g. `CALLCENTER`, `MESSAGING`, `BACKOFFICE`).
- **ENV** — `PROD`, `STAGING`, `SANDBOX`, etc.
- **SEQ** — Zero-padded sequence when multiple apps share type + env.

Exact validation rules (length, charset) are TBD at implementation time.

## Organization record (UI alignment)

Platform organization mocks and detail screens surface at least:

| Field / concept | Meaning |
|-----------------|--------|
| **organizationName** | Primary display name (not a generic `name` field in mocks). |
| **organizationCode** | Short code; visible on overview and tables. |
| **primaryClientId** | Primary integration client identifier shown beside the org code. |
| **creditBalance** | Monetary **credits** wallet balance. |
| **seatLimit** / seats used | **Organization Admin Portal** seat capacity (admin users), not verification volume. |
| **paymentStanding** | Invoice / payment health (`current`, `overdue`, `failed`) — **separate** from org lifecycle. |
| **plan** | Commercial **plan** tier (Starter / Professional / Enterprise). |
| **integrationStatus** | Integration readiness (see below). |
| **status** | Organization **lifecycle** (see below). |

### Organization lifecycle (`status`)

`draft` → `pending_setup` → `active`; may become `suspended`, `disabled`, or `archived` per policy.

### Integration status (`integrationStatus`)

`not_configured` → `missing_redirect_uri` / `missing_keys` → `ready_for_testing` → `sandbox_active` or `production_active`; `error` when integration health fails.

## Organization setup checklist (six steps)

Aligned with the **VerifyMe Admin Portal** organization overview checklist in the UI prototype:

1. **Complete organization profile** — legal name, codes, industry, address, timezone, currency; move out of `draft` as appropriate.
2. **Configure API integration** — client applications, environments (see [`api-overview.md`](./api-overview.md)).
3. **Add redirect URI** — allowed callbacks for OIDC-style return paths.
4. **Configure QR linking keys** — asymmetric keys for payloads (see [`qr-linking.md`](./qr-linking.md)).
5. **Configure verification settings** — limits, session timeouts, OTP policy flags (design-time).
6. **Test integration** — demo or sandbox path against the Verification Service when wired.

**Handle authorization:** the end-user token is entered on the **VerifyMe Verification Page**; validation completes **before** the **`redirect_uri`** receives **`auth_code`** (see [`verification-flow.md`](./verification-flow.md)).

## Lifecycle: VerifyMe Admin creates organization

1. **Profile** — legal name, **organizationCode**, industry, address, timezone, currency.
2. **Initial organization admin** — first **Organization Admin Portal** user (Owner-equivalent).
3. **Plan & credits** — tier, initial **credit** wallet, per-organization verification pricing hooks (see [`billing-credits.md`](./billing-credits.md)).

## Lifecycle: Organization Admin completes setup

In the **Organization Admin Portal**, the customer completes remaining configuration (profile polish, API, redirect URIs, QR keys, verification settings, testing) as in the checklist above.

## Administrative controls (product rules)

- **Suspend** — VerifyMe admins (and appropriately scoped roles) may **suspend** an organization (reversible).
- **Permanent disable / archive** — Only **Super Admin** may permanently disable or archive an organization.

See [`admin-user-management.md`](./admin-user-management.md) for role matrices.
