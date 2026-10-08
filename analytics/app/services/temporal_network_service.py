import json
import os
from collections import defaultdict
from typing import Dict, List, Any
from app.services.network_service import NetworkService

class TemporalNetworkService:
    def __init__(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets"))

    def _calculate_betweenness(self, nodes, edges):
        adj = defaultdict(list)
        for e in edges:
            adj[e['source']].append(e['target'])
            adj[e['target']].append(e['source'])

        betweenness = {n['id']: 0.0 for n in nodes}
        for s in nodes:
            s_id = s['id']
            # BFS for shortest paths
            queue = [s_id]
            paths = {n['id']: [] for n in nodes}
            paths[s_id] = [[s_id]]
            visited = set([s_id])
            
            while queue:
                curr = queue.pop(0)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
                    
                    # Append paths
                    for p in paths[curr]:
                        if neighbor not in p:
                            new_path = p + [neighbor]
                            # Only keep shortest paths
                            if not paths[neighbor] or len(new_path) == len(paths[neighbor][0]):
                                paths[neighbor].append(new_path)
                            elif len(new_path) < len(paths[neighbor][0]):
                                paths[neighbor] = [new_path]

            # Accumulate betweenness
            for t_id, t_paths in paths.items():
                if s_id != t_id and t_paths:
                    num_paths = len(t_paths)
                    for path in t_paths:
                        for v in path[1:-1]:
                            betweenness[v] += 1.0 / num_paths

        # Normalize undirected (divide by 2)
        n_nodes = len(nodes)
        norm_factor = ((n_nodes - 1) * (n_nodes - 2)) if n_nodes > 2 else 1
        for v in betweenness:
            betweenness[v] = round((betweenness[v] / 2.0) / norm_factor, 4)
            
        return betweenness

    def get_temporal_analysis(self) -> Dict[str, Any]:
        file_path = os.path.join(self.base_dir, "temporal_network_sample.json")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return {"error": "Temporal dataset not found."}

        periods = []
        snapshots = []
        evolution = []
        centralityEvolution = []
        communities = []
        communityEvolution = []
        
        # Tensor representation
        # Tensor[entityA][entityB][time_period] = weight
        tensor_summary = {
            "dimensions": ["Entity", "Entity", "Time"],
            "description": "Three-way tensor representation implemented for temporal semantic graph; full-scale tensor decomposition is outside the scope of this academic application.",
            "time_periods": [],
            "slices": {}
        }
        
        prev_nodes = set()
        prev_edges = set()
        prev_communities = []
        
        for idx, snap in enumerate(data):
            period = snap["period"]
            periods.append(period)
            tensor_summary["time_periods"].append(period)
            
            # 1. Base Network Analysis
            base_metrics = NetworkService.analyze_network(snap["nodes"], snap["edges"])
            betweenness = self._calculate_betweenness(snap["nodes"], snap["edges"])
            
            snapshots.append({
                "period": period,
                "metrics": base_metrics["network"],
                "semantic": snap.get("semantic", [])
            })
            
            # Tensor construction
            slice_data = []
            for e in snap["edges"]:
                slice_data.append({"source": e["source"], "target": e["target"], "weight": 1})
            tensor_summary["slices"][period] = slice_data
            
            # 2. Node Evolution
            curr_nodes = set(n["id"] for n in snap["nodes"])
            curr_edges = set(tuple(sorted([e["source"], e["target"]])) for e in snap["edges"])
            
            if idx == 0:
                evolution.append({
                    "period": period,
                    "new_nodes": len(curr_nodes),
                    "removed_nodes": 0,
                    "persistent_nodes": 0,
                    "new_edges": len(curr_edges),
                    "removed_edges": 0,
                    "persistent_edges": 0
                })
            else:
                evolution.append({
                    "period": period,
                    "new_nodes": len(curr_nodes - prev_nodes),
                    "removed_nodes": len(prev_nodes - curr_nodes),
                    "persistent_nodes": len(curr_nodes & prev_nodes),
                    "new_edges": len(curr_edges - prev_edges),
                    "removed_edges": len(prev_edges - curr_edges),
                    "persistent_edges": len(curr_edges & prev_edges)
                })
                
            # 3. Centrality Evolution
            for node_data in base_metrics["nodes"]:
                node_id = node_data["id"]
                status = "New"
                if idx > 0:
                    status = "Persistent" if node_id in prev_nodes else "Emerging"
                    
                centralityEvolution.append({
                    "period": period,
                    "node": node_id,
                    "degree": node_data["degreeCentrality"],
                    "closeness": node_data["closenessCentrality"],
                    "betweenness": betweenness.get(node_id, 0),
                    "status": status
                })
                
            # Declining nodes
            if idx > 0:
                for old_node in prev_nodes - curr_nodes:
                    centralityEvolution.append({
                        "period": period,
                        "node": old_node,
                        "degree": 0,
                        "closeness": 0,
                        "betweenness": 0,
                        "status": "Declining"
                    })
            
            # 4. Communities
            curr_comms = base_metrics["communities"]
            communities.append({
                "period": period,
                "data": curr_comms
            })
            
            # 5. Community Evolution
            for c_idx, c in enumerate(curr_comms):
                c_set = set(c["nodes"])
                best_match = None
                best_overlap = 0
                
                for p_idx, p_c in enumerate(prev_communities):
                    p_set = set(p_c["nodes"])
                    intersection = len(c_set & p_set)
                    union = len(c_set | p_set)
                    jaccard = intersection / union if union > 0 else 0
                    
                    if jaccard >= 0.50 and jaccard > best_overlap:
                        best_overlap = jaccard
                        best_match = p_c["id"]
                        
                event = "Birth"
                if best_match:
                    if len(c_set) > len(set(next(x["nodes"] for x in prev_communities if x["id"] == best_match))):
                        event = "Growth"
                    elif len(c_set) < len(set(next(x["nodes"] for x in prev_communities if x["id"] == best_match))):
                        event = "Shrinkage"
                    else:
                        event = "Continuation"
                        
                communityEvolution.append({
                    "period": period,
                    "community": c["id"],
                    "size": c["size"],
                    "previous": best_match,
                    "overlap": round(best_overlap, 2),
                    "event": event
                })
                
            # Death events
            if idx > 0:
                matched_prevs = [x["previous"] for x in communityEvolution if x["period"] == period and x["previous"]]
                for p_c in prev_communities:
                    if p_c["id"] not in matched_prevs:
                        communityEvolution.append({
                            "period": period,
                            "community": p_c["id"],
                            "size": 0,
                            "previous": p_c["id"],
                            "overlap": 0,
                            "event": "Death"
                        })
            
            prev_nodes = curr_nodes
            prev_edges = curr_edges
            prev_communities = curr_comms

        return {
            "periods": periods,
            "snapshots": snapshots,
            "evolution": evolution,
            "centralityEvolution": centralityEvolution,
            "communities": communities,
            "communityEvolution": communityEvolution,
            "tensorSummary": tensor_summary
        }

temporal_network_service = TemporalNetworkService()
