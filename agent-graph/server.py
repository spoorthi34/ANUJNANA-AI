from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

from socratic_graph.graph import create_socratic_graph
from socratic_graph.state import SocraticAgentState

app = FastAPI(
    title="AnuJnana Socratic Agent Graph API",
    description="Multi-agent cognitive tutoring backend powered by LangGraph",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate the compiled LangGraph workflow
graph = create_socratic_graph()

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)
    history: List[Dict[str, str]] = Field(default_factory=list)
    chapter_id: Optional[str] = None
    section_index: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    misconception: Optional[str]
    bloom_level: Optional[str]
    scaffolding_tactic: Optional[str]
    target_discovery: Optional[str]
    sources: List[Dict[str, Any]]
    critic_verdict: Optional[str]

@app.get("/health")
def health_check():
    return {"status": "ok", "agent": "Socratic Pedagogical Graph"}

@app.post("/api/socratic/chat", response_model=ChatResponse)
async def chat_socratic(req: ChatRequest):
    initial_state: SocraticAgentState = {
        "question": req.question,
        "history": req.history,
        "chapter_id": req.chapter_id,
        "section_index": req.section_index,
        "misconception": None,
        "bloom_level": None,
        "retrieval_query": None,
        "scaffolding_tactic": None,
        "hint_budget": None,
        "target_discovery": None,
        "sources": [],
        "candidate_reply": None,
        "critic_verdict": None,
        "critic_critique": None,
        "retry_count": 0,
        "final_reply": None,
    }

    try:
        final_state = graph.invoke(initial_state)
        return ChatResponse(
            reply=final_state.get("final_reply") or final_state.get("candidate_reply") or "Can you break this down further?",
            misconception=final_state.get("misconception"),
            bloom_level=final_state.get("bloom_level"),
            scaffolding_tactic=final_state.get("scaffolding_tactic"),
            target_discovery=final_state.get("target_discovery"),
            sources=final_state.get("sources", []),
            critic_verdict=final_state.get("critic_verdict"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
