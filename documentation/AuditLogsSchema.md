# Audit Logs Data Schema

> **VerifyMe terminology:** See [`../docs/billing-credits.md`](../docs/billing-credits.md) and [`../docs/product-spec.md`](../docs/product-spec.md). Example payloads may reference **subscription** in `action` strings for historical alignment; product language prefers **plan / credits** for customer-facing and admin UX text.

## Overview
This document defines the **actual implemented** data structure for storing audit logs based on the specifications in AuditLogsPlan.md. 

**Implementation Status:** ✅ Frontend prototype complete
- Prototypes relating to Audit Logs primarily in `src/app/shared/types/auditLog.ts`
- Simplified for prototype (e.g., flattened structures, reduced fields)
- Database schema and query patterns provided for backend implementation

---

### Implementation Notes

**Prototype Simplifications:**
- `timestamp` is a string (ISO 8601) instead of a typed DateTime
- `organization` is denormalized into `BaseAuditLog` (not split into separate entity)
- `payload` is generic `Record<string, unknown>` allowing flexible structures
- Nested objects are flattened (e.g., `billingPeriodFrom` / `billingPeriodTo` instead of `billingPeriod: { from, to }`)
- Line items simplified to count instead of full array (`lineItemsCount` vs `lineItems[]`)
- Some compound logs split into single-action types (e.g., `ComplianceAuditInitiatedLog` only)

**For Production:** These simplifications can be replaced with more strict typing and nested structures as needed.

---

## Database Schema (SQL)

### Primary Audit Logs Table

```sql
CREATE TABLE audit_logs (
  -- Identifiers
  id VARCHAR(20) PRIMARY KEY,           -- LOG-XXXX format
  organization_id UUID NOT NULL,
  
  -- Actor
  actor VARCHAR(255) NOT NULL,          -- email or "system"
  actor_type VARCHAR(50) NOT NULL,      -- Enum value
  
  -- Temporal
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Action & Status
  action VARCHAR(100) NOT NULL,         -- Dot notation
  status VARCHAR(20) NOT NULL,          -- Enum value
  
  -- Context
  ip_address VARCHAR(45),               -- IPv4 or IPv6
  user_agent VARCHAR(500),
  details TEXT NOT NULL,
  
  -- Action-specific payload (JSON for flexibility)
  payload JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for common queries
  INDEX idx_org_id (organization_id),
  INDEX idx_actor (actor),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status),
  INDEX idx_org_timestamp (organization_id, timestamp DESC),
  INDEX idx_action_timestamp (action, timestamp DESC)
);

-- Retention policy table
CREATE TABLE audit_log_retention_policies (
  id SERIAL PRIMARY KEY,
  action_pattern VARCHAR(100) NOT NULL,  -- e.g., "compliance.*"
  retention_days INT NOT NULL,
  description TEXT,
  UNIQUE(action_pattern)
);

-- Populate retention policies
INSERT INTO audit_log_retention_policies (action_pattern, retention_days, description) VALUES
  ('subscription.*', 365, 'Standard logs'),
  ('billing.*', 365, 'Standard logs'),
  ('user.*', 365, 'Standard logs'),
  ('api_key.*', 1095, 'Security events - 3 years'),
  ('sso.*', 1095, 'Security events - 3 years'),
  ('mfa.*', 1095, 'Security events - 3 years'),
  ('compliance.*', 2555, 'Compliance logs - 7 years'),
  ('policy.*', 2555, 'Compliance logs - 7 years'),
  ('organization.deleted', 730, 'Failed/important actions - 2 years'),
  ('admin.*', 1095, 'Security events - 3 years');
```

---

## Document Schema (MongoDB/NoSQL)

```javascript
db.createCollection("audit_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "organizationId", "actor", "actorType", "timestamp", "action", "status", "details"],
      properties: {
        // Identifiers
        id: {
          bsonType: "string",
          pattern: "^LOG-[0-9]+$",
          description: "Unique audit log identifier"
        },
        organizationId: {
          bsonType: "objectId",
          description: "Reference to organization"
        },
        organization: {
          bsonType: "string",
          description: "Organization name (denormalized)"
        },
        
        // Actor
        actor: {
          bsonType: "string",
          description: "Email or 'system'"
        },
        actorType: {
          enum: ["Platform Admin", "Organization Admin", "Organization Owner", "Organization Member", "System"],
          description: "Type of actor"
        },
        
        // Temporal
        timestamp: {
          bsonType: "date",
          description: "UTC timestamp"
        },
        
        // Action
        action: {
          bsonType: "string",
          pattern: "^[a-z_]+\\.[a-z_]+$",
          description: "Dot notation action"
        },
        
        // Status
        status: {
          enum: ["success", "failed", "pending", "warning"],
          description: "Audit log status"
        },
        
        // Context
        ipAddress: {
          bsonType: "string",
          description: "IP address or 'N/A'"
        },
        userAgent: {
          bsonType: "string",
          description: "Browser/client info (optional)"
        },
        details: {
          bsonType: "string",
          description: "Human-readable description"
        },
        
        // Payload
        payload: {
          bsonType: "object",
          description: "Action-specific data"
        }
      }
    }
  }
});

// Indexes for performance
db.audit_logs.createIndex({ organizationId: 1, timestamp: -1 });
db.audit_logs.createIndex({ action: 1, timestamp: -1 });
db.audit_logs.createIndex({ actor: 1, timestamp: -1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ status: 1 });

// TTL index for automatic cleanup based on retention policy
db.audit_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 94608000 }  // 3 years default
);
```

