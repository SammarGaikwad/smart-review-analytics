# IPTM Unit I: Feasibility Study

## A. Technical Feasibility
The platform utilizes modern web and machine learning technologies precisely scoped to remain fully technically feasible. 

**Actual Project Stack Evaluated:**
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Analytics:** Python + FastAPI
- **Database:** PostgreSQL + Prisma ORM
- **Analytics Dependencies:** pandas, NumPy, scikit-learn, NLTK
- **DevOps:** Git/GitHub, Docker, Jenkins

**Feasibility Analysis:**
- **Technology availability:** All frameworks/languages utilized are open-source with extensive documentation and community support.
- **Developer familiarity:** Standard RESTful API designs connecting a Node backend to a Python microservice are widely understood, mitigating architectural friction.
- **Integration feasibility:** Prisma handles relational schema synchronization effectively, and HTTP integrations between Node and FastAPI are stateless and scalable.
- **Deployment feasibility:** Docker containerization removes OS-level dependency issues, allowing automated Jenkins builds.
- **Scalability considerations:** Stateless microservice routing allows reasonable horizontal scaling. However, full tensor decompositions or massive graph modeling is not infinitely scalable on a single node.
- **Technical risks:** High-frequency temporal network processing can bottleneck RAM on limited machines if snapshot volumes grow unexpectedly.

*Conclusion:* Operationally technically feasible with controlled dataset volumes.

---

## B. Operational Feasibility
Operational feasibility assesses whether the intended user groups (Data Analysts, Business Managers, System Admins) can utilize the platform without encountering excessive complexity.

**Evaluation:**
- **Web-based interface:** Delivered through an intuitive React SPA (Single Page Application) removing desktop installation requirements.
- **Role-based access (RBAC):** Interfaces safely downgrade functions based on token claims, ensuring standard users cannot accidentally trigger disruptive system resets.
- **Analytics visualization & Search:** Complex algorithms (TF-IDF, PageRank, SVM Sentiment) are processed backend-side, abstracting mathematical density into simple charts/tables for analysts.
- **Training Requirements:** Data analysts require minor orientation regarding the NLP benchmark testing mechanics (Unit III/IV/VI workflows); business managers require basic dashboard walk-throughs.

*Conclusion:* Operationally feasible with reasonable, lightweight user training.

---

## C. Economic/Financial Feasibility
*(See `IPTM_COST_ESTIMATION.md` and `IPTM_FINANCIAL_APPRAISAL.md` for complete calculations)*

The project evaluates direct and indirect resource overhead to implement the platform from scratch. 
Because the technology stack heavily leverages open-source distributions (PostgreSQL, Python, Node, React) and zero-cost DevOps toolchains (Jenkins), software licensing overhead is inherently $0. Initial costs are strictly mapped to human-capital labor and cloud infrastructure hosting.

*Conclusion:* Highly economically feasible due to strict zero-license software architecture. 

---

## D. Schedule Feasibility
The project scope cleanly modularizes core systems (Auth, Data Ingestion) from advanced experimental analytical units (ASTMA Units II-VI), allowing iterative Agile deliverables.

**Evaluation:**
- Parallelization allows frontend design (React) to develop concurrently with backend modeling (Python/Node).
- Advanced analytics modules heavily re-use existing structural data layers, preventing re-engineering delays.

*Conclusion:* Schedule feasible due to modular decoupling.

---

## Feasibility Summary Table

| Category | Assessment | Evidence | Risk | Conclusion |
| :--- | :--- | :--- | :--- | :--- |
| **Technical** | High | Standard REST+React+Python stack, robust open-source tools. | RAM saturation on heavy ML computations. | Fully Technically Feasible |
| **Operational** | High | Clear RBAC separation and abstract dashboard designs. | Minimal user resistance expected; requires light training. | Fully Operationally Feasible |
| **Economic** | High | Avoidance of proprietary licenses; strictly human-capital costs. | Underscoping cloud-compute requirements. | Fully Economically Feasible |
| **Schedule** | High | Modular component mapping allows iterative independent module completion. | Integration bottleneck between Python and Node layers. | Fully Schedule Feasible |
