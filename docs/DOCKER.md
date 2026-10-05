# Docker Containerization & DevOps Documentation

## 1. Overview & Purpose
The **Smart Review Analytics Platform** uses Docker and Docker Compose for microservices containerization, dependency isolation, and reproducible deployment.

---

## 2. Container Topology & Architecture

```
                    ┌───────────────────────────────┐
                    │     React Frontend (Vite)     │
                    │         localhost:3000        │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Docker Network: smart_review_network                                    │
│                                                                         │
│   ┌────────────────────────────────┐   HTTP    ┌────────────────────┐   │
│   │ Node.js Express Backend API    │──────────►│ Python FastAPI     │   │
│   │ Container: smart_review_backend│           │ Container:         │   │
│   │ Port: 5000:5000                │           │ smart_review_      │   │
│   └───────────────┬────────────────┘           │ analytics_engine   │   │
│                   │                            │ Port: 8000:8000    │   │
└───────────────────┼────────────────────────────┴────────────────────┘   │
                    │ host.docker.internal:6009                           │
                    ▼                                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│ External PostgreSQL Database (Host Machine)                             │
│ Database: smart_review_analytics (Port 6009)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Container Services Summary

| Service | Technology | Port | Container Name | Health Check Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Node.js 20 LTS + Express + TypeScript | `5000` | `smart_review_backend_api` | `GET /api/health` |
| **Analytics Engine** | Python 3.11 + FastAPI + scikit-learn + NLTK | `8000` | `smart_review_analytics_engine` | `GET /api/analytics/health` |
| **PostgreSQL DB** | PostgreSQL 16 (Host Machine) | `6009` | External | Native TCP Port 6009 |

---

## 4. Environment Variables & Networking

### Docker Compose Services (`docker-compose.yml`)

#### Backend Container Environment Configuration
- `PORT=5000`
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://postgres:<password>@host.docker.internal:6009/smart_review_analytics?schema=public`
- `ANALYTICS_URL=http://analytics:8000`
- `ANALYTICS_SERVICE_URL=http://analytics:8000`
- `JWT_SECRET=super-secret-jwt-key-change-in-production-2026`
- `JWT_EXPIRES_IN=1d`
- `CORS_ORIGIN=http://localhost:3000`

---

## 5. Docker CLI Commands

### Build Container Images
```bash
docker compose build
```

### Start Services in Detached Mode
```bash
docker compose up -d
```

### Check Running Container Status
```bash
docker compose ps
```

### View Real-Time Container Logs
```bash
# All containers
docker compose logs -f

# Specific container logs
docker compose logs -f backend
docker compose logs -f analytics
```

### Stop Services
```bash
docker compose down
```

---

## 6. IPTM / DevOps Academic Curriculum Mapping

| IPTM / DevOps Concept | System Implementation Evidence |
| :--- | :--- |
| **Containerization** | Production multi-stage `backend/Dockerfile` and `analytics/Dockerfile` |
| **Environment Consistency** | Isolated runtime environments (Node 20 Alpine & Python 3.11-slim) |
| **Service Discovery** | Docker internal bridge network (`smart_review_network`) enabling `backend` $\rightarrow$ `analytics:8000` resolution |
| **Host Gateway Resolution** | Windows Docker Desktop `host.docker.internal` routing to external PostgreSQL on port `6009` |
| **Deployment Automation Foundation** | Declarative orchestration in `docker-compose.yml` with healthchecks & dependency ordering |
