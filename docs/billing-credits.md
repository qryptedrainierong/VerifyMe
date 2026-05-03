# Billing & Credits (Design Phase)

VerifyMe commercial model centers on **monetary credits** consumed by **billable verification outcomes** and configurable **OTP** charges—not on abstract “API quotas” or generic SaaS “subscription usage” language.

## Credits

- **Credit** is a **monetary value** (e.g. USD) held in an organization **credit wallet**.
- **Top-up credits** **carry over** across billing periods until consumed (design intent; implementation details TBD).

## Plans

- **Tiers:** Starter, Professional, Enterprise (names and entitlements are product/marketing; technical mapping TBD).
- **Example initial credits (illustrative):** $10, $50, $250 — not binding quotes.

## Verification Pricing

- **Per-organization** configuration: **verification API call price** (price per verification attempt or per completed flow—exact unit to be finalized with finance) is set **per organization** (and may vary by tier or contract).

## Billable Outcomes

| Verification outcome | Billable? (design default) |
|---------------------|----------------------------|
| **Verified** (successful identity verification) | **Yes** |
| **Failed** (explicit failure after honest attempt) | **Yes** |
| **Expired** (user or org abandoned flow) | **No** |
| **Error** (platform or integration fault) | **No** |
| **Indeterminate** (cannot classify) | **No** |

Rationale: organizations should not pay for broken infrastructure or abandoned sessions; they do pay for genuine verification work succeeded or failed under normal conditions.

## OTP Billing

- **Email OTP** billing is **configurable** (per org or per plan): may be included, per-message, or bundled.
- **Future SMS OTP** is expected to be **billable per send** once offered.

## Relationship To “Usage” In UI

Admin screens may still show charts labeled for **design exploration**. Product copy should refer to **verification attempts**, **verification volume**, **credits consumed**, and **OTP charges**—not “subscription usage” or “API quota” unless explicitly referring to a legacy metric name in an audit log key (see audit log terminology notes in repo `documentation/README.md`).

## Related Documents

- [`client-management.md`](./client-management.md) — who sets plans and initial credits.
- [`schema-notes.md`](./schema-notes.md) — `credit_wallets`, `credit_transactions`, `usage_events`.
