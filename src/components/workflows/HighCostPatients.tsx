import { ArrowLeft, AlertCircle, DollarSign } from 'lucide-react';

// High need patient metrics
const TOTAL_HIGH_COST_PATIENTS = 39;
const TOTAL_EXCESS_COST = 280000;
const CURRENT_PMPM = 1042;
const TARGET_PMPM = 950;
const TOP_PERFORMER_PMPM = 850;

// Categories of high need patients
const categoryData: Record<string, {
  avgCost: number;
  percentOfTotal: number;
  riskFactors: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'Multiple Chronic Conditions': {
    avgCost: 95000,
    percentOfTotal: 40,
    riskFactors: [
      'Uncoordinated care across specialists',
      'Polypharmacy risks',
      'Frequent hospitalizations',
      'Poor self-management skills'
    ],
    interventions: [
      'Assign dedicated care coordinator',
      'Implement comprehensive care plan',
      'Weekly check-in calls',
      'Medication therapy management'
    ],
    expectedImpact: 'Reducing costs by 20% saves $22,400 per patient annually',
    color: 'red'
  },
  'Post-Surgical Complications': {
    avgCost: 120000,
    percentOfTotal: 25,
    riskFactors: [
      'Inadequate pre-operative optimization',
      'Poor post-discharge follow-up',
      'Infection or wound issues',
      'Lack of rehab engagement'
    ],
    interventions: [
      'Pre-surgical optimization protocol',
      'Enhanced recovery after surgery pathway',
      'Home health nursing follow-up',
      'Physical therapy compliance monitoring'
    ],
    expectedImpact: 'Preventing complications saves $35,000 per case',
    color: 'red'
  },
  'Behavioral Health Comorbidity': {
    avgCost: 85000,
    percentOfTotal: 20,
    riskFactors: [
      'Untreated depression/anxiety',
      'Medication non-adherence',
      'Social isolation',
      'Substance use disorders'
    ],
    interventions: [
      'Integrated behavioral health screening',
      'Collaborative care model',
      'Peer support programs',
      'Care management with BH focus'
    ],
    expectedImpact: 'Integrated care reduces costs by 15-25%',
    color: 'amber'
  },
  'End-Stage Organ Disease': {
    avgCost: 150000,
    percentOfTotal: 15,
    riskFactors: [
      'Frequent ED visits and admissions',
      'Dialysis or transplant needs',
      'Complex medication regimens',
      'Palliative care needs unmet'
    ],
    interventions: [
      'Palliative care consultation',
      'Advance care planning',
      'Home-based care programs',
      'Symptom management optimization'
    ],
    expectedImpact: 'Palliative care reduces costs by 30% in last year of life',
    color: 'amber'
  }
};

interface Props {
  onBack: () => void;
}

export default function HighCostPatients({ onBack }: Props) {
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
    const patientCount = Math.round(TOTAL_HIGH_COST_PATIENTS * data.percentOfTotal / 100);
    const totalCost = Math.round(TOTAL_EXCESS_COST * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      patientCount,
      totalCost
    };
  });

  const gapToTarget = CURRENT_PMPM - TARGET_PMPM;
  const percentAbove = Math.round((gapToTarget / TARGET_PMPM) * 100);

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
          <h1 className="text-4xl font-light">High Need Patients</h1>
          <p className="text-gray-600 mt-2">{TOTAL_HIGH_COST_PATIENTS} patients • {formatCurrency(TOTAL_EXCESS_COST)} excess costs</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-light text-amber-900">{percentAbove}% Above Target PMPM</div>
              <div className="text-sm text-amber-700 font-light mt-1">Current: {formatCurrency(CURRENT_PMPM)} • Target: {formatCurrency(TARGET_PMPM)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-amber-600">{formatCurrency(TOTAL_EXCESS_COST)}</div>
            <div className="text-sm text-amber-700 font-light">Excess Costs</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200">
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Current PMPM</div>
            <div className="text-2xl font-light text-amber-900">{formatCurrency(CURRENT_PMPM)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Target PMPM</div>
            <div className="text-2xl font-light text-amber-900">{formatCurrency(TARGET_PMPM)}</div>
            <div className="text-xs text-amber-600">+{formatCurrency(gapToTarget)} gap</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Efficiently Managed</div>
            <div className="text-2xl font-light text-amber-900">{formatCurrency(TOP_PERFORMER_PMPM)}</div>
            <div className="text-xs text-amber-600">+{formatCurrency(CURRENT_PMPM - TOP_PERFORMER_PMPM)} gap</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Recommendations</h2>

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

      {/* Breakdown by Category */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Category</h2>

        <div className="space-y-6">
          {categories
            .sort((a, b) => b.totalCost - a.totalCost)
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
                    <DollarSign className={`w-6 h-6 ${
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
                    <p className="text-sm text-gray-600">{cat.patientCount} patients • Avg {formatCurrency(cat.avgCost)}/patient</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-light text-red-600">{formatCurrency(cat.totalCost)}</div>
                    <div className="text-xs text-gray-500">Excess Cost</div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</div>
                    <div className="space-y-1">
                      {cat.riskFactors.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {factor}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">&nbsp;</div>
                    <div className="space-y-1">
                      {cat.riskFactors.slice(2).map((factor, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {factor}</div>
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
