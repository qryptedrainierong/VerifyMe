# Billing & credits (design phase)

VerifyMe commercial model centers on **monetary credits** consumed by **billable verification outcomes** and configurable **OTP** charges—not on abstract “API quotas” or generic “subscription usage” wording.

Definitions: [`glossary.md`](./glossary.md). Audit log keys may still use legacy namespaces (e.g. `subscription.*`); see [`audit-logs-plan.md`](./audit-logs-plan.md).

## Credits

- **Credits** are a **monetary value** (e.g. USD) held in an organization **credit wallet** (`creditBalance` in platform UI mocks).
- **Top-up credits** **carry over** across billing periods until consumed (design intent; implementation details TBD).

## Plans

- **Tiers:** Starter, Professional, Enterprise (names and entitlements are product/marketing; technical mapping TBD).
- **Example initial credits (illustrative):** $10, $50, $250 — not binding quotes.

## Billable outcomes (final)

Billing is driven by the **final verification outcome** of a **verification session** (not generic “API usage”). The rules are:

| Outcome | Billable? |
|---------|-----------|
| **Verified** | **Yes** |
| **Failed** | **Yes** |
| **Expired** | **No** |
| **Error** | **No** |
| **Indeterminate** | **No** |
| **Cancelled** | **No** |
| **Pending** | **No** |

Organizations are charged only when a session settles as **Verified** or **Failed**.

## Verification pricing (per organization)

- Each organization has a **per-unit price** (and optional tier or contract modifiers) applied when posting **billable** usage for **verification sessions**.
- Pricing configuration is owned in the **VerifyMe Admin Portal** / finance workflows; this document does not fix currency minor units or invoice line-item layout.

## OTP billing

- **Email OTP** billing is **configurable** (per org or per plan): may be included, per-message, or bundled.
- **SMS OTP** (**future**) is **billable per send** once the product offers it.

## Relationship to verification logs and usage & credits in UI

Admin screens may show charts for **design exploration**. Product copy should refer to **verification logs**, **verification session** volume, **usage & credits**, and **OTP charges**—not “subscription usage” or “API quota.” If text must reference stored audit identifiers, note that log **action keys** may still use legacy names (e.g. `subscription.*`) while UI labels use **plans** and **credits**.

## Related documents

- [`client-management.md`](./client-management.md) — who sets plans and initial credits.
- [`schema-notes.md`](./schema-notes.md) — `credit_wallets`, `credit_transactions`, `usage_events`.
- [`audit-logs-plan.md`](./audit-logs-plan.md) — audit events touching billing configuration.
