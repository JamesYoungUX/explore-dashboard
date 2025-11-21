import { useState, useEffect } from 'react';
import { ArrowLeft, Target, AlertCircle, TrendingUp } from 'lucide-react';

type GapSummary = {
  gap_type: string;
  total_gaps: number;
  avg_days_overdue: number;
  max_days_overdue: number;
  high_priority_count: number;
};

// Quality gate bonus at risk - this is the key financial metric
const TOTAL_QUALITY_BONUS = 350000;

// Panel size for calculating realistic gap counts
const PANEL_SIZE = 1500;

// Mock data for financial impact and interventions
const gapTypeData: Record<string, {
  revenuePerClosure: number;
  qualityMeasure: string;
  currentRate: number;
  targetRate: number;
  topPerformerRate: number;
  bonusWeight: number;
  eligiblePercent: number;
  interventions: string[];
  expectedROI: string;
}> = {
  'Annual Wellness Visit': {
    revenuePerClosure: 175,
    qualityMeasure: 'AWV Completion Rate',
    currentRate: 68,
    targetRate: 85,
    topPerformerRate: 92,
    bonusWeight: 15,
    eligiblePercent: 100,
    interventions: [
      'Automated appointment reminders 30/14/7 days before due date',
      'Standing orders for MA to schedule during any visit',
      'Dedicated AWV time slots on provider schedules',
      'Patient portal self-scheduling for AWV'
    ],
    expectedROI: 'Closing 17% gap protects $52,500 of quality bonus'
  },
  'Diabetic Eye Exam': {
    revenuePerClosure: 85,
    qualityMeasure: 'Diabetes Eye Exam Rate',
    currentRate: 58,
    targetRate: 75,
    topPerformerRate: 88,
    bonusWeight: 12,
    eligiblePercent: 25,
    interventions: [
      'Retinal camera in-office (eliminates referral barrier)',
      'Auto-schedule eye exam with diabetic visit',
      'Care coordinator follow-up on referral completion',
      'Partner with mobile retinal screening service'
    ],
    expectedROI: 'Closing 17% gap protects $42,000 of quality bonus'
  },
  'HbA1c Test': {
    revenuePerClosure: 45,
    qualityMeasure: 'Diabetes HbA1c Control',
    currentRate: 72,
    targetRate: 85,
    topPerformerRate: 91,
    bonusWeight: 12,
    eligiblePercent: 25,
    interventions: [
      'Point-of-care A1c testing at every diabetic visit',
      'Standing lab orders with patient self-scheduling',
      'Pharmacy-based A1c testing partnership',
      'Text reminders with direct lab scheduling link'
    ],
    expectedROI: 'Closing 13% gap protects $42,000 of quality bonus'
  },
  'Mammogram': {
    revenuePerClosure: 125,
    qualityMeasure: 'Breast Cancer Screening',
    currentRate: 64,
    targetRate: 80,
    topPerformerRate: 87,
    bonusWeight: 10,
    eligiblePercent: 35,
    interventions: [
      'Mobile mammography unit at practice quarterly',
      'Care coordinator to schedule and confirm',
      'Address transportation barriers (ride service)',
      'Same-day mammogram scheduling at referral'
    ],
    expectedROI: 'Closing 16% gap protects $35,000 of quality bonus'
  },
  'Colonoscopy': {
    revenuePerClosure: 350,
    qualityMeasure: 'Colorectal Cancer Screening',
    currentRate: 55,
    targetRate: 75,
    topPerformerRate: 82,
    bonusWeight: 10,
    eligiblePercent: 60,
    interventions: [
      'FIT test alternative for colonoscopy-averse patients',
      'Cologuard home testing option',
      'Nurse navigator for colonoscopy scheduling',
      'Address prep concerns with simplified protocols'
    ],
    expectedROI: 'Closing 20% gap protects $35,000 of quality bonus'
  },
  'Bone Density Scan': {
    revenuePerClosure: 95,
    qualityMeasure: 'Osteoporosis Screening',
    currentRate: 48,
    targetRate: 70,
    topPerformerRate: 78,
    bonusWeight: 5,
    eligiblePercent: 30,
    interventions: [
      'Auto-referral at age 65 or risk factors',
      'Partner with imaging center for priority scheduling',
      'Bundle with AWV appointment',
      'Care gap alert in EHR for eligible patients'
    ],
    expectedROI: 'Closing 22% gap protects $17,500 of quality bonus'
  },
  'Flu Vaccination': {
    revenuePerClosure: 35,
    qualityMeasure: 'Influenza Immunization',
    currentRate: 62,
    targetRate: 80,
    topPerformerRate: 89,
    bonusWeight: 8,
    eligiblePercent: 100,
    interventions: [
      'Standing orders for MA/RN administration',
      'Walk-in flu shot clinics (no appointment)',
      'Pharmacy partnership for overflow',
      'Text blast campaigns in September-October'
    ],
    expectedROI: 'Closing 18% gap protects $28,000 of quality bonus'
  },
  'Blood Pressure Check': {
    revenuePerClosure: 25,
    qualityMeasure: 'Blood Pressure Control',
    currentRate: 71,
    targetRate: 85,
    topPerformerRate: 90,
    bonusWeight: 10,
    eligiblePercent: 45,
    interventions: [
      'Home BP monitoring program with device loan',
      'Nurse visits for BP-only checks',
      'Pharmacy BP kiosk integration',
      'Telehealth BP review appointments'
    ],
    expectedROI: 'Closing 14% gap protects $35,000 of quality bonus'
  },
  'Lipid Panel': {
    revenuePerClosure: 40,
    qualityMeasure: 'Statin Therapy Adherence',
    currentRate: 66,
    targetRate: 80,
    topPerformerRate: 86,
    bonusWeight: 6,
    eligiblePercent: 35,
    interventions: [
      'Standing annual lab orders for chronic patients',
      'Fasting lab early AM availability',
      'Home phlebotomy for mobility-limited patients',
      'Auto-schedule labs 1 month before due'
    ],
    expectedROI: 'Closing 14% gap protects $21,000 of quality bonus'
  },
  'Cardiac Stress Test': {
    revenuePerClosure: 450,
    qualityMeasure: 'CAD Management',
    currentRate: 52,
    targetRate: 75,
    topPerformerRate: 81,
    bonusWeight: 5,
    eligiblePercent: 15,
    interventions: [
      'In-office stress testing capability',
      'Cardiology co-management agreement',
      'Care coordinator for scheduling and prep',
      'Patient education on test importance'
    ],
    expectedROI: 'Closing 23% gap protects $17,500 of quality bonus'
  },
  'Pneumonia Vaccine': {
    revenuePerClosure: 45,
    qualityMeasure: 'Pneumococcal Vaccination',
    currentRate: 58,
    targetRate: 80,
    topPerformerRate: 88,
    bonusWeight: 7,
    eligiblePercent: 50,
    interventions: [
      'Standing orders for 65+ patients',
      'Bundle with flu shot visits',
      'EHR alert for eligible patients',
      'Pharmacy administration partnership'
    ],
    expectedROI: 'Closing 22% gap protects $24,500 of quality bonus'
  }
};

