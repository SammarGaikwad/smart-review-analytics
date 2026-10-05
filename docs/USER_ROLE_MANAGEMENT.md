# Enterprise User & Role Management Documentation

## 1. Overview & Purpose
The **User & Role Management** module enables administrators to securely manage user accounts, assign/remove system roles, control user activation status, and enforce strict role-based access control (RBAC). All administrative actions are automatically recorded in the `AuditLog` table.

---

## 2. Architecture & Flow

### User Management Control Flow
```
Admin Client
  │
  │  Headers: { Authorization: "Bearer <ADMIN_JWT>" }
  ▼
Authentication Middleware (auth.middleware.ts)
  │
  ├─► Verifies JWT signature and extracts user identity claims
  │
  ▼
RBAC Middleware (rbac.middleware.ts)
  │
  ├─► Verifies user.roles contains "Admin" (HTTP 403 if insufficient)
  │
  ▼
User Management Controller (userManagement.controller.ts)
  │
  ├─► Validates input parameters (email, password, roles, IDs)
  │
  ▼
User Management Service (userManagement.service.ts)
  │
  ├─► Prisma ORM -> PostgreSQL (smart_review_analytics)
  │     Query / Mutate User, Role, UserRole
  │
  ├─► Record AuditLog Event (createAuditLog)
  │
  ▼
Admin Client receives HTTP 200/201 + Safe User Profile Response
```

---

## 3. System Roles & Access Matrix

| Role Name | Description | Admin Management Rights | System Access |
| :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | Full Read/Write/Assign | All Platform Modules & APIs |
| **Analyst** | Data & NLP Analyst | None (Access Denied - HTTP 403) | Dashboards, Analytics APIs, Reports |
| **BusinessUser** | Domain & Product Manager | None (Access Denied - HTTP 403) | Reviews, Product Analytics, Insights |
| **Customer** | End Consumer | None (Access Denied - HTTP 403) | Submit & view own reviews |

---

## 4. API Endpoints Reference

### 4.1 List All Available Roles
- **URL**: `GET /api/users/roles`
- **Access**: Admin Only
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": [
      { "id": "1", "name": "Admin", "description": "Full system administration access" },
      { "id": "2", "name": "Analyst", "description": "Access to analytics, dashboards, and reports" },
      { "id": "3", "name": "BusinessUser", "description": "Access to reviews, products, and domain insights" },
      { "id": "4", "name": "Customer", "description": "Can submit and view customer reviews" }
    ]
  }
  ```

### 4.2 List Users (Paginated & Filterable)
- **URL**: `GET /api/users?page=1&limit=20&search=john&role=Customer`
- **Access**: Admin Only
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "7328dd43-c14b-4d89-9f9c-11615c26b98f",
          "email": "customer@analytics.com",
          "fullName": "John Doe Customer",
          "isActive": true,
          "createdAt": "2026-10-04T16:00:00.000Z",
          "updatedAt": "2026-10-04T16:00:00.000Z",
          "roles": ["Customer"]
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 4,
        "totalPages": 1
      }
    }
  }
  ```

### 4.3 Get Single User Details
- **URL**: `GET /api/users/:id`
- **Access**: Admin Only
- **Response (HTTP 200)**: Safe user profile without `passwordHash`.

### 4.4 Create New User
- **URL**: `POST /api/users`
- **Access**: Admin Only
- **Request Body**:
  ```json
  {
    "email": "newanalyst@analytics.com",
    "fullName": "Jane Analyst",
    "password": "SecurePassword123",
    "role": "Analyst"
  }
  ```
- **Response (HTTP 201 Created)**: Safe user profile + `UserRole` link.

### 4.5 Update User Details
- **URL**: `PUT /api/users/:id`
- **Access**: Admin Only
- **Request Body**: `{ "fullName": "Jane Analyst Senior", "isActive": true }`

### 4.6 Change User Status (Activation / Deactivation)
- **URL**: `PATCH /api/users/:id/status`
- **Access**: Admin Only
- **Request Body**: `{ "isActive": false }`
- **Safeguard**: Prevents Admin self-deactivation.

### 4.7 Assign Role to User
- **URL**: `POST /api/users/:id/roles`
- **Access**: Admin Only
- **Request Body**: `{ "role": "BusinessUser" }`
- **Safeguard**: Handles duplicate role assignments cleanly without erroring.

### 4.8 Remove Role from User
- **URL**: `DELETE /api/users/:id/roles/:roleId`
- **Access**: Admin Only
- **Safeguard**: Prevents removing the final Admin role if only one administrator remains in the system.

### 4.9 Delete User
- **URL**: `DELETE /api/users/:id`
- **Access**: Admin Only
- **Safeguard**: Prevents Admin self-deletion and last Admin user deletion.

---

## 5. Security & Administrative Safeguards
1. **Password Safety**: Passwords are hashed using `bcrypt` (cost factor 10). `passwordHash` is excluded from all responses.
2. **Duplicate Prevention**: Email uniqueness is enforced (HTTP 409 Conflict), and duplicate `UserRole` entries are prevented using `@@unique([userId, roleId])`.
3. **Admin Lockout Protection**:
   - Admins cannot deactivate or delete their own accounts.
   - The system prevents deleting or revoking the `Admin` role from the final administrator.
4. **Server-Side Enforcement**: Authorization relies exclusively on server-verified JWT signatures and database role relations.

---

## 6. Enterprise Systems (ES) Curriculum Mapping

| ES Curriculum Unit | Concept | Implementation Evidence |
| :--- | :--- | :--- |
| **ES Unit II** | Enterprise Database Architecture | `User`, `Role`, `UserRole` Prisma relational modeling in PostgreSQL |
| **ES Unit III** | Enterprise CRM & User Management | User CRUD, profile management, status control |
| **ES Unit III** | Role-Based Security Architecture | JWT authentication & `authorizeRoles("Admin")` RBAC middleware |
| **ES Unit IV** | Enterprise Accountability & Governance | Automatic `AuditLog` generation for user creation, updates, and role mutations |
