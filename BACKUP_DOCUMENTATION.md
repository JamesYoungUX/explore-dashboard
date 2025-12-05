# Backup Documentation - Pre-Leadership Feedback Implementation
**Created:** 2025-12-04
**Purpose:** Document current application structure before implementing leadership feedback redesign

---

## Table of Contents
1. [Application Overview](#application-overview)
2. [Component Structure](#component-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Navigation & Routing](#navigation--routing)
6. [TypeScript Types](#typescript-types)
7. [Rollback Instructions](#rollback-instructions)

---

## Application Overview

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with Tremor components
- **Charts:** Recharts library
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Neon PostgreSQL (@neondatabase/serverless)
- **Routing:** View-based routing via `activeView` state in App.tsx

### Current User Flow
1. User lands on **DashboardOverview** (main homepage)
2. View top metrics, charts, and "Top Opportunities" section
3. Click on an opportunity/initiative to drill down into specific problem areas
4. Navigate to workflows (High Cost Patients, Readmissions, Care Gaps, etc.)
5. Drill deeper into gap categories (DME, Specialty Drugs, etc.)

---

## Component Structure

### Main Application Files
```
src/
├── App.tsx                          # Main app shell, navigation routing
├── types/index.ts                   # TypeScript type definitions
├── components/
│   ├── dashboard/
│   │   └── DashboardOverview.tsx    # Main homepage component
│   └── workflows/
│       ├── HighCostPatients.tsx     # High cost patient management
│       ├── PreventableReadmissions.tsx
│       ├── EDOverutilization.tsx
│       ├── MedicationAdherence.tsx
│       ├── CareGaps.tsx             # Quality performance gaps
│       ├── ReferralLeakage.tsx      # Network leakage
│       ├── SharedSavings.tsx        # Cost saving opportunities (gap categories)
│       ├── AttributionDecline.tsx   # Attribution decline tracking
│       ├── ChosenInitiatives.tsx    # Selected initiatives management
│       ├── TopDoctors.tsx           # Top doctors by gap category
│       ├── TopPatients.tsx          # Top patients by gap category
│       └── GapDrilldown.tsx         # Drill-down for specific gap categories
```

### DashboardOverview.tsx Structure
**Location:** `src/components/dashboard/DashboardOverview.tsx`

**Key Features:**
- Hero section with 4 big metrics (Total Cost, Patients, Quality Measures, Annual Gap)
- 4 charts in grid:
  - Cost Distribution (pie chart)
  - Cost Trend PMPM (line chart)
  - Risk Distribution (pie chart)
  - Performance vs Efficiently Managed (metrics)
- "Top Opportunities" section with 3 featured cards (Cost Saving, Quality, Attribution)
- "All Performance Initiatives" table with filter toggle for high priority items
- Click-through navigation to specific problem areas

### SharedSavings.tsx Structure
**Location:** `src/components/workflows/SharedSavings.tsx`

**Key Features:**
- Summary card showing benchmark vs actual performance
- Gap breakdown showing 6 categories:
  - DME and Supplies (red)
  - Specialty Drugs (red)
  - Outpatient Surgery (amber)
  - Inpatient Surgery (amber)
  - Post-Acute Rehab (amber)
  - Inpatient Medical (blue)
- Each category shows: amount, percent, description, solutions
- Click-through to GapDrilldown for detailed view

### GapDrilldown.tsx Structure
**Location:** `src/components/workflows/GapDrilldown.tsx`

**Accepts:** `gapType` prop (e.g., 'gap-dme', 'gap-specialty-drugs')
**Displays:**
- Top doctors contributing to gap (spend, patient count, benchmarks)
- Top patients contributing to gap (spend, cost drivers)
- Fetches data from API based on gap type

---

## Database Schema

### Current Tables

```sql
-- Core Tables
patients                    # Patient demographics and core info
high_cost_patients         # High cost patient tracking
readmissions               # Readmission tracking
ed_visits                  # ED visit tracking
medication_adherence       # Medication adherence tracking
care_gaps                  # Care gap tracking
referrals                  # Referral tracking

-- Gap Category Tables
gap_categories             # Cost saving gap categories
doctors                    # Doctor master list
gap_top_doctors           # Top doctors by gap category
gap_top_patients          # Top patients by gap category

-- Metrics Cache
dashboard_metrics         # Cached aggregated metrics (JSONB)
```

### Key Tables Schema

#### gap_categories
```sql
CREATE TABLE gap_categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,           # e.g., 'gap-dme'
  category VARCHAR(255) NOT NULL,              # e.g., 'DME and Supplies'
  amount DECIMAL(10,2) NOT NULL,               # Gap amount ($84,000)
  percent INTEGER NOT NULL,                    # Percent of total gap (20%)
  description VARCHAR(255),                    # '68% above benchmark spend'
  current_spend VARCHAR(100),                  # '$310 per patient'
  last_year_spend VARCHAR(100),                # '$285 per patient'
  top_performer_spend VARCHAR(100),            # '$100 per patient'
  solutions TEXT[],                            # Array of solution strings
  color VARCHAR(20) NOT NULL,                  # 'red', 'amber', 'blue'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### gap_top_doctors
```sql
CREATE TABLE gap_top_doctors (
  id SERIAL PRIMARY KEY,
  gap_category_id INTEGER REFERENCES gap_categories(id),
  doctor_id INTEGER REFERENCES doctors(id),
  spend DECIMAL(10,2) NOT NULL,
  patient_count INTEGER NOT NULL,
  avg_per_patient DECIMAL(10,2) NOT NULL,
  benchmark_avg DECIMAL(10,2),
  top_performer_avg DECIMAL(10,2),
  percent_above_benchmark INTEGER,
  cost_drivers TEXT,
  opportunities TEXT,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### dashboard_metrics
```sql
CREATE TABLE dashboard_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) UNIQUE NOT NULL,   # e.g., 'total_cost', 'patient_count'
  metric_value JSONB,                          # Flexible JSON storage
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Base URL
Development: `http://localhost:3000/api/`

### Current Endpoints

#### GET /api/dashboard
**Purpose:** Fetch cached dashboard metrics
**Returns:** Object with metric_name keys and metric_value data
```javascript
{
  "total_cost": { ... },
  "patient_count": { ... },
  ...
}
```

#### GET /api/gap-categories
**Purpose:** Fetch all gap categories
**Returns:** Array of gap category objects
```javascript
[
  {
    "id": 1,
    "slug": "gap-dme",
    "category": "DME and Supplies",
    "amount": 84000,
    "percent": 20,
    "description": "68% above benchmark spend",
    ...
  },
  ...
]
```

#### GET /api/gap-categories?slug={slug}
**Purpose:** Fetch specific gap category with top doctors and patients
**Query Params:** `slug` (e.g., 'gap-dme')
**Returns:** Gap category object with nested topDoctors and topPatients arrays
```javascript
{
  "id": 1,
  "slug": "gap-dme",
  "category": "DME and Supplies",
  ...,
  "topDoctors": [ ... ],
  "topPatients": [ ... ]
}
```

#### GET /api/high-cost-patients
**Purpose:** Fetch high cost patients list

#### GET /api/readmissions
**Purpose:** Fetch readmissions list

#### GET /api/care-gaps
**Purpose:** Fetch care gaps list

#### GET /api/medication-adherence
**Purpose:** Fetch medication adherence issues

#### GET /api/top-doctors?gapSlug={slug}
**Purpose:** Fetch top doctors for specific gap category

#### GET /api/top-patients?gapSlug={slug}
**Purpose:** Fetch top patients for specific gap category

### API Utilities (api/_lib/)
- `db.js` - Neon database connection handler
- `cors.js` - CORS handling utility
- `errors.js` - Error handling utilities
- `config.js` - Configuration settings

---

## Navigation & Routing

### App.tsx Routing Logic
**Location:** `src/App.tsx`

**State Management:**
```typescript
const [activeView, setActiveView] = useState<ProblemArea | 'overview'>('overview');
```

**Route Mapping:**
```typescript
switch (activeView) {
  case 'shared-savings':
    return <SharedSavings onBack={() => setActiveView('overview')} />;
  case 'high-cost-patients':
    return <HighCostPatients onBack={() => setActiveView('overview')} />;
  case 'readmissions':
    return <PreventableReadmissions onBack={() => setActiveView('overview')} />;
  case 'ed-overutilization':
  case 'ed-utilization':
    return <EDOverutilization onBack={() => setActiveView('overview')} />;
  case 'care-gaps':
  case 'quality-performance':
    return <CareGaps onBack={() => setActiveView('overview')} />;
  case 'referral-leakage':
  case 'network-leakage':
    return <ReferralLeakage onBack={() => setActiveView('overview')} />;
  case 'attribution':
    return <AttributionDecline onBack={() => setActiveView('overview')} />;
  case 'gap-dme':
  case 'gap-specialty-drugs':
  case 'gap-outpatient-surgery':
  case 'gap-inpatient-surgery':
  case 'gap-post-acute':
  case 'gap-inpatient-medical':
    return <GapDrilldown gapType={activeView} onBack={() => setActiveView('shared-savings')} />;
  case 'chosen-initiatives':
    return <ChosenInitiatives onBack={() => setActiveView('overview')} />;
  default:
    return <DashboardOverview onSelectArea={setActiveView} />;
}
```

### Navigation Header
```jsx
<button onClick={() => setActiveView('overview')}>Dashboard</button>
<button onClick={() => setActiveView('chosen-initiatives')}>Initiatives</button>
<button>Reports</button>
<button>Settings</button>
```

**Styling:**
- Dark background: `#111111`
- Brand yellow accent: `#FFD85F`
- Active button gets yellow background with black text

---

## TypeScript Types

### ProblemArea Union Type
**Location:** `src/types/index.ts`
```typescript
export type ProblemArea =
  | 'high-cost-patients'
  | 'readmissions'
  | 'ed-overutilization'
  | 'medication-adherence'
  | 'care-gaps'
  | 'referral-leakage'
  | 'shared-savings'
  | 'quality-performance'
  | 'attribution'
  | 'ed-utilization'
  | 'network-leakage'
  | 'top-doctors'
  | 'top-patients'
  | 'gap-dme'
  | 'gap-specialty-drugs'
  | 'gap-outpatient-surgery'
  | 'gap-inpatient-surgery'
  | 'gap-post-acute'
  | 'gap-inpatient-medical'
  | 'chosen-initiatives';
```

### Core Interfaces
```typescript
export interface Patient {
  id: string;
  name: string;
  age: number;
  totalCost: number;
  riskScore: number;
  conditions: string[];
  lastVisit: string;
}

export interface Readmission {
  patientId: string;
  patientName: string;
  admissionDate: string;
  readmissionDate: string;
  diagnosis: string;
  cost: number;
  preventable: boolean;
}

export interface CareGap {
  patientId: string;
  patientName: string;
  gapType: string;
  dueDate: string;
  overdueDays: number;
  priority: 'high' | 'medium' | 'low';
}

export interface WorkflowTask {
  id: string;
  patientId: string;
  patientName: string;
  taskType: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
}
```

---

## Rollback Instructions

### If You Need to Revert Changes

1. **Git Rollback (if committed):**
   ```bash
   git log --oneline
   git revert <commit-hash>
   # OR
   git reset --hard <commit-hash-before-changes>
   ```

2. **Component Restoration:**
   - All original components are preserved in this documentation
   - Key files to check:
     - `src/App.tsx`
     - `src/components/dashboard/DashboardOverview.tsx`
     - `src/components/workflows/SharedSavings.tsx`
     - `src/types/index.ts`

3. **Database Rollback:**
   - Keep original schema.sql intact
   - If new tables were added, run:
     ```sql
     DROP TABLE IF EXISTS [new_table_name] CASCADE;
     ```
   - Re-run original schema if needed:
     ```bash
     psql $DATABASE_URL -f db/schema.sql
     ```

4. **API Endpoint Restoration:**
   - Original API files are in `api/` directory
   - Remove any new endpoint files
   - Restore original endpoint code from git history

5. **Verify Rollback:**
   ```bash
   npm run dev        # Check frontend
   npm run dev:api    # Check API
   ```

---

## Notes for Implementation

### What Will Change (Per Leadership Feedback):
1. **New Components (Supplemental):**
   - CostPerformanceInsights (new main view)
   - CostSavingDeepDive (spending + utilization)
   - Unified Recommendations component
   - ProgramImplementation component

2. **Database Changes:**
   - New tables: recommendations, cost_categories_v2, performance_metrics
   - Enhanced data: utilization metrics, period comparisons, green/positive categories

3. **API Changes:**
   - New endpoints for performance insights, recommendations, cost categories with utilization
   - Enhanced endpoints for period filtering

4. **Navigation:**
   - Add new views to navigation
   - Keep old DashboardOverview accessible
   - Blend nav bar styling

### What Will Be Preserved:
- ✅ Current DashboardOverview component
- ✅ All existing workflow components
- ✅ GapDrilldown functionality
- ✅ Existing database tables and data
- ✅ All current API endpoints
- ✅ TypeScript types (extended, not replaced)
- ✅ Recharts library and UI components
- ✅ Tailwind styling system

---

## Key Decisions Documented

From leadership feedback discussion:

1. **Supplement, Don't Replace:** New views supplement existing dashboard, not replace it
2. **Database-Driven:** NO mock data in code - all data from database via API
3. **Balanced View:** Show GREEN/positive categories, not just problems
4. **Unified Recommendations:** Merge "opportunities" and "initiatives" into one concept
5. **Status Tracking:** Recommendations must be convertible to workflows
6. **Spending + Utilization:** Show both metrics side-by-side to distinguish expensive vs. overused
7. **Keep Nav Bar:** Blend styling but keep current structure
8. **Keep Drill-Downs:** Preserve current gap drill-down functionality

---

**End of Backup Documentation**
