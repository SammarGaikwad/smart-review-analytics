import math
from typing import List, Dict, Any

class NetworkService:
    """
    Service for calculating social and network analytics metrics on graph datasets.
    Supports node degree, degree centrality, network density, average degree,
    closeness centrality, connected components, and top node rankings.
    """

    @staticmethod
    def analyze_network(nodes_data: List[Dict[str, Any]], edges_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not nodes_data:
            nodes_data = []
        if not edges_data:
            edges_data = []

        # 1. Parse and sanitize nodes
        valid_nodes = {}
        for n in nodes_data:
            if not isinstance(n, dict):
                continue
            node_id = str(n.get("id", "")).strip()
            if not node_id:
                continue
            node_type = str(n.get("type", "unknown"))
            label = str(n.get("label", node_id))
            valid_nodes[node_id] = {
                "id": node_id,
                "type": node_type,
                "label": label,
                "metadata": n.get("metadata", {})
            }

        # 2. Parse and sanitize edges (ensuring source and target exist in valid_nodes)
        valid_edges = []
        edge_set = set()
        adj = {node_id: set() for node_id in valid_nodes}

        for e in edges_data:
            if not isinstance(e, dict):
                continue
            src = str(e.get("source", "")).strip()
            tgt = str(e.get("target", "")).strip()
            if not src or not tgt or src not in valid_nodes or tgt not in valid_nodes:
                continue
            
            # Avoid self-loops in degree count if src == tgt
            if src == tgt:
                continue

            # Standardize undirected edge key
            edge_key = (src, tgt) if src <= tgt else (tgt, src)
            weight = e.get("weight", 1)
            try:
                weight = float(weight)
            except (ValueError, TypeError):
                weight = 1.0

            if edge_key not in edge_set:
                edge_set.add(edge_key)
                valid_edges.append({
                    "source": src,
                    "target": tgt,
                    "type": str(e.get("type", "connected")),
                    "weight": weight
                })
                adj[src].add(tgt)
                adj[tgt].add(src)

        N = len(valid_nodes)
        E = len(valid_edges)

        # 3. Calculate Global Graph Metrics
        if N <= 1:
            density = 0.0
            avg_degree = 0.0
        else:
            # Undirected graph density formula: 2E / (N * (N - 1))
            density = round((2.0 * E) / (N * (N - 1)), 4)
            avg_degree = round((2.0 * E) / N, 4)

        # 4. Node Degree & Degree Centrality
        degree_map = {}
        degree_centrality_map = {}
        for node_id in valid_nodes:
            deg = len(adj[node_id])
            degree_map[node_id] = deg
            degree_centrality_map[node_id] = round(deg / (N - 1), 4) if N > 1 else 0.0

        # 5. Connected Components & Closeness Centrality (BFS)
        components = []
        visited = set()

        for node_id in valid_nodes:
            if node_id not in visited:
                comp = []
                queue = [node_id]
                visited.add(node_id)
                while queue:
                    curr = queue.pop(0)
                    comp.append(curr)
                    for nxt in adj[curr]:
                        if nxt not in visited:
                            visited.add(nxt)
                            queue.append(nxt)
                components.append(comp)

        closeness_centrality = {}
        for node_id in valid_nodes:
            distances = {node_id: 0}
            queue = [node_id]
            while queue:
                curr = queue.pop(0)
                d = distances[curr]
                for nxt in adj[curr]:
                    if nxt not in distances:
                        distances[nxt] = d + 1
                        queue.append(nxt)
            
            reachable_count = len(distances) - 1
            if reachable_count > 0:
                total_dist = sum(distances.values())
                # Wasserman and Faust normalized closeness centrality for disconnected graphs
                closeness = (reachable_count / total_dist) * (reachable_count / (N - 1)) if N > 1 else 0.0
                closeness_centrality[node_id] = round(closeness, 4)
            else:
                closeness_centrality[node_id] = 0.0

        # 6. Format Node List with Metrics
        enriched_nodes = []
        for node_id, node_info in valid_nodes.items():
            enriched_nodes.append({
                **node_info,
                "degree": degree_map[node_id],
                "degreeCentrality": degree_centrality_map[node_id],
                "closenessCentrality": closeness_centrality[node_id]
            })

        # 7. Rank Top Connected Nodes
        top_nodes = sorted(
            [
                {
                    "nodeId": n["id"],
                    "label": n["label"],
                    "type": n["type"],
                    "degree": n["degree"],
                    "degreeCentrality": n["degreeCentrality"]
                }
                for n in enriched_nodes
            ],
            key=lambda x: (x["degree"], x["degreeCentrality"]),
            reverse=True
        )[:10]

        # 8. Community Structures
        communities_formatted = [
            {
                "id": f"community-{idx + 1}",
                "size": len(comp),
                "nodes": comp
            }
            for idx, comp in enumerate(components)
        ]

        return {
            "network": {
                "nodeCount": N,
                "edgeCount": E,
                "averageDegree": avg_degree,
                "density": density,
                "connectedComponentsCount": len(components)
            },
            "topNodes": top_nodes,
            "communities": communities_formatted,
            "nodes": enriched_nodes,
            "edges": valid_edges
        }
