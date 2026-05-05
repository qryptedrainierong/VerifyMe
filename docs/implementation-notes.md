# Implementation notes (repository)

Engineering context for this **frontend-only** VerifyMe Admin Portals bundle: layout, tooling, and cache/version behavior. Product rules live in [`product-spec.md`](./product-spec.md), [`glossary.md`](./glossary.md), and related domain docs.

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

Organization Detail shows organization-specific summary (info, status), usage highlights, an integration readiness checklist, and governance controls. Deep operational tables—verification sessions, audit logs, billing activity, client apps / API, identity links, and similar—live on platform-wide VerifyMe Admin routes; Organization Detail links to those views with an `organizationId` query param when filters are supported (design-phase until pages read the param).

VerifyMe Users (`/verifyme-users`), Identity Links (`/identity-links`), and Client Apps / API (`/client-apps`) read `organizationId` from the query string when it matches a sample organization id and pre-select the organization filter; otherwise they show a short design-phase note without breaking navigation. The same pattern should extend to Verification Sessions, Billing, and Audit Logs when those screens add query-aware filtering.

## Design system

Tokens live in `src/styles/theme.css` with Tailwind mapping. Prefer token changes over per-page color overrides.

## Data and state

Pages are largely mock-driven; there is no production API layer in repo scope. Adding live data will need a deliberate client/model strategy.

**Identity fields in mocks:** `PlatformEndUserAssociation` uses `verifymeUserId` (UUID), `verifymeId` (`vm…` public id), `clientUserId`, and `device` (single-device MVP). Verification session mocks expose `maskedVerifymeId` for admin display, not internal FKs. Naming follows [`glossary.md`](./glossary.md).

## Audit logs UI (prototype)

Types: `src/app/shared/types/auditLog.ts`. Main screen: `src/app/platform/pages/PlatformAuditLogs.tsx`. Specifications: [`audit-logs-plan.md`](./audit-logs-plan.md), [`audit-logs-schema.md`](./audit-logs-schema.md), [`audit-logs-ui.md`](./audit-logs-ui.md).

## Cache and versioning (historical)

Past “stale bundle” issues were mitigated with content-hashed Vite outputs, dev **`Cache-Control: no-store`**, router future flags, stable **`key`** props on portal roots and `RouterProvider`, optional console version logging, and `src/app/shared/utils/cacheWarning.ts`. If changes fail to appear locally, hard-refresh once, then inspect `vite.config.ts`, `App.tsx`, and that utility.

Details of each past iteration are intentionally summarized here; avoid duplicating long change logs.

## Local development

```bash
npm install
npm run dev
```

## Attributions

This project includes components from [shadcn/ui](https://ui.shadcn.com/) under the [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). Photos may be sourced from [Unsplash](https://unsplash.com) under the [Unsplash license](https://unsplash.com/license).
