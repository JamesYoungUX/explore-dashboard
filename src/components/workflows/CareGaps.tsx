import { useState, useEffect } from 'react';
import { ArrowLeft, Target, AlertCircle } from 'lucide-react';

type GapSummary = {
  gap_type: string;
  total_gaps: number;
  avg_days_overdue: number;
  max_days_overdue: number;
  high_priority_count: number;
};

type GapTypeData = {
  revenuePerClosure: number;
  qualityMeasure: string;
  currentRate: number;
  targetRate: number;
  topPerformerRate: number;
  bonusWeight: number;
  eligiblePercent: number;
  interventions: string[];
  expectedROI: string;
};

type PracticeConfig = {
  panel_size: number;
  total_quality_bonus: number;
};

interface Props {
  onBack: () => void;
}

export default function CareGaps({ onBack }: Props) {
  const [summary, setSummary] = useState<GapSummary[]>([]);
  const [gapTypeData, setGapTypeData] = useState<Record<string, GapTypeData>>({});
  const [config, setConfig] = useState<PracticeConfig>({ panel_size: 1522, total_quality_bonus: 350000 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [summaryRes, metricsRes, configRes] = await Promise.all([
          fetch('/api/care-gaps?summary=true'),
          fetch('/api/config?type=gap-metrics'),
          fetch('/api/config?type=practice')
        ]);

        if (!summaryRes.ok || !metricsRes.ok || !configRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [summaryData, metricsData, configData] = await Promise.all([
          summaryRes.json(),
          metricsRes.json(),
          configRes.json()
        ]);

        setSummary(summaryData);
        setGapTypeData(metricsData);
        setConfig(configData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    const eligiblePatients = Math.round(config.panel_size * data.eligiblePercent / 100);
    const gapRate = (100 - data.currentRate) / 100;
    return Math.round(eligiblePatients * gapRate);
  };

  const totalGaps = summary.reduce((sum, s) => sum + getRealisticGapCount(s.gap_type), 0);

  // Calculate bonus at risk
  const totalBonusAtRisk = summary.reduce((sum, s) => {
    const data = gapTypeData[s.gap_type];
    if (data && data.currentRate < data.targetRate) {
      return sum + (config.total_quality_bonus * data.bonusWeight / 100);
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
              <div className="text-2xl font-light text-red-900">{Math.round((totalBonusAtRisk / config.total_quality_bonus) * 100)}% of Quality Bonus at Risk</div>
              <div className="text-sm text-red-700 font-light mt-1">{config.panel_size} attributed lives • {summary.length} measures below target</div>
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
            <div className="text-2xl font-light text-red-900">{formatCurrency(config.total_quality_bonus)}</div>
            <div className="text-xs text-red-600">{Math.round((totalBonusAtRisk / config.total_quality_bonus) * 100)}% at risk</div>
          </div>
        </div>
      </div>

      {/* Stellar Suggestions */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Stellar Suggestions</h2>

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
                      <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">{getRealisticGapCount(gap.gap_type)} patients</a>
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

              const bonusAtRisk = config.total_quality_bonus * data.bonusWeight / 100;
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
                      <p className="text-sm text-gray-600">
                        <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">{realisticCount} patients</a>
                        {' • '}{isBelowTarget ? `${gapToClose}% below target` : 'Target met'}
                      </p>
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
                      <div className="text-xs text-gray-500 mb-1">Efficiently Managed</div>
                      <div className="text-sm font-medium">{data.topPerformerRate}%</div>
                    </div>
                  </div>

                  {/* Stellar suggestions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Stellar suggestions:</div>
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
