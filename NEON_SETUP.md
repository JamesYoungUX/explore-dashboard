# Neon Database Setup Instructions

## Step 1: Create Neon Account & Database

1. Go to https://neon.tech and sign up
2. Create a new project (name it "ACO Dashboard" or similar)
3. Copy your connection string from the dashboard

## Step 2: Configure Environment

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Edit `.env` and paste your Neon connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=3001
```

## Step 3: Set Up Database Schema

You have two options:

### Option A: Using Neon SQL Editor (Easiest)
1. Go to your Neon dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `db/schema.sql`
4. Click "Run"
5. Copy and paste the contents of `db/seed.sql`
6. Click "Run"

### Option B: Using psql command line
```bash
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql
```

## Step 4: Start the Application

### Development (Frontend + Backend):
```bash
npm run dev:all
```

This starts:
- Frontend on http://localhost:5173
- Backend API on http://localhost:3001

### Or run separately:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## Step 5: Update Frontend to Use API

The frontend components currently use mock data. You'll need to update them to fetch from the API endpoints:

- `GET /api/dashboard` - Dashboard overview data
- `GET /api/high-cost-patients` - High cost patients list
- `GET /api/readmissions` - Readmissions data
- `GET /api/medication-adherence` - Medication adherence data
- `GET /api/care-gaps` - Care gaps data

## API Endpoints

- Health check: `http://localhost:3001/api/health`
- Dashboard: `http://localhost:3001/api/dashboard`
- High Cost Patients: `http://localhost:3001/api/high-cost-patients`
- Readmissions: `http://localhost:3001/api/readmissions`
- Medication Adherence: `http://localhost:3001/api/medication-adherence`
- Care Gaps: `http://localhost:3001/api/care-gaps`

## Troubleshooting

**Connection Error:**
- Make sure your DATABASE_URL is correct
- Check that your IP is allowed in Neon (Neon allows all IPs by default)

**Port Already in Use:**
- Change PORT in `.env` to a different number (e.g., 3002)

**Module Not Found:**
- Run `npm install` to ensure all dependencies are installed
