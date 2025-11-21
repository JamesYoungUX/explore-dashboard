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
  | 'gap-dme'
  | 'gap-specialty-drugs'
  | 'gap-outpatient-surgery'
  | 'gap-inpatient-surgery'
  | 'gap-post-acute'
  | 'gap-inpatient-medical';
