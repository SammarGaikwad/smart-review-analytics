# FRONTEND INTEGRATION & REAL-DATA DASHBOARD DOCUMENTATION

## 1. Overview & Architecture

The Smart Review Analytics Platform frontend is built using **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Lucide React**, and **Recharts**.

### System Architecture Stack
```
React (Vite 18)
      │ (HTTP REST / JSON)
      ▼
Centralized API Service (Axios Client with JWT Interceptors)
      │
      ▼
Node.js + Express REST API (Port 5000)
      │
      ├───────────────────────┐
      ▼                       ▼
Prisma ORM               Python FastAPI Analytics (Port 8000)
      │ (ASTMA: VADER, TF-IDF, K-Means, NetworkX)
      ▼
PostgreSQL Database (Port 6009)
```

---

## 2. API Service Layer

The frontend utilizes a centralized HTTP client built on `axios` located at `frontend/src/api/client.ts`.

- **Base URL**: Controlled by `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:5000`).
- **Authorization Injection**: Interceptor automatically attaches `Authorization: Bearer <token>` from `localStorage`.
- **Global Error Handling**: Automatically intercepts HTTP `401 Unauthorized` responses, clears stored JWT credentials, and triggers redirect to `/login`.

---

## 3. Authentication & JWT Flow

Authentication is managed via `AuthContext.tsx` (`frontend/src/context/AuthContext.tsx`).

1. **User Login**: User submits email/password on `/login` (`POST /api/auth/login`).
2. **Token Storage**: JWT bearer token is safely saved in browser storage (`smart_review_auth_token`).
3. **User Hydration**: On app launch or page refresh, `AuthContext` calls `GET /api/auth/me` with the bearer header to retrieve current profile, verified roles, and permissions.
4. **Logout**: Instantly purges JWT token and context state, redirecting user to `/login`.

---

## 4. Protected Routes & RBAC Architecture

Route protection is implemented using higher-order layout wrappers in `frontend/src/components/routes/ProtectedRoutes.tsx`:

- `<ProtectedRoute />`: Ensures user is authenticated; otherwise redirects to `/login`.
- `<RoleRoute allowedRoles={['Admin', 'Analyst']} />`: Checks user's active roles returned from `GET /api/auth/me`. If access is forbidden, displays a modern, styled `403 Forbidden` error banner without exposing sensitive components.

---

## 5. Dashboard Real Data Integration

The dashboard (`frontend/src/pages/DashboardPage.tsx`) has been completely decoupled from static/placeholder values and connects directly to `GET /api/analytics/web`.

### Real Analytics Data Populated:
- **Total Reviews & Average Rating**: Calculated directly from PostgreSQL database rows.
- **Sentiment Breakdown**: VADER positive, neutral, and negative sentiment counts.
- **Domain Performance**: Real review counts and average ratings grouped by registered domains.
- **Rating Distribution**: Live 1 to 5 star rating breakdown.
- **System Health**: Dynamic health status badge fetched from `GET /api/health`.

---

## 6. Analytics Pages & ASTMA Capabilities

- **Web Analytics**: Real-time KPI summaries, domain performance breakdown, rating distribution, and sentiment distribution.
- **Network Analytics**: Graph node and edge metrics fetched from `GET /api/analytics/network` (Node count, Edge count, Average degree, Graph density, Connected components).
- **Interactive Sentiment / NLP Tester**: Live integration calling backend sentiment and keyword analysis pipelines.

---

## 7. User Management UI (Admin Only)

Admin-exclusive interface at `frontend/src/pages/UsersPage.tsx`:
- List all enterprise users (`GET /api/users`).
- Create new user accounts (`POST /api/users`).
- Toggle user activation status (`PATCH /api/users/:id/status`).
- Assign and revoke user roles (`POST /api/users/:id/roles`, `DELETE /api/users/:id/roles/:roleId`).
- Safe user deletion with confirmation safeguards (`DELETE /api/users/:id`).

---

## 8. Enterprise Audit Logs (Admin Only)

Admin-exclusive interface at `frontend/src/pages/AuditLogsPage.tsx`:
- System activity audit trail fetched from `GET /api/audit-logs`.
- Supports action filtering (`USER_LOGIN`, `USER_CREATE`, `USER_STATUS_CHANGE`, `ROLE_ASSIGN`, etc.).
- Paginated table showing Action, Target Entity, User/Actor, IP Address, Timestamp, and JSON Details.

---

## 9. Environment Variables

Client configuration is defined in `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

> **Security Note**: `VITE_*` variables are bundled into browser code. No passwords, database credentials, or JWT secrets are placed in frontend environment files.

---

## 10. Verification & Build Status

- **Frontend Build (`npm run build`)**: PASS (5.31s)
- **Node Backend Type Check (`npx tsc --noEmit`)**: PASS (0 errors)
- **Full Automated System Test**: PASS (10/10 automated tests passed)
