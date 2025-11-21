import type { Patient, Readmission, EDVisit, MedicationIssue, CareGap, ReferralLeakage, WorkflowTask } from '../types';

export const highCostPatients: Patient[] = [
  { id: 'P001', name: 'John Smith', age: 68, totalCost: 145000, riskScore: 9.2, conditions: ['CHF', 'Diabetes', 'COPD'], lastVisit: '2024-10-15' },
  { id: 'P002', name: 'Mary Johnson', age: 72, totalCost: 132000, riskScore: 8.8, conditions: ['Cancer', 'Hypertension'], lastVisit: '2024-10-20' },
  { id: 'P003', name: 'Robert Williams', age: 65, totalCost: 98000, riskScore: 8.1, conditions: ['Kidney Disease', 'Diabetes'], lastVisit: '2024-10-18' },
  { id: 'P004', name: 'Patricia Brown', age: 70, totalCost: 87000, riskScore: 7.9, conditions: ['COPD', 'CAD'], lastVisit: '2024-10-22' },
  { id: 'P005', name: 'Michael Davis', age: 66, totalCost: 76000, riskScore: 7.5, conditions: ['Diabetes', 'Neuropathy'], lastVisit: '2024-10-25' },
];

export const patientCaseManagement = [
  { patientId: 'P001', patientName: 'John Smith', assignedTo: 'Sarah Chen, RN', status: 'in-progress', daysOpen: 12, expectedSavings: 45000, nextAction: 'Care plan review', nextActionDue: '2024-11-12', conditions: 'CHF, Diabetes, COPD' },
  { patientId: 'P002', patientName: 'Mary Johnson', assignedTo: 'Michael Torres, RN', status: 'in-progress', daysOpen: 8, expectedSavings: 38000, nextAction: 'Specialist coordination', nextActionDue: '2024-11-10', conditions: 'Cancer, Hypertension' },
  { patientId: 'P003', patientName: 'Robert Williams', assignedTo: 'Sarah Chen, RN', status: 'pending', daysOpen: 3, expectedSavings: 28000, nextAction: 'Initial assessment', nextActionDue: '2024-11-09', conditions: 'Kidney Disease, Diabetes' },
  { patientId: 'P004', patientName: 'Patricia Brown', assignedTo: 'Jennifer Lee, RN', status: 'in-progress', daysOpen: 15, expectedSavings: 22000, nextAction: 'Medication review', nextActionDue: '2024-11-11', conditions: 'COPD, CAD' },
  { patientId: 'P005', name: 'Michael Davis', assignedTo: 'Michael Torres, RN', status: 'resolved', daysOpen: 45, expectedSavings: 18000, nextAction: 'Monthly follow-up', nextActionDue: '2024-11-15', conditions: 'Diabetes, Neuropathy' },
];

export const readmissionCases = [
  { patientId: 'P001', patientName: 'John Smith', assignedTo: 'Sarah Chen, RN', status: 'in-progress', daysOpen: 5, expectedSavings: 28000, nextAction: 'Home health setup', nextActionDue: '2024-11-10', diagnosis: 'CHF Exacerbation' },
  { patientId: 'P006', patientName: 'Linda Martinez', assignedTo: 'Jennifer Lee, RN', status: 'pending', daysOpen: 2, expectedSavings: 22000, nextAction: 'Discharge follow-up call', nextActionDue: '2024-11-09', diagnosis: 'Pneumonia' },
  { patientId: 'P007', patientName: 'James Garcia', assignedTo: 'Michael Torres, RN', status: 'in-progress', daysOpen: 4, expectedSavings: 19000, nextAction: 'PCP appointment scheduled', nextActionDue: '2024-11-11', diagnosis: 'COPD Exacerbation' },
];

