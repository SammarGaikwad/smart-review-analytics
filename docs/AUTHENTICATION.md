# Authentication & Role-Based Access Control (RBAC) Documentation

## 1. Overview
The **Smart Review Analytics Platform** uses JSON Web Tokens (JWT) and bcrypt password verification integrated with PostgreSQL database role definitions (`User`, `Role`, `UserRole` Prisma models) to provide secure enterprise authentication and granular authorization.

---

## 2. Authentication Architecture & Flow

### Login Sequence
```
Client
  │
  │  POST /api/auth/login { email, password }
  ▼
Auth Controller (auth.controller.ts)
  │
  │  loginUser(email, password)
  ▼
Auth Service (auth.service.ts)
  │
  ├─► Prisma ORM -> PostgreSQL (smart_review_analytics)
  │     Query User + UserRole + Role
  │
  ├─► bcrypt.compare(password, user.passwordHash)
  │
  ├─► Generate JWT Token (sub: user.id, email: user.email, roles: [...])
  │
  ▼
Client receives HTTP 200 + { user: { id, email, fullName, roles }, token }
```

### Protected Request Flow
```
Client Request
  │
  │  Headers: { Authorization: "Bearer <JWT>" }
  ▼
Authentication Middleware (auth.middleware.ts)
  │
  ├─► Extracts Bearer Token
  ├─► Verifies JWT via JWT_SECRET
  └─► Attaches payload to req.user
  │
  ▼
RBAC Middleware (rbac.middleware.ts)
  │
  ├─► Checks user.roles against allowed roles
  │     ├─ No match  -> HTTP 403 Forbidden
  │     └─ Matches   -> Call next()
  ▼
Target Controller & Service
```

---

## 3. API Endpoints

### 3.1 Login Endpoint
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@analytics.com",
    "password": "password123"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "7328dd43-c14b-4d89-9f9c-11615c26b98f",
        "email": "admin@analytics.com",
        "fullName": "System Administrator",
        "roles": ["Admin"],
        "isActive": true,
        "createdAt": "2026-10-04T16:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (HTTP 401)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### 3.2 Current User Profile
- **URL**: `GET /api/auth/me`
- **Access**: Authenticated users
- **Header**: `Authorization: Bearer <token>`
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "7328dd43-c14b-4d89-9f9c-11615c26b98f",
      "email": "admin@analytics.com",
      "fullName": "System Administrator",
      "roles": ["Admin"],
      "isActive": true,
      "createdAt": "2026-10-04T16:00:00.000Z"
    }
  }
  ```

---

### 3.3 Protected Demonstration Routes
- `GET /api/auth/test` — Accessible by any valid authenticated role (`Admin`, `Analyst`, `BusinessUser`, `Customer`).
- `GET /api/auth/admin-test` — Protected by `authorizeRoles("Admin")` (Denies non-Admin with HTTP 403 Forbidden).

---

## 4. System Roles (RBAC)

| Role Name | Description | Access Scope |
| :--- | :--- | :--- |
| **Admin** | Full system administration | All endpoints, User Management, System Config |
| **Analyst** | Analytics and reporting engine | Dashboards, Sentiment, Keywords, Topics, Clustering, Networks |
| **BusinessUser**| Product & Domain oversight | Domain insights, Product metrics, Reviews |
| **Customer** | End consumer role | Submit and view own reviews |

---

## 5. HTTP Status Codes

| Code | Meaning | Cause |
| :--- | :--- | :--- |
| **200 OK** | Success | Request succeeded & token/user profile issued |
| **400 Bad Request** | Validation Error | Missing email or password in login request |
| **401 Unauthorized** | Authentication Error | Invalid credentials, missing/malformed token, or expired JWT |
| **403 Forbidden** | Authorization Error | Valid user token but role lacks required permission |
| **500 Internal Error** | Server Error | Unhandled server or database failure |

---

## 6. Environment Variables

Define in `.env`:
```env
JWT_SECRET=super-secret-jwt-key-change-in-production-2026
JWT_EXPIRES_IN=1d
```

---

## 7. Security Best Practices Implemented
1. **Password Safety**: `passwordHash` is excluded from all API responses and JWT claims.
2. **Credential Privacy**: Generic error messages (`"Invalid email or password"`) prevent username enumeration attacks.
3. **No Frontend Reliance**: Authorization checks parse roles strictly from server-signed JWT identity verified against database records.
4. **Environment Isolation**: Production secrets are never committed to version control (`.env.example` contains placeholders only).
