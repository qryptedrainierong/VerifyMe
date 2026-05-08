# Developer handoff

Implementation-oriented handoff for third-party developers onboarding to this repository.

## 1) Repository structure

- `src/app/platform/`: VerifyMe Admin (platform) portal
- `src/app/enterprise/`: Organization Admin portal
- `src/app/shared/`: shared UI/components/types/helpers
- `src/styles/`: theme tokens and global styles
- `docs/`: source-of-truth documentation
- `documentation/`: legacy redirect stub only (do not add docs here)

## 2) Portal structure

### VerifyMe Admin (platform)

Core domains:

1. Dashboard
2. Organizations
3. VerifyMe Users
4. Identity Links
5. Verification Sessions
6. Client Apps / API
7. Billing & Credits
8. Audit Logs
9. Platform Team & Access
10. Platform Settings

### Organization Admin

Core domains:

1. Dashboard
2. Linked End Users
3. Verification Logs
4. Usage & Credits
5. Billing
6. API Integration
7. QR Linking
8. Team & Roles
9. Settings

### Organization Admin route map (handoff quick-reference)

Use this as the canonical route-to-responsibility map for the Organization Admin Portal:

- `/` — Dashboard (**monitoring + operational support**): action-required queue, organization health, and setup readiness.
- `/linked-end-users` — Linked End Users list (**operational support + governance**): org-side customer records, link lifecycle, invite operations, conflict visibility.
- `/linked-end-users/:recordId` — Linked End User detail (**governance + operational support**): link/invite controls, conflict review, user-risk summary visibility.
- `/verification-logs` — Verification Logs (**monitoring**): organization-scoped session monitoring with lifecycle, proof-result, and billing context.
- `/usage-credits` — Usage & Credits (**monitoring + billing**): verification volume trends, wallet/credit position, period utilization context.
- `/billing` — Billing (**billing + governance**): invoices, payment standing, action-required invoice review, billing controls.
- `/api-integration` — API Integration (**integration + configuration**): client registration context, redirect URIs, scope posture, credential lifecycle controls.
- `/qr-linking` — QR Linking (**integration + configuration**): key posture, QR/deep-linking implementation guidance, key-management context.
- `/team-roles` — Team & Roles (**governance + operational support**): org-admin user directory, role/status summary.
- `/team-roles/:memberId` — Team member detail (**governance**): role/security/activity review and confirmation-gated access controls.
- `/settings` — Settings (**configuration + governance**): organization profile, verification settings within platform limits, notification/security preferences.

### Organization operator workflows (intended)

- **Onboard and configure**
  - Dashboard setup signals → API Integration / QR Linking / Settings verification tab.
- **Run daily operations**
  - Dashboard action queue → Linked End Users and Verification Logs for queue handling.
- **Manage billing posture**
  - Usage & Credits (trend/consumption context) → Billing (invoice actions and payment state).
- **Administer access**
  - Team & Roles list → member detail for role/status/security controls.
- **Investigate risk/conflict safely**
  - Linked End Users list/detail for organization-safe conflict and user-risk summary handling.

## 3) Routing model

- Routers are created via functions (`getPlatformRouter()`, `getEnterpriseRouter()`), not shared singletons.
- Major entities use full-page detail routes.
- Session/invoice/audit events use modal detail patterns.
- Row click is the standard entry to detail context.

### Platform route map (handoff quick-reference)

Use this as the canonical route-to-responsibility map for the Platform Admin Portal:

