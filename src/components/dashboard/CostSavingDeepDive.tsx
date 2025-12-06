import { useState, useEffect } from 'react';
import { TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
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
  const [allCategories, setAllCategories] = useState<CostCategory[]>([]);
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

      // Also fetch all categories (unfiltered) for banner calculation
      if (statusFilter) {
        const allParams = new URLSearchParams();
        allParams.append('periodKey', selectedPeriod);
        const allResponse = await fetch(`/api/cost-categories?${allParams.toString()}`);
        if (allResponse.ok) {
          const allResult = await allResponse.json();
          setAllCategories(allResult.categories);
          console.log('Fetched all categories (filtered view):', allResult.categories.length);
        }
      } else {
        setAllCategories(result.categories);
        console.log('Set all categories (unfiltered view):', result.categories.length);
        const aboveBenchmark = result.categories.filter((cat: any) => cat.spendingVarianceAmount > 0);
        console.log('Categories above benchmark:', aboveBenchmark.length, aboveBenchmark.map((c: any) => c.categoryName));
      }
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

  const getVarianceColor = (variance: number) => {
    const absVariance = Math.abs(variance);

    // Watch items: within ±3% of benchmark
    if (absVariance <= 3) {
      return 'amber'; // Watch
    }

    // Priority (overspending): more than +3% above benchmark
    if (variance > 3) {
      return 'red'; // Priority
    }

    // Performing well (underspending): more than -3% below benchmark
    if (variance < -3) {
      return 'green';
    }

    return 'gray';
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
          <p className="text-sm text-gray-500 italic">All data risk-adjusted</p>
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

      {/* Summary Banner */}
      <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-3xl font-bold text-red-900">
              {(() => {
                const aboveBenchmark = allCategories.filter(cat =>
                  cat.spendingVariancePercent !== null &&
                  cat.spendingVariancePercent !== undefined &&
                  cat.spendingVariancePercent > 0
                );
                console.log('Banner % calc - categories:', aboveBenchmark.map(c => ({ name: c.categoryName, percent: c.spendingVariancePercent })));
                if (aboveBenchmark.length === 0) return 'At benchmark';
                const avgPercent = aboveBenchmark.reduce((sum, cat) => {
                  const percent = typeof cat.spendingVariancePercent === 'string'
                    ? parseFloat(cat.spendingVariancePercent)
                    : cat.spendingVariancePercent;
                  return sum + (percent || 0);
                }, 0) / aboveBenchmark.length;
                console.log('Banner % calc - average:', avgPercent);
                return `${avgPercent.toFixed(1)}% above benchmark`;
              })()}
            </div>
            <div className="text-sm text-red-700 mt-2 font-medium">#7 in ACO on cost control</div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-3 justify-end">
              <div className="text-3xl font-bold text-red-900">
                {(() => {
                  const filtered = allCategories.filter(cat =>
                    cat.spendingVarianceAmount !== null &&
                    cat.spendingVarianceAmount !== undefined &&
                    cat.spendingVarianceAmount > 0
                  );

                  const totalAboveBenchmark = filtered.reduce((sum, cat) => {
                    const amount = typeof cat.spendingVarianceAmount === 'string'
                      ? parseFloat(cat.spendingVarianceAmount)
                      : cat.spendingVarianceAmount;
                    return sum + (amount || 0);
                  }, 0);

                  return formatCurrency(totalAboveBenchmark);
                })()}
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <span className="text-lg font-semibold">
                  {(() => {
                    const aboveBenchmark = allCategories.filter(cat =>
                      cat.trendPercent !== null &&
                      cat.trendPercent !== undefined &&
                      cat.spendingVarianceAmount !== null &&
                      cat.spendingVarianceAmount !== undefined &&
                      cat.spendingVarianceAmount > 0
                    );
                    if (aboveBenchmark.length === 0) return '+0.0%';
                    const avgTrend = aboveBenchmark.reduce((sum, cat) => {
                      const trend = typeof cat.trendPercent === 'string'
                        ? parseFloat(cat.trendPercent)
                        : cat.trendPercent;
                      return sum + (trend || 0);
                    }, 0) / aboveBenchmark.length;
                    return `${avgTrend >= 0 ? '+' : ''}${avgTrend.toFixed(1)}%`;
                  })()}
                </span>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-red-700 mt-1">above benchmark spending</div>
          </div>
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
            className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onNavigate && onNavigate(category.slug)}
          >
            {/* Category Name */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{category.categoryName}</h3>

            <div className="flex items-center justify-between gap-8">
              {/* Left: PMPM and Utilization */}
              <div className="flex gap-12 flex-1">
                {/* PMPM Section */}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-3">PMPM</div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(category.spendingPmpmBenchmark)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Actual</div>
                      <div className={`text-lg font-bold ${(category.spendingVariancePercent ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(category.spendingPmpmActual)}
                        {category.spendingVariancePercent !== null && category.spendingVariancePercent !== undefined && (
                          <span className="ml-2 text-sm">({formatPercent(category.spendingVariancePercent)})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utilization Section */}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    {category.utilizationUnit ? category.utilizationUnit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Utilization'}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                      <div className="text-lg font-medium text-gray-900">{formatNumber(category.utilizationBenchmark)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Actual</div>
                      <div className={`text-lg font-bold ${(category.utilizationVariancePercent ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(category.utilizationActual)}
                        {category.utilizationVariancePercent !== null && category.utilizationVariancePercent !== undefined && (
                          <span className="ml-2 text-sm">({formatPercent(category.utilizationVariancePercent)})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-24 w-px bg-gray-300"></div>

              {/* Right: Variance Summary and Explore */}
              <div className="flex flex-col items-end justify-between h-24 min-w-[280px]">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {(() => {
                      const variance = category.spendingVariancePercent ?? 0;
                      const color = getVarianceColor(variance);
                      const colorClasses = {
                        red: 'text-red-900',
                        amber: 'text-amber-900',
                        green: 'text-green-900',
                        gray: 'text-gray-900'
                      };

                      return (
                        <>
                          <div className={`text-3xl font-bold ${colorClasses[color]}`}>
                            {category.spendingVarianceAmount !== null && category.spendingVarianceAmount !== undefined
                              ? formatCurrency(Math.abs(category.spendingVarianceAmount))
                              : '$0'}
                          </div>
                          {category.trendPercent !== null && category.trendPercent !== undefined && (
                            <div className={`flex items-center gap-1 ${category.trendPercent < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              <span className="text-lg font-semibold">{formatPercent(category.trendPercent)}</span>
                              <TrendingUp className={`w-5 h-5 ${category.trendPercent < 0 ? 'rotate-180' : ''}`} />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    {(() => {
                      const variance = category.spendingVariancePercent ?? 0;
                      const color = getVarianceColor(variance);

                      if (color === 'amber') {
                        return (
                          <>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded uppercase tracking-wide border border-amber-300">
                              WATCH
                            </span>
                            <span className="text-sm text-gray-600">
                              ±3% of benchmark
                            </span>
                          </>
                        );
                      }

                      return (
                        <span className="text-sm text-gray-600">
                          {variance > 0 ? 'above benchmark spending' : 'below benchmark spending'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                  Explore
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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
