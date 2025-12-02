# ACO Total Cost of Care Dashboard

A comprehensive dashboard for practice leaders, CFOs, and CEOs to monitor and manage total cost of care with drill-down capabilities into key problem areas.

## Problem Areas Tracked

1. **High-Cost Patients** - Identify and manage patients driving excessive costs
2. **Preventable Readmissions** - Track and reduce 30-day readmissions
3. **Emergency Department Overutilization** - Monitor inappropriate ED visits
4. **Medication Non-Adherence** - Track prescription compliance issues
5. **Care Gaps** - Identify missed preventive care opportunities
6. **Specialist Referral Leakage** - Monitor out-of-network referrals
7. **Cost Saving Opportunities** - Track cost gaps and opportunities

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Tremor React + Tailwind CSS
- **Charts**: Recharts
- **Backend**: Vercel Serverless Functions
- **Database**: Neon Serverless Postgres
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Neon database account (https://neon.tech)
- Vercel account (for deployment)

### Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

See `.env.example` for reference.

### Local Development

```bash
# Install dependencies
npm install

# Run database migrations
node db/run-migrations.js

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Database Setup

1. Create a Neon database at https://console.neon.tech
2. Copy the connection string to your `.env` file
3. Run migrations:
   ```bash
   node db/run-migrations.js
   ```
4. Seed the database:
   ```bash
   node db/run-migration.js
   ```

## Project Structure

```
├── api/                    # Serverless API functions
│   ├── _lib/              # Shared utilities
│   │   ├── db.js          # Database connection
│   │   ├── errors.js      # Error handling
│   │   └── cors.js        # CORS configuration
│   ├── dashboard.js       # Dashboard metrics
│   ├── high-cost-patients.js
│   ├── readmissions.js
│   ├── medication-adherence.js
│   ├── care-gaps.js
│   ├── gap-categories.js
│   ├── top-doctors.js
│   ├── top-patients.js
│   ├── config.js
│   └── health.js          # Health check endpoint
├── db/                    # Database schema and migrations
├── src/                   # React frontend
│   ├── components/
│   │   ├── dashboard/
│   │   ├── workflows/
│   │   └── ui/
│   ├── types/
│   └── App.tsx
└── vercel.json           # Vercel configuration
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `DATABASE_URL` with your Neon connection string

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Environment Variables in Vercel

Add these in your Vercel project settings:

- `DATABASE_URL` - Your Neon database connection string

## API Endpoints

All API endpoints are available at `/api/*`:

- `GET /api/health` - Health check with database connectivity
- `GET /api/dashboard` - Dashboard overview metrics
- `GET /api/high-cost-patients` - High-cost patient data
- `GET /api/readmissions` - Readmission data
- `GET /api/medication-adherence` - Medication adherence data
- `GET /api/care-gaps` - Care gaps data
  - `?summary=true` - Get summary by type
  - `?type=xyz` - Filter by gap type
- `GET /api/gap-categories` - Gap categories for cost saving opportunities
  - `?slug=xyz` - Get specific category with doctors/patients
- `GET /api/top-doctors` - Top doctors by category
- `GET /api/top-patients` - Top patients by category
- `GET /api/config` - Configuration data
  - `?type=practice` - Practice configuration
  - `?type=gap-metrics` - Gap metrics
  - `?type=suggestions` - Dashboard suggestions
