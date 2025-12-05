# New API Endpoints Documentation

## Overview
Three new API endpoints to support the leadership feedback implementation:
- Performance Insights (dashboard data)
- Cost Categories (spending + utilization)
- Recommendations (unified recommendations with status)

---

## 1. Performance Insights Endpoint

### `GET /api/performance-insights`

Returns ACO Cost Performance Insights data for the main dashboard.

#### Query Parameters
- `periodKey` (optional): `'ytd'`, `'last_12_months'`, `'last_quarter'`
  - If not provided, uses the active period

#### Response Structure
```json
{
  "period": {
    "id": 1,
    "periodKey": "ytd",
    "periodLabel": "Year to Date",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isActive": true
  },
  "metrics": [
    {
      "id": 1,
      "periodId": 1,
      "metricType": "total_cost",
      "currentValue": 1680000,
      "previousValue": 1742000,
      "changePercent": -3.6,
      "changeDirection": "down",
      "benchmarkValue": 1450000,
      "isAboveBenchmark": true,
      "displayFormat": "currency"
    }
  ],
  "costOpportunities": [
    {
      "id": 1,
      "periodId": 1,
      "costCategoryId": 3,
      "opportunityType": "overspending",
      "amountVariance": 150000,
      "percentVariance": 22,
      "acoRank": 15,
      "categorySlug": "acute-rehab",
      "categoryName": "Acute Rehab",
      "performanceStatus": "red"
    }
  ],
  "efficiencyKpis": [
    {
      "id": 1,
      "periodId": 1,
      "kpiType": "readmission_rate",
      "kpiLabel": "Readmission Rate",
      "actualValue": 8.2,
      "acoBenchmark": 6.5,
      "variancePercent": 26.2,
      "performanceStatus": "warning",
      "displayFormat": "percent"
    }
  ],
  "topRecommendations": [
    {
      "id": 1,
      "title": "Implement care management program",
      "description": "Deploy specialized care coordinators...",
      "status": "not_started",
      "priority": "high",
      "estimatedSavings": 85000,
      "affectedLives": 412,
      "affectedCategories": [
        {
          "categoryId": 3,
          "categoryName": "Acute Rehab",
          "categorySlug": "acute-rehab",
          "impactAmount": 45000
        }
      ]
    }
  ]
}
```

#### Example Requests
```bash
# Get current period data
curl http://localhost:3000/api/performance-insights

# Get specific period data
curl http://localhost:3000/api/performance-insights?periodKey=last_12_months
```

---

## 2. Cost Categories Endpoint

### `GET /api/cost-categories`

Returns cost categories with spending AND utilization metrics.

#### Query Parameters
- `periodKey` (optional): Filter by period
- `status` (optional): Filter by performance status (`'red'`, `'yellow'`, `'green'`)
- `slug` (optional): Get specific category with drill-down data

#### Response Structure (List)
```json
{
  "period": {
    "id": 1,
    "periodKey": "ytd",
    "periodLabel": "Year to Date"
  },
  "categories": [
    {
      "id": 3,
      "slug": "acute-rehab",
      "categoryName": "Acute Rehab",
      "periodId": 1,
      "spendingPmpmActual": 150.00,
      "spendingPmpmBenchmark": 84.10,
      "spendingVarianceAmount": 65.90,
      "spendingVariancePercent": 22.0,
      "utilizationActual": 9.8,
      "utilizationBenchmark": 9.0,
      "utilizationVariancePercent": 8.9,
      "utilizationUnit": "admits_per_k",
      "performanceStatus": "red",
      "isOpportunity": true,
      "isStrength": false,
      "acoRank": 15,
      "totalCategories": 20,
      "description": "22% above benchmark spending",
      "displayOrder": 1
    }
  ]
}
```

#### Response Structure (Single Category)
```json
{
  "category": {
    "id": 3,
    "slug": "acute-rehab",
    "categoryName": "Acute Rehab",
    ...
  },
  "recommendations": [
    {
      "id": 1,
      "title": "Implement discharge planning protocols",
      "status": "not_started",
      "priority": "high",
      "estimatedSavings": 45000,
      "impactAmount": 45000
    }
  ],
  "hospitals": [
    {
      "id": 1,
      "hospitalName": "Valley IRF",
      "discharges": 200,
      "avgLos": 11.5,
      "spend": 320000,
      "readmissionRate": 6.1
    }
  ],
  "drgs": [
    {
      "id": 1,
      "drgCode": "945",
      "drgDescription": "Rehabilitation w CC/MCC",
      "patientCount": 89,
      "totalSpend": 156000,
      "avgSpendPerPatient": 17528,
      "benchmarkAvg": 12840,
      "percentAboveBenchmark": 36.5
    }
  ],
  "dischargingHospitals": [
    {
      "id": 1,
      "hospitalName": "Regional Medical Center",
      "discharges": 178,
      "percentDischargedToIrf": 24.1,
      "percentDischargedToIrfBenchmark": 17.2
    }
  ]
}
```

