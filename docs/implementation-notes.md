# Implementation notes (repository)

Engineering context for this **frontend-only** VerifyMe Admin Portals bundle: layout, tooling, and cache/version behavior. Product rules live in [`product-spec.md`](./product-spec.md), [`glossary.md`](./glossary.md), and related domain docs. **Risk scoring** (platform vs link scope, privacy, UI, audit, proposed snapshot fields) is canonical in [`risk-scoring.md`](./risk-scoring.md).

## Tech stack

- Vite, React 18, React Router 7, TypeScript
- Tailwind CSS v4, Radix UI, Lucide
- Recharts and other UI helpers

## How the app starts

1. `src/main.tsx` mounts the app and global styles.
2. `src/app/App.tsx` shows the portal selector.
3. Choosing a portal loads `PlatformApp.tsx` or `EnterpriseApp.tsx`.
4. Each portal creates its own browser router and a layout with nested `<Outlet />` routes.

Two portal modes share one deployable SPA, not two separate apps.

## Folder map (high level)

| Path | Role |
|------|------|
| `src/app/platform/` | VerifyMe Admin Portal — routes, pages |
| `src/app/enterprise/` | Organization Admin Portal — routes, pages |
| `src/app/shared/` | Shared components, hooks, utils |
| `src/styles/` | Theme tokens, Tailwind entry, fonts |
| `docs/` | Product, schema, audit, maintenance (this tree) |
| `documentation/` | Stub [`README.md`](../documentation/README.md) only — redirects to `docs/` |

## Routing model

- Platform: `src/app/platform/routes.tsx`
- Enterprise: `src/app/enterprise/routes.tsx`

Routers are created through functions (e.g. `getPlatformRouter()`) rather than a single shared singleton, to reduce stale router state when switching portals or during HMR.

### UX — Organization Detail vs platform-wide pages

Organization Detail shows organization-specific summary (info, status), usage highlights, an integration readiness checklist, and governance controls. Deep operational tables—verification sessions, audit logs, billing activity, client apps / API, identity links, and similar—live on platform-wide VerifyMe Admin routes; Organization Detail links to those views with an `organizationId` query parameter when the target page supports it.

Organization Admin Portal follows the same operational UI pattern as VerifyMe Admin: summary lists, row-click details, destructive controls only inside detail views with confirmation, and no prototype wording in visible UI.

**Prototype behavior:** VerifyMe Users (`/verifyme-users`), Identity Links (`/identity-links`), and Client Apps / API (`/client-apps`) read `organizationId` from the query string, match it against seeded organization ids, and pre-select the organization filter when possible. Other list screens should follow the same pattern as query-aware filtering is added.

**Billing dashboard:** Top-line spend metrics aggregate `getVerificationSpend(org)` from seeded organizations — this is **verification-related spend**, not SaaS MRR. Invoice rows and governance actions use in-memory mock data (`platformBillingInvoicesMock`); confirmations do not send email or call a payments API in the prototype.

**Audit logs:** The date-range control uses a fixed anchor time (`ANCHOR_NOW_MS` in `PlatformAuditLogs.tsx`) so relative windows stay stable against static sample timestamps. Log IDs and raw `action` keys are detail-modal fields in the admin UI.

**VerifyMe User controls:** Suspend, reactivate, disable, restore, and recovery reset update the in-memory end-user association session only. There is no server round-trip. “Transfer organization links” is not implemented; it was removed from the UI until product approves the workflow.

**Identity link conflict resolution:** Confirming resolution updates the identity link session row; reviewer attribution in mocks is a placeholder string, not an authenticated principal.

**Client app controls:** Rotate secret and disable app mutate the client apps session only; no credential material is generated or shown.

### Detail presentation — full page vs modal

Major entities use **full-page** detail views (Organizations, VerifyMe Users, Client Apps / API, Identity Links). Event, transaction, and log records use **modal/dialog** details (verification sessions, billing invoices / credit flows, audit log events).

## Design system

Tokens live in `src/styles/theme.css` with Tailwind mapping. Prefer token changes over per-page color overrides.

### UI language principle

Visible admin UI should use operational language. Prototype/design notes belong in documentation.

### VerifyMe Admin list pages (UI pattern)

