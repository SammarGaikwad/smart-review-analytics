# Entity-Relationship (ER) Diagram

## Smart Review Analytics Platform Database Architecture

This document presents the complete Entity-Relationship diagram for the 3-Tier Enterprise Database design (PostgreSQL / SQLite via Prisma ORM), satisfying **Enterprise Systems (ES) Unit I (DBMS & 3-Tier Architecture)** and **ITPM Unit VI (Database Management)** requirements.

```mermaid
erDiagram
    users ||--o{ user_roles : "assigned"
    roles ||--o{ user_roles : "belongs to"
    users ||--o{ reviews : "writes"
    users ||--o{ audit_logs : "triggers"
    users ||--o{ activity_events : "generates"
    users ||--o{ reports : "creates"

    domains ||--o{ products : "contains"
    domains ||--o{ reviews : "categorizes"
    products ||--o{ reviews : "receives"

    reviews ||--o| sentiment_results : "analyzed by"
    reviews ||--o{ review_keywords : "extracted"
    keywords ||--o{ review_keywords : "appears in"

    reviews ||--o{ review_topics : "associated with"
    topics ||--o{ review_topics : "classified under"

    users {
        string id PK
        string email UK
        string passwordHash
        string fullName
        boolean isActive
        datetime createdAt
    }

    roles {
        string id PK
        string name UK
        string description
    }

    domains {
        string id PK
        string name UK
        string code UK
        string description
    }

    products {
        string id PK
        string domainId FK
        string name
        string category
    }

    reviews {
        string id PK
        string customerId FK
        string domainId FK
        string productId FK
        string reviewText
        float rating
        string source
        datetime reviewDate
    }

    sentiment_results {
        string id PK
        string reviewId FK,UK
        string sentimentLabel
        float sentimentScore
        float positiveProb
        float neutralProb
        float negativeProb
    }

    keywords {
        string id PK
        string word UK
        string category
    }

    topics {
        string id PK
        string name UK
        string description
    }

    clusters {
        string id PK
        int clusterNumber
        string name
        string description
        int reviewCount
    }

    audit_logs {
        string id PK
        string userId FK
        string userEmail
        string action
        string resource
        string ipAddress
        datetime timestamp
    }
```

---

## Entity Summaries & Subject Mapping

| Entity Table | ES Subject Mapping | ASTMA Subject Mapping | Core Functionality |
| :--- | :--- | :--- | :--- |
| `users` | Unit III (CRM & User Directory) | - | Manages authenticated platform users |
| `roles` / `user_roles` | Unit III (RBAC & Access Control) | - | Defines granular roles (`Admin`, `Analyst`, `BusinessUser`, `Customer`) |
| `domains` / `products` | Unit I & II (ERP Enterprise Modules) | - | Categorizes reviews across 5 domains (Hotels, Restaurants, Movies, Electronics, E-commerce) |
| `reviews` | Unit I (Data Layer) | Unit I (Text Mining Source) | Stores raw review text, ratings, and timestamps |
| `sentiment_results` | - | Unit II (Sentiment Prediction) | Stores output label (`Positive`, `Neutral`, `Negative`) & compound scores |
| `keywords` / `review_keywords` | - | Unit III (Keyword Extraction) | Stores candidate keywords and TF-IDF / frequency scores |
| `topics` / `review_topics` | - | Unit II (Topic Detection) | Maps reviews to domain topics with probabilities |
| `clusters` | - | Unit I & II (Unsupervised Clustering) | Groups reviews via K-Means / text feature clustering |
| `audit_logs` | Unit III (Audit Trails & Security) | - | Enterprise security logging for system actions |
| `activity_events` | - | Unit IV (Web Analytics & Activity) | Tracks search activity and clickstream events |
