import { ArrowLeft, AlertCircle, Activity } from 'lucide-react';

// Total readmissions cost at risk - matches dashboard
const TOTAL_READMISSION_COST = 185000;

// Panel size for calculating realistic counts
const PANEL_SIZE = 1500;

// Current readmission rate and target
const CURRENT_RATE = 8.2;
const TARGET_RATE = 6.5;
const TOP_PERFORMER_RATE = 5.2;

// Total readmissions
const TOTAL_READMISSIONS = 89;

// Readmission categories with interventions
const categoryData: Record<string, {
  avgCost: number;
  percentOfTotal: number;
  riskFactors: string[];
  interventions: string[];
  expectedImpact: string;
  color: 'red' | 'amber' | 'blue';
}> = {
  'CHF Exacerbation': {
    avgCost: 28000,
    percentOfTotal: 35,
    riskFactors: [
      'Poor medication adherence',
      'Dietary non-compliance (sodium)',
      'Missed follow-up appointments',
      'Inadequate home health support'
    ],
    interventions: [
      'Daily weight monitoring with telemonitoring',
      'CHF nurse navigator follow-up within 48 hours',
      'Medication reconciliation and simplification',
      'Low-sodium diet education with family'
    ],
    expectedImpact: 'Reducing CHF readmissions by 50% saves $32,375 annually',
    color: 'red'
  },
  'COPD Exacerbation': {
    avgCost: 22000,
    percentOfTotal: 25,
    riskFactors: [
      'Inhaler technique issues',
      'Smoking cessation failure',
      'Delayed action plan activation',
      'Environmental triggers at home'
    ],
    interventions: [
      'Pulmonary rehab referral and enrollment',
      'Home spirometry monitoring program',
      'Action plan laminated card for refrigerator',
      'Smoking cessation with NRT and counseling'
    ],
    expectedImpact: 'Reducing COPD readmissions by 40% saves $18,500 annually',
    color: 'red'
  },
  'Pneumonia': {
    avgCost: 19000,
    percentOfTotal: 20,
    riskFactors: [
      'Incomplete antibiotic course',
      'Aspiration risk not addressed',
      'Inadequate vaccination history',
      'Dehydration and poor nutrition'
    ],
    interventions: [
      'Ensure antibiotic course completion verification',
      'Speech therapy swallow evaluation if indicated',
      'Pneumonia and flu vaccination before discharge',
      'Hydration and nutrition support plan'
    ],
    expectedImpact: 'Reducing pneumonia readmissions by 35% saves $12,950 annually',
    color: 'amber'
  },
  'Diabetes Complications': {
    avgCost: 18000,
    percentOfTotal: 12,
    riskFactors: [
      'Hypoglycemia events',
      'Insulin dosing errors',
      'Poor wound care',
      'Medication access issues'
    ],
    interventions: [
      'CGM or frequent SMBG with nurse review',
      'Diabetes educator home visit',
      'Wound care nurse follow-up',
      'Connect with patient assistance programs'
    ],
    expectedImpact: 'Reducing diabetes readmissions by 40% saves $8,880 annually',
    color: 'amber'
  },
  'Cardiac Events': {
    avgCost: 32000,
    percentOfTotal: 8,
    riskFactors: [
      'Cardiac rehab non-enrollment',
      'Antiplatelet non-adherence',
      'Uncontrolled risk factors',
      'Anxiety/depression post-event'
    ],
    interventions: [
      'Automatic cardiac rehab enrollment',
      'Pharmacist-led medication counseling',
      'Aggressive risk factor management',
      'Behavioral health screening and referral'
    ],
    expectedImpact: 'Reducing cardiac readmissions by 45% saves $6,660 annually',
    color: 'blue'
  }
};

interface Props {
  onBack: () => void;
}

export default function PreventableReadmissions({ onBack }: Props) {
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
    const caseCount = Math.round(TOTAL_READMISSIONS * data.percentOfTotal / 100);
    const totalCost = Math.round(TOTAL_READMISSION_COST * data.percentOfTotal / 100);
    return {
      name,
      ...data,
      caseCount,
      totalCost
    };
  });

  const gapToTarget = CURRENT_RATE - TARGET_RATE;
  const preventableReadmissions = Math.round(TOTAL_READMISSIONS * (gapToTarget / CURRENT_RATE));
  const preventableCost = Math.round(TOTAL_READMISSION_COST * (gapToTarget / CURRENT_RATE));

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
          <h1 className="text-4xl font-light">Preventable Readmissions</h1>
          <p className="text-gray-600 mt-2">{TOTAL_READMISSIONS} readmissions • {formatCurrency(TOTAL_READMISSION_COST)} excess costs</p>
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
              <div className="text-2xl font-light text-amber-900">{gapToTarget.toFixed(1)}% Above Target Rate</div>
              <div className="text-sm text-amber-700 font-light mt-1">{PANEL_SIZE} attributed lives • Current: {CURRENT_RATE}% • Target: {TARGET_RATE}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-amber-600">{formatCurrency(TOTAL_READMISSION_COST)}</div>
            <div className="text-sm text-amber-700 font-light">Excess Costs</div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200">
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Current Rate</div>
            <div className="text-2xl font-light text-amber-900">{CURRENT_RATE}%</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Target Rate</div>
            <div className="text-2xl font-light text-amber-900">{TARGET_RATE}%</div>
            <div className="text-xs text-amber-600">+{gapToTarget.toFixed(1)}% gap</div>
          </div>
          <div>
            <div className="text-xs text-amber-700 font-light mb-1">Efficiently Managed</div>
            <div className="text-2xl font-light text-amber-900">{TOP_PERFORMER_RATE}%</div>
            <div className="text-xs text-amber-600">+{(CURRENT_RATE - TOP_PERFORMER_RATE).toFixed(1)}% gap</div>
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
                    <span>{cat.caseCount} cases</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Gap Breakdown */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Breakdown by Diagnosis</h2>

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
                    <Activity className={`w-6 h-6 ${
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
                    <p className="text-sm text-gray-600">{cat.caseCount} cases • Avg {formatCurrency(cat.avgCost)}/case</p>
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

      {/* Impact Summary */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-4">Potential Impact</h2>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <span className="font-medium">Reaching target rate would prevent {preventableReadmissions} readmissions and save {formatCurrency(preventableCost)} annually.</span>
            <br />
            <span className="text-green-700">Focus on CHF and COPD cases which account for 60% of excess costs.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
