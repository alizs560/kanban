# LOOM (Frontend)

Interactive bilingual project management interface built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Key Features

- Kanban Board with 3 standard columns (To Do, In Progress, Done) and dynamic column creation, renaming, and safe deletion.
- Workflow Phases (Brand & Identity, UI/UX, Frontend, Backend, QA & Launch) with dynamic phase tabs, card counts, add/edit/delete support.
- 5 Project Views:
  - Board: Drag-and-drop kanban with search, filter, and card edit drawer.
  - List: Compact tabular view grouped by column.
  - Timeline: 31-day monthly Gantt chart with task duration bars and assignees.
  - Calendar: December 2026 grid view supporting RTL (Sat-Fri) and LTR (Sun-Sat).
  - Progress: Analytics dashboard with overall completion, phase breakdown, and priority metrics.
- Offline-ready typography: Local Persian Peyda fonts (300, 500, 700) and system Latin fonts.
- Browser persistence via LocalStorage with versioned migration (`v5-dynamic-columns-and-phases`).
- Fake user authentication (`user` / `password`) with token persistence.

## Development

From the `frontend/` directory:

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run unit tests
npm run test:unit

# Run linter
npm run lint

# Build static export
npm run build
```

Development server runs at `http://localhost:3000`.

## Architecture & Documentation

- Persian technical architecture: [AGENTS.md](AGENTS.md)
- Root project documentation: [../README.md](../README.md)
- Development plan: [../docs/PLAN.md](../docs/PLAN.md)
