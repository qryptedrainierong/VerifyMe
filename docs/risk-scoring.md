# Risk scoring (design)

**Canonical design** for **VerifyMe User (platform) risk**: how scores should be calculated, stored, displayed, and audited when a backend exists. **Identity links** are **not** assigned a separate primary **link risk score** in product UX; they focus on **conflict status**, **resolution**, and **name consistency** signals.

This document is **not** a migration or API contract; it guides product, compliance, and future implementation.

**Related:** [`glossary.md`](./glossary.md) (identifiers, `name_match_status`), [`schema-notes.md`](./schema-notes.md) (proposed snapshot table), [`audit-logs-plan.md`](./audit-logs-plan.md) (risk and conflict audit actions), [`end-user-management.md`](./end-user-management.md) (privacy and device rules).

---

## 1. Risk ownership: VerifyMe User

| Aspect | Definition |
|--------|------------|
| **Scope** | **VerifyMe User** — **cross-organization**, **platform-wide** behavior. |
| **Question** | “Is this VerifyMe user exhibiting elevated risk **across the platform**?” |
| **Universality** | One user, one risk posture in product terms: **risk score / risk level** belong to the **VerifyMe User**, not to each identity link as a separate scored entity. |
| **Primary audience (full detail)** | **VerifyMe Admin** — **Platform Risk** tab on VerifyMe User detail; signals are aggregated without naming other organizations in factor labels. |
| **Organization Admin** | May see a **safe User risk status** band (e.g. Low / Moderate / High / Critical) for the linked VerifyMe User **only** — **not** cross-organization activity, **not** full factor lists, **not** platform-wide scores presented as “link risk”. |

**Signals (non-exhaustive; design inputs for future engines):**

- Repeated **ID Proof Fail** outcomes **across organizations** (count and recency).
- High **verification session** frequency relative to norms.
- **Rapid retry** behavior (short intervals between failed or abandoned attempts).
- **Recent device replacement** (new device bound, prior device rotated).
- **Recovery / account reset** activity.
- **Suspicious account status** transitions (policy-flagged).
- **Linked to unusually many organizations** (count threshold — product-tuned).
- **Failed verifications** spanning **multiple** organizations in a window.

**Strict boundary:** **Do not expose cross-organization detail** to **Organization Admin** or org-scoped APIs.

---

## 2. Identity links: conflict and name consistency (not a link risk score)

**Identity links** (`organization_user_links`) are the right place for:

| Concern | Role |
|---------|------|
| **Conflict status** | Pending review, resolved, etc. |
| **Conflict reason / resolution** | Auditable operator narrative (safe labels — not raw comparison dumps). |
| **`name_match_status` / `name_match_score`** | **Signals** for fraud/conflict workflows — **not** proof of legal identity. |
| **Invite / channel notes** | Context for review (sample UI only in mocks). |

Link-level events (name mismatch, retries on one link, duplicate link attempts) may **inform** the **VerifyMe User** risk engine or **trigger conflict workflows**, but the **product-facing numeric risk score** is **not** framed as a separate **“Link Risk Score”** for customers.

---

## 3. Score range and risk levels (VerifyMe User only)

| Field | Value |
|-------|--------|
| **Numeric range** | **0–100** (integers; fractional internal math may be rounded). |

| Level | Range |
|-------|--------|
| **Low** | 0–24 |
| **Moderate** | 25–49 |
| **High** | 50–74 |
| **Critical** | 75–100 |

**Product meaning:**

- Scores are **risk indicators**, not **proof of fraud** or **deterministic identity truth**.
- Scores support **review**, **escalation**, and **policy-driven workflow** — not automatic denial of service **unless** policy explicitly requires it and is legally/compliance-approved.
- **Final automated enforcement** must be **configurable per organization / policy** in a future system.

---

## 4. Example scoring weights (design / mock only — VerifyMe User)

The weights below are **starting points** for product design and mock data. **Production** weights must be tuned using testing, **compliance review**, monitoring, and **false-positive analysis**. Version via **`calculation_version`**.

**Rules:** Sum deltas from signals in the evaluation window; **clamp** to **0–100**.

### 4.1 Platform (VerifyMe User) — example weights

| Signal | Delta | Cap / note |
|--------|-------|----------------|
| Each **ID Proof Fail** across the **platform** in last **24h** | **+5** | **Max +25** total from this bucket |
| **ID Proof Fail** observed across **3+ organizations** (in window) | **+25** | |
| **Rapid retry** pattern (platform-defined threshold) | **+15** | |
| **Recent device replacement** | **+10** | |
| **Recovery / reset requested** | **+10** | |
| **Suspended / disabled** account history (policy-flagged) | **+20** | |
| **Clean successful history** (platform-defined negative signal) | **−15** | |

### 4.2 Link-derived signals (inputs to conflict / review — not a published link score)

