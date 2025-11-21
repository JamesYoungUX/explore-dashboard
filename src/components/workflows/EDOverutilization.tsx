import { ArrowLeft, AlertCircle, Zap } from 'lucide-react';

// ED utilization metrics
const TOTAL_PREVENTABLE_VISITS = 156;
const TOTAL_AVOIDABLE_COST = 250000;
const CURRENT_ED_RATE = 520; // per 1000 members
const TARGET_ED_RATE = 450;
const TOP_PERFORMER_RATE = 380;

// Categories of preventable ED visits
const categoryData: Record<string, {
  avgCost: number;
  percentOfTotal: number;
  reasons: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'Primary Care Accessible': {
    avgCost: 1200,
    percentOfTotal: 35,
    reasons: [
      'After-hours symptom onset',
      'Unable to get same-day appointment',
      'Unaware of urgent care options',
      'Convenience factor'
    ],
    interventions: [
      'Extend clinic hours to evenings/weekends',
      'Reserve same-day slots for acute needs',
      'Promote 24/7 nurse triage line',
      'Partner with nearby urgent care'
    ],
    expectedImpact: 'Redirecting 50% saves $43,750 annually',
    color: 'red'
  },
  'Chronic Disease Exacerbation': {
    avgCost: 2100,
    percentOfTotal: 30,
    reasons: [
      'Poor disease self-management',
      'Medication non-adherence',
      'Lack of action plan',
      'Delayed symptom recognition'
    ],
    interventions: [
      'Disease-specific education programs',
      'Written action plans for flare-ups',
      'Remote monitoring for high-risk patients',
      'Proactive outreach during weather changes'
    ],
    expectedImpact: 'Better management prevents 40% of visits',
    color: 'red'
  },
  'Behavioral Health Crisis': {
    avgCost: 1800,
    percentOfTotal: 20,
    reasons: [
      'Limited BH appointment access',
      'Crisis without support system',
      'Medication issues',
      'Substance use relapse'
    ],
    interventions: [
      'Same-day BH appointments',
      'Crisis hotline and mobile team',
      'Peer support specialists',
      'Integrated BH in primary care'
    ],
    expectedImpact: 'Crisis services reduce ED visits by 30%',
    color: 'amber'
  },
  'Minor Injuries/Illness': {
    avgCost: 900,
    percentOfTotal: 15,
    reasons: [
      'Perceived severity overestimate',
      'Lack of first aid knowledge',
      'No regular PCP relationship',
      'Insurance concerns'
    ],
    interventions: [
      'Patient education on ED alternatives',
      'Telehealth for minor complaints',
      'Urgent care cost transparency',
      'First aid resources and guidance'
    ],
    expectedImpact: 'Education redirects 60% to lower-cost settings',
    color: 'blue'
  }
};

interface Props {
  onBack: () => void;
}

export default function EDOverutilization({ onBack }: Props) {
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
    const visitCount = Math.round(TOTAL_PREVENTABLE_VISITS * data.percentOfTotal / 100);
    const totalCost = Math.round(TOTAL_AVOIDABLE_COST * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      visitCount,
      totalCost
    };
  });

  const gapToTarget = CURRENT_ED_RATE - TARGET_ED_RATE;
  const percentAbove = Math.round((gapToTarget / TARGET_ED_RATE) * 100);

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
          <h1 className="text-4xl font-light">ED Overutilization</h1>
          <p className="text-gray-600 mt-2">{TOTAL_PREVENTABLE_VISITS} preventable visits • {formatCurrency(TOTAL_AVOIDABLE_COST)} avoidable costs</p>
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
              <div className="text-2xl font-light text-amber-900">{percentAbove}% Above Target ED Rate</div>
              <div className="text-sm text-amber-700 font-light mt-1">Current: {CURRENT_ED_RATE}/1000 • Target: {TARGET_ED_RATE}/1000</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-amber-600">{formatCurrency(TOTAL_AVOIDABLE_COST)}</div>
            <div className="text-sm text-amber-700 font-light">Avoidable Costs</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200">
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-amber-900">{CURRENT_ED_RATE}</div>
            <div className="text-xs text-amber-600">per 1,000</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-amber-900">{TARGET_ED_RATE}</div>
            <div className="text-xs text-amber-600">+{gapToTarget} gap</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Efficiently Managed</div>
            <div className="text-2xl font-light text-amber-900">{TOP_PERFORMER_RATE}</div>
            <div className="text-xs text-amber-600">+{CURRENT_ED_RATE - TOP_PERFORMER_RATE} gap</div>
          </div>
        </div>
      </div>

      {/* Stellar Suggestions */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Stellar Suggestions</h2>

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
                    <span>{cat.visitCount} visits</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Visit Type</h2>

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
                    <Zap className={`w-6 h-6 ${
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
                    <p className="text-sm text-gray-600">{cat.visitCount} visits • Avg {formatCurrency(cat.avgCost)}/visit</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-light text-amber-600">{formatCurrency(cat.totalCost)}</div>
                    <div className="text-xs text-gray-500">Avoidable Cost</div>
                  </div>
                </div>

                {/* Reasons */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Root Causes:</div>
                    <div className="space-y-1">
                      {cat.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {reason}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">&nbsp;</div>
                    <div className="space-y-1">
                      {cat.reasons.slice(2).map((reason, idx) => (
                        <div key={idx} className="text-sm text-gray-600">• {reason}</div>
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
