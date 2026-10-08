import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.temporal_network_service import temporal_network_service

def test_temporal_grouping():
    res = temporal_network_service.get_temporal_analysis()
    assert "periods" in res
    assert len(res["periods"]) > 0

def test_snapshot_creation():
    res = temporal_network_service.get_temporal_analysis()
    assert "snapshots" in res
    assert len(res["snapshots"]) == len(res["periods"])
    assert "metrics" in res["snapshots"][0]

def test_node_evolution():
    res = temporal_network_service.get_temporal_analysis()
    assert "evolution" in res
    evo = res["evolution"][0]
    assert "new_nodes" in evo
    assert "removed_nodes" in evo
    assert "persistent_nodes" in evo

def test_centrality_evolution():
    res = temporal_network_service.get_temporal_analysis()
    assert "centralityEvolution" in res
    assert len(res["centralityEvolution"]) > 0
    c_evo = res["centralityEvolution"][0]
    assert "degree" in c_evo
    assert "betweenness" in c_evo
    assert "closeness" in c_evo
    assert "status" in c_evo

def test_community_detection_and_evolution():
    res = temporal_network_service.get_temporal_analysis()
    assert "communities" in res
    assert "communityEvolution" in res
    assert len(res["communityEvolution"]) > 0
    c_evo = res["communityEvolution"][0]
    assert "overlap" in c_evo
    assert "event" in c_evo

def test_temporal_tensor_construction():
    res = temporal_network_service.get_temporal_analysis()
    assert "tensorSummary" in res
    assert "dimensions" in res["tensorSummary"]
    assert "slices" in res["tensorSummary"]

def test_semantic_graph():
    res = temporal_network_service.get_temporal_analysis()
    assert "semantic" in res["snapshots"][0]

if __name__ == "__main__":
    test_temporal_grouping()
    test_snapshot_creation()
    test_node_evolution()
    test_centrality_evolution()
    test_community_detection_and_evolution()
    test_temporal_tensor_construction()
    test_semantic_graph()
    print("All Temporal Network tests passed.")
