import os
from typing import Dict, Any
from ..state import SocraticAgentState

SYSTEM_TEMPLATE = """You are AnuJnana's Socratic physics tutor for students studying quantum mechanics.

PEDAGOGICAL DIRECTIVES:
- Diagnosed Misconception: {misconception}
- Bloom's Stage: {bloom_level}
- Scaffolding Strategy: {scaffolding_tactic}
- Target Discovery: {target_discovery}
- STRICT HINT BUDGET: {hint_budget}

MANDATORY RULES:
1. Provide HINTS ONLY. Never give away the final numerical value, formula, or derivation.
2. Ground every hint in the numbered SOURCES below. Cite each sentence that uses a source like [1] or [2].
3. Conclude with exactly ONE thought-provoking guiding question to help the student take the next step.
4. Keep the tone warm, concise, and under 120 words.
"""

def generate_socratic_hint_node(state: SocraticAgentState) -> Dict[str, Any]:
    """
    Stage 4: Socratic Dialogue Generator
    Synthesizes pedagogical strategy, hint budget, and retrieved sources
    into a cited Socratic response ending with a guiding question.
    """
    sources = state.get("sources", [])
    source_text = "\n\n".join(f"[{s['n']}] {s['label']}: {s['content']}" for s in sources)
    question = state.get("question", "")

    # Check if OpenAI or compatible API key is provided
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatOpenAI(
                model=os.getenv("SOCRATIC_MODEL", "gpt-4o-mini"),
                temperature=0.3,
                max_tokens=250,
            )

            prompt = SYSTEM_TEMPLATE.format(
                misconception=state.get("misconception"),
                bloom_level=state.get("bloom_level"),
                scaffolding_tactic=state.get("scaffolding_tactic"),
                target_discovery=state.get("target_discovery"),
                hint_budget="; ".join(state.get("hint_budget", [])),
            )

            messages = [
                SystemMessage(content=prompt),
                HumanMessage(content=f"SOURCES:\n{source_text}\n\nSTUDENT QUESTION:\n{question}"),
            ]

            response = llm.invoke(messages)
            return {"candidate_reply": response.content}
        except Exception as e:
            # Fall back to deterministic pedagogical generation on network/auth issue
            pass

    # Deterministic Pedagogical Synthesis (Offline / Mock Mode)
    tactic = state.get("scaffolding_tactic", "")
    target = state.get("target_discovery", "")
    cite_num = sources[0]["n"] if sources else 1

    if "Heisenberg" in tactic:
        reply = (
            f"Think about what confinement does to a particle in a box [{cite_num}]. "
            "If its energy were truly zero, its momentum would also be exactly zero without any uncertainty. "
            "What does Heisenberg's uncertainty principle say must happen to the momentum uncertainty when position is strictly bounded?"
        )
    elif "Boundary" in tactic:
        reply = (
            f"Consider what happens outside the box where the potential barrier is infinitely high [{cite_num}]. "
            "Could the particle ever be found inside an infinite potential barrier? "
            "If the probability of finding it there is zero, what must the wave function ψ equal at the boundary walls?"
        )
    elif "Tunneling" in tactic or "Decay" in tactic:
        reply = (
            f"Imagine the quantum wave meeting a barrier higher than its energy [{cite_num}]. "
            "Inside the barrier, the wave doesn't stop instantly—its amplitude decays exponentially. "
            "If you make the barrier thicker, does more or less of that wave reach the other side?"
        )
    else:
        reply = (
            f"Let's look at the foundational constraints in your lesson [{cite_num}]. "
            f"To reach our goal of understanding, think about how physical boundaries shape the allowed wave modes. "
            "What happens to the allowed wavelengths when both ends of a medium are fixed?"
        )

    return {"candidate_reply": reply}
