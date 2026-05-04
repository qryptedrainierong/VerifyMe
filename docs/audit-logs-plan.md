# Audit Logs Plan

> **VerifyMe terminology:** Product copy and new specs use **plans**, **credits**, and **verification billing** (see [`billing-credits.md`](./billing-credits.md)). This document still uses historical **audit action keys** such as `subscription.*` in several places; treat those names as **stable log identifiers** until a backend migration aliases or renames them.

## Overview
This document outlines all audit log types organized by category, with detailed logging requirements for each action.

Action groups:

1. Plans & billing *(log namespace: `subscription.*`; product area: plans, credits, and verification-related billing)*
2. Billing & Payment
3. User Management
4. Security & Access Control
5. Organization Management
6. Data Management (future work)
7. Compliance & Governance (future work)
8. System & Administrative

---

## 1. Plans & billing (log namespace `subscription.*`)

### 1.1 subscription.upgraded
**Purpose:** Track when an organization upgrades their plan

**Trigger:** Organization owner/admin selects a higher tier plan and payment is successfully processed

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Previous plan
- New plan
- Upgrade date & time
- Billing change (if applicable)
- IP Address
- Status (success/failed)

### 1.2 subscription.downgraded
**Purpose:** Track when an organization downgrades their plan

**Trigger:** Organization owner/admin selects a lower tier plan and change is applied

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Previous plan
- New plan
- Downgrade date & time
- Refund amount (if applicable)
- IP Address
- Status (success/failed)

### 1.3 subscription.cancelled
**Purpose:** Track when a plan is cancelled

**Trigger:** Organization owner/admin initiates cancellation or system cancels due to non-payment

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Cancelled plan
- Cancellation date & time
- Reason for cancellation
- Final billing amount
- IP Address
- Status (success/failed)

### 1.4 subscription.renewed
**Purpose:** Track automatic plan renewals

**Trigger:** Subscription renewal date is reached and payment is automatically charged

**Items to Log:**
- Organization ID & Name
- Plan type
- Renewal date & time
- Billing period
- Amount charged
- Payment method used
- Status (success/failed)

---

## 2. Billing & Payment

### 2.1 billing.invoice_generated
**Purpose:** Track when invoices are automatically generated

**Trigger:** Billing cycle ends and system automatically generates invoice for services rendered

**Items to Log:**
- Organization ID & Name
- Invoice ID
- Invoice amount
- Billing period (from - to)
- Generation date & time
- Invoice status (draft/sent)
- Line items (plan, add-ons, etc.)

### 2.2 billing.invoice_sent
**Purpose:** Track when invoices are sent to customers

**Trigger:** Invoice is manually sent by admin or automatically sent based on billing settings

**Items to Log:**
- Organization ID & Name
- Invoice ID
- Invoice amount
- Sent date & time
- Recipient email
- Delivery status
- Sent by (actor)

### 2.3 billing.payment_received
**Purpose:** Track successful payments

**Trigger:** Payment gateway confirms successful charge on payment method

**Items to Log:**
- Organization ID & Name
- Invoice ID (if applicable)
- Payment amount
- Payment date & time
- Payment method
- Transaction ID
- Status (success/failed)

### 2.4 billing.payment_failed
**Purpose:** Track failed payment attempts

**Trigger:** Payment gateway returns error during charge attempt (declined card, insufficient funds, etc.)

**Items to Log:**
- Organization ID & Name
- Invoice ID (if applicable)
- Attempted amount
- Failed payment date & time
- Payment method used
- Failure reason (e.g., card declined, insufficient funds)
- Retry count
- Status (failed/retrying)

### 2.5 billing.payment_refunded
**Purpose:** Track refunded payments

**Trigger:** Admin initiates refund or system automatically refunds due to dispute/chargeback

**Items to Log:**
- Organization ID & Name
- Original transaction ID
- Refund amount
- Refund date & time
- Reason for refund
- Actor initiating refund
- Status (success/failed)

---

## 3. User Management

### 3.1 user.invited
**Purpose:** Track when users are invited to an organization