- `/` — Dashboard: cross-domain operational summary and action-required queues.
- `/organizations` — Organizations list: create/filter organizations and open organization detail.
- `/organizations/:id` — Organization detail: organization summary, readiness checklist, governance controls, links to platform-wide operational pages.
- `/verifyme-users` — VerifyMe Users list: platform-level user posture and cross-organization activity.
- `/verifyme-users/:verifymeId` — VerifyMe User detail: user posture, risk context, lifecycle controls.
- `/identity-links` — Identity Links list: organization-side `client_user_id` linkage, conflicts, name consistency.
- `/identity-links/:identityLinkId` — Identity Link detail: conflict workflow, link state controls.
- `/verification-sessions` — Verification Sessions list + modal detail: monitoring-only session lifecycle, ID proof result, billing context.
- `/client-apps` — Client Apps / API list: OIDC client registrations and integration readiness.
- `/client-apps/:clientAppId` — Client App detail: redirect/scopes/integration and confirmation-gated app controls.
- `/billing` — Billing & Credits: invoices, billing alerts/activity, confirmation-gated invoice controls.
- `/audit-logs` — Audit Logs: governance read-only trail with filterable modal detail.
- `/platform-team` — Platform Team & Access list: platform admin user management summary.
- `/platform-team/:platformAdminId` — Platform Team member detail: role/security/activity controls.
- `/settings` — Platform Settings: global policy categories and governance controls (not tenant-local settings).

### Platform Settings model

- Platform Settings is a global policy center, not a tenant preferences form.
- Categories map to policy ownership and audit boundaries:
  - General Platform
  - Verification Policy
  - Risk & Governance
  - Organization Defaults
  - Billing & Credits Policy
  - Audit & Retention
  - Platform Team & Access Policy
  - Feature Controls
  - Developer / Internal (Super Admin only)
- Risky settings changes are confirmation-gated and should emit audit events.

## 4) Entity and identifier model

- Internal IDs: UUID (not primary display in normal UI).
- Public/display identifiers:
  - Organization: `organizationId` / org code context
  - VerifyMe User: `verifymeId` (`vm...`)
  - Platform Admin: `platformAdminId` (`pa...`)
  - Client App: `clientId`
  - Enterprise customer key: `client_user_id`
- `verifyme_user_id` is an internal FK and should not be surfaced as normal UI identity.

## 5) Verification model (terminology)

Keep these concepts separate:

- Session status (operational state)
- ID proof result (`id_proof_pass`, `id_proof_fail`, `none` / unavailable states)
- Billing outcome (billable vs non-billable)
- Risk status (platform-level user posture)

Do not merge these into one field in UI or schema planning.

## 6) Risk and governance model

- Risk belongs to VerifyMe User (platform-wide).
- Identity Links focus on conflict, name consistency, and resolution.
- Organization Admin gets safe user risk status only (no cross-org risk factors/details).
- Governance actions should be confirm-gated and auditable.

## 7) UI conventions

- List pages are summary/filter surfaces.
- No default row action dropdowns for major entities.
- Row click opens full-page detail for major entities.
- Sessions/invoices/audit records use modal details.
- Destructive controls live inside details with confirmation.

## 8) Mock data purpose and limits

- Mock/sample datasets are intentional placeholders for frontend behavior.
- They must remain production-toned in visible copy and values.
- Do not add raw secrets/tokens/private key material to mock data.
- Keep scenario coverage broad across lifecycle, risk, billing, integration, and governance states.

## 9) Frontend/backend separation

Current repository scope:

- Frontend UI and mock-data interactions only
- No backend services, migrations, auth provider integrations, or infrastructure code

Platform pages with mock/session behavior that backend integration should replace first:

- Organization state mutations (`platformOrganizationSessionOverrides`).
- VerifyMe User association/session mutations (`platformEndUserAssociationsSession`).
- Identity link state mutations (`platformIdentityLinksSession`).
- Client app state mutations (`platformClientAppsSession`).
- Platform Settings save/change flows (currently UI-only state + confirmation semantics).
- Billing and invoice action flows (currently UI-only confirmation messages).

Organization Admin pages with mock/session behavior that backend integration should replace first:

- Linked End Users record mutations (`enterpriseLinkedEndUsersSession`) including invite, suspend/reactivate/revoke/disable, and conflict-reviewed markers.
- Team member detail actions (role/status changes currently local component state in `EnterpriseTeamMemberDetail`).
- Billing controls in invoice detail (reminder/refund/mark-reviewed confirmations are UI-only).
- Settings save actions (profile/verification/notification/security controls currently UI-only state).
- API Integration and QR Linking control affordances (credential/key actions are non-persistent placeholders).

