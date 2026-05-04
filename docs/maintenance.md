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

Many screens are design-phase shells. Confirm mock vs future API contracts before embedding heavy logic in page components.

## Suggested future refactors

- Shared `types/` or domain layer
- `services/` or `api/` layer
- Route metadata shared with navigation
- Tests around portal switching and critical shared components

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

Product and design decisions live in **`/docs`** — start at [`README.md`](./README.md). Engineering notes that do not belong in product specs are in [`implementation-notes.md`](./implementation-notes.md).
