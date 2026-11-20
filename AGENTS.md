# Project rules

- The opening route reuses the course-selection page so the screenshot-matched experience stays identical at `/` and `/topics`.
- Preserve Socratic hint-only tutor behavior; learner accounts, profiles and lesson completions live in the backend with owner-only access, while guests fall back to this-device storage so lessons stay usable signed out.
- Express reference-specific course styling through semantic CSS tokens and shared course classes so all topic cards support theme changes.
- Keep static chapter content and chapter-specific quiz data together in a shared frontend lesson catalog so every entry point opens the matching lesson.
- Render the lesson outside the dashboard shell with its own reference navigation, because the screenshots use full-width textbook views.
- Share the pluckable wave tool between lesson views and drive the guitar-string card and the two Watch Video SVG animations from a per-subtopic media catalog beside the lesson catalog, because no real video files were supplied.
- Read audio summaries aloud with the browser's built-in speech voice, with a timed fallback, so narration works without a paid voice service.
- Keep game scoring rules (such as level energies) in pure lib modules with tests, so the game screens stay presentation-only.
- Camera focus analysis runs fully on-device through one shared lesson-level tracker, so switching lesson modes never restarts the camera and no frames leave the browser.
- The assistant (MCP) server requires sign-in through the app's own OAuth consent page, and login/signup carry a validated `next` path, so external assistants only act as an approved learner.
- Learner progress (points, levels, streaks, badges, charts) is derived by pure rules in `src/lib/progressStats.ts` from an append-only, owner-only activity log (device storage for guests), so every screen shows the same numbers and no stat is hardcoded.
