from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.network_service import NetworkService

router = APIRouter()

class NodeModel(BaseModel):
    id: str
    type: str = "unknown"
    label: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EdgeModel(BaseModel):
    source: str
    target: str
    type: str = "connected"
    weight: float = 1.0

class NetworkRequest(BaseModel):
    nodes: List[NodeModel] = Field(default_factory=list)
    edges: List[EdgeModel] = Field(default_factory=list)

@router.post("/network")
def analyze_network(request: NetworkRequest):
    nodes_dict = [n.model_dump() for n in request.nodes]
    edges_dict = [e.model_dump() for e in request.edges]

    result = NetworkService.analyze_network(nodes_dict, edges_dict)

    return {
        "success": True,
        "message": "Network analytics calculated successfully",
        "data": result
    }
