import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import type { CostCategory, PerformancePeriod } from '../../types';

interface Props {
  onNavigate?: (categorySlug: string) => void;
}

interface CostCategoriesResponse {
  period: PerformancePeriod;
  categories: CostCategory[];
}

export default function CostSavingDeepDive({ onNavigate }: Props) {
  const [data, setData] = useState<CostCategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');

  useEffect(() => {
    fetchData();
  }, [statusFilter, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('periodKey', selectedPeriod);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/cost-categories?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch cost categories');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching cost categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-amber-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'red': return 'Priority';
      case 'yellow': return 'Watch';
      case 'green': return 'Performing Well';
      default: return 'Unknown';
    }
  };

  const getVarianceColor = (variance: number | string) => {
    const num = typeof variance === 'string' ? parseFloat(variance) : variance;
    if (num > 0) return 'text-red-600';
    if (num < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number | string) => {
    const num = typeof variance === 'string' ? parseFloat(variance) : variance;
    if (num > 0) return <TrendingUp className="w-4 h-4" />;
    if (num < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading cost categories...</div>
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
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">Cost Savings Breakout</h1>
          <p className="text-sm text-gray-500 mt-2">All Data Risk Adjusted</p>
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
          <span className="text-xs text-gray-700 font-normal">{data.period.periodLabel}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <div className="text-sm text-gray-600 mb-2 font-medium">Performance Status</div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === null ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              All ({data.categories.length})
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'red' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Priority
            </button>
            <button
              onClick={() => setStatusFilter('yellow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'yellow' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Watch
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'green' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Performing Well
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {data.categories.map((category) => (
          <div
            key={category.id}
            className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigate && onNavigate(category.slug)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(category.performanceStatus)}`} />
                <div>
                  <h3 className="text-xl font-medium">{category.categoryName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-sm font-medium">{getStatusLabel(category.performanceStatus)}</div>
                </div>
                {category.acoRank && category.totalCategories && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">ACO Rank</div>
                    <div className="text-sm font-medium">{category.acoRank} of {category.totalCategories}</div>
                  </div>
                )}
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Spending and Utilization Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Section */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">Spending (PMPM)</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Actual</div>
                    <div className="text-2xl font-light">{formatCurrency(category.spendingPmpmActual)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                    <div className="text-2xl font-light text-gray-600">{formatCurrency(category.spendingPmpmBenchmark)}</div>
                  </div>
                </div>

                {category.spendingVariancePercent !== null && category.spendingVariancePercent !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Variance vs Benchmark</span>
                    <div className={`flex items-center gap-2 font-semibold ${getVarianceColor(category.spendingVariancePercent)}`}>
                      {getVarianceIcon(category.spendingVariancePercent)}
                      <span>{formatPercent(category.spendingVariancePercent)}</span>
                      {category.spendingVarianceAmount !== null && category.spendingVarianceAmount !== undefined && (
                        <span className="text-sm">({formatCurrency(Math.abs(category.spendingVarianceAmount))})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Utilization Section */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Utilization {category.utilizationUnit && `(${category.utilizationUnit.replace(/_/g, ' ')})`}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Actual</div>
                    <div className="text-2xl font-light">{formatNumber(category.utilizationActual)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                    <div className="text-2xl font-light text-gray-600">{formatNumber(category.utilizationBenchmark)}</div>
                  </div>
                </div>

                {category.utilizationVariancePercent !== null && category.utilizationVariancePercent !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Variance vs Benchmark</span>
                    <div className={`flex items-center gap-2 font-semibold ${getVarianceColor(category.utilizationVariancePercent)}`}>
                      {getVarianceIcon(category.utilizationVariancePercent)}
                      <span>{formatPercent(category.utilizationVariancePercent)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insight Badge */}
            {category.isOpportunity && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-medium">Cost Savings Opportunity</span>
              </div>
            )}
            {category.isStrength && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">Performing Efficiently</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.categories.length === 0 && (
        <div className="text-center py-12 bg-white/60 backdrop-blur rounded-2xl">
          <div className="text-gray-500">No categories found with the selected filters.</div>
        </div>
      )}
    </div>
  );
}
