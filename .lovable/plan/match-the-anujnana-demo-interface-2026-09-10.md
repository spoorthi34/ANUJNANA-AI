# Match the AnuJnana Demo Interface

## Goal
Replace the current generic emerald/blue premium interface with the warm, illustrated AnuJnana experience shown in the shared LinkedIn demo.

## What will change
- Restore the cream, coral, amber, and leafy-green visual language from the demo.
- Use the compact left navigation, playful atom branding, soft outlined panels, and friendly illustrated accents.
- Rebuild the dashboard around the demo’s “Explore the Quantum World” layout, course list, topic cards, and light progress indicators.
- Rebuild the learning page as the demo’s three-column workspace:
  - cognitive load and engagement monitor on the left;
  - textbook lesson card in the center;
  - subtopics, analogy, and wave visual on the right;
  - colorful learning-action bar along the bottom.
- Restyle Relax Mode, animation, Socratic tutor, audio summary, quiz, game, and memory-prediction views to match the same warm visual system.
- Match the simple centered sign-up/login experience shown in the demo.
- Keep all existing frontend interactions and routes working; no backend changes.

## Responsive behavior
- Preserve the desktop composition from the video.
- Collapse side panels into accessible drawers/sections on tablets and phones.
- Keep the learning controls reachable without overlapping lesson content.

## Verification
- Check the landing, sign-up, dashboard, topics, learning, quiz, and game screens in the live preview.
- Confirm desktop and mobile layouts, interactions, and animations.
- Resolve any build or browser errors before completion.

## Technical details
- React, TypeScript, Tailwind, Framer Motion, and existing shadcn controls remain in place.
- Semantic design tokens will define the full warm palette and panel styles.
- Existing mock learning data and Socratic-only tutor behavior remain unchanged.