#### Example Requests
```bash
# Get all categories
curl http://localhost:3000/api/cost-categories

# Get only red/priority categories
curl http://localhost:3000/api/cost-categories?status=red

# Get only green/efficient categories
curl http://localhost:3000/api/cost-categories?status=green

# Get specific category with drill-down data
curl http://localhost:3000/api/cost-categories?slug=acute-rehab
```

---

## 3. Recommendations Endpoint

### `GET /api/recommendations`

Returns unified recommendations with status tracking.

#### Query Parameters
- `id` (optional): Get specific recommendation with full details
- `status` (optional): Filter by status (`'not_started'`, `'accepted'`, `'rejected'`, `'already_doing'`)
- `priority` (optional): Filter by priority (`'high'`, `'medium'`, `'low'`)

#### Response Structure (List)
```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Implement care management program",
      "description": "Deploy specialized care coordinators for high-cost patients",
      "status": "not_started",
      "priority": "high",
      "estimatedSavings": 85000,
      "affectedLives": 412,
      "implementationComplexity": "medium",
      "patientCohort": "high-cost patients (top 5%)",
      "cohortSize": 76,
      "hasProgramDetails": true,
      "canConvertToWorkflow": true,
      "workflowType": "care_management",
      "affectedCategories": [
        {
          "categoryId": 3,
          "categoryName": "Acute Rehab",
          "categorySlug": "acute-rehab",
          "performanceStatus": "red",
          "impactAmount": 45000
        },
        {
          "categoryId": 8,
          "categoryName": "Inpatient Medical",
          "categorySlug": "inpatient-medical",
          "performanceStatus": "yellow",
          "impactAmount": 28000
        }
      ]
    }
  ],
  "totalCount": 12,
  "filters": {
    "status": null,
    "priority": "high"
  }
}
```

#### Response Structure (Single Recommendation)
```json
{
  "id": 1,
  "title": "Implement care management program",
  "description": "Deploy specialized care coordinators...",
  "status": "not_started",
  "priority": "high",
  "estimatedSavings": 85000,
  "affectedLives": 412,
  "implementationComplexity": "medium",
  "patientCohort": "high-cost patients (top 5%)",
  "cohortSize": 76,
  "hasProgramDetails": true,
  "programOverview": "This program deploys specialized care coordinators...",
  "videoUrl": "https://vimeo.com/example",
  "canConvertToWorkflow": true,
  "workflowType": "care_management",
  "affectedCategories": [...],
  "programResources": {
    "bestPractices": [
      {
        "id": 1,
        "title": "Start with highest-cost patients",
        "content": "Focus initial outreach on the top 5% of patients by cost...",
        "displayOrder": 1
      }
    ],
    "testimonials": [
      {
        "id": 2,
        "content": "This program reduced our high-cost spend by 18% in 6 months",
        "author": "Dr. Sarah Chen",
        "authorRole": "CMO, Valley Medical Group",
        "displayOrder": 1
      }
    ],
    "implementationSteps": [
      {
        "id": 3,
        "title": "Step 1: Identify patients",
        "content": "Use claims data to identify top 5% high-cost patients...",
        "displayOrder": 1
      }
    ]
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

#### Example Requests
```bash
# Get all recommendations
curl http://localhost:3000/api/recommendations

# Get high priority recommendations
curl http://localhost:3000/api/recommendations?priority=high

# Get accepted recommendations
curl http://localhost:3000/api/recommendations?status=accepted

# Get specific recommendation with full details
curl http://localhost:3000/api/recommendations?id=1
```

---

## Error Handling

All endpoints follow the same error format:

```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to fetch performance insights",
    "timestamp": "2025-12-04T13:45:00Z"
  }
}
```

### Error Codes
- `DATABASE_ERROR`: Database query failed
- `NOT_FOUND`: Resource not found (404)
- `VALIDATION_ERROR`: Invalid query parameters
- `MISSING_ENV`: Database configuration error
- `INTERNAL_ERROR`: General server error

---

## Authentication

Currently, these endpoints are **unauthenticated** for development purposes. In production, add authentication middleware.

---

## CORS

Configured to allow:
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: Configure `ALLOWED_ORIGINS` environment variable

---

## Testing Endpoints

### 1. Start the API server
```bash
npm run dev:api
# or
vercel dev --listen 3000
```

### 2. Test with curl
```bash
# Test performance insights
curl http://localhost:3000/api/performance-insights

# Test cost categories
curl http://localhost:3000/api/cost-categories

# Test recommendations
curl http://localhost:3000/api/recommendations
```

### 3. Expected Response (Before Seeding)
```json
{
  "error": "No performance period found",
  "message": "Please run seed data to create periods."
}
```

This is expected! Run the migration and seed data first.

---

## Next Steps

1. **Run migrations** to create tables:
   ```bash
   node db/run-migration-002.js
   ```

2. **Seed database** with sample data:
   ```bash
   node db/seed-new-data.js
   ```

3. **Test endpoints** with sample data

4. **Build frontend components** that consume these APIs

---

## Files Created
- `api/performance-insights.js` - Performance dashboard endpoint
- `api/cost-categories.js` - Cost categories with utilization
- `api/recommendations.js` - Unified recommendations
- `api/API_ENDPOINTS_NEW.md` - This documentation