interface Props {
  onBack: () => void;
}

export default function CareGaps({ onBack }: Props) {
  const [summary, setSummary] = useState<GapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/care-gaps/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch care gaps summary');
        }
        const result = await response.json();
        setSummary(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && summary.length === 0) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Calculate realistic gap counts based on panel size
  const getRealisticGapCount = (gapType: string) => {
    const data = gapTypeData[gapType];
    if (!data) return 0;
    const eligiblePatients = Math.round(PANEL_SIZE * data.eligiblePercent / 100);
    const gapRate = (100 - data.currentRate) / 100;
    return Math.round(eligiblePatients * gapRate);
  };

  const totalGaps = summary.reduce((sum, s) => sum + getRealisticGapCount(s.gap_type), 0);

  // Calculate bonus at risk
  const totalBonusAtRisk = summary.reduce((sum, s) => {
    const data = gapTypeData[s.gap_type];
    if (data && data.currentRate < data.targetRate) {
      return sum + (TOTAL_QUALITY_BONUS * data.bonusWeight / 100);
    }
    return sum;
  }, 0);

  // Calculate weighted average quality rates
  const totalWeight = summary.reduce((sum, s) => {
    const data = gapTypeData[s.gap_type];
    return sum + (data?.bonusWeight || 5);
  }, 0);

  const avgCurrentRate = summary.reduce((sum, s) => {
    const data = gapTypeData[s.gap_type];
    return sum + ((data?.currentRate || 60) * (data?.bonusWeight || 5));
  }, 0) / totalWeight;

  const avgTargetRate = summary.reduce((sum, s) => {
    const data = gapTypeData[s.gap_type];
    return sum + ((data?.targetRate || 80) * (data?.bonusWeight || 5));
  }, 0) / totalWeight;

  const gapPercent = Math.round(avgTargetRate - avgCurrentRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl font-light">Quality Gap Analysis</h1>
          <p className="text-gray-600 mt-2">{totalGaps} open gaps • {formatCurrency(totalBonusAtRisk)} bonus at risk</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-light text-red-900">{Math.round((totalBonusAtRisk / TOTAL_QUALITY_BONUS) * 100)}% of Quality Bonus at Risk</div>
              <div className="text-sm text-red-700 font-light mt-1">{PANEL_SIZE} attributed lives • {summary.length} measures below target</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-red-600">{formatCurrency(totalBonusAtRisk)}</div>
            <div className="text-sm text-red-700 font-light">Bonus at Risk</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-red-200">
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-red-900">{Math.round(avgCurrentRate)}%</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-red-900">{Math.round(avgTargetRate)}%</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Total Bonus</div>
            <div className="text-2xl font-light text-red-900">{formatCurrency(TOTAL_QUALITY_BONUS)}</div>
            <div className="text-xs text-red-600">{Math.round((totalBonusAtRisk / TOTAL_QUALITY_BONUS) * 100)}% at risk</div>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Priority Actions</h2>

        <div className="space-y-4">
          {summary
            .sort((a, b) => {
              const aBonus = gapTypeData[a.gap_type]?.bonusWeight || 5;
              const bBonus = gapTypeData[b.gap_type]?.bonusWeight || 5;
              return bBonus - aBonus;
            })
            .slice(0, 3)
            .map((gap, idx) => {
              const data = gapTypeData[gap.gap_type];
              if (!data) return null;

              return (
                <div key={gap.gap_type} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className={`w-8 h-8 ${idx === 0 ? 'bg-red-100' : 'bg-amber-100'} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <span className={`${idx === 0 ? 'text-red-600' : 'text-amber-600'} font-medium`}>{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{data.interventions[0]}</h3>
                    <p className="text-sm text-gray-600 mb-2">{data.expectedROI}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{gap.gap_type}</span>
                      <span>•</span>
                      <span>{getRealisticGapCount(gap.gap_type)} patients</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Gap Breakdown */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Gap Breakdown by Measure</h2>

        <div className="space-y-6">
          {summary
            .sort((a, b) => {
              const aBonus = gapTypeData[a.gap_type]?.bonusWeight || 5;
              const bBonus = gapTypeData[b.gap_type]?.bonusWeight || 5;
              return bBonus - aBonus;
            })
            .map((gap) => {
              const data = gapTypeData[gap.gap_type];
              if (!data) return null;

              const bonusAtRisk = TOTAL_QUALITY_BONUS * data.bonusWeight / 100;
              const isBelowTarget = data.currentRate < data.targetRate;
              const gapToClose = data.targetRate - data.currentRate;
              const realisticCount = getRealisticGapCount(gap.gap_type);

              return (
                <div
                  key={gap.gap_type}
                  className="p-6 bg-white rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-6 mb-4">
                    <div className={`w-12 h-12 ${isBelowTarget ? 'bg-amber-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      <Target className={`w-6 h-6 ${isBelowTarget ? 'text-amber-600' : 'text-green-600'}`} strokeWidth={2} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-normal">{gap.gap_type}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          isBelowTarget ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {data.bonusWeight}% of bonus
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{realisticCount} patients • {isBelowTarget ? `${gapToClose}% below target` : 'Target met'}</p>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-light ${isBelowTarget ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(bonusAtRisk)}
                      </div>
                      <div className="text-xs text-gray-500">{isBelowTarget ? 'At Risk' : 'Protected'}</div>
                    </div>
                  </div>

                  {/* Benchmark Comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Current</div>
                      <div className="text-sm font-medium">{data.currentRate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Target</div>
                      <div className="text-sm font-medium">{data.targetRate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Top Performer</div>
                      <div className="text-sm font-medium">{data.topPerformerRate}%</div>
                    </div>
                  </div>

                  {/* Interventions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Interventions:</div>
                    <div className="space-y-1">
                      {data.interventions.map((intervention, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {intervention}</div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
