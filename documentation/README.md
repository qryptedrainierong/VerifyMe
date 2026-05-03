# VerifyMe — Repository Documentation (`documentation/`)

## Purpose

This folder contains project-level notes for:

- New developers who need a fast introduction to the codebase
- Future maintainers who need context before making structural changes
- Anyone who needs a quick map of the two admin portals and the shared UI layer

## Product & Terminology (Authoritative)

Agreed **VerifyMe** product language, flows, billing, QR linking, and high-level schema intent live under **`/docs`** (repository root):

- [`../docs/product-spec.md`](../docs/product-spec.md) — surfaces, OIDC-style flow, Verification Service boundary
- [`../docs/client-management.md`](../docs/client-management.md) — client = organization, `client_id` format, setup lifecycle
- [`../docs/admin-user-management.md`](../docs/admin-user-management.md) — VerifyMe vs organization admin roles
- [`../docs/end-user-management.md`](../docs/end-user-management.md) — mobile-only onboarding, device rules, invites
- [`../docs/billing-credits.md`](../docs/billing-credits.md) — credits as money, billable outcomes, OTP billing
- [`../docs/qr-linking.md`](../docs/qr-linking.md) — asymmetric payloads, keys, deep links
- [`../docs/api-overview.md`](../docs/api-overview.md) — APIs and documentation expectations
- [`../docs/schema-notes.md`](../docs/schema-notes.md) — table list only; no migrations in this phase

Prefer **verification**, **credits**, **linked end users**, and **organization admin** language over legacy SaaS terms such as **API quota**, **subscription usage**, or generic **team** where those terms conflict with VerifyMe.

**Audit logs:** Product terminology uses **plans** and **credits**. Existing **audit log action keys** (for example `subscription.*`, `platform.*`) are **not renamed** in those documents so stored logs and prototypes stay backward-compatible; UI labels should still follow product wording where readers see them.

## Project Snapshot

VerifyMe Admin Portals is a Vite + React + TypeScript frontend project that presents two separate admin experiences from a single entry point:

- **VerifyMe Admin Portal** (`src/app/platform/`)  
  Internal-facing console for Qrypted / VerifyMe operators (organizations, VerifyMe users, verification sessions, client apps, billing & credits, audit logs, platform settings).

- **Organization Admin Portal** (`src/app/enterprise/`)  
  Customer-facing console for enterprise tenants (linked end users, verification logs, API integration, QR linking, team & roles, usage & credits, billing, settings).

The current implementation is a **UI/UX and system design** phase shell: routed pages, layouts, reusable components, and design-system utilities. There is **no** production backend, **no** database integration, and **no** real authentication in this repository scope.

## Tech Stack

- Vite for development/build tooling
- React 18
- React Router 7
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Lucide icons
- Recharts and other UI helper libraries

## How The App Starts

Application flow is straightforward:

1. `src/main.tsx` mounts the React app and loads global styles.
2. `src/app/App.tsx` renders the portal selector screen.
3. Selecting a portal loads either:
   - `src/app/platform/PlatformApp.tsx`
   - `src/app/enterprise/EnterpriseApp.tsx`
4. Each portal creates its own browser router and renders a layout with nested pages.

This means the project behaves like a single frontend app with two portal modes, not two separately deployed applications.

## Folder Map

### Root

- `src/`
  Main application source
- `documentation/`
  Introductory and maintenance notes (this folder)
- `docs/`
  VerifyMe product, billing, API, QR linking, and schema **design** specs
- `README.md`
  Quick start entry document
- `vite.config.ts`
  Build, aliasing, asset resolution, HMR, and cache-related setup
- `documentation/FIXES_APPLIED.md`
  Summary of cache-related fixes already made in the project
- `documentation/CACHE_FIX_NOTES.md`
  Additional cache behavior notes
- `documentation/AuditLogsPlan.md`
  Comprehensive audit logging strategy and log type specifications
- `documentation/AuditLogsSchema.md`
  Data schema design for audit logs (TypeScript, SQL, MongoDB)

### `src/app`

- `App.tsx`
  Portal selector and high-level app switcher
- `platform/`
  VerifyMe Admin Portal app, routes, and pages
- `enterprise/`
  Organization Admin Portal app, routes, and pages
- `shared/`
  Components, hooks, and utilities used across both portals

### `src/app/platform`

Contains the **VerifyMe Admin Portal**:

- `PlatformApp.tsx`
  Portal bootstrap with error boundary and router provider
- `routes.tsx`
  Route configuration for platform pages
- `pages/`
  Screens such as dashboard, organizations, VerifyMe users, identity links, verification sessions, client apps, billing & credits, audit logs, platform settings

### `src/app/enterprise`

Contains the **Organization Admin Portal**:

- `EnterpriseApp.tsx`
  Portal bootstrap with error boundary and router provider
- `routes.tsx`
  Route configuration for organization pages
- `pages/`
  Screens such as dashboard, linked end users, verification logs, API integration, QR linking, team & roles, usage & credits, billing, and settings

### `src/app/shared`

Shared code used by both portals:

- `components/`
  Layout pieces, tables, badges, charts, error boundary, top bar, sidebar, and UI wrappers
- `components/ui/`
  Reusable UI primitives and wrappers, largely aligned with Radix/shadcn-style patterns
- `hooks/`
  Shared React hooks
- `utils/`
  Small shared utilities such as cache/version handling

### `src/styles`

Global styling entry points:

- `index.css`
  Imports the other style layers
- `theme.css`
  Theme tokens and Tailwind theme bindings
