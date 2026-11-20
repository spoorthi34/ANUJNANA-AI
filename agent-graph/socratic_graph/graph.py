from typing import Literal
from langgraph.graph import StateGraph, START, END

from .state import SocraticAgentState
from .agents.diagnostician import diagnose_misconception_node
from .agents.planner import plan_pedagogy_node
from .agents.retriever import retrieve_knowledge_node
from .agents.socratic_tutor import generate_socratic_hint_node
from .agents.critic import critic_guardrail_node

def route_after_critic(state: SocraticAgentState) -> Literal["plan", "__end__"]:
    """
    Conditional edge:
    If leakage or missing citation is caught and we have remaining retries,
    re-route to the Planner with stricter constraints.
    Otherwise, finalize.
    """
    verdict = state.get("critic_verdict")
    retry_count = state.get("retry_count", 0)

    if verdict != "PASS" and retry_count < 2:
        return "plan"
    return END

def create_socratic_graph():
    """
    Constructs and compiles the Socratic Multi-Agent Pedagogical Graph.
    """
    workflow = StateGraph(SocraticAgentState)

    # Add agent nodes
    workflow.add_node("diagnose", diagnose_misconception_node)
    workflow.add_node("plan", plan_pedagogy_node)
    workflow.add_node("retrieve", retrieve_knowledge_node)
    workflow.add_node("generate", generate_socratic_hint_node)
    workflow.add_node("critic", critic_guardrail_node)

    # Add edges
    workflow.add_edge(START, "diagnose")
    workflow.add_edge("diagnose", "plan")
    workflow.add_edge("plan", "retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", "critic")

    # Conditional loop
    workflow.add_conditional_edges(
        "critic",
        route_after_critic,
        {
            "plan": "plan",
            END: END,
        },
    )

    return workflow.compile()
