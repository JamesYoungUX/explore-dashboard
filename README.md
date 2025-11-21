# ACO Total Cost of Care Dashboard

A comprehensive dashboard for practice leaders, CFOs, and CEOs to monitor and manage total cost of care with drill-down capabilities into key problem areas.

## Problem Areas Tracked

1. **High-Cost Patients** - Identify and manage patients driving excessive costs
2. **Preventable Readmissions** - Track and reduce 30-day readmissions
3. **Emergency Department Overutilization** - Monitor inappropriate ED visits
4. **Medication Non-Adherence** - Track prescription compliance issues
5. **Care Gaps** - Identify missed preventive care opportunities
6. **Specialist Referral Leakage** - Monitor out-of-network referrals

## Tech Stack

- Frontend: React + TypeScript + Vite
- UI Components: shadcn/ui + Tailwind CSS
- Charts: Recharts
- State Management: React Context
- Data: Mock data (production would connect to EHR/claims data)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx
│   │   ├── ProblemAreaCard.tsx
│   │   └── MetricCard.tsx
│   ├── workflows/
│   │   ├── HighCostPatients.tsx
│   │   ├── PreventableReadmissions.tsx
│   │   ├── EDOverutilization.tsx
│   │   ├── MedicationAdherence.tsx
│   │   ├── CareGaps.tsx
│   │   └── ReferralLeakage.tsx
│   └── ui/ (shadcn components)
├── data/
│   └── mockData.ts
├── types/
│   └── index.ts
└── App.tsx
```
