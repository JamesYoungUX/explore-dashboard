# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **ACO Total Cost of Care Dashboard** (StellarMetrics) - a React-based healthcare analytics dashboard that helps practice leaders, CFOs, and CEOs monitor and manage total cost of care with drill-down capabilities into key problem areas.

## Development Commands

### Frontend Development
- `npm run dev` - Start Vite development server on http://localhost:5173
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build locally

### Backend Development
- `npm run server` - Start Express API server on http://localhost:3001
- `npm run dev:all` - Start both frontend and backend concurrently

### Database Operations
- `psql $DATABASE_URL -f db/schema.sql` - Initialize database schema
- `psql $DATABASE_URL -f db/seed.sql` - Seed database with sample data
- `node db/run-migrations.js` - Run database migrations

## Architecture Overview

### Frontend Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Tremor components
- **State Management**: React useState for local state, no global state management
- **Routing**: Single-page application with view-based navigation via `activeView` state in App.tsx
- **Charts**: Recharts library for data visualizations

### Component Structure
- **App.tsx**: Main application shell with navigation and view routing
- **src/components/dashboard/**: Main dashboard overview components
- **src/components/workflows/**: Individual problem area detail pages
- **src/components/ui/**: Reusable UI components (BenchmarkBar, etc.)
- **src/types/index.ts**: TypeScript type definitions for all data models

### Backend Architecture
- **Server**: Express.js server in `server/index.js`
- **Database**: Neon PostgreSQL with `@neondatabase/serverless`
- **API Structure**: Separate endpoint files in `api/` directory
- **Database Schema**: SQL files in `db/` directory

### Key Navigation Flow
The application uses a view-based navigation system where `activeView` determines which component to render:
- `overview` → DashboardOverview
- Problem areas (e.g., `high-cost-patients`) → Individual workflow components
- Drill-down views (e.g., `gap-dme`) → GapDrilldown component
- Navigation between views handled via `setActiveView` callbacks

### Data Flow
- Frontend components can use either:
  - Mock data from `src/data/mockData.ts` (current default)
  - API endpoints from backend server (when configured)
- API endpoints return JSON data matching TypeScript interfaces in `src/types/`

### Styling Conventions
- Tailwind CSS with custom brand colors
- Brand yellow: `#FFD85F`
- Dark header: `#111111`
- Gradient backgrounds: `from-gray-50 via-orange-50/30 to-yellow-50/30`
- Responsive design with `max-w-[1600px]` container

### Database Integration
- Environment variables in `.env` file (DATABASE_URL, PORT)
- Database setup instructions in `NEON_SETUP.md`
- Schema and seed files in `db/` directory
- Migration scripts for database updates

## Important Development Notes

### Component Development
- Follow existing component patterns in `src/components/workflows/`
- Use TypeScript interfaces from `src/types/index.ts`
- Implement consistent navigation with `onBack` callbacks
- Use Tailwind utility classes, avoid custom CSS

### API Development
- Add new endpoints in separate files in `api/` directory
- Use Neon serverless client for database queries
- Follow existing error handling patterns
- Ensure CORS is enabled for frontend communication

### Database Changes
- Update schema in `db/schema.sql`
- Add migration scripts in `db/migrations/`
- Update seed data in `db/seed.sql` or `db/seed-gaps.sql`

### TypeScript Configuration
- Path mapping: `@/*` maps to `./src/*`
- Strict mode enabled with unused variable/parameter checking
- Target ES2020 with modern module resolution