# AnuJnana — Multi-Agent Socratic Learning Compass 🧠

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)](https://github.com/langchain-ai/langgraph)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Vitest-39%20Passing-brightgreen)](https://vitest.dev/)

An adaptive, intelligent STEM learning platform for quantum physics education. Instead of spoon-feeding answers or derivations, **AnuJnana** pairs learners with a **5-stage Multi-Agent Socratic Pedagogical Graph** that diagnoses misconceptions, scaffolds understanding through guided questions, enforces strict anti-answer-leakage guardrails, and monitors engagement via real-time on-device computer vision.

---

## 🏛 Architecture

### Multi-Agent Pedagogical Graph

```mermaid
flowchart TD
    Inquiry([Learner Question + History + Lesson Context]) --> Diagnostician
    
    subgraph SocraticGraph ["Multi-Agent Pedagogical Graph"]
        Diagnostician["1. Diagnostician Agent
        - Misconception Profiler
        - Bloom's Taxonomy Classifier (1-6)
        - Targeted Query Expansion"]
        
        Diagnostician --> Planner["2. Scaffolding Strategy Planner
        - Chooses Tactic (Counterfactual, Analogy, ZPD)
        - Sets Strict 'Hint Budget' (forbidden formulas/answers)"]
        
        Planner --> Retriever["3. Hybrid Knowledge Retriever
        - Pulls prerequisite physics chunks
        - Keyword + Vector similarity"]
        
        Retriever --> Dialogue["4. Socratic Dialogue Agent
        - Synthesizes hints <= 120 words
        - Cites sources like [1]
        - Concludes with 1 guiding question"]
        
        Dialogue --> Critic{"5. Adversarial Guardrail Critic
        - Checks for formula/answer leakage
        - Enforces citation grounding
        - Checks Socratic questioning rule"}
        
        Critic -- "Leakage Detected (Retries < 2)" --> Planner
        Critic -- "Passed Guardrail" --> Output([Stream to Learner + Emit Pedagogical Reasoning])
    end
```

---

## ✨ Key Features

1. **Multi-Agent Socratic AI Tutor**:
   - **Active Misconception Profiling**: Detects underlying conceptual blocks (e.g. classical zero-velocity confusion vs quantum ground-state confinement).
   - **Anti-Leakage Guardrail**: Prevents formula disclosure when students demand direct solutions.
   - **Zone of Proximal Development (ZPD)**: Scaffolds hints aligned with Bloom's Taxonomy stages.
   - **Transparent Pedagogical Reasoning**: Streams internal pedagogical rationale to the UI in an expandable drawer.
   - **Hybrid RAG**: Fuses `pgvector` cosine similarity with BM25 keyword matching over verified curriculum passages.

2. **Real-Time On-Device Attention Tracker**:
   - Analyzes facial landmarks, gaze direction, and blink rates in real time (60fps) using in-browser Web Workers.
   - **Zero cloud transmission**: Camera frames never leave the user's browser.
   - Automatically recommends **Relax Mode** when fatigue or cognitive overload is detected.

3. **Interactive Physics Visualizers**:
   - Pluckable standing wave guitar string simulator.
   - Particle-in-a-box energy level ladder and wave function visualizers.
   - Real-time SVG-based quantum animation engines.

4. **Cognitive Retention Engine**:
   - Spaced-repetition revision schedules based on the Ebbinghaus forgetting curve.
   - Interactive Concept Map navigation graph (`/concepts`).
   - Append-only activity tracking driving verifiable learner stats, streaks, and certificates.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, HTML5 Canvas API
- **AI & Agent Orchestration**: LangGraph, Multi-Agent StateGraph, Server-Sent Events (SSE) Streaming
- **Backend & Database**: Supabase (PostgreSQL, `pgvector`, Auth, Edge Functions with Deno/TypeScript), FastAPI, Python
- **Testing**: Vitest, React Testing Library, JSDOM (39 unit & integration tests)

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js (v18+) and npm

### 2. Install & Run Web App
```bash
# Clone the repository
git clone <repository-url>
cd aura-socratic-learning-compass-main

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests & Build
```bash
# Run unit & integration test suite
npm test -- --run

# Run production build
npm run build
```

---

## 🔬 Standalone Python LangGraph Service (`agent-graph/`)

For offline experimentation, evaluation benchmarks, or local LLM serving (Ollama/vLLM):

```bash
cd agent-graph

# Install Python requirements
pip install -r requirements.txt

# Run the automated Socratic evaluation benchmark
python evaluate.py

# Start the FastAPI microservice
python server.py
```

---

## 📄 License

This project is licensed under the MIT License.
