# ASTMA Temporal Network Analysis & Dynamic Community Evolution

## 1. Objective
This document details the fulfillment of ASTMA Unit VI. It expands the static Network Analytics module into a dynamic, temporal graph evaluation framework capable of computing centrality trajectories, semantic tensor representations, and dynamic community events across discrete time-steps.

## 2. Temporal Network Concept & Data Source
The temporal network decomposes continuous network activity (customer reviews) into finite time-window snapshots (`datasets/temporal_network_sample.json`). Because the underlying production dataset lacks sufficient high-velocity continuous interaction to model long-term social evolution transparently, a curated academic demonstration dataset (Months: `2026-01`, `2026-02`, `2026-03`) is utilized specifically to surface these mathematical mechanisms without manipulating real PostgreSQL records.

## 3. Network Construction & Metrics (Implemented)
For every temporal period, a bipartite sub-graph (Customer → Product) is instantiated. 
The backend recursively computes:
- Network Nodes & Edge totals.
- Graph Density (Undirected).
- Number of isolated Connected Components.
- Node Degree, Closeness Centrality, and Betweenness Centrality.

## 4. Network Evolution (Implemented)
By tracking entities mathematically relative to the $T_{-1}$ snapshot, the system categorizes entity transitions:
- **Nodes/Edges:** Counted mathematically as `New`, `Removed`, and `Persistent`.
- **Node Centrality:** Individuals are tracked algorithmically (e.g., node "CustomerC" enters as *Emerging* in Feb, transitioning to *Persistent* in Mar).

## 5. Community Detection & Evolution (Implemented)
- **Detection:** Driven natively via structural component mapping equivalent to disconnected community modules. 
- **Evolution via Jaccard Index:** For communities detected in period $T$, a Jaccard overlap scalar is tested against period $T_{-1}$. 
- **Dynamic Events:**
  - `Birth`: New community structurally independent from prior periods.
  - `Death`: Community module dissipates.
  - `Growth` / `Shrinkage`: Intersection $ \ge 0.50 $ with changing magnitude.
  - `Continuation`: Intersection $ \ge 0.50 $ with exact structural size consistency.

*Note: Merge and Split mechanics are scientifically modeled via overlaps but abstracted out to Growth/Birth equivalents to prevent erroneous mischaracterizations on bipartite graphs.*

## 6. Temporal Semantic Graph (Implemented)
The Semantic connection graph is natively rendered via mapping abstracted "Topics" (e.g., *Quality*, *Battery*) strictly connected to underlying active product components within a given timeframe, demonstrating localized topic dominance visually per period.

## 7. Three-Way Tensor Representation (Implemented)
The ASTMA tensor decomposition requirement mathematically equates to computing a 3D matrix. A lightweight three-way tensor (`Entity × Entity × Time`) slice is algorithmically formulated. 

*Demonstrated Scope:* The system explicitly calculates the dimensions and formulates the sparse matrix relationships (`source`, `target`, `weight = 1`) across sequential indices. A full-scale spectral Tensor Decomposition algorithm library (e.g., TensorLy) was purposefully omitted to avoid overloading the FastAPI microservice with massive dependencies out-of-scope for the web application architecture.

## 8. Application Integration
- **APIs:** The Python FastAPI `GET /api/analytics/network/temporal` orchestrates the mathematical models, seamlessly proxied through the Express.js API securely.
- **Frontend:** Integrated heavily into a scalable UI component (`TemporalNetworkLab.tsx`) rendered on the primary Analytics dashboard.
- **Testing:** Validated mechanically via `test_temporal_network.py` directly tracking state transition formulas.

## 9. ASTMA Unit VI Traceability
| Syllabus Requirement | Status | Implementation Strategy |
| :--- | :--- | :--- |
| **Web/social network extraction from archive series** | **IMPLEMENTED** | Sliced JSON arrays via Timestamp grouping |
| **Temporal analysis** | **IMPLEMENTED** | Density and component shifts calculated |
| **Semantic graph** | **IMPLEMENTED** | Topic → Product matrices tracking sentiment tags |
| **Dynamic network models** | **IMPLEMENTED** | Node and Centrality event tracking |
| **Community detection** | **IMPLEMENTED** | Recursive module aggregation |
| **Community evolution** | **IMPLEMENTED** | Jaccard Overlap testing generating Birth/Growth/Death events |
| **Three-way tensor concept** | **DEMONSTRATED** | Mathematical index modeling implemented; large-scale decomposition omitted. |
| **Visualization** | **IMPLEMENTED** | Lucide React-powered temporal UI tables |

## 10. Limitations & Future Scope
- The Jaccard threshold is strictly locked at $0.50$; dynamic thresholding based on graph density distribution could yield higher-resolution evolution events.
- To execute large-scale Tensor Decomposition, an external microservice strictly dedicated to sparse tensor mathematical modeling is recommended for future architectural scale.
