# VerifyMe documentation

**`/docs` is the single source of truth** for VerifyMe product, UX, API, schema, audit, maintenance, and implementation notes for this repository.

If you arrived from a legacy **`/documentation`** path in another system, use this **`docs/`** tree instead; a stub [`../documentation/README.md`](../documentation/README.md) in the repo points here.

## How to use this folder

1. Start with **[`product-spec.md`](./product-spec.md)** for surfaces and scope, then **[`glossary.md`](./glossary.md)** for shared terms.
2. Follow **[`verification-flow.md`](./verification-flow.md)** for the end-user and OIDC-style authorization path.
3. Use domain docs (billing, clients, end users, QR, API) when working on those areas.
4. Use **engineering** docs for repo layout, maintenance, cache/versioning context, and audit log specifications.

All paths below are under `./` (this `docs/` directory).

---

## Core product

| Document | Purpose |
|----------|---------|
| [`product-spec.md`](./product-spec.md) | Product vision, major surfaces, Verification Service boundary, MVP scope |
| [`glossary.md`](./glossary.md) | Canonical definitions (identifiers, tokens, portals, billing terms) |
| [`verification-flow.md`](./verification-flow.md) | Authorize → app → token on Verification Page → auth_code → token exchange (no algorithm detail) |

---

## Feature domains

| Document | Purpose |
|----------|---------|
| [`client-management.md`](./client-management.md) | Organization ↔ client apps, `client_id` format, setup lifecycle, org profile |
| [`admin-user-management.md`](./admin-user-management.md) | VerifyMe Admin Portal vs Organization Admin Portal roles |
| [`end-user-management.md`](./end-user-management.md) | VerifyMe Users, Linked End Users, invites, device rules |
| [`billing-credits.md`](./billing-credits.md) | Credits, plans, billable verification outcomes, OTP billing |
| [`qr-linking.md`](./qr-linking.md) | QR linking payloads, keys, deep links (no raw payload storage in UI) |
| [`api-overview.md`](./api-overview.md) | HTTP / OIDC-style integration overview, MVP scopes |

---

## Data & schema

| Document | Purpose |
|----------|---------|
| [`schema-notes.md`](./schema-notes.md) | High-level relational concepts (no migrations in this repo) |

---

## Audit (compliance & logging)

These stay grouped as the **audit** set; they are part of `/docs` but are the canonical audit specifications.

| Document | Purpose |
|----------|---------|
| [`audit-logs-plan.md`](./audit-logs-plan.md) | Audit event catalog by category (includes legacy `subscription.*` action keys) |
| [`audit-logs-schema.md`](./audit-logs-schema.md) | Storage shape, SQL/Mongo sketches, retention, export examples |
| [`audit-logs-ui.md`](./audit-logs-ui.md) | Audit logs UI prototype structure, status, and follow-ups |

---

## Engineering / system

| Document | Purpose |
|----------|---------|
| [`maintenance.md`](./maintenance.md) | Where to change routes, shared UI, themes, high-risk areas |
| [`implementation-notes.md`](./implementation-notes.md) | Repo layout, stack, routing/cache notes, third-party attributions |

---

## Complete file list

| File | Role |
|------|------|
| `README.md` | This index |
| `admin-user-management.md` | Portal admin roles |
| `api-overview.md` | HTTP / OIDC overview, MVP scopes |
| `audit-logs-plan.md` | Audit event catalog |
| `audit-logs-schema.md` | Audit storage / retention / export sketches |
| `audit-logs-ui.md` | Audit logs UI prototype notes |
| `billing-credits.md` | Credits, plans, billable outcomes |
| `client-management.md` | Organizations, `client_id`, setup checklist |
| `end-user-management.md` | VerifyMe Users, Linked End Users, invites |
| `glossary.md` | Canonical definitions |
| `implementation-notes.md` | Repo layout, stack, cache/version context, attributions |
| `maintenance.md` | Where to edit code safely |
| `product-spec.md` | Vision, surfaces, verification sessions (UI notes) |
| `qr-linking.md` | QR linking design |
| `schema-notes.md` | Relational concepts |
| `verification-flow.md` | Authorize → token exchange narrative |

## Related

- Root **[`../README.md`](../README.md)** — clone, install, run, and pointer into `/docs`.
- Legacy path stub: **[`../documentation/README.md`](../documentation/README.md)** — points here; do not add new docs under `documentation/`.

Authoritative content lives only under **`docs/`**. The repo root `documentation/README.md` is a short redirect stub, not a second doc tree.
