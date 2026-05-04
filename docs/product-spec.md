# VerifyMe — Product Specification (Design Phase)

This document captures agreed product scope and terminology. It does **not** specify production implementation, database migrations, or live API contracts. The project is in **UI/UX and system design** phase.

## Product Vision

**VerifyMe** is a privacy-preserving **identity verification** platform for **call-center** and **messaging** transactions. Organizations integrate VerifyMe through an **OIDC-style** flow. End-users onboard in the **VerifyMe mobile app**, generate a **one-time verification token** (passcode + OTP + biometrics), and an organization representative enters that token on the **VerifyMe verification page**. VerifyMe validates the token via the **Verification Service** (already exists; will be integrated later), returns an OIDC-style **auth_code**, and the organization exchanges it for an **id_token**.

No backend logic is implied by this document; it frames what the admin portals and public surfaces are **for**.

## OIDC client scopes (MVP)

MVP integrations enable **`openid`** only on client applications. Additional scopes are **future** (clearly labeled as such in UI and docs when shown); see [`api-overview.md`](./api-overview.md).

## Major Product Surfaces

| Surface | Audience | Purpose (high level) |
|--------|----------|----------------------|
| **VerifyMe Admin Portal** | Internal Qrypted / VerifyMe operators | Organizations, VerifyMe users, identity links, verification sessions, client apps / API, billing & credits, audit logs, platform settings |
| **Organization Admin Portal** | Enterprise customers using VerifyMe | Linked end users, verification logs, API integration, QR linking, team & roles, usage & credits, billing, settings |
| **VerifyMe Mobile App** | End-users | Onboarding, account recovery, device binding, token generation for verification |
| **Verification Page** | Organization reps (e.g. call center) | Collect one-time token, drive OIDC-style authorize → token exchange with org backends |
| **APIs & API documentation** | Technical integrators | Client registration, redirect URIs, scopes, demo flows, token exchange guidance |

## Demo Enterprise Flow

A **Demo Enterprise Flow** is part of product design: scripted or sandbox-friendly paths so sales, solutions engineering, and customers can see end-to-end verification **without** production data. Admin UIs may surface “demo” or “sample” labels until backend wiring exists.

## Verification Service

The **Verification Service** is a real system component that **already exists** in the wider VerifyMe architecture. This repository’s admin portals will **not** call it during the design phase. Later integration will:

- Validate one-time tokens and device-bound signals
- Emit structured outcomes for **verification sessions** and **billing**
- Remain opaque to admin UIs regarding sensitive cryptographic details

## Relationship To This Repository

This repo currently hosts:

- React + Vite **frontend shells** for both admin portals
- Shared layout, routing, and design-system components
- **No** production authentication, **no** database, **no** Verification Service HTTP clients in scope for the design phase

For terminology alignment across product, client lifecycle, billing, and data shape, see also:

- [`client-management.md`](./client-management.md)
- [`billing-credits.md`](./billing-credits.md)
- [`api-overview.md`](./api-overview.md)
- [`schema-notes.md`](./schema-notes.md)
