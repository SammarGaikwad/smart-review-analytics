# Enterprise Audit Trail Documentation

## 1. Overview & Purpose
The **Enterprise Audit Trail** module provides security accountability, operational traceability, and administrative monitoring for the **Smart Review Analytics Platform**. It records important authenticated user actions (logins, failed authentication attempts, product creations, updates, deletions) into PostgreSQL using the existing `AuditLog` model.

---

## 2. ActivityEvent vs. AuditLog Architecture

| Feature | `ActivityEvent` | `AuditLog` |
| :--- | :--- | :--- |
| **Primary Focus** | Application & Web Usage Analytics | Enterprise Security & Operational Accountability |
| **Typical Actions** | `PAGE_VIEW`, `SEARCH`, `FILTER`, `EXPORT` | `LOGIN_SUCCESS`, `LOGIN_FAILED`, `CREATE`, `UPDATE`, `DELETE`, `ROLE_CHANGE` |
| **Audience** | ASTMA Web Analytics Engine & Product Managers | System Administrators, Compliance Officers & Security Auditors |
| **Access Control** | Public/Authenticated tracking endpoints | Restricted (Admin-only access via RBAC) |

---

## 3. Data Schema (`AuditLog`)
Reused from `backend/prisma/schema.prisma`:
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  userEmail String?
  action    String   // CREATE, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILED
  resource  String   // Product, Domain, Review, User
  ipAddress String?
  status    String   @default("SUCCESS") // SUCCESS, FAILURE, FORBIDDEN
  timestamp DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

## 4. Standardized Audit Action Vocabulary

| Action Name | Trigger Event | Status |
| :--- | :--- | :--- |
| `LOGIN_SUCCESS` | Successful user authentication via `POST /api/auth/login` | `SUCCESS` |
| `LOGIN_FAILED` | Invalid credentials or missing account on `POST /api/auth/login` | `FAILURE` |
| `CREATE` | Creation of business entity (e.g. `Product`) via `POST /api/products` | `SUCCESS` |
| `UPDATE` | Modification of entity via `PUT /api/products/:id` | `SUCCESS` |
| `DELETE` | Removal of entity via `DELETE /api/products/:id` | `SUCCESS` |
| `ANALYZE` | Execution of analytics pipeline job | `SUCCESS` |

---

## 5. API Reference: GET /api/audit-logs

- **URL**: `GET /api/audit-logs`
- **Authentication**: Required (`Authorization: Bearer <JWT>`)
- **Authorization**: Admin role required (`authorizeRoles("Admin")`)
- **Query Parameters**:
  - `page` (number, default: `1`): Page number (min: 1)
  - `limit` (number, default: `20`): Records per page (min: 1, max: 100)
  - `action` (string, optional): Filter by action name (e.g., `DELETE`, `CREATE`, `LOGIN_SUCCESS`)
  - `resource` / `entity` (string, optional): Filter by target resource (e.g., `Product`, `User`)
  - `userId` (string, optional): Filter by user ID
  - `status` (string, optional): Filter by status (`SUCCESS`, `FAILURE`)
  - `startDate` (ISO 8601 string, optional): Range filter start
  - `endDate` (ISO 8601 string, optional): Range filter end

### Example Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "c8a42b10-8f92-4912-9c1e-0518fa1b4392",
        "userId": "7328dd43-c14b-4d89-9f9c-11615c26b98f",
        "userEmail": "admin@analytics.com",
        "action": "DELETE",
        "resource": "Product",
        "ipAddress": "127.0.0.1",
        "status": "SUCCESS",
        "timestamp": "2026-10-04T16:59:45.000Z",
        "user": {
          "id": "7328dd43-c14b-4d89-9f9c-11615c26b98f",
          "email": "admin@analytics.com",
          "fullName": "System Administrator"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## 6. Security & Operational Rules
1. **Authenticated Actor**: Audit actor details (`userId`, `userEmail`) are derived strictly from `req.user` attached by `auth.middleware.ts`. Request body user IDs are never trusted.
2. **Credential Protection**: Passwords, password hashes, JWT tokens, and authorization headers are **never** logged.
3. **Non-blocking Audit Logging**: Failed login attempts with non-existent emails or audit creation warnings log safely without crashing core business flows.
4. **RBAC Protection**: `GET /api/audit-logs` returns HTTP 403 Forbidden for non-Admin users (`Analyst`, `BusinessUser`, `Customer`).
