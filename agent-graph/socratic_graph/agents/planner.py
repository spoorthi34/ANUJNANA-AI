from typing import Dict, Any, List
from ..state import SocraticAgentState

def plan_pedagogy_node(state: SocraticAgentState) -> Dict[str, Any]:
    """
    Stage 2: Pedagogical Strategy Planner
    Chooses the educational scaffolding technique (analogy, counterfactual, boundary cases)
    and defines the strict 'Hint Budget' (concepts and formulas strictly forbidden from revealing).
    """
    misconception = state.get("misconception", "")
    bloom = state.get("bloom_level", "Understand")
    question = state.get("question", "").lower()

    hint_budget: List[str] = [
        "Do NOT give exact final numerical values (e.g., 0 eV, 3.2 eV)",
        "Do NOT write out the full solved formula (e.g., E = n^2 h^2 / 8mL^2)",
        "Do NOT state 'The answer is X'",
    ]

    if "classical zero" in misconception.lower():
        tactic = "Heisenberg Uncertainty Counterfactual"
        target = "Realizing that zero kinetic energy means delta_p = 0, violating delta_x * delta_p >= hbar/2"
        hint_budget.append("Do NOT state the ground state energy formula directly")
    elif "arbitrary" in misconception.lower():
        tactic = "Physical Boundary Condition Deduction"
        target = "Recognizing that infinite potential means 0% probability inside walls, requiring psi(0)=psi(L)=0"
        hint_budget.append("Do NOT give the exact sine wave solution without guiding questions")
    elif "all-or-nothing" in misconception.lower():
        tactic = "Evanescent Wave Decay Analogy"
        target = "Deducing that wave amplitude decays exponentially through barrier thickness L"
        hint_budget.append("Do NOT directly give the T = e^(-2kL) formula without asking about decay")
    else:
        tactic = "Socratic Guided Inquiry (Zone of Proximal Development)"
        target = "Connecting basic boundary conditions to wave behavior"

    return {
        "scaffolding_tactic": tactic,
        "hint_budget": hint_budget,
        "target_discovery": target,
    }
