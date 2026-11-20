import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listTopicsTool from "./tools/list-topics";
import getLessonTool from "./tools/get-lesson";
import getQuizTool from "./tools/get-quiz";

// Vite inlines the stable ref; the published backend URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-remix-of-aura-learn",
  title: "Remix of Remix of Aura Learn",
  version: "0.1.0",
  instructions:
    "Tools for the LearnAI Adaptive Learning Platform. Use list_topics to discover available quantum mechanics topics, get_lesson to read lesson pages for a topic, and get_quiz to fetch practice questions. Callers must sign in with their learner account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listTopicsTool, getLessonTool, getQuizTool],
});
