from typing import Annotated, Dict, List, Literal, Optional, TypedDict
import operator

BloomLevel = Literal["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
CriticVerdict = Literal["PASS", "LEAKAGE_DETECTED", "MISSING_CITATION", "MISSING_QUESTION"]

class SourceChunk(TypedDict):
    n: int
    label: str
    content: str
    similarity: float

class SocraticAgentState(TypedDict):
    # Context input
    question: str
    history: List[Dict[str, str]]
    chapter_id: Optional[str]
    section_index: Optional[int]

    # Stage 1: Diagnostician outputs
    misconception: Optional[str]
    bloom_level: Optional[BloomLevel]
    retrieval_query: Optional[str]

    # Stage 2: Strategy Planner outputs
    scaffolding_tactic: Optional[str]
    hint_budget: Optional[List[str]]  # Concepts explicitly forbidden to reveal
    target_discovery: Optional[str]   # What learner should discover on their own

    # Stage 3: Retrieval
    sources: List[SourceChunk]

    # Stage 4: Socratic Dialogue
    candidate_reply: Optional[str]

    # Stage 5: Critic & Guardrail
    critic_verdict: Optional[CriticVerdict]
    critic_critique: Optional[str]
    retry_count: int

    # Final response
    final_reply: Optional[str]
