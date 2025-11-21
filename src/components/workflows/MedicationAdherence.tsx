import { ArrowLeft, AlertCircle, Pill } from 'lucide-react';

// Medication adherence metrics
const TOTAL_NON_ADHERENT_PATIENTS = 234;
const TOTAL_RISK_EXPOSURE = 156000;
const CURRENT_ADHERENCE = 52;
const TARGET_ADHERENCE = 80;
const TOP_PERFORMER_ADHERENCE = 88;

// Categories of non-adherence
const categoryData: Record<string, {
  avgRisk: number;
  percentOfTotal: number;
  barriers: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'Cost/Access Barriers': {
    avgRisk: 8500,
    percentOfTotal: 35,
    barriers: [
      'High copays or deductibles',
      'Transportation to pharmacy',
      'Insurance coverage gaps',
      'Complex prior auth requirements'
    ],
    interventions: [
      'Connect with patient assistance programs',
      'Switch to generic alternatives',
      '90-day mail order options',
      'Copay assistance enrollment'
    ],
    expectedImpact: 'Addressing cost barriers improves adherence by 40%',
    color: 'red'
  },
  'Complexity/Side Effects': {
    avgRisk: 6200,
    percentOfTotal: 30,
    barriers: [
      'Multiple medications (polypharmacy)',
      'Difficult dosing schedules',
      'Unpleasant side effects',
      'Lack of symptom improvement'
    ],
    interventions: [
      'Medication therapy management review',
      'Simplify regimens where possible',
      'Address side effects proactively',
      'Patient education on expected timeline'
    ],
    expectedImpact: 'Simplified regimens increase adherence by 25%',
    color: 'red'
  },
  'Forgetfulness/Habits': {
    avgRisk: 4800,
    percentOfTotal: 20,
    barriers: [
      'No established routine',
      'Cognitive impairment',
      'Busy lifestyle',
      'Multiple caregivers involved'
    ],
    interventions: [
      'Pill organizers and reminders',
      'Medication synchronization',
      'Family/caregiver engagement',
      'Smart pill bottle technology'
    ],
    expectedImpact: 'Reminder systems improve adherence by 30%',
    color: 'amber'
  },
  'Beliefs/Health Literacy': {
    avgRisk: 5500,
    percentOfTotal: 15,
    barriers: [
      'Doesn\'t believe medication helps',
      'Fears about side effects',
      'Prefers alternative treatments',
      'Misunderstands instructions'
    ],
    interventions: [
      'Motivational interviewing',
      'Teach-back method education',
      'Address cultural beliefs respectfully',
      'Share outcome data and evidence'
    ],
    expectedImpact: 'Education and engagement improve adherence by 20%',
    color: 'amber'
  }
};

interface Props {
  onBack: () => void;
}

export default function MedicationAdherence({ onBack }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate category data
  const categories = Object.entries(categoryData).map(([name, data]) => {
    const patientCount = Math.round(TOTAL_NON_ADHERENT_PATIENTS * data.percentOfTotal / 100);
    const totalRisk = Math.round(TOTAL_RISK_EXPOSURE * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      patientCount,
      totalRisk
    };
  });

  const gapToTarget = TARGET_ADHERENCE - CURRENT_ADHERENCE;
  const percentBelow = Math.round((gapToTarget / TARGET_ADHERENCE) * 100);

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
          <h1 className="text-4xl font-light">Medication Non-Adherence</h1>
          <p className="text-gray-600 mt-2">{TOTAL_NON_ADHERENT_PATIENTS} patients • {formatCurrency(TOTAL_RISK_EXPOSURE)} risk exposure</p>
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
              <div className="text-2xl font-light text-red-900">{gapToTarget}% Below Target Adherence</div>
              <div className="text-sm text-red-700 font-light mt-1">Current: {CURRENT_ADHERENCE}% • Target: {TARGET_ADHERENCE}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-red-600">{formatCurrency(TOTAL_RISK_EXPOSURE)}</div>
            <div className="text-sm text-red-700 font-light">Risk Exposure</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-red-200">
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-red-900">{CURRENT_ADHERENCE}%</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-red-900">{TARGET_ADHERENCE}%</div>
            <div className="text-xs text-red-600">+{gapToTarget}% gap</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Top Performer</div>
            <div className="text-2xl font-light text-red-900">{TOP_PERFORMER_ADHERENCE}%</div>
            <div className="text-xs text-red-600">+{TOP_PERFORMER_ADHERENCE - CURRENT_ADHERENCE}% gap</div>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Priority Actions</h2>

        <div className="space-y-4">
          {categories
            .sort((a, b) => b.percentOfTotal - a.percentOfTotal)
            .slice(0, 3)
            .map((cat, idx) => (
              <div key={cat.name} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className={`w-8 h-8 ${idx === 0 ? 'bg-red-100' : 'bg-amber-100'} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className={`${idx === 0 ? 'text-red-600' : 'text-amber-600'} font-medium`}>{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{cat.interventions[0]}</h3>
                  <p className="text-sm text-gray-600 mb-2">{cat.expectedImpact}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{cat.name}</span>
                    <span>•</span>
                    <span>{cat.patientCount} patients</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Breakdown by Barrier Type */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Barrier Type</h2>

        <div className="space-y-6">
          {categories
            .sort((a, b) => b.totalRisk - a.totalRisk)
            .map((cat) => (
              <div
                key={cat.name}
                className="p-6 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-6 mb-4">
                  <div className={`w-12 h-12 ${
                    cat.color === 'red' ? 'bg-red-100' :
                    cat.color === 'amber' ? 'bg-amber-100' : 'bg-blue-100'
                  } rounded-lg flex items-center justify-center`}>
                    <Pill className={`w-6 h-6 ${
                      cat.color === 'red' ? 'text-red-600' :
                      cat.color === 'amber' ? 'text-amber-600' : 'text-blue-600'
                    }`} strokeWidth={2} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-normal">{cat.name}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        cat.color === 'red' ? 'bg-red-100 text-red-700' :
                        cat.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {cat.percentOfTotal}% of total
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{cat.patientCount} patients • Avg {formatCurrency(cat.avgRisk)} risk</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-light text-red-600">{formatCurrency(cat.totalRisk)}</div>
                    <div className="text-xs text-gray-500">Risk Exposure</div>
                  </div>
                </div>

                {/* Barriers */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Common Barriers:</div>
                    <div className="space-y-1">
                      {cat.barriers.slice(0, 2).map((barrier, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {barrier}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">&nbsp;</div>
                    <div className="space-y-1">
                      {cat.barriers.slice(2).map((barrier, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {barrier}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interventions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Interventions:</div>
                  <div className="space-y-1">
                    {cat.interventions.map((intervention, idx) => (
                      <div key={idx} className="text-sm text-gray-600">• {intervention}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
