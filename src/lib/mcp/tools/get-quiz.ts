import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const quizzes: Record<string, { question: string; options: string[]; answerIndex: number }[]> = {
  "infinite-potential-well": [
    {
      question: "What is the lowest allowed energy in an infinite potential well?",
      options: ["Zero", "π²ℏ²/(2ma²)", "Any positive value", "Depends on temperature"],
      answerIndex: 1,
    },
    {
      question: "How do the allowed energy levels scale with the quantum number n?",
      options: ["Linearly", "As n²", "As √n", "Exponentially"],
      answerIndex: 1,
    },
    {
      question: "What boundary condition does ψ(x) satisfy at the walls?",
      options: ["ψ = 1", "ψ = 0", "dψ/dx = 0", "ψ is imaginary"],
      answerIndex: 1,
    },
  ],
  "finite-potential-well": [
    {
      question: "In a finite well, what happens to the wave function outside the walls?",
      options: ["It is exactly zero", "It decays exponentially", "It oscillates freely", "It becomes infinite"],
      answerIndex: 1,
    },
  ],
  "quantum-tunnelling": [
    {
      question: "The tunnelling transmission coefficient depends most strongly on…",
      options: ["Color of the barrier", "Barrier width and height", "Time of day", "Particle spin"],
      answerIndex: 1,
    },
  ],
};

export default defineTool({
  name: "get_quiz",
  title: "Get practice quiz",
  description: "Get sample multiple-choice quiz questions for a topic.",
  inputSchema: {
    topicId: z
      .enum(["infinite-potential-well", "finite-potential-well", "quantum-tunnelling"])
      .describe("Topic id from list_topics."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ topicId }) => {
    const questions = quizzes[topicId] ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify({ topicId, questions }, null, 2) }],
      structuredContent: { topicId, questions },
    };
  },
});