**Trigger:** Organization admin sends invitation to new user via email or direct link

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Invited user email
- Invited date & time
- Role assigned
- Invitation expiry date
- IP Address
- Status (success/pending/expired)

### 3.2 user.joined
**Purpose:** Track when invited users accept and join

**Trigger:** Invited user clicks acceptance link and completes account setup

**Items to Log:**
- User email
- Organization ID & Name
- Join date & time
- Role assigned
- IP Address
- Status (success)

### 3.3 user.role_changed
**Purpose:** Track when user roles are updated

**Trigger:** Organization admin modifies a user's role/permissions

**Items to Log:**
- Actor (email, type)
- User email
- Organization ID & Name
- Previous role
- New role
- Change date & time
- IP Address
- Status (success/failed)

### 3.4 user.removed
**Purpose:** Track when users are removed from an organization

**Trigger:** Organization admin removes user access or user requests to leave organization

**Items to Log:**
- Actor (email, type)
- User email
- Organization ID & Name
- Removal date & time
- Reason for removal
- IP Address
- Status (success/failed)

### 3.5 user.deactivated
**Purpose:** Track when users are deactivated (not deleted)

**Trigger:** Organization admin deactivates user account temporarily or due to inactivity

**Items to Log:**
- Actor (email, type)
- User email
- Organization ID & Name
- Deactivation date & time
- Reason for deactivation
- IP Address
- Status (success/failed)

### 3.6 user.password_reset
**Purpose:** Track when users request password resets

**Trigger:** User initiates password reset from login page or admin forces password reset

**Items to Log:**
- User email
- Request date & time
- Reset link expiry
- IP Address
- Status (requested/completed/expired)

---

## 4. Security & Access Control

### 4.1 api_key.created
**Purpose:** Track when API keys are created

**Trigger:** User or admin generates new API key in settings

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- API key ID (partial/masked)
- Key name/label
- Scopes/permissions
- Creation date & time
- Expiry date (if set)
- IP Address
- Status (success/failed)

### 4.2 api_key.rotated
**Purpose:** Track when API keys are rotated for security

**Trigger:** User or admin manually rotates API key or system auto-rotates based on policy

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Old API key ID (partial/masked)
- New API key ID (partial/masked)
- Rotation date & time
- Reason for rotation
- IP Address
- Status (success/failed)

### 4.3 api_key.revoked
**Purpose:** Track when API keys are revoked or deleted

**Trigger:** User or admin deletes/revokes API key or system revokes due to security policy

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- API key ID (partial/masked)
- Revocation date & time
- Reason for revocation
- IP Address
- Status (success/failed)

### 4.4 sso.configured
**Purpose:** Track when SSO integrations are set up

**Trigger:** Organization admin enables and configures SSO provider (e.g., Okta, Azure AD)

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- SSO provider (e.g., Okta, Azure AD, Google)
- Configuration date & time
- Enabled status (yes/no)
- IP Address
- Status (success/failed)

### 4.5 sso.updated
**Purpose:** Track when SSO configurations are modified

**Trigger:** Organization admin modifies existing SSO settings or connection parameters

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- SSO provider
- Previous settings (summary)
- New settings (summary)
- Update date & time
- IP Address
- Status (success/failed)

### 4.6 sso.disabled
**Purpose:** Track when SSO is disabled

**Trigger:** Organization admin disables SSO integration

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- SSO provider
- Disabled date & time
- Reason for disabling
- IP Address
- Status (success/failed)

### 4.7 mfa.enabled
**Purpose:** Track when multi-factor authentication is enabled

**Trigger:** User enables MFA on account or admin enforces MFA for organization

**Items to Log:**
- Actor (email, type)
- User email (if for specific user)
- Organization ID & Name
- MFA method (SMS/Authenticator/Email)
- Enabled date & time
- Scope (organization/user)
- IP Address
- Status (success/failed)

### 4.8 mfa.disabled
**Purpose:** Track when MFA is disabled

**Trigger:** User disables MFA on account or admin removes MFA requirement

**Items to Log:**
- Actor (email, type)
- User email (if for specific user)
- Organization ID & Name
- MFA method
- Disabled date & time
- IP Address
- Status (success/failed)

