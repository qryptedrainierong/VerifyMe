# Billing & Credits (Design Phase)

VerifyMe commercial model centers on **monetary credits** consumed by **billable verification outcomes** and configurable **OTP** charges—not on abstract “API quotas” or generic SaaS “subscription usage” language.

## Credits

- **Credit** is a **monetary value** (e.g. USD) held in an organization **credit wallet**.
- **Top-up credits** **carry over** across billing periods until consumed (design intent; implementation details TBD).

## Plans

- **Tiers:** Starter, Professional, Enterprise (names and entitlements are product/marketing; technical mapping TBD).
- **Example initial credits (illustrative):** $10, $50, $250 — not binding quotes.

## Billable outcomes (final)

Billing is driven by the **final verification outcome** of a verification session. The rules are:

| Outcome | Billable? |
|---------|-----------|
| **Verified** | **Yes** — billable |
| **Failed** | **Yes** — billable |
| **Expired** | **No** — not billable |
| **Error** | **No** — not billable |
| **Indeterminate** | **No** — not billable |

Organizations are charged only when work resolves to **Verified** or **Failed**. They are **not** charged for abandoned sessions (**Expired**), platform or integration faults (**Error**), or outcomes that cannot be classified (**Indeterminate**).

## Verification pricing (per organization)

- Each organization has a **per-unit price** (and optional tier or contract modifiers) applied when posting **billable** usage—that is, when sessions settle as **Verified** or **Failed** as above.
- Pricing configuration is owned in the **VerifyMe Admin Portal** / finance workflows; this document does not fix currency minor units or invoice line-item layout.

## OTP billing

- **Email OTP** billing is **configurable** (per org or per plan): may be included, per-message, or bundled.
- **SMS OTP** (future) is **billable per send** once the product offers it.

## Relationship to verification logs and usage & credits in UI

Admin screens may still show charts for **design exploration**. Product copy should refer to **verification logs**, **verification volume**, **usage & credits**, and **OTP charges**—not “subscription usage” or “API quota” unless explicitly referring to a **legacy audit log action key** (see `documentation/README.md`: product wording uses **plans** and **credits**; internal keys such as `subscription.*` may stay for backward compatibility).

## Related Documents

- [`client-management.md`](./client-management.md) — who sets plans and initial credits.
- [`schema-notes.md`](./schema-notes.md) — `credit_wallets`, `credit_transactions`, `usage_events`.
