# TeamForge AI Collaboration Platform — Implementation Plan

## Scope
Build a polished frontend prototype based on the supplied architecture reference. The demo focuses on a role-aware collaboration workspace with seeded data and stateful interactions; no production backend integration is required.

## Design direction
- **Design movement:** Editorial operations dashboard with a quiet cybernetic layer — structured like a command center, softened with human notes and status cues.
- **Core principles:** (1) show the next best action, (2) make team health legible at a glance, (3) keep AI recommendations explainable, (4) use density with generous rhythm instead of dashboard clutter.
- **Color philosophy:** Ink navy and warm paper establish trust and focus; electric violet marks intelligence and action; mint and amber signal healthy progress vs. attention needed. Surfaces stay light so the product feels collaborative rather than clinical.
- **Layout paradigm:** Persistent left rail + wide editorial workspace, with a strong top context bar and asymmetrical content bands. AI insight cards sit beside operational content instead of beneath it.
- **Signature elements:** a violet “AI pulse” indicator, dotted-grid data surfaces, and compact status pills with small signal bars.
- **Interaction philosophy:** clicks should feel like opening a workbench: project switcher, nav tabs, filters, and task status changes update the workspace without leaving the frame. AI cards use one-click actions that visibly change state.
- **Animation:** short 150–220ms transitions, subtle hover lift, shimmer only for AI analysis/loading moments, no continuous motion that competes with work content.
- **Typography:** Inter / ui-sans-serif for product UI, with bold condensed-looking weight contrast for section titles. Use tight display line-height and relaxed body copy.
- **Brand essence:** “A calmer way to assemble the right people around the right work.” Personality: precise, encouraging, quietly intelligent.
- **Brand voice:** direct, optimistic, useful. Example lines: “Your team is close — close two skill gaps before kickoff.” / “Turn the signal into the next move.”
- **Wordmark & logo:** a small four-node constellation joined into a square, paired with the TeamForge wordmark.
- **Signature brand color:** Electric violet `#6D5DFB`.

## Implementation
- `index.html`: application shell and root mount.
- `src/main.js`: seeded domain data, app state, rendering, and interaction handlers.
- `src/styles.css`: responsive visual system, layout, cards, tables, drawers, and modal states.
- `public/manus-routes.json`: route manifest for the single-page prototype.
- `package.json`: Vite-based dev/build commands.

The browser serves the app on the managed runtime port 3000. The prototype uses static client-side state and does not request a server or database capability.