- `tailwind.css`
  Tailwind integration
- `fonts.css`
  Font setup

## Routing Model

Each portal owns its own route tree:

- Platform routes live in `src/app/platform/routes.tsx`
- Enterprise routes live in `src/app/enterprise/routes.tsx`

Both use `createBrowserRouter()` and nested layouts with `<Outlet />`.

Important detail:

- Both route modules are created through functions (`getPlatformRouter()` and `getEnterpriseRouter()`) rather than shared singleton router exports.
- This was done to avoid stale router/HMR behavior and is tied to the repo's cache-fix work.

## Shared Layout Pattern

Both portals use the same high-level shell:

- `PortalSidebar`
- `TopBar`
- page content rendered through route outlets

The layouts differ mainly in:

- navigation items
- section naming
- page set

This is a useful pattern to preserve. New common shell behavior should usually be added in shared components first, then configured per portal.

## Design System Notes

The project uses shared tokens defined in `src/styles/theme.css`.

Key points:

- Visual tokens are mostly CSS custom properties
- Tailwind utilities map into those tokens through `@theme inline`
- Shared UI primitives live under `src/app/shared/components/ui`

When adjusting colors, spacing rhythm, radius, or typography defaults, start with `theme.css` before changing individual page styles. That keeps both portals visually aligned.

## Data And State Reality

At the moment, the pages appear to be mostly static/demo-style UI screens. There is no obvious centralized API layer, service layer, or state management solution in the current repo structure.

Implications:

- Introducing live data will require architectural decisions
- Repeated mock data may exist across page files
- Behavior consistency between portals should be reviewed when adding real business logic

If backend integration is added later, consider introducing:

- a shared API client layer
- typed domain models
- page-level data loaders or hooks
- a clear mock-vs-live data strategy

## Audit Logging Strategy

The platform includes comprehensive audit logging requirements and UI implementation:

### Documentation Files

1. **`documentation/AuditLogsPlan.md`**
   - 45+ audit log types organized into 8 categories
   - Trigger conditions for each event
   - Log fields and data capture requirements
   - Common fields, retention policies, and export formats

2. **`documentation/AuditLogsSchema.md`**
   - TypeScript interfaces and enums for all log types
   - SQL and MongoDB schema definitions
   - Retention policy tables and archival strategies
   - Query patterns and performance considerations
   - JSON/CSV export format examples

3. **`documentation/AuditLogsUIImplementationPlan.md`**
   - Complete implementation roadmap (10 phases)
   - Actual vs planned component structure
   - Status of all implemented features
   - Notes for future refinements and scalability

### Current UI Implementation

**Status:** ✅ Prototype Complete

- **Component:** `src/app/platform/pages/PlatformAuditLogs.tsx`
  - Main audit logs table with 7 columns (Timestamp, Actor, Organization, Action, Details, Status, IP)
  - 10 sample logs with schema-aligned payloads
  - Click-to-view modal with full log details
  - Filtering UI (date range, actor type, organization, action category)
  
- **Type System:** `src/app/shared/types/auditLog.ts`
  - TypeScript enums (ActorType, AuditStatus, ActionCategory)
  - 45+ typed audit actions with discriminated unions
  - Category-specific payload interfaces
  - Utility functions for formatting and color-coding

- **Features Implemented:**
  - ✅ Schema-aligned mock data
  - ✅ Modal details view with generic payload renderer
  - ✅ Color-coded action labels and status badges
  - ✅ JSON copy-to-clipboard
  - ✅ Click-outside-to-close modal
  - ⚠️ Filter UI present but not functional (awaits backend integration)

- **Desktop Only:** Mobile responsiveness testing needed

### Backend Integration

When connecting to backend APIs:
1. Replace mock data with API calls
2. Implement client-side filtering logic
3. Add pagination for large datasets
4. Wire up export functionality
5. Implement real-time audit event streaming (if needed)

## Local Development

Install and run:

```bash
npm install
npm run dev
```

The Vite dev server is the main local workflow.

## Build And Caching Notes

The repo already includes cache-mitigation work:

- version tracking in `App.tsx`
- cache warning utility in `src/app/shared/utils/cacheWarning.ts`
- router recreation per portal app
- content-hashed Vite build outputs
- `Cache-Control: no-store` headers in dev server config

If developers report "changes not showing up", review:

- `vite.config.ts`
- `src/app/App.tsx`
- `src/app/shared/utils/cacheWarning.ts`
- `documentation/FIXES_APPLIED.md`
- `documentation/CACHE_FIX_NOTES.md`

## Recommended Developer Workflow

When making changes:

1. Identify whether the change is portal-specific or shared.
2. Prefer `shared/` for reusable layout and UI behavior.
3. Keep route definitions close to each portal.
4. Keep theme/token changes centralized in `src/styles/theme.css`.
5. Check both portals after editing shared components.

## Known Maintenance Themes

These are the main areas future maintainers should pay attention to:

- shared-shell consistency between the two portals
- avoidance of duplicated component logic across portal page files
- router behavior and cache/HMR stability
- whether static prototype pages evolve into real feature modules
- documentation drift when routes/pages are added

## Related Notes

- [Product & design specs (`/docs`)](../docs/product-spec.md)
- [Maintenance Guide](./maintenance.md)
- [Audit Logs Plan](./AuditLogsPlan.md)
- [Audit Logs Schema](./AuditLogsSchema.md)
- [Root Quick Start](../README.md)
- [Cache Fix Summary](./FIXES_APPLIED.md)
- [Cache Notes](./CACHE_FIX_NOTES.md)