export const medicationCases = [
  { patientId: 'P001', patientName: 'John Smith', assignedTo: 'Pharmacy Team', status: 'in-progress', daysOpen: 18, expectedSavings: 12000, nextAction: 'Medication sync enrollment', nextActionDue: '2024-11-10', medication: 'Furosemide', adherenceRate: 45 },
  { patientId: 'P011', patientName: 'Jennifer Thomas', assignedTo: 'Pharmacy Team', status: 'pending', daysOpen: 5, expectedSavings: 8000, nextAction: 'Cost barrier assessment', nextActionDue: '2024-11-09', medication: 'Metformin', adherenceRate: 52 },
  { patientId: 'P012', patientName: 'Christopher Lee', assignedTo: 'Sarah Chen, RN', status: 'in-progress', daysOpen: 12, expectedSavings: 6000, nextAction: 'Patient education call', nextActionDue: '2024-11-11', medication: 'Lisinopril', adherenceRate: 58 },
];

export const careGapCases = [
  { patientId: 'P013', patientName: 'Nancy White', assignedTo: 'Care Coordination', status: 'pending', daysOpen: 75, expectedSavings: 0, nextAction: 'Schedule eye exam', nextActionDue: '2024-11-09', gapType: 'Diabetic Eye Exam', priority: 'high' },
  { patientId: 'P014', patientName: 'Daniel Harris', assignedTo: 'Care Coordination', status: 'in-progress', daysOpen: 60, expectedSavings: 0, nextAction: 'Colonoscopy scheduled', nextActionDue: '2024-11-15', gapType: 'Colorectal Screening', priority: 'high' },
  { patientId: 'P015', patientName: 'Karen Clark', assignedTo: 'Jennifer Lee, RN', status: 'pending', daysOpen: 45, expectedSavings: 0, nextAction: 'Lab order sent', nextActionDue: '2024-11-10', gapType: 'HbA1c Test', priority: 'medium' },
];

export const referralCases = [
  { patientId: 'P016', patientName: 'Paul Lewis', assignedTo: 'Referral Coordinator', status: 'in-progress', daysOpen: 8, expectedSavings: 3200, nextAction: 'In-network cardiologist identified', nextActionDue: '2024-11-10', specialty: 'Cardiology' },
  { patientId: 'P017', patientName: 'Betty Walker', assignedTo: 'Referral Coordinator', status: 'pending', daysOpen: 5, expectedSavings: 4500, nextAction: 'Contact patient for approval', nextActionDue: '2024-11-09', specialty: 'Orthopedics' },
  { patientId: 'P018', patientName: 'Mark Hall', assignedTo: 'Referral Coordinator', status: 'resolved', daysOpen: 12, expectedSavings: 2100, nextAction: 'Appointment confirmed', nextActionDue: '2024-11-15', specialty: 'Neurology' },
];

export const readmissions: Readmission[] = [
  { patientId: 'P001', patientName: 'John Smith', admissionDate: '2024-09-15', readmissionDate: '2024-10-10', diagnosis: 'CHF Exacerbation', cost: 28000, preventable: true },
  { patientId: 'P006', patientName: 'Linda Martinez', admissionDate: '2024-09-20', readmissionDate: '2024-10-18', diagnosis: 'Pneumonia', cost: 22000, preventable: true },
  { patientId: 'P007', patientName: 'James Garcia', admissionDate: '2024-09-25', readmissionDate: '2024-10-20', diagnosis: 'COPD Exacerbation', cost: 19000, preventable: true },
];

export const edVisits: EDVisit[] = [
  { patientId: 'P008', patientName: 'Barbara Rodriguez', visitDate: '2024-10-28', chiefComplaint: 'Back Pain', cost: 3200, appropriate: false, alternativeCare: 'Primary Care' },
  { patientId: 'P009', patientName: 'David Wilson', visitDate: '2024-10-27', chiefComplaint: 'URI Symptoms', cost: 2800, appropriate: false, alternativeCare: 'Urgent Care' },
  { patientId: 'P010', patientName: 'Susan Anderson', visitDate: '2024-10-26', chiefComplaint: 'Medication Refill', cost: 2500, appropriate: false, alternativeCare: 'Telehealth' },
];