VerifyMe Admin list pages should be **summary-first**: the table is a filterable overview. **Row click** navigates to a **full-page detail** for major entities or opens a **detail dialog** for event/transaction/log rows (see “Detail presentation” above). **Destructive or security-sensitive actions** (refunds, credential rotation, account disable, conflict resolution, etc.) must live **inside** detail **controls** and use **explicit confirmation** (e.g. alert/confirm flow), not row-level menus or ad-hoc list buttons.

Platform Team & Access uses the same list/detail behavior: no destructive controls in rows, confirmations for state-changing controls, and operational language in visible UI.

### Governance & audit logs

Governance actions must be performed from **entity detail pages**, require **confirmation**, and **produce audit log events** in a live system. **List pages** (including Audit Logs) must **not** expose destructive controls on rows; Audit Logs is read-only with modal detail. Confirmation copy states that the action **will be recorded in audit logs**. The current bundle does not persist new audit rows from these controls unless wired to a backend later.

## Data and state

Pages are largely mock-driven; there is no production API layer in repo scope. Adding live data will need a deliberate client/model strategy.

**Identity fields in mocks:** `PlatformEndUserAssociation` keeps `verifymeUserId` (UUID) for relational joins only; **VerifyMe Admin normal UI** surfaces **`verifymeId` (`vm…`)**, masked email, and `client_user_id` where relevant — not internal UUIDs. Verification sessions use `maskedVerifymeId` in data as the display VerifyMe ID field. Naming follows [`glossary.md`](./glossary.md).

**Risk UX:** **Platform Risk** (score, signals) lives on **VerifyMe User** detail. **Identity Links** emphasize **conflict** and **name consistency**; **Organization Admin** shows **User risk status** only (no cross-org factors). See [`risk-scoring.md`](./risk-scoring.md).

## Audit logs UI (prototype)

Types: `src/app/shared/types/auditLog.ts`. Main screen: `src/app/platform/pages/PlatformAuditLogs.tsx`. Specifications: [`audit-logs-plan.md`](./audit-logs-plan.md), [`audit-logs-schema.md`](./audit-logs-schema.md), [`audit-logs-ui.md`](./audit-logs-ui.md).

**Governance filters (URL query — shareable):** `search`, `governanceCategory` (Risk \| Identity \| …), `entityType` (`organization` \| `verifyme_user` \| `identity_link` \| `client_app` \| `verification_session` \| `billing` \| `other`), `focus` (`risk` \| `conflict`), `verifymeId`, `identityLinkId`, `clientAppId`, `verificationSessionId`, `organizationId`, `actor`, `severity` (`informational` \| `warning` \| `high` \| `critical`), `dateRange`. Deep links from entity pages use `auditLogsHref()` in `src/app/platform/utils/auditLogsNavigation.ts`. Modal detail includes **Changes** (`changeTracking`), **Related entities**, and governance severity labels.

**Timelines:** Shared component `GovernanceTimeline`; mock risk history `platformVerifymeUserRiskHistorySample.ts`; mock conflict history `platformIdentityLinkConflictHistorySample.ts`.

## Cache and versioning (historical)

Past “stale bundle” issues were mitigated with content-hashed Vite outputs, dev **`Cache-Control: no-store`**, router future flags, stable **`key`** props on portal roots and `RouterProvider`, optional console version logging, and `src/app/shared/utils/cacheWarning.ts`. If changes fail to appear locally, hard-refresh once, then inspect `vite.config.ts`, `App.tsx`, and that utility.

Details of each past iteration are intentionally summarized here; avoid duplicating long change logs.

## Local development

```bash
npm install
npm run dev
```

## Packaging hygiene

- Source ZIP handoff packages should exclude `dist/`.
- `dist/` is build output and should be generated per environment, not versioned in source handoff archives.

## Organization Detail tabs (historical note)

Older VerifyMe Admin builds exposed many organization sub-pages as top-level tabs (client apps, redirect URIs, QR keys, verification settings, billing, admin users, linked end users, sessions, audit). The current **`OrganizationDetailTabs`** layout is four tabs only (Organization Details, Usage, Integration Checklist, Organization Controls); deeper operational views are linked as platform-wide routes. To restore retired tab bodies, use git history around `OrganizationDetailTabs.tsx` and `organizationDetailMock`.

## Attributions

This project includes components from [shadcn/ui](https://ui.shadcn.com/) under the [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). Photos may be sourced from [Unsplash](https://unsplash.com) under the [Unsplash license](https://unsplash.com/license).
