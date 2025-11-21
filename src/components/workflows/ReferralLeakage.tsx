import { ArrowLeft, AlertCircle, ArrowUpRight } from 'lucide-react';

// Referral leakage metrics - matches dashboard
const TOTAL_OON_VISITS = 1245;
const TOTAL_LEAKAGE_COST = 95000;
const CURRENT_OON_RATE = 4.2;
const TARGET_OON_RATE = 8;
const TOP_PERFORMER_RATE = 5;

// Categories of network leakage
const categoryData: Record<string, {
  avgCost: number;
  percentOfTotal: number;
  reasons: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'Specialist Availability': {
    avgCost: 85,
    percentOfTotal: 35,
    reasons: [
      'Long wait times for in-network',
      'Limited appointment slots',
      'Geographic accessibility',
      'Subspecialty not available'
    ],
    interventions: [
      'Expand in-network specialist contracts',
      'Negotiate reserved slots with specialists',
      'Telehealth specialist consultations',
      'Hub-and-spoke specialty networks'
    ],
    expectedImpact: 'Better access retains 60% of leaked visits, saving $20K',
    color: 'red'
  },
  'Provider Preference': {
    avgCost: 72,
    percentOfTotal: 30,
    reasons: [
      'Historical referral patterns',
      'Personal relationships with OON',
      'Unaware of in-network options',
      'Perceived quality differences'
    ],
    interventions: [
      'Updated in-network specialist directory',
      'Quality metrics for in-network providers',
      'Provider education on network options',
      'EHR referral decision support'
    ],
    expectedImpact: 'Education redirects 40% to in-network, saving $11K',
    color: 'red'
  },
  'Patient Request': {
    avgCost: 68,
    percentOfTotal: 20,
    reasons: [
      'Existing relationship with OON',
      'Insurance literacy issues',
      'Recommendation from others',
      'Brand name recognition'
    ],
    interventions: [
      'Patient education on cost differences',
      'Cost transparency tools',
      'Care navigator support',
      'In-network quality testimonials'
    ],
    expectedImpact: 'Informed patients choose in-network 50% more, saving $9K',
    color: 'amber'
  },
  'Emergency/Urgent': {
    avgCost: 95,
    percentOfTotal: 15,
    reasons: [
      'Urgent specialist need',
      'After-hours referral',
      'ED follow-up requirement',
      'Time-sensitive condition'
    ],
    interventions: [
      'On-call in-network specialist roster',
      'Urgent referral coordinator',
      'Same-day specialist access program',
      'Post-acute care network'
    ],
    expectedImpact: 'Urgent access program captures 45% of urgent visits, saving $6K',
    color: 'amber'
  }
};

interface Props {
  onBack: () => void;
}

export default function ReferralLeakage({ onBack }: Props) {
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
    const visitCount = Math.round(TOTAL_OON_VISITS * data.percentOfTotal / 100);
    const totalCost = Math.round(TOTAL_LEAKAGE_COST * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      visitCount,
      totalCost
    };
  });

  const gapToTarget = TARGET_OON_RATE - CURRENT_OON_RATE;
  const percentBelowTarget = Math.round((gapToTarget / TARGET_OON_RATE) * 100);

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
          <h1 className="text-4xl font-light">Network Leakage</h1>
          <p className="text-gray-600 mt-2">{TOTAL_OON_VISITS.toLocaleString()} out-of-network visits • {formatCurrency(TOTAL_LEAKAGE_COST)} higher costs</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-light text-green-900">{percentBelowTarget}% Below Target OON Rate</div>
              <div className="text-sm text-green-700 font-light mt-1">Current: {CURRENT_OON_RATE}% • Target: {TARGET_OON_RATE}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-green-600">{formatCurrency(TOTAL_LEAKAGE_COST)}</div>
            <div className="text-sm text-green-700 font-light">Network Leakage</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-200">
          <div>
            <div className="text-xs text-green-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-green-900">{CURRENT_OON_RATE}%</div>
          </div>
          <div>
            <div className="text-xs text-green-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-green-900">{TARGET_OON_RATE}%</div>
            <div className="text-xs text-green-600">{gapToTarget.toFixed(1)}% better</div>
          </div>
          <div>
            <div className="text-xs text-green-700 font-light mb-1">Top Performer</div>
            <div className="text-2xl font-light text-green-900">{TOP_PERFORMER_RATE}%</div>
            <div className="text-xs text-green-600">{(TOP_PERFORMER_RATE - CURRENT_OON_RATE).toFixed(1)}% better</div>
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
                    <span>{cat.visitCount} visits</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Breakdown by Reason */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Reason</h2>

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
                    <ArrowUpRight className={`w-6 h-6 ${
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
                    <div className="text-2xl font-light text-green-600">{formatCurrency(cat.totalCost)}</div>
                    <div className="text-xs text-gray-500">Higher Cost</div>
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
