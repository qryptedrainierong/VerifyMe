# Maintenance guide

Practical notes for maintainers: where to edit, what the codebase assumes, and high-risk areas.

## Current architecture summary

- One Vite application
- One top-level portal selector
- Two routed portal experiences (VerifyMe Admin Portal, Organization Admin Portal)
- One shared component and design layer

Boundaries are partly conceptual (not separate packages).

## Where to make changes

### Add a new page

If the page belongs to one portal only:

1. Create the page under that portal’s `pages/` folder.
2. Add the route in that portal’s `routes.tsx`.
3. Update navigation in the corresponding layout.

### Shared navigation or shell

Start with:

- `src/app/shared/components/PortalSidebar.tsx`
- `src/app/shared/components/TopBar.tsx`

Then:

- `src/app/platform/pages/PlatformLayout.tsx`
- `src/app/enterprise/pages/EnterpriseLayout.tsx`

### Shared UI patterns

- `src/app/shared/components/`
- `src/app/shared/components/ui/`

Broad edits affect both portals.

### Look and feel

- `src/styles/theme.css`
- `src/styles/index.css`
- `src/styles/fonts.css`

Prefer design tokens over one-off colors on pages.

## High-risk areas

### Portal switching

`src/app/App.tsx` switches portals and may log build/cache version info. Be careful changing mount/unmount behavior and portal selection state.

### Router creation

Each portal builds its router via a function and memoizes it inside the portal app. Do not casually collapse this into a shared singleton without retesting portal switching, HMR, and deep links.

### Shared primitives

`shared/components/ui/` has wide blast radius. Survey usages and test both portals before changing primitives.

### Static and mock data

Many screens are mock-backed shells. Confirm mock vs future API contracts before embedding heavy logic in page components.

## Suggested future refactors

- Shared `types/` or domain layer
- `services/` or `api/` layer
- Route metadata shared with navigation
- Tests around portal switching and critical shared components
- Consolidate confirmation dialogs into a shared `ConfirmActionDialog` pattern across platform and enterprise pages (only after backend validation/error payload contracts settle).
- Introduce a shared status/filter toolbar pattern for list pages to reduce repeated inline filter layout logic (after server-driven filter contracts are stable).
- Add a `TechnicalDetailsDisclosure` helper for consistent internal-ID and debug-field presentation (after API schema metadata fields are finalized).
- Evaluate moving unused legacy pages under `src/app/platform/legacy/` once downstream references are fully audited.

## Shared primitives (current state)

The following shared primitives are already introduced and safe for incremental use where markup patterns match:

- `SummaryStatCard`
- `TableEmptyStateRow`
- `AuditHintText`
- `ScopedFilterBanner`
- `HelperCallout`

Adopt these in low-risk, mechanical cases only. If a page needs variant logic or custom behavior, prefer local markup until the pattern stabilizes.

## Defer until backend/API contracts settle

Do not aggressively abstract the following before backend integration locks request/response and error contracts:

1. **Unified server-driven filtering model**
   - Wait for canonical query parameter names, multi-filter behavior, sorting semantics, and pagination metadata from APIs.
2. **Audit mutation receipts / persisted audit feedback**
   - Wait for backend receipts (event id, actor id, timestamp, correlation/request id) before centralizing post-action success patterns.
3. **Backend-dependent confirmation payloads**
   - Wait for server validation payloads and business-rule error shapes before broad confirmation-dialog abstraction.
4. **Advanced empty/error/unauthorized states**
   - Wait for standardized API error taxonomy (`empty`, `not_found`, `forbidden`, transient failure) before global empty/error wrappers.
5. **Technical metadata blocks tied to API schemas**
   - Wait for stable metadata fields (ids, version hashes, policy revision refs, etags, audit refs) before shared metadata panels.
6. **`ConfirmActionDialog` broad extraction**
   - Defer broad extraction if behavior must branch on backend validation, retry logic, async progress, or structured server errors.

## Anti-over-abstraction rule

Before backend contracts settle, optimize for clarity and local correctness over sweeping reuse:

- Prefer small shared primitives for stable visual shells.
- Keep behaviorful flows local when server outcomes are unknown.
- Avoid introducing "one component for all cases" patterns that will need breaking changes once live APIs arrive.

## Testing gaps

There may be no automated test suite in `package.json`. Manually verify portal selection, navigation, shared components, and responsive layout after substantive UI changes.

## Suggested manual regression checklist

After meaningful UI or routing changes:

1. `npm run dev` boots.
2. Portal selector loads.
3. VerifyMe Admin Portal navigates.
4. Organization Admin Portal navigates.
5. Shared components render in both portals.
6. No obvious console errors during navigation.

## Dependency upgrades

Treat React, React Router, Vite, Tailwind, and Radix upgrades carefully; re-check router behavior and styling tokens.

## Documentation

Product and design decisions live in **`/docs`** — start at [`README.md`](./README.md). Engineering notes that do not belong in product specs are in [`implementation-notes.md`](./implementation-notes.md). A repo-root [`documentation/README.md`](../documentation/README.md) stub redirects legacy `/documentation` bookmarks to this tree.
