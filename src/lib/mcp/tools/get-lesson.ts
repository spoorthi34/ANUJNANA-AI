import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const lessons: Record<string, { title: string; summary: string; keyPoints: string[] }[]> = {
  "infinite-potential-well": [
    {
      title: "The Infinite Potential Well",
      summary:
        "A particle trapped between two infinitely tall walls. It behaves as a standing wave and can only occupy discrete quantized energy levels.",
      keyPoints: [
        "Wave function must vanish at the walls (x=0 and x=a).",
        "Allowed wave functions: ψₙ(x) = A·sin(nπx/a).",
        "Energy levels grow as n²: Eₙ = n²π²ℏ² / (2ma²).",
        "Zero-point energy is nonzero — a direct consequence of the uncertainty principle.",
      ],
    },
    {
      title: "Wave Functions & Boundary Conditions",
      summary: "Boundary conditions force the wave function to fit perfectly inside the box, producing quantization.",
      keyPoints: [
        "ψ(0) = 0 and ψ(a) = 0.",
        "Only integer numbers of half-wavelengths fit.",
        "Analogy: guitar string fixed at both ends.",
      ],
    },
  ],
  "finite-potential-well": [
    {
      title: "Finite Well Basics",
      summary: "Walls have finite height, so the wave function decays exponentially outside the well instead of vanishing.",
      keyPoints: [
        "Fewer bound states than the infinite well.",
        "Wave function leaks into classically forbidden regions.",
      ],
    },
  ],
  "quantum-tunnelling": [
    {
      title: "Quantum Tunnelling",
      summary: "A particle with less energy than a barrier still has a nonzero probability of appearing on the other side.",
      keyPoints: [
        "Transmission coefficient depends exponentially on barrier width and height.",
        "Powers scanning tunneling microscopes and nuclear fusion in stars.",
      ],
    },
  ],
};

export default defineTool({
  name: "get_lesson",
  title: "Get lesson content",
  description: "Get the lesson pages (title, summary, key points) for a given topic id.",
  inputSchema: {
    topicId: z
      .enum(["infinite-potential-well", "finite-potential-well", "quantum-tunnelling"])
      .describe("Topic id from list_topics."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ topicId }) => {
    const pages = lessons[topicId] ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify({ topicId, pages }, null, 2) }],
      structuredContent: { topicId, pages },
    };
  },
});