---

## Query Patterns

### Common Queries

```sql
-- Get all logs for an organization in date range
SELECT * FROM audit_logs
WHERE organization_id = $1 
  AND timestamp BETWEEN $2 AND $3
ORDER BY timestamp DESC
LIMIT 100;

-- Get specific action logs
SELECT * FROM audit_logs
WHERE organization_id = $1
  AND action = $2
  AND timestamp > NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;

-- Get all logs by actor
SELECT * FROM audit_logs
WHERE actor = $1
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- Get failed actions for troubleshooting
SELECT * FROM audit_logs
WHERE organization_id = $1
  AND status = 'failed'
ORDER BY timestamp DESC
LIMIT 50;

-- Compliance report - all policy changes
SELECT * FROM audit_logs
WHERE action LIKE 'policy.%'
  AND timestamp > NOW() - INTERVAL '1 year'
ORDER BY timestamp DESC;

-- Security audit - all admin activities
-- KK: 90 days could slow down DB server, proceed with caution
SELECT * FROM audit_logs
WHERE actor_type = 'Platform Admin'
  AND timestamp > NOW() - INTERVAL '90 days'
ORDER BY timestamp DESC;
```

---

## Retention Strategy

| Log Category | Retention | Reason |
|--------------|-----------|--------|
| Subscription/Billing | 12 months | Standard operational logs |
| User Management | 12 months | Standard operational logs |
| API Keys/SSO/MFA | 36 months | Security events & compliance |
| Organization/Seats | 12 months | Standard operational logs |
| Data Management | 24 months | Sensitive operations |
| Compliance/Policy | 84 months (7 years) | Regulatory requirements |
| System/Admin | 36 months | Security & audit trail |

---

## Export/Serialization Format

### JSON Export Example

```json
{
  "logs": [
    {
      "id": "LOG-8934",
      "organizationId": "ORG-001",
      "organization": "Acme Corporation",
      "actor": "admin@platform.com",
      "actorType": "Platform Admin",
      "timestamp": "2024-04-09T10:32:45Z",
      "action": "subscription.upgraded",
      "status": "success",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "details": "Upgraded from Professional to Enterprise",
      "payload": {
        "previousPlan": "Professional",
        "newPlan": "Enterprise",
        "billingChange": 500
      }
    },
    {
      "id": "LOG-8933",
      "organizationId": "ORG-001",
      "organization": "Acme Corporation",
      "actor": "john@acme.com",
      "actorType": "Organization Owner",
      "timestamp": "2024-04-09T10:28:12Z",
      "action": "user.invited",
      "status": "success",
      "ipAddress": "203.0.113.45",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "details": "Invited new user with Admin role",
      "payload": {
        "invitedUserEmail": "sarah@acme.com",
        "roleAssigned": "Administrator",
        "invitationExpiryDate": "2024-04-16T10:28:12Z"
      }
    }
  ],
  "exportedAt": "2024-04-10T14:20:00Z",
  "totalRecords": 2,
  "format": "json",
  "encryption": "aes-256"
}
```

### CSV Export Example

```csv
ID,Timestamp,Actor,ActorType,Organization,Action,Status,IP Address,Details
LOG-8934,2024-04-09T10:32:45Z,admin@platform.com,Platform Admin,Acme Corporation,subscription.upgraded,success,192.168.1.100,Upgraded from Professional to Enterprise
```

---

## Performance Considerations

1. **Indexing Strategy**
   - Primary: `(organization_id, timestamp DESC)`
   - Secondary: `(action, timestamp DESC)`
   - Search: `(actor, timestamp DESC)`

2. **Partitioning** (for large datasets)
   - Partition by `organization_id` (hash)
   - Sub-partition by `timestamp` (monthly range)

3. **Archival**
   - Move logs older than retention period to archive storage
   - Consider cold storage (S3, Azure Archive) for compliance logs

4. **Query Optimization**
   - Use JSONB indexes for frequent payload queries
   - Denormalize organization name to avoid joins
   - Limit default query results (pagination)