These **do not** define a separate **customer-facing link risk score**. They support **conflict review**, **`name_match_status`**, and optional **inputs** to the **VerifyMe User** risk engine:

- **`name_match_status`** mismatch / partial_match / strong_match.
- **Repeated ID Proof Fail** on **one** link (org scope).
- **Rapid retry** on **one** link.
- **Conflict** queue / duplicate link attempts.
- **Revoked / suspended** link lifecycle.

---

## 5. Implementation approach (future backend)

Design guidance only; no migrations implied.

### 5.1 Principles

- Store **raw risk signals** separately from the **final VerifyMe User score** where practical.
- Compute **`risk_score`** **deterministically** from a **signal snapshot** + **`calculation_version`**.
- Avoid unnecessary raw PII in risk payloads; use **counts**, **enums**, **timestamps**, **safe labels**.
- **Audit** material **VerifyMe User** score changes, **high-risk** crossings, and **conflict** lifecycle events (see §7).
- **Never** leak other organizations’ behavior into **Organization Admin** views.

### 5.2 Suggested stored fields — `verifyme_user_risk_snapshots`

| Column | Type / notes |
|--------|----------------|
| `id` | UUID PK |
| `verifyme_user_id` | FK → `verifyme_users.id` |
| `risk_score` | 0–100 |
| `risk_level` | Enum |
| `risk_factors_json` | JSON — safe labels |
| `calculation_version` | String |
| `calculated_at` | Timestamp |

**Do not** introduce **`identity_link_risk_snapshots`** as a primary product table for a competing **link risk score**. Persist **conflict** and **name_match** fields on the **link** row (or dedicated conflict tables) instead.

---

## 6. Privacy and security boundaries

### 6.1 What organizations must not see

- **VerifyMe User full name** as raw profile (unless a future controlled disclosure path exists).
- **Raw name comparison** values or raw **`customer_name_for_matching`**.
- **Cross-organization** verification behavior outside their tenant.

### 6.2 What organizations may see

- **User risk status** — compact band (Low / Moderate / High / Critical) for the **linked** VerifyMe User, when policy allows.
- **`name_match_status`** (and optional score) for **their** link — **signal only**, not proof of identity.
- **Conflict** state and **safe** resolution summaries for **their** records.

### 6.3 Never expose (any portal or audit payload)

Passcode, OTP, biometrics, generated verification token, **Encrypted_Auth_Cred**, **Transaction_Code** (raw), **raw `client_secret`**, private keys, **raw `auth_code`**, **raw `id_token` / `access_token`**.

---

## 7. UI guidance

### 7.1 VerifyMe Admin — VerifyMe User

- **Platform Risk** tab: score, level, signals, recommendation, safe supporting metrics.
- **VerifyMe Users** list: compact **risk status** badge (level only).

### 7.2 VerifyMe Admin — Identity Link

- **Conflict review / resolution** first when applicable.
- **Name consistency** in its own section (**signal only**).
- **Related user risk**: reference **VerifyMe User** risk (badge / optional score) with link to user detail — **do not** duplicate as “Link Risk Score”.

### 7.3 Organization Admin

- **User risk status** label (not “link risk”).
- **Name consistency** on linked end users.
- Short helper copy: platform-derived indicator; **no** cross-org detail.

### 7.4 Verification sessions

- **User risk status** (and name consistency as context) — org view shows **status band only** when available; platform may link to full user risk.

---

## 8. Audit log guidance

Align with [`audit-logs-plan.md`](./audit-logs-plan.md). Primary actions include:

| Action key | When |
|------------|------|
| `verifyme_user.risk_score_calculated` | VerifyMe User snapshot computed or updated |
| `verifyme_user.risk_high_risk_detected` | User risk crosses policy threshold |
| `verifyme_user.risk_reviewed` | Operator documents user risk review |
| `identity_link.conflict_detected` | Conflict opened / escalated |
| `identity_link.conflict_reviewed` | Review recorded |
| `identity_link.conflict_resolved` | Conflict closed with resolution |
| `identity_link.name_match_evaluated` | `name_match_status` updated |

**Do not** use **`identity_link.risk_score_calculated`** as a primary product audit event.

**Payload discipline:** For user risk events, record **score**, **level**, **safe factor labels**, **`calculation_version`**, **timestamp**. For conflict events, record **safe** reasons and resolutions — **not** raw comparison strings or secrets.

---

## 9. Related documents

| Document | Relevance |
|----------|-----------|
| [`glossary.md`](./glossary.md) | Terms and risk ownership |
| [`schema-notes.md`](./schema-notes.md) | Link conflict fields; user risk snapshot |
| [`audit-logs-plan.md`](./audit-logs-plan.md) | Full audit catalog |
| [`implementation-notes.md`](./implementation-notes.md) | Repo / UI alignment |
| [`end-user-management.md`](./end-user-management.md) | Linked users, privacy |
| [`verification-flow.md`](./verification-flow.md) | Session lifecycle |
