import { defineTool } from "@lovable.dev/mcp-js";

const topics = [
  {
    id: "infinite-potential-well",
    title: "Infinite Potential Well",
    chapter: 1,
    subject: "Quantum Mechanics",
    subtopics: ["Subtopic 1.1", "Subtopic 1.2", "Subtopic 1.3", "Subtopic 1.4", "Subtopic 1.5"],
  },
  {
    id: "finite-potential-well",
    title: "Finite Potential Well",
    chapter: 2,
    subject: "Quantum Mechanics",
    subtopics: ["Setup", "Bound states", "Tunneling probability"],
  },
  {
    id: "quantum-tunnelling",
    title: "Quantum Tunnelling",
    chapter: 3,
    subject: "Quantum Mechanics",
    subtopics: ["Barrier basics", "Transmission coefficient", "Applications"],
  },
];

export default defineTool({
  name: "list_topics",
  title: "List learning topics",
  description: "List the quantum mechanics topics available on the platform, including chapter number and subtopics.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(topics, null, 2) }],
    structuredContent: { topics },
  }),
});