---

## 5. Organization Management

### 5.1 organization.created
**Purpose:** Track when new organizations are created

**Trigger:** Platform admin or user creates new organization through onboarding process

**Items to Log:**
- Actor (email, type)
- Organization name
- Organization ID
- Plan type
- Creation date & time
- Admin user email
- IP Address
- Status (success/failed)

### 5.2 organization.updated
**Purpose:** Track updates to organization settings

**Trigger:** Organization admin modifies organization profile, settings, or configuration

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Changed fields (summary)
- Previous values
- New values
- Update date & time
- IP Address
- Status (success/failed)

### 5.3 organization.suspended
**Purpose:** Track when organizations are suspended

**Trigger:** Platform admin suspends organization or system auto-suspends due to payment failure/policy violation

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Suspension date & time
- Reason (e.g., payment failure, policy violation)
- Duration (temporary/permanent)
- IP Address
- Status (success)

### 5.4 organization.reactivated
**Purpose:** Track when suspended organizations are reactivated

**Trigger:** Platform admin reactivates suspended organization or organization resolves suspension issue

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Reactivation date & time
- Reason for reactivation
- IP Address
- Status (success/failed)

### 5.5 organization.deleted
**Purpose:** Track when organizations are deleted

**Trigger:** Platform admin deletes organization or organization owner requests deletion

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Deletion date & time
- Reason for deletion
- Data retention policy applied
- IP Address
- Status (success/failed)

### 5.6 seats.increased
**Purpose:** Track when seat limits are increased

**Trigger:** Organization purchases additional user seats or admin allocates more seats

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Previous seat limit
- New seat limit
- Increase date & time
- Reason for increase
- IP Address
- Status (success/failed)

### 5.7 seats.decreased
**Purpose:** Track when seat limits are decreased

**Trigger:** Organization downscales seat allocation or admin reduces available seats

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Previous seat limit
- New seat limit
- Decrease date & time
- Reason for decrease
- IP Address
- Status (success/failed)

---

## 6. Data Management

### 6.1 data.exported
**Purpose:** Track when organization/user data is exported

**Trigger:** User or admin initiates data export from organization dashboard or reports section

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Export scope (all users, specific user, specific data type)
- Data types exported (e.g., user profiles, audit logs, transaction history)
- Export date & time
- File format (CSV/JSON/PDF)
- File size
- IP Address
- Status (success/failed)

### 6.2 data.imported
**Purpose:** Track when data is imported into the system

**Trigger:** Admin uploads/imports data file (CSV, JSON, etc.) into organization

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Import source
- Data types imported
- Number of records imported
- Import date & time
- File format
- Validation status
- IP Address
- Status (success/failed/partial)

### 6.3 data.deleted
**Purpose:** Track when data is deleted

**Trigger:** Admin permanently deletes data records or system purges data per retention policy

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Data type (users, audit logs, etc.)
- Records affected count
- Deletion date & time
- Reason for deletion
- Backup created (yes/no)
- IP Address
- Status (success/failed)

### 6.4 backup.created
**Purpose:** Track when system backups are performed

**Trigger:** Admin initiates backup or system automatically creates scheduled backup

**Items to Log:**
- Organization ID & Name
- Backup type (full/incremental)
- Creation date & time
- Data scope
- Backup size
- Status (success/failed)

### 6.5 backup.restored
**Purpose:** Track when data is restored from backups

**Trigger:** Admin restores data from backup due to data loss, corruption, or disaster recovery

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Backup ID/date
- Restore date & time
- Restore scope
- Reason for restore
- IP Address
- Status (success/failed)

---

## 7. Compliance & Governance

### 7.1 compliance.audit_initiated
**Purpose:** Track when compliance audits are started

**Trigger:** Platform admin or compliance officer initiates audit process for organization

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Audit type
- Audit scope
- Initiated date & time
- Expected completion date
- Status (initiated)

### 7.2 compliance.audit_completed
**Purpose:** Track when compliance audits are completed

**Trigger:** Compliance audit finishes and report is generated/finalized