export const medicationIssues: MedicationIssue[] = [
  { patientId: 'P001', patientName: 'John Smith', medication: 'Furosemide', adherenceRate: 45, missedDoses: 22, lastFillDate: '2024-09-15', condition: 'CHF' },
  { patientId: 'P011', patientName: 'Jennifer Thomas', medication: 'Metformin', adherenceRate: 52, missedDoses: 18, lastFillDate: '2024-09-20', condition: 'Diabetes' },
  { patientId: 'P012', patientName: 'Christopher Lee', medication: 'Lisinopril', adherenceRate: 58, missedDoses: 15, lastFillDate: '2024-09-25', condition: 'Hypertension' },
];

export const careGaps: CareGap[] = [
  { patientId: 'P013', patientName: 'Nancy White', gapType: 'Annual Diabetic Eye Exam', dueDate: '2024-08-15', overdueDays: 75, priority: 'high' },
  { patientId: 'P014', patientName: 'Daniel Harris', gapType: 'Colorectal Cancer Screening', dueDate: '2024-09-01', overdueDays: 60, priority: 'high' },
  { patientId: 'P015', patientName: 'Karen Clark', gapType: 'HbA1c Test', dueDate: '2024-09-15', overdueDays: 45, priority: 'medium' },
];

export const referralLeakage: ReferralLeakage[] = [
  { patientId: 'P016', patientName: 'Paul Lewis', specialty: 'Cardiology', referralDate: '2024-10-20', inNetwork: false, estimatedCost: 8500, potentialSavings: 3200 },
  { patientId: 'P017', patientName: 'Betty Walker', specialty: 'Orthopedics', referralDate: '2024-10-22', inNetwork: false, estimatedCost: 12000, potentialSavings: 4500 },
  { patientId: 'P018', patientName: 'Mark Hall', specialty: 'Neurology', referralDate: '2024-10-25', inNetwork: false, estimatedCost: 6500, potentialSavings: 2100 },
];

export const workflowTasks: WorkflowTask[] = [
  { id: 'T001', patientId: 'P001', patientName: 'John Smith', taskType: 'Care Coordination Call', priority: 'high', assignedTo: 'Care Manager A', dueDate: '2024-11-01', status: 'pending', notes: 'Follow up on CHF management and medication adherence' },
  { id: 'T002', patientId: 'P006', patientName: 'Linda Martinez', taskType: 'Discharge Follow-up', priority: 'high', assignedTo: 'Care Manager B', dueDate: '2024-11-02', status: 'in-progress', notes: 'Schedule post-discharge visit within 7 days' },
  { id: 'T003', patientId: 'P008', patientName: 'Barbara Rodriguez', taskType: 'Patient Education', priority: 'medium', assignedTo: 'Nurse C', dueDate: '2024-11-03', status: 'pending', notes: 'Educate on appropriate ED use and alternatives' },
];

export const dashboardMetrics = {
  totalCostOfCare: 12450000,
  costPerMember: 8300,
  savingsOpportunity: 1850000,
  qualityScore: 87,
  riskAdjustedPMPM: 725,
  trendData: [
    { month: 'May', cost: 1020000, target: 1050000 },
    { month: 'Jun', cost: 1035000, target: 1050000 },
    { month: 'Jul', cost: 1048000, target: 1050000 },
    { month: 'Aug', cost: 1062000, target: 1050000 },
    { month: 'Sep', cost: 1055000, target: 1050000 },
    { month: 'Oct', cost: 1042000, target: 1050000 },
  ],
};

export const benchmarkData = {
  readmissionRate: {
    current: 8.2,
    lastYear: 9.8,
    industryBenchmark: 7.5,
    topPerformer: 5.2,
  },
  edUtilization: {
    current: 245, // per 1000 members
    lastYear: 268,
    industryBenchmark: 220,
    topPerformer: 180,
  },
  medicationAdherence: {
    current: 52, // average %
    lastYear: 48,
    industryBenchmark: 65,
    topPerformer: 78,
  },
  careGapClosure: {
    current: 73, // % closed
    lastYear: 68,
    industryBenchmark: 82,
    topPerformer: 91,
  },
  referralLeakage: {
    current: 12, // % out of network
    lastYear: 18,
    industryBenchmark: 8,
    topPerformer: 3,
  },
  costPerMember: {
    current: 8300,
    lastYear: 8650,
    industryBenchmark: 7900,
    topPerformer: 7200,
  },
};