Expected future backend integration:

- Replace in-memory stores with API data sources
- Preserve existing UI vocabulary and state model boundaries
- Keep redaction and privacy boundaries intact
- Enforce platform limits server-side before accepting organization overrides
- Persist policy category revisions with actor/timestamp/effective metadata

## 10) Sensitive data handling rules

Never expose in UI, docs examples, or mock payloads:

- OTP, passcode, biometrics
- raw `auth_code`, `id_token`, `access_token`
- raw `client_secret`
- private keys
- `Encrypted_Auth_Cred`
- `Transaction_Code`
- recovery secrets
- raw risk heuristic weights or cross-organization detection internals

## 11) MVP assumptions

- VerifyMe User onboarding is app-first.
- One active device per VerifyMe User in current MVP assumptions.
- Organization-side linking is explicit and auditable.
- Risk and governance are operator tools, not automatic denial logic by default.

## 12) Known intentional limitations

- In-memory/session stores stand in for backend persistence.
- Some shared UI patterns are duplicated and tracked for future consolidation in `docs/maintenance.md`.
- Legacy non-routed platform pages exist and are marked as legacy.
- Role-based visibility in Platform Settings (for example Developer/Internal) is mock frontend gating, not authenticated backend authorization.
- “This action will be recorded in audit logs” copy reflects governance intent; this repository does not append new persisted audit rows without backend wiring.
- Organization Admin “Create User”, invite/control actions, billing actions, and settings saves are frontend workflow simulations unless wired to backend APIs.

## 13) Shared primitives and adoption boundaries

Introduced shared primitives (UI shell-level):

- `SummaryStatCard`
- `TableEmptyStateRow`
- `AuditHintText`
- `ScopedFilterBanner`
- `HelperCallout`

Use these where markup and behavior already match. Do not force-fit pages that require complex variants or backend-aware behavior branches.

### Defer broader abstraction until backend contracts settle

Hold these until API contracts are stable:

1. **Unified server-driven filtering model**
   - Wait for canonical backend query params, sorting, pagination, and facet/filter semantics.
2. **Audit mutation receipts / persisted audit feedback**
   - Wait for server-issued audit receipt payloads and persisted event references.
3. **Backend-dependent confirmation payloads**
   - Wait for validation/error payload standards before centralizing confirmation+result flows.
4. **Advanced empty/error/unauthorized states**
   - Wait for API error taxonomy to avoid premature global error-state abstractions.
5. **Technical metadata blocks tied to API schemas**
   - Wait for finalized metadata fields and schema version contracts.
6. **`ConfirmActionDialog` broad extraction**
   - Keep local if action flows depend on backend validation, async retries, or structured server-side errors.

### Over-abstraction warning

Avoid broad "unify everything" refactors before backend wiring:

- Prefer stable visual primitives over behavior-heavy abstractions.
- Keep action flows local where server outcomes are unknown.
- Revisit high-convergence components after backend responses are contract-tested.

## 14) Organization-scoped URL filter behavior

Platform pages may accept `organizationId` query context for workflow continuity from organization detail links.

- Query-aware today: `/verifyme-users`, `/identity-links`, `/client-apps`, `/verification-sessions`, `/billing`.
- Pattern:
  - If `organizationId` matches known seeded org ids, apply scope and show a visible scoped indicator.
  - Allow clearing URL scope via UI affordance.
  - Preserve local/manual filters.
  - Unknown ids remain visible in the indicator but do not force an invalid scope.

## 15) Implementation priorities (recommended)

1. Stabilize API contracts around existing UI/state semantics.
2. Introduce backend persistence behind current route/component boundaries.
3. Preserve identifier privacy model and redaction behavior.
4. Add test coverage for routing, detail modals/pages, and governance filter deep links.
5. Consolidate low-risk shared UI abstractions after backend contracts settle.
6. Add backend-backed policy revision storage and approval workflow for platform settings categories.
