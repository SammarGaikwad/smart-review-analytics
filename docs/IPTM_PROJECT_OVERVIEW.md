# IPTM Unit I: Project Overview

## 1. Project Identification

**Project Title:** Smart Review Analytics Platform for Multiple Domains  
**Project Type:** Data Analytics & Web Platform  
**Project Domain:** E-commerce, Hospitality, Entertainment, and Customer Feedback Management  
**Target Users:** Business managers, Data analysts, Product managers, Customer experience teams, Administrators.  

**Business Problem:**  
Organizations receive vast amounts of unstructured customer feedback from multiple domain sources. However, they lack a unified, scalable platform to accurately collect, process, analyze, and visualize this text data in real-time, resulting in lost insights and delayed responses to customer needs.

**Proposed Solution:**  
The project develops a centralized, multi-tenant platform integrating advanced ASTMA techniques (sentiment analysis, keyword extraction, topic clustering, and network mapping) with rigorous enterprise safeguards (RBAC, Audit Trails). 

**Technology Stack:**  
- **Frontend:** React, TypeScript, Vite, Tailwind CSS  
- **Backend:** Node.js, Express, TypeScript  
- **Analytics Engine:** Python, FastAPI, scikit-learn, NLTK  
- **Database:** PostgreSQL, Prisma ORM  
- **DevOps:** Git/GitHub, Docker, Jenkins CI/CD  

**Expected Outcome:**  
A fully operational application providing centralized analytics capabilities without reliance on disparate analytical tools, significantly accelerating decision-making for end users.

---

## 2. Problem Statement
Organizations receive customer reviews from multiple domains but often lack a unified platform for collecting, processing, analyzing, and visualizing this feedback. The project provides a centralized platform explicitly designed for:
- Review and domain management
- Sentiment analysis (Lexicon & ML Predictive)
- Keyword extraction (TF-IDF, RAKE, TextRank)
- Topic analysis & Clustering (K-Means)
- Web, Search, and Network analytics (including temporal network evolution)
- Enterprise-grade User management, RBAC, and Audit trails
- Containerized deployments via Docker/Jenkins CI-CD

---

## 3. Project Objectives
The platform is built to fulfill measurable, distinct objectives:
1. Centralize multi-domain review data into a single queryable PostgreSQL warehouse.
2. Analyze customer sentiment across qualitative text inputs dynamically.
3. Extract important keywords utilizing standard academic algorithms.
4. Identify dominant review topics accurately mapping product/service strengths.
5. Discover structural customer/product relationships via social graph network metrics.
6. Provide actionable web and network analytics tracking site usage and PageRank equivalents.
7. Provide strict role-based access controls (RBAC) securely segregating managers from analysts.
8. Maintain immutable audit trails capturing user-system interactions.
9. Provide automated deployment/CI-CD pipelines to ensure seamless updates.
10. Generate analytical reporting components summarizing domain/product-level statistics natively.

---

## 4. Project Scope

### In Scope
- Centralized Review management & Product/domain management.
- Multi-engine Sentiment analysis & Predictive sentiment models (Naive Bayes/SVM).
- Text processing: Keyword extraction, Topic analysis, and Clustering.
- Search/indexing/ranking demonstration (Inverted indexing, TF-IDF + PageRank).
- Web analytics (Clickstream, A/B Testing, Surveys, SEO checks).
- Graph tracking: Static and Temporal network analytics.
- User management, Role-Based Access Control (RBAC), and Audit logging.
- PDF/UI reporting interfaces.
- DevOps implementations (Docker, Jenkins CI/CD pipelines).

### Out of Scope
- Production-scale social-media scraping or continuous external data ingestion.
- Building a large-scale commercial search engine capable of open-web indexing.
- Real-time global review collection mapping petabytes of unstructured text.
- Full Google Analytics replacement (event/cookie scaling limits).
- Full Enterprise Resource Planning (ERP) integrations.
- Production-grade massive spectral tensor decomposition (restricted to academic tensor representation).
- Enterprise-scale distributed data lake hosting.

---

## 5. Stakeholder Analysis

| Stakeholder | Role | Interest | Influence | Expectation |
| :--- | :--- | :--- | :--- | :--- |
| **Project Team** | Execution | High | High | Successfully deploy stable code architecture and meet requirements. |
| **Business Manager** | Decision Maker | High | High | Leverage dashboards to assess multi-domain product viability easily. |
| **Data Analyst** | Primary User | High | Medium | Execute NLP metrics precisely without manipulating code manually. |
| **System Administrator** | Governance | Medium | Medium | Audit logs, manage RBAC easily, deploy safely via CI/CD. |
| **End User / Customer** | Feedback Source | Low | Low | Receive better services as an indirect result of platform analysis. |
| **Academic Evaluator** | Assessment | High | High | Verify alignment with IPTM & ASTMA curriculum standards transparently. |
