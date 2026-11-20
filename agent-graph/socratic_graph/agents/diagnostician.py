import re
from typing import Dict, Any
from ..state import SocraticAgentState, BloomLevel

def diagnose_misconception_node(state: SocraticAgentState) -> Dict[str, Any]:
    """
    Stage 1: Diagnostician Agent
    Analyzes the learner's inquiry to identify underlying false assumptions,
    determines cognitive Bloom stage, and outputs an enriched search query.
    """
    question = state.get("question", "")
    q = question.lower()

    # Rule-guided & semantic classification
    if any(k in q for k in ["ground", "zero energy", "minimum energy", "at rest"]):
        misconception = "Confusing classical zero velocity with quantum ground-state confinement"
        bloom: BloomLevel = "Analyze"
        query = "ground state zero energy Heisenberg uncertainty principle confinement minimum"
    elif any(k in q for k in ["wall", "boundary", "psi = 0", "infinite potential"]):
        misconception = "Assuming wave function values are arbitrary rather than constrained by V=infinity"
        bloom: BloomLevel = "Understand"
        query = "boundary conditions infinite potential well wave function zero walls"
    elif any(k in q for k in ["tunnel", "barrier", "penetrat", "leak"]):
        misconception = "Believing quantum barrier penetration is all-or-nothing rather than exponential decay"
        bloom: BloomLevel = "Apply"
        query = "quantum tunneling barrier width transmission probability decay"
    elif any(k in q for k in ["node", "antinode", "standing", "|psi|^2", "density"]):
        misconception = "Confusing mechanical string displacement shape with probability density distribution"
        bloom: BloomLevel = "Understand"
        query = "standing wave nodes probability density Born rule |psi|^2"
    elif any(k in q for k in ["quantiz", "discrete", "levels", "ladder", "allowed"]):
        misconception = "Assuming bound state energies can vary continuously without constraint"
        bloom: BloomLevel = "Analyze"
        query = "energy quantization discrete eigenvalues standing wave boundary fit"
    else:
        misconception = "Inquiring about foundational principles and mathematical relations"
        bloom: BloomLevel = "Understand"
        query = question

    return {
        "misconception": misconception,
        "bloom_level": bloom,
        "retrieval_query": query,
    }
