import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import type { PerformanceInsightsResponse, ProblemArea } from '../../types';

interface Props {
  onNavigate: (view: ProblemArea, recId?: number) => void;
}

export default function CostPerformanceInsights({ onNavigate }: Props) {
  const [data, setData] = useState<PerformanceInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');

  const getDateRange = (period: string) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    switch (period) {
      case 'ytd':
        return `Jan 1, ${currentYear} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'last_12_months':
        const last12Start = new Date(today);
        last12Start.setMonth(today.getMonth() - 12);
        return `${last12Start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'last_quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        const lastQuarter = quarter === 0 ? 3 : quarter - 1;
        const lastQuarterYear = quarter === 0 ? currentYear - 1 : currentYear;
        const quarterStart = new Date(lastQuarterYear, lastQuarter * 3, 1);
        const quarterEnd = new Date(lastQuarterYear, (lastQuarter + 1) * 3, 0);
        return `${quarterStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${quarterEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/performance-insights?periodKey=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error('Failed to fetch performance insights');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching performance insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading performance insights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl text-gray-700 mb-2">Error Loading Data</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <div className="text-xs text-gray-400">Make sure the API server is running: npm run dev:api</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    // Check if the number has meaningful decimals (not .00)
    const hasDecimals = num % 1 !== 0;

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(num);
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getMetricValue = (metric: any) => {
    const value = typeof metric.currentValue === 'string' ? parseFloat(metric.currentValue) : metric.currentValue;
    switch (metric.displayFormat) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value}%`;
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  const getTrendIcon = (direction?: string, metricType?: string) => {
    const isPatientCount = metricType === 'patient_count';

    if (direction === 'up') {
      // For patient count, up is good (green), for costs up is bad (red)
      return <TrendingUp className={`w-5 h-5 ${isPatientCount ? 'text-green-600' : 'text-red-600'}`} />;
    }
    if (direction === 'down') {
      // For patient count, down is bad (red), for costs down is good (green)
      return <TrendingDown className={`w-5 h-5 ${isPatientCount ? 'text-red-600' : 'text-green-600'}`} />;
    }
    return null;
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'red': return 'bg-red-50 border-red-200 text-red-900';
      case 'yellow': return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'green': return 'bg-green-50 border-green-200 text-green-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'red': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'yellow': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'green': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-light">Cost Performance Insights</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">All Data Risk Adjusted</p>
        </div>

        {/* Period Filter */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD85F] focus:border-transparent cursor-pointer"
            >
              <option value="ytd">Year to Date</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="last_quarter">Last Quarter</option>
            </select>
          </div>
          <span className="text-xs text-gray-700 font-normal">{getDateRange(selectedPeriod)}</span>
        </div>
      </div>

      {/* Top Metrics Card */}
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-4 xl:gap-6 lg:divide-x divide-gray-200">
          {data.metrics.map((metric, index) => {
            const isCostSavings = metric.metricType === 'cost_savings_opportunity';
            const isPatientCount = metric.metricType === 'patient_count';

            // For patient count, positive is good (green), for costs negative is good (green)
            const getPercentColor = () => {
              if (metric.changePercent === null || metric.changePercent === undefined) return '';
              if (isPatientCount) {
                return metric.changePercent > 0 ? 'text-green-600' : 'text-red-600';
              }
              return metric.changePercent < 0 ? 'text-green-600' : 'text-red-600';
            };

            return (
              <div key={metric.id} className={`space-y-2 ${index > 0 ? 'lg:pl-4 xl:pl-6' : ''}`}>
                <div className="text-xs lg:text-sm text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                  {metric.metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                {isCostSavings ? (
                  <div className="flex items-baseline gap-1 lg:gap-1.5">
                    <span className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light whitespace-nowrap">
                      $750,000
                    </span>
                    <span className="text-sm lg:text-base xl:text-lg font-light text-gray-600 whitespace-nowrap">
                      (15%)
                    </span>
                    <span className="text-sm lg:text-base font-medium text-green-600 whitespace-nowrap">
                      -2.1%
                    </span>
                    {getTrendIcon(metric.changeDirection, metric.metricType)}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5 lg:gap-2">
                    <div className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light whitespace-nowrap">{getMetricValue(metric)}</div>
                    {metric.changePercent !== null && metric.changePercent !== undefined && (
                      <span className={`text-sm lg:text-base font-medium whitespace-nowrap ${getPercentColor()}`}>
                        {formatPercent(metric.changePercent)}
                      </span>
                    )}
                    {getTrendIcon(metric.changeDirection, metric.metricType)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm overflow-hidden">

        {/* Cost Opportunities - Side by Side */}
        <div className="p-6 lg:p-8 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:divide-x divide-gray-200">
            {/* Top Cost Savings Opportunities */}
            <div className="lg:pr-8">
              <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-light mb-6">Top Cost Savings Opportunities</h2>
              <div className="space-y-3 lg:space-y-4">
                {data.costOpportunities
                  .filter(opp => opp.opportunityType === 'overspending')
                  .sort((a, b) => Math.abs(b.amountVariance || 0) - Math.abs(a.amountVariance || 0))
                  .map((opp) => (
                    <div
                      key={opp.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 rounded-xl border ${getPerformanceColor(opp.performanceStatus || 'yellow')} cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]`}
                      onClick={() => {
                        if (opp.categorySlug) {
                          onNavigate(opp.categorySlug as ProblemArea);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 mb-3 sm:mb-0">
                        {getPerformanceIcon(opp.performanceStatus || 'yellow')}
                        <div>
                          <div className="font-medium text-base lg:text-lg">{opp.categoryName}</div>
                          <div className="text-sm lg:text-base opacity-80">
                            {opp.percentVariance !== null && opp.percentVariance !== undefined ? (
                              `${Math.abs(opp.percentVariance).toFixed(1)}% above benchmark`
                            ) : 'At benchmark'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-right sm:ml-4">
                        <div className="font-semibold text-lg lg:text-xl text-red-700">
                          {opp.amountVariance !== null && opp.amountVariance !== undefined
                            ? formatCurrency(Math.abs(opp.amountVariance))
                            : '$0'}
                        </div>
                        {opp.acoRank && (
                          <div className="text-xs lg:text-sm opacity-70">Rank {opp.acoRank} in ACO</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Performing Categories */}
            <div className="lg:pl-8">
              <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-light mb-6">Top Performing Categories</h2>
              <div className="space-y-3 lg:space-y-4">
                {data.costOpportunities
                  .filter(opp => opp.opportunityType === 'efficient')
                  .sort((a, b) => Math.abs(b.amountVariance || 0) - Math.abs(a.amountVariance || 0))
                  .map((opp) => (
                    <div
                      key={opp.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 rounded-xl border ${getPerformanceColor(opp.performanceStatus || 'green')} cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]`}
                      onClick={() => {
                        if (opp.categorySlug) {
                          onNavigate(opp.categorySlug as ProblemArea);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 mb-3 sm:mb-0">
                        {getPerformanceIcon(opp.performanceStatus || 'green')}
                        <div>
                          <div className="font-medium text-base lg:text-lg">{opp.categoryName}</div>
                          <div className="text-sm lg:text-base opacity-80">
                            {opp.percentVariance !== null && opp.percentVariance !== undefined ? (
                              `${Math.abs(opp.percentVariance).toFixed(1)}% below benchmark`
                            ) : 'At benchmark'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-right sm:ml-4">
                        <div className="font-semibold text-lg lg:text-xl text-green-700">
                          {opp.amountVariance !== null && opp.amountVariance !== undefined
                            ? formatCurrency(Math.abs(opp.amountVariance))
                            : '$0'}
                        </div>
                        {opp.acoRank && (
                          <div className="text-xs lg:text-sm opacity-70">Rank {opp.acoRank} in ACO</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency KPIs */}
        <div className="p-6 lg:p-8 border-b border-gray-200">
          <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-light mb-6">Efficiency KPIs</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Lowest Performing Table */}
            <div>
              <h3 className="text-lg lg:text-xl font-medium mb-4 text-red-700">Lowest Performing</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Metric</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Actual</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Benchmark</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">ACO Rank</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.efficiencyKpis
                      .filter(kpi => kpi.variancePercent !== null && kpi.variancePercent !== undefined && kpi.variancePercent > 0)
                      .sort((a, b) => (b.variancePercent || 0) - (a.variancePercent || 0))
                      .slice(0, 3)
                      .map((kpi, index) => (
                        <tr key={kpi.id} className={`border-b border-gray-200 hover:bg-red-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{kpi.kpiLabel}</td>
                          <td className="py-4 px-4 text-right text-base font-semibold text-gray-900">
                            {kpi.displayFormat === 'percent' ? `${kpi.actualValue}%` :
                              kpi.displayFormat === 'per_thousand' ? formatNumber(kpi.actualValue) :
                                formatNumber(kpi.actualValue)}
                          </td>
                          <td className="py-4 px-4 text-right text-sm text-gray-600">
                            {kpi.acoBenchmark !== null && kpi.acoBenchmark !== undefined ? (
                              kpi.displayFormat === 'percent' ? `${kpi.acoBenchmark}%` : formatNumber(kpi.acoBenchmark)
                            ) : '-'}
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-700">
                            {kpi.acoRank || '-'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                              {kpi.variancePercent !== null && kpi.variancePercent !== undefined && formatPercent(kpi.variancePercent)}
                              <ArrowUp className="w-4 h-4" />
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Highest Performing Table */}
            <div>
              <h3 className="text-lg lg:text-xl font-medium mb-4 text-green-700">Highest Performing</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Metric</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Actual</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Benchmark</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">ACO Rank</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.efficiencyKpis
                      .filter(kpi => kpi.performanceStatus === 'good')
                      .sort((a, b) => Math.abs(b.variancePercent || 0) - Math.abs(a.variancePercent || 0))
                      .slice(0, 3)
                      .map((kpi, index) => (
                        <tr key={kpi.id} className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{kpi.kpiLabel}</td>
                          <td className="py-4 px-4 text-right text-base font-semibold text-gray-900">
                            {kpi.displayFormat === 'percent' ? `${kpi.actualValue}%` :
                              kpi.displayFormat === 'per_thousand' ? formatNumber(kpi.actualValue) :
                                formatNumber(kpi.actualValue)}
                          </td>
                          <td className="py-4 px-4 text-right text-sm text-gray-600">
                            {kpi.acoBenchmark !== null && kpi.acoBenchmark !== undefined ? (
                              kpi.displayFormat === 'percent' ? `${kpi.acoBenchmark}%` : formatNumber(kpi.acoBenchmark)
                            ) : '-'}
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-700">
                            {kpi.acoRank || '-'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                              {kpi.variancePercent !== null && kpi.variancePercent !== undefined && formatPercent(kpi.variancePercent)}
                              <ArrowDown className="w-4 h-4" />
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-light">Top Recommendations</h2>
            <button
              onClick={() => onNavigate('recommendations' as ProblemArea)}
              className="text-sm lg:text-base text-gray-600 hover:text-900 transition-colors font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          {/* Single card containing all recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            {data.topRecommendations.map((rec, index) => (
              <div key={rec.id}>
                <div
                  className="flex items-start gap-4 p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onNavigate('recommendations' as ProblemArea, rec.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-base lg:text-lg">{rec.title}</div>
                      {rec.status && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rec.status === 'not_started' ? 'bg-gray-100 text-gray-700' :
                          rec.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            rec.status === 'already_doing' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {rec.status === 'not_started' ? 'Not Started' :
                            rec.status === 'already_doing' ? 'Already Doing' :
                              rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm lg:text-base text-gray-600 mb-3">{rec.description}</div>

                    {/* Special formatting for care management program */}
                    {rec.title === 'Implement a care management program' ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm lg:text-base text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <span>Cost area(s):</span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          IP Surgical
                        </span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          IP Medical
                        </span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          ED
                        </span>
                        <span>totalling</span>
                        <span>
                          {formatCurrency(rec.estimatedSavings || 0)} (47%)
                        </span>
                        <span>from</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('high-cost-patients' as ProblemArea);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors"
                        >
                          39 high need patients
                        </button>
                      </div>
                    ) : rec.title === 'Refer patients with dementia to GUIDE program' ? (
                      /* Special formatting for GUIDE program */
                      <div className="flex flex-wrap items-center gap-2 text-sm lg:text-base text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <span>Cost area(s):</span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          ED
                        </span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          SNF
                        </span>
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border-2 border-blue-200">
                          IP Medical
                        </span>
                        <span>totalling</span>
                        <span>
                          {formatCurrency(rec.estimatedSavings || 0)}
                        </span>
                        <span>from</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('high-cost-patients' as ProblemArea);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-colors"
                        >
                          87 patients with dementia
                        </button>
                      </div>
                    ) : (
                      /* Default formatting for other recommendations */
                      <>
                        <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-500">
                          {rec.estimatedSavings && (
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(rec.estimatedSavings)} potential savings
                            </span>
                          )}
                          {rec.affectedLives && (
                            <span>{formatNumber(rec.affectedLives)} patients affected</span>
                          )}
                        </div>
                        {rec.affectedCategories && rec.affectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {rec.affectedCategories.map((cat) => (
                              <span key={cat.categoryId} className="text-xs lg:text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                                {cat.categoryName}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm lg:text-base font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                      View details
                      <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </span>
                  </div>
                </div>
                {/* Divider line between recommendations (except after last one) */}
                {index < data.topRecommendations.length - 1 && (
                  <div className="border-b border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
