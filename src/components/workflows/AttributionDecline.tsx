import { ArrowLeft, AlertCircle, Users } from 'lucide-react';

// Attribution decline metrics
const TOTAL_LOST_PATIENTS = 91;
const TOTAL_REVENUE_IMPACT = 127000;
const CURRENT_ATTRIBUTION_RATE = 94;
const TARGET_ATTRIBUTION_RATE = 98;
const TOP_PERFORMER_RATE = 99;

// Categories of attribution loss
const categoryData: Record<string, {
  patientCount: number;
  percentOfTotal: number;
  reasons: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'Long Wait Times': {
    patientCount: 34,
    percentOfTotal: 37,
    reasons: [
      'Average wait time 12+ days for appointments',
      'No same-day sick visit availability',
      'Phone hold times exceeding 10 minutes',
      'Limited evening/weekend hours'
    ],
    interventions: [
      'Implement open access scheduling',
      'Add same-day appointment slots',
      'Deploy nurse triage phone line',
      'Extend clinic hours 2 evenings/week'
    ],
    expectedImpact: 'Reducing wait times retains 60% of at-risk patients',
    color: 'red'
  },
  'Provider Retirement/Departure': {
    patientCount: 28,
    percentOfTotal: 31,
    reasons: [
      'No transition plan for departing providers',
      'Poor communication about changes',
      'Patients not reassigned promptly',
      'Loss of trusted relationship'
    ],
    interventions: [
      'Create provider succession protocols',
      'Proactive patient outreach 90 days before',
      'Introduce replacement provider in person',
      'Schedule immediate follow-up with new PCP'
    ],
    expectedImpact: 'Proper transitions retain 80% of affected patients',
    color: 'red'
  },
  'Poor Patient Experience': {
    patientCount: 18,
    percentOfTotal: 20,
    reasons: [
      'Staff communication issues',
      'Billing/administrative problems',
      'Difficulty getting test results',
      'Lack of care coordination'
    ],
    interventions: [
      'Patient experience training for staff',
      'Proactive results communication',
      'Dedicated patient advocate role',
      'Streamline billing processes'
    ],
    expectedImpact: 'Experience improvements reduce churn by 25%',
    color: 'amber'
  },
  'Geographic/Insurance Changes': {
    patientCount: 11,
    percentOfTotal: 12,
    reasons: [
      'Patient relocation',
      'Insurance network changes',
      'Employer plan changes',
      'Medicare Advantage plan switches'
    ],
    interventions: [
      'Partner with nearby practices for referrals',
      'Expand insurance contracts',
      'Proactive outreach during open enrollment',
      'Offer cash-pay options for non-covered patients'
    ],
    expectedImpact: 'Network expansion recovers 30% of insurance-related losses',
    color: 'blue'
  }
};

interface Props {
  onBack: () => void;
}

export default function AttributionDecline({ onBack }: Props) {
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
    const revenueImpact = Math.round(TOTAL_REVENUE_IMPACT * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      revenueImpact
    };
  });

  const gapToTarget = TARGET_ATTRIBUTION_RATE - CURRENT_ATTRIBUTION_RATE;

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
          <h1 className="text-4xl font-light">Attribution Decline</h1>
          <p className="text-gray-600 mt-2">{TOTAL_LOST_PATIENTS} patients lost • {formatCurrency(TOTAL_REVENUE_IMPACT)} revenue impact</p>
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
              <div className="text-2xl font-light text-amber-900">{gapToTarget}% Below Target Attribution</div>
              <div className="text-sm text-amber-700 font-light mt-1">Current: {CURRENT_ATTRIBUTION_RATE}% • Target: {TARGET_ATTRIBUTION_RATE}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-amber-600">{formatCurrency(TOTAL_REVENUE_IMPACT)}</div>
            <div className="text-sm text-amber-700 font-light">Revenue Impact</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200">
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-amber-900">{CURRENT_ATTRIBUTION_RATE}%</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-amber-900">{TARGET_ATTRIBUTION_RATE}%</div>
            <div className="text-xs text-amber-600">+{gapToTarget}% gap</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Efficiently Managed</div>
            <div className="text-2xl font-light text-amber-900">{TOP_PERFORMER_RATE}%</div>
            <div className="text-xs text-amber-600">+{TOP_PERFORMER_RATE - CURRENT_ATTRIBUTION_RATE}% gap</div>
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
                    <span>{cat.patientCount} patients</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Reason</h2>

        <div className="space-y-6">
          {categories
            .sort((a, b) => b.revenueImpact - a.revenueImpact)
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
                    <Users className={`w-6 h-6 ${
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
                        {cat.percentOfTotal}% of losses
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{cat.patientCount} patients lost</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-light text-red-600">{formatCurrency(cat.revenueImpact)}</div>
                    <div className="text-xs text-gray-500">Revenue Impact</div>
                  </div>
                </div>

                {/* Reasons */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Contributing Factors:</div>
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
