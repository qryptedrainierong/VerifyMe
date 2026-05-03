# Maintenance Guide

## Why This Exists

This file is aimed at future maintainers who need practical notes about where changes should go, what assumptions the current codebase makes, and what parts of the project deserve extra caution.

## Current Architecture Summary

The codebase is organized around:

- one Vite application
- one top-level portal selector
- two routed portal experiences
- one shared component/design layer

This is a clean setup for a prototype or MVP UI shell, but it also means some boundaries are conceptual rather than enforced by separate packages or modules.

## Where To Make Changes

### Add a new page

If the page belongs only to one portal:

1. Create the page component in the relevant portal's `pages/` folder.
2. Add the route in that portal's `routes.tsx`.
3. Add or update navigation in the corresponding layout file.

### Update shared navigation or shell behavior

Start with:

- `src/app/shared/components/PortalSidebar.tsx`
- `src/app/shared/components/TopBar.tsx`

Then check:

- `src/app/platform/pages/PlatformLayout.tsx`
- `src/app/enterprise/pages/EnterpriseLayout.tsx`

### Update shared UI patterns

Start with:

- `src/app/shared/components/`
- `src/app/shared/components/ui/`

Be careful with broad changes here because both portals depend on these components.

### Update look and feel

Start with:

- `src/styles/theme.css`
- `src/styles/index.css`
- `src/styles/fonts.css`

Prefer token-level updates over one-off color overrides in individual pages.

## High-Risk Areas

### Portal switching

`src/app/App.tsx` controls switching between the two portal experiences. It also contains build version logging and cache version checks.

Be careful when changing:

- the portal selection state model
- how portal components mount and unmount
- version constants used for cache awareness

### Router creation

Each portal creates its router via a function call and memoizes it within the portal app component.

Do not casually refactor this into a shared exported singleton without retesting:

- portal switching
- HMR during development
- direct browser navigation to nested routes

This pattern appears to be part of earlier caching/staleness fixes.

### Shared primitives

The `shared/components/ui/` folder likely contains generated or adapted primitive wrappers. These are easy to edit but have wide blast radius.

Before changing a base primitive:

- identify all usages
- test both portals
- verify visual regressions

### Static data and placeholders

Some pages are likely UI demonstrations rather than production-complete features. Maintain that awareness when estimating work.

Before adding complex logic:

- confirm whether data is mock or real
- check if there is an expected API contract elsewhere
- avoid embedding too much business logic directly inside page components

## Recommended Refactor Directions

If this project continues to grow, these improvements would likely pay off:

- introduce a shared `types/` or domain model layer
- introduce a `services/` or `api/` layer
- move repeated page data/config into dedicated modules
- formalize route metadata so navigation and routes stay in sync
- add tests around portal switching and critical shared components

## Testing Gaps To Keep In Mind

There are currently no obvious test files or test scripts in `package.json`.

That means maintainers should assume extra manual verification is needed for:

- portal selection
- route navigation
- shared component behavior
- responsive layout behavior
- cache-related regressions after build/tooling changes

## Suggested Manual Regression Checklist

After meaningful UI or routing changes, verify:

1. The app boots from `npm run dev`.
2. The selector screen loads correctly.
3. Platform portal can be entered and navigated.
4. Enterprise portal can be entered and navigated.
5. Shared components still render correctly in both portals.
6. No obvious console errors appear during navigation.
7. Version/caching logs still behave as expected after a rebuild if build tooling changed.

## Dependency Notes

The dependency list is UI-heavy. A large portion of the project value is in reusable presentation components and primitive wrappers.

When upgrading dependencies:

- prioritize React, React Router, Vite, Tailwind, and Radix-related changes carefully
- review breaking changes in router behavior
- review styling/token compatibility after Tailwind or plugin upgrades
- retest any components built on wrapper abstractions

## Documentation Hygiene

This documentation should be updated when any of the following change:

- top-level folder structure
- portal names or responsibilities
- route maps
- startup flow
- build/cache strategy
- shared component conventions

If the project evolves from prototype UI to production-integrated app, this should be reflected explicitly in `documentation/README.md`.
