import re
from typing import Dict, Any
from ..state import SocraticAgentState, CriticVerdict

FORBIDDEN_LEAKAGE_PATTERNS = [
    r"\bthe\s+answer\s+is\b",
    r"\bthe\s+formula\s+is\s+E\s*=",
    r"\bE_?1\s*=\s*h\^?2",
    r"\bpsi\s*=\s*0\s+is\s+the\s+answer\b",
    r"\bexact\s+value\s+is\b",
    r"\bhere\s+is\s+the\s+solution\b",
]

def critic_guardrail_node(state: SocraticAgentState) -> Dict[str, Any]:
    """
    Stage 5: Guardrail & Leakage Critic
    Inspects candidate response for answer leakage, missing citations,
    and missing Socratic questions.
    """
    reply = state.get("candidate_reply", "")
    retry_count = state.get("retry_count", 0)

    # Check 1: Answer leakage detection
    for pattern in FORBIDDEN_LEAKAGE_PATTERNS:
        if re.search(pattern, reply, re.IGNORECASE):
            return {
                "critic_verdict": "LEAKAGE_DETECTED",
                "critic_critique": f"Leaked forbidden answer/solution matching '{pattern}'.",
                "retry_count": retry_count + 1,
            }

    # Check 2: Citation grounding
    if not re.search(r"\[\d+\]", reply):
        return {
            "critic_verdict": "MISSING_CITATION",
            "critic_critique": "Reply did not include required [n] citation markers.",
            "retry_count": retry_count + 1,
        }

    # Check 3: Concluding question check
    if not reply.strip().endswith("?"):
        return {
            "critic_verdict": "MISSING_QUESTION",
            "critic_critique": "Reply did not conclude with a guiding Socratic question.",
            "retry_count": retry_count + 1,
        }

    return {
        "critic_verdict": "PASS",
        "critic_critique": "Compliant with all Socratic pedagogical constraints.",
        "final_reply": reply,
    }