**Items to Log:**
- Auditor (if applicable)
- Organization ID & Name
- Audit type
- Completion date & time
- Findings count
- Risk level (low/medium/high)
- Report generated (yes/no)
- Status (completed/failed)

### 7.3 policy.created
**Purpose:** Track when new policies are created

**Trigger:** Organization admin or platform admin creates new organization policy

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Policy name
- Policy type
- Policy version
- Creation date & time
- Effective date
- IP Address
- Status (success/failed)

### 7.4 policy.updated
**Purpose:** Track when policies are modified

**Trigger:** Organization admin or platform admin updates existing policy version

**Items to Log:**
- Actor (email, type)
- Organization ID & Name
- Policy name
- Previous version
- New version
- Update date & time
- Effective date
- Change summary
- IP Address
- Status (success/failed)

### 7.5 policy.acknowledged
**Purpose:** Track when users acknowledge policies

**Trigger:** User reads and acknowledges policy (e.g., terms, privacy policy, code of conduct)

**Items to Log:**
- User email
- Organization ID & Name
- Policy name
- Acknowledgement date & time
- Policy version acknowledged
- IP Address

---

## 8. System & Administrative

### 8.1 system.configuration_changed
**Purpose:** Track system-level configuration changes

**Trigger:** Platform admin modifies system configuration, feature flags, or settings

**Items to Log:**
- Actor (email, type)
- Configuration item
- Previous value
- New value
- Change date & time
- Change reason
- IP Address
- Status (success/failed)

### 8.2 system.maintenance_started
**Purpose:** Track when system maintenance begins

**Trigger:** Platform admin initiates scheduled or emergency system maintenance

**Items to Log:**
- Admin user
- Maintenance type
- Start date & time
- Expected duration
- Affected services
- Status (initiated)

### 8.3 system.maintenance_completed
**Purpose:** Track when system maintenance ends

**Trigger:** Platform admin completes system maintenance and services are back online

**Items to Log:**
- Admin user
- Maintenance type
- Completion date & time
- Actual duration
- Issues encountered (if any)
- Status (completed/failed)

### 8.4 admin.login
**Purpose:** Track admin logins for security

**Trigger:** Admin user successfully authenticates and logs into platform admin panel

**Items to Log:**
- Admin email
- Login date & time
- IP Address
- User agent/browser
- MFA used (yes/no)
- Status (success/failed)

### 8.5 admin.logout
**Purpose:** Track admin logouts

**Trigger:** Admin user logs out of platform admin panel or session expires

**Items to Log:**
- Admin email
- Logout date & time
- Session duration
- IP Address

---

## Common Fields for All Audit Logs

These fields should be present in every audit log entry:

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique audit log identifier (e.g., LOG-8934) |
| timestamp | DateTime | ISO 8601 format with UTC timezone |
| actor | String | User email or "system" for automated actions |
| actorType | String | Platform Admin, Organization Admin, Organization Owner, Organization Member, System |
| organization | String | Organization name |
| organizationId | String | Organization identifier |
| action | String | Action type (dot notation: category.action) |
| status | Enum | success, failed, pending, warning |
| ipAddress | String | Source IP address or "N/A" for system actions |
| userAgent | String | Browser/client information (optional) |
| details | String | Human-readable description of the action |

---

## Retention Policy

- **Standard Logs**: 12 months retention
- **Compliance Logs**: 7 years retention
- **Failed Actions**: 24 months retention
- **Security Events**: 3 years retention

---

## Export Format

- **Supported Formats**: JSON, CSV, PDF
- **Timezone**: UTC
- **Redaction**: Sensitive data (passwords, full API keys) must be masked
- **Encryption**: Export files should support AES-256 encryption

---

## Related VerifyMe docs

- [`audit-logs-schema.md`](./audit-logs-schema.md) — storage shape and examples
- [`audit-logs-ui.md`](./audit-logs-ui.md) — UI prototype notes
- [`billing-credits.md`](./billing-credits.md) — plans, credits, billable **verification session** outcomes
- [`glossary.md`](./glossary.md) — canonical terminology

