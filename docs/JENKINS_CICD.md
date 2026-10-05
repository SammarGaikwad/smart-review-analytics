# Jenkins CI/CD Pipeline Documentation

## 1. Overview & Purpose
The **Jenkins CI/CD Pipeline** provides automated continuous integration, TypeScript code validation, Python syntax verification, Docker container image build verification, database-isolated integration testing, and automated health checks for the **Smart Review Analytics Platform**.

---

## 2. CI/CD Pipeline Architecture

```
GitHub Push / Webhook
         │
         ▼
Jenkins Agent (Jenkinsfile)
         │
         ├──► Stage 1: Checkout Source Code
         ├──► Stage 2: Environment & Tooling Validation
         ├──► Stage 3: Backend TypeScript Compilation Check (npx tsc --noEmit)
         ├──► Stage 4: Analytics Python Compilation Check (python -m compileall)
         ├──► Stage 5: Docker Container Image Build (docker compose build)
         ├──► Stage 6: Docker Compose Specification Validation (docker compose config)
         ├──► Stage 7: Isolated CI Environment Startup (docker-compose.ci.yml)
         │               └─► Starts disposable smart_review_ci Postgres container
         ├──► Stage 8: CI Database Schema Migration & Seeding
         ├──► Stage 9: Container Health Check Verification
         ├──► Stage 10: End-to-End API Smoke Tests
         │
         ▼
Post Actions: Always Cleanup Disposable CI Containers (docker compose -f docker-compose.ci.yml down -v)
```

---

## 3. Database Isolation Architecture

To ensure total safety of production/academic database records, the CI pipeline uses a separate, dedicated Compose specification ([docker-compose.ci.yml](file:///d:/projects/smart-review-analytics/docker-compose.ci.yml)).

| Environment | Database Name | Port | Host Connection | Data Persistence |
| :--- | :--- | :--- | :--- | :--- |
| **Development / Real DB** | `smart_review_analytics` | `6009` | Host PostgreSQL Machine | Persistent |
| **Jenkins CI Environment** | `smart_review_ci` | `5433` | Isolated Docker Container (`postgres_ci`) | Disposable (Removed via `down -v`) |

> **Critical Safety Guarantee**: The CI pipeline **never** executes `prisma db push`, `prisma migrate reset`, or destructive commands against the host database (`smart_review_analytics`).

---

## 4. Pipeline Stages & Execution Commands

| Stage # | Stage Name | Purpose | Command / Execution |
| :--- | :--- | :--- | :--- |
| **1** | **Checkout** | Source code retrieval | `checkout scm` |
| **2** | **Env Validation** | Tooling availability check | `git`, `docker`, `node`, `npm`, `python` version check |
| **3** | **Backend Validation** | Type checking & Prisma Client generation | `npm install && npx prisma generate && npx tsc --noEmit` |
| **4** | **Analytics Validation**| Python syntax compilation | `python -m compileall app` |
| **5** | **Docker Build** | Container image creation | `docker compose build` & `docker compose -f docker-compose.ci.yml build` |
| **6** | **Compose Validation** | Spec syntax check | `docker compose config` & `docker compose -f docker-compose.ci.yml config` |
| **7** | **CI Startup** | Isolated container launch | `docker compose -f docker-compose.ci.yml up -d` |
| **8** | **CI DB Migration** | Disposable DB initialization | `prisma db push` & `npm run prisma:seed` (on `smart_review_ci` container) |
| **9** | **Health Checks** | Container endpoint response | `curl -f http://localhost:5001/api/health` & `curl -f http://localhost:8001/api/analytics/health` |
| **10**| **Smoke Tests** | API functionality check | `POST /api/auth/login`, `GET /api/domains`, `GET /api/analytics/network` |
| **11**| **Cleanup** | Container tear down | `docker compose -f docker-compose.ci.yml down -v` |

---

## 5. IPTM / DevOps Academic Curriculum Mapping

| IPTM / DevOps Concept | Implementation Evidence |
| :--- | :--- |
| **Continuous Integration (CI)** | Declarative `Jenkinsfile` orchestrating build, test, and verification automation |
| **Automated Verification** | `npx tsc --noEmit` type compilation and Python module compilation |
| **Environment Isolation** | `docker-compose.ci.yml` isolating disposable PostgreSQL and microservice containers |
| **Database Safety** | Strict separation of test databases (`smart_review_ci`) from persistent databases |
| **Pipeline Reliability** | Automated `post { always { ... } }` cleanup preventing resource leaks |
