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

export interface EDVisit {
  patientId: string;
  patientName: string;
  visitDate: string;
  chiefComplaint: string;
  cost: number;
  appropriate: boolean;
  alternativeCare: string;
}

export interface MedicationIssue {
  patientId: string;
  patientName: string;
  medication: string;
  adherenceRate: number;
  missedDoses: number;
  lastFillDate: string;
  condition: string;
}

export interface CareGap {
  patientId: string;
  patientName: string;
  gapType: string;
  dueDate: string;
  overdueDays: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ReferralLeakage {
  patientId: string;
  patientName: string;
  specialty: string;
  referralDate: string;
  inNetwork: boolean;
  estimatedCost: number;
  potentialSavings: number;
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
  | 'gap-drilldown'
  | 'cost-performance-insights'
  | 'cost-categories'
  | 'recommendations'
  | 'progress-tracking'
  | 'settings'
  | 'chosen-initiatives'
  | 'gap-dme'
  | 'gap-specialty-drugs'
  | 'gap-outpatient-surgery'
  | 'gap-inpatient-surgery'
  | 'gap-post-acute'
  | 'gap-inpatient-medical'
  | 'cost-performance-insights'
  | 'cost-saving-deep-dive'
  | 'program-implementation';

// ============================================================================
// NEW TYPES FOR LEADERSHIP FEEDBACK IMPLEMENTATION
// ============================================================================

// Performance Periods
export interface PerformancePeriod {
  id: number;
  periodKey: string;           // 'ytd', 'last_12_months', 'last_quarter'
  periodLabel: string;          // 'Year to Date', 'Last 12 Months'
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Performance Metrics (Top-level metrics with trending)
export interface PerformanceMetric {
  id: number;
  periodId: number;
  metricType: string;           // 'total_cost', 'patient_count', etc.
  currentValue: number;
  previousValue?: number;
  changePercent?: number;       // e.g., -4.2 (negative is good for cost)
  changeDirection?: 'up' | 'down' | 'flat';
  benchmarkValue?: number;
  isAboveBenchmark?: boolean;
  displayFormat: 'currency' | 'number' | 'percent';
}

// Cost Categories (Enhanced with Spending + Utilization)
export interface CostCategory {
  id: number;
  slug: string;                             // 'acute-rehab', 'op-surgical'
  categoryName: string;                     // 'Acute Rehab', 'OP Surgical'
  periodId: number;

  // Spending Metrics
  spendingPmpmActual: number;               // Actual spending PMPM
  spendingPmpmBenchmark: number;            // Benchmark spending PMPM
  spendingVarianceAmount?: number;          // Dollar variance
  spendingVariancePercent?: number;         // Percent variance (22% above)

  // Utilization Metrics
  utilizationActual: number;                // Admits/K, Visits/K, etc.
  utilizationBenchmark: number;             // Benchmark utilization
  utilizationVariancePercent?: number;      // Percent variance
  utilizationUnit?: string;                 // 'admits_per_k', 'visits_per_k'

  // Performance Status
  performanceStatus: 'red' | 'yellow' | 'green';
  isOpportunity?: boolean;                  // Is this an opportunity area?
  isStrength?: boolean;                     // Is this a strength area?

  // Ranking
  acoRank?: number;                         // Rank within ACO (1 = best)
  totalCategories?: number;                 // Total categories for context

  // Metadata
  description?: string;
  displayOrder?: number;
}

// Recommendations (Unified concept)
export type RecommendationStatus = 'not_started' | 'acknowledged' | 'accepted' | 'rejected' | 'already_doing' | 'in_progress' | 'completed';

export interface Recommendation {
  id: number;
  title: string;
  description?: string;

  // Status Tracking
  status: RecommendationStatus;
  priority?: 'high' | 'medium' | 'low';

  // Measurability (can this be tracked in ACO software vs external)
  isMeasurable?: boolean;                   // true = ACO software, false = external tracking

  // Impact Metrics
  estimatedSavings?: number;
  affectedLives?: number;
  implementationComplexity?: 'low' | 'medium' | 'high';

  // Patient Cohort
  patientCohort?: string;                   // 'dementia patients', 'all patients'
  cohortSize?: number;

  // Program Details
  hasProgramDetails?: boolean;
  programOverview?: string;
  videoUrl?: string;

  // Workflow Conversion
  canConvertToWorkflow?: boolean;
  workflowType?: string;

  // Affected Categories (from join)
  affectedCategories?: {
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    impactAmount?: number;
  }[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
}

// Program Resources
export interface ProgramResource {
  id: number;
  recommendationId: number;
  resourceType: 'best_practice' | 'testimonial' | 'implementation_step';
  title?: string;
  content: string;
  displayOrder?: number;
  author?: string;                          // For testimonials
  authorRole?: string;                      // For testimonials
}

// Efficiency KPIs
export interface EfficiencyKpi {
  id: number;
  periodId: number;
  kpiType: string;                          // 'readmission_rate', 'ed_rate'
  kpiLabel: string;                         // 'Readmission Rate'
  actualValue: number;
  acoBenchmark?: number;
  millimanBenchmark?: number;
  variancePercent?: number;
  performanceStatus?: 'good' | 'warning' | 'poor' | 'bad';
  displayFormat: 'percent' | 'per_thousand' | 'number';
  displayOrder?: number;
  acoRank?: number;                         // ACO Rank (1 = best)
}

// Cost Opportunities (Dashboard summary)
export interface CostOpportunity {
  id: number;
  periodId: number;
  costCategoryId: number;
  opportunityType: 'overspending' | 'efficient' | 'neutral';
  amountVariance?: number;
  percentVariance?: number;
  acoRank?: number;
  displayOrder?: number;
  showOnDashboard?: boolean;

  // Joined category data (flat from API)
  categorySlug?: string;
  categoryName?: string;
  performanceStatus?: 'red' | 'yellow' | 'green';
  spendingPmpmActual?: number;
  spendingPmpmBenchmark?: number;

  // Legacy nested structure (for backward compatibility)
  category?: CostCategory;
}

// Cost Category Drill-Down Data
export interface CostCategoryHospital {
  id: number;
  costCategoryId: number;
  hospitalName: string;
  discharges: number;
  avgLos?: number;                          // Average length of stay
  spend: number;
  readmissionRate?: number;
  displayOrder?: number;
}

export interface CostCategoryDrg {
  id: number;
  costCategoryId: number;
  drgCode?: string;
  drgDescription: string;
  patientCount: number;
  totalSpend: number;
  avgSpendPerPatient: number;
  benchmarkAvg?: number;
  percentAboveBenchmark?: number;
  displayOrder?: number;
}

export interface CostCategoryDischargingHospital {
  id: number;
  costCategoryId: number;
  hospitalName: string;
  discharges: number;
  percentDischargedToIrf?: number;          // Percent to IRF
  percentDischargedToIrfBenchmark?: number;
  displayOrder?: number;
}

// API Response Types
export interface PerformanceInsightsResponse {
  period: PerformancePeriod;
  metrics: PerformanceMetric[];
  costOpportunities: CostOpportunity[];
  efficiencyKpis: EfficiencyKpi[];
  topRecommendations: Recommendation[];
}

export interface CostCategoryDetailResponse {
  category: CostCategory;
  recommendations: Recommendation[];
  hospitals?: CostCategoryHospital[];
  drgs?: CostCategoryDrg[];
  dischargingHospitals?: CostCategoryDischargingHospital[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  totalCount: number;
  filters?: {
    status?: RecommendationStatus[];
    priority?: string[];
  };
}
