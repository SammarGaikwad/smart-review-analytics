# Smart Review Analytics Platform for Multiple Domains

A single, integrated enterprise-grade academic software project satisfying requirements for three core subjects:
1. **ASTMA** — Advanced Social, Text and Media Analytics
2. **IPTM** — IT Project Management
3. **ES** — Enterprise Systems

---

## 🏗️ 3-Tier Enterprise System Architecture

```text
               Presentation Layer (Tier 1)
                     React + Vite + TS
                            │
                            ▼
               Application Layer (Tier 2)
                 Node.js + Express REST API
                   │                  │
                   ▼                  ▼
          Data Layer (Tier 3)   Analytics Service (Python)
         PostgreSQL + Prisma     FastAPI + NLP + Scikit-Learn
```

---

## 📁 Repository Structure

```text
smart-review-analytics/
├── frontend/        # React + TypeScript + Vite + Tailwind CSS
├── backend/         # Node.js + Express + TypeScript API Server
├── analytics/       # Python FastAPI Service (NLP, Sentiment, Clustering)
├── database/        # ERD diagrams, SQL scripts, & migrations reference
├── datasets/        # Sample CSV review datasets (Hotels, E-commerce, etc.)
├── docker/          # Docker & container orchestration configurations
├── docs/            # Academic documentation for ASTMA, IPTM, and ES
├── tests/           # Integration & End-to-End Test suites
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 2. Analytics Service
```bash
cd analytics
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Analytics runs on `http://localhost:8000`*

### 3. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*
