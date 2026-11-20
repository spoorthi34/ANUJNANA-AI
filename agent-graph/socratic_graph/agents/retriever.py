from typing import Dict, Any, List
from ..state import SocraticAgentState, SourceChunk

# Canonical passages from the AnuJnana Quantum Physics Course Corpus
COURSE_CORPUS = [
    {
        "label": "Quantum Foundations · Wave-Particle Duality",
        "content": "de Broglie proposed that particles possess a wavelength lambda = h / p. Confinement in space restricts allowable wavelengths to standing wave modes.",
    },
    {
        "label": "Quantum Foundations · Heisenberg Uncertainty Principle",
        "content": "The uncertainty principle states delta_x * delta_p >= hbar / 2. A confined particle has bounded delta_x <= L, so momentum cannot be precisely zero, forbidding zero kinetic energy.",
    },
    {
        "label": "Particle in a Box · Infinite Potential Well Boundaries",
        "content": "For a box with infinite walls at x=0 and x=L, the potential V is infinite outside. The particle has zero probability of existing outside, demanding psi(0) = 0 and psi(L) = 0.",
    },
    {
        "label": "Particle in a Box · Quantized Energy Levels",
        "content": "Boundary conditions require an integer number of half-wavelengths to fit: L = n * (lambda / 2). This quantizes energy into discrete ladder rungs E_n = n^2 * E_1.",
    },
    {
        "label": "Barrier Penetration · Quantum Tunneling",
        "content": "When a particle meets a barrier of height V > E, the wave function decays exponentially inside as e^(-kappa * x). If the barrier width L is thin, a non-zero amplitude emerges on the other side.",
    },
    {
        "label": "Wave Mechanics · Probability Density and Nodes",
        "content": "Born's rule states that |psi(x)|^2 represents the probability density of finding the particle. A node is a point where psi = 0, meaning zero chance of detection there.",
    },
]

def retrieve_knowledge_node(state: SocraticAgentState) -> Dict[str, Any]:
    """
    Stage 3: Knowledge Retrieval Node
    Matches query and diagnosed topics against the curriculum corpus.
    """
    query = (state.get("retrieval_query") or state.get("question", "")).lower()
    keywords = [w for w in query.replace("?", "").replace(",", "").split() if len(w) > 3]

    scored: List[tuple[float, dict]] = []
    for passage in COURSE_CORPUS:
        score = 0.0
        text = (passage["label"] + " " + passage["content"]).lower()
        for kw in keywords:
            if kw in text:
                score += 1.0
        if score > 0:
            scored.append((score, passage))

    # Fallback to top 2 passages if no keyword match
    if not scored:
        scored = [(1.0, COURSE_CORPUS[0]), (0.8, COURSE_CORPUS[1])]

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = scored[:3]

    sources: List[SourceChunk] = []
    for idx, (score, passage) in enumerate(selected):
        sources.append({
            "n": idx + 1,
            "label": passage["label"],
            "content": passage["content"],
            "similarity": min(1.0, 0.5 + score * 0.15),
        })

    return {"sources": sources}
