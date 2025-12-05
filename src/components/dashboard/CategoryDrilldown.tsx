import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Building2, FileText, Users } from 'lucide-react';
import type { CostCategory, Recommendation } from '../../types';

interface Props {
  categorySlug: string;
  onBack: () => void;
  onNavigateToRecommendation?: (recId: number) => void;
}

interface Hospital {
  id: number;
  hospitalName: string;
  discharges: number;
  avgLos: number;
  spend: number;
  readmissionRate?: number;
}

interface DRG {
  id: number;
  drgCode: string;
  drgDescription: string;
  patientCount: number;
  totalSpend: number;
  avgSpendPerPatient: number;
  benchmarkAvg?: number;
  percentAboveBenchmark?: number;
}

interface DischargingHospital {
  id: number;
  hospitalName: string;
  discharges: number;
  percentDischargedToIrf?: number;
  percentDischargedToIrfBenchmark?: number;
}

interface CategoryDetailResponse {
  category: CostCategory;
  recommendations: Recommendation[];
  hospitals: Hospital[];
  drgs: DRG[];
  dischargingHospitals: DischargingHospital[];
}

export default function CategoryDrilldown({ categorySlug, onBack, onNavigateToRecommendation }: Props) {
  const [data, setData] = useState<CategoryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [categorySlug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/api/cost-categories?slug=${categorySlug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch category details');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching category details:', err);
    } finally {
      setLoading(false);
    }
  };

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
      case 'red': return 'Priority - Needs Attention';
      case 'yellow': return 'Watch - Monitor Closely';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading category details...</div>
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

  const { category, recommendations, hospitals, drgs, dischargingHospitals } = data;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(category.performanceStatus)}`} />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">{category.categoryName}</h1>
          </div>
          <p className="text-sm text-gray-500">{getStatusLabel(category.performanceStatus)}</p>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Performance Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">Spending (PMPM)</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Actual</div>
                <div className="text-3xl font-light">{formatCurrency(category.spendingPmpmActual)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                <div className="text-3xl font-light text-gray-600">{formatCurrency(category.spendingPmpmBenchmark)}</div>
              </div>
            </div>
            {category.spendingVariancePercent !== null && category.spendingVariancePercent !== undefined && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Variance vs Benchmark</span>
                <div className={`text-lg font-semibold flex items-center gap-2 ${getVarianceColor(category.spendingVariancePercent)}`}>
                  {category.spendingVariancePercent > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{formatPercent(category.spendingVariancePercent)}</span>
                  {category.spendingVarianceAmount !== null && category.spendingVarianceAmount !== undefined && (
                    <span className="text-sm">({formatCurrency(Math.abs(category.spendingVarianceAmount))})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Utilization */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Utilization {category.utilizationUnit && `(${category.utilizationUnit.replace(/_/g, ' ')})`}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Actual</div>
                <div className="text-3xl font-light">{formatNumber(category.utilizationActual)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Benchmark</div>
                <div className="text-3xl font-light text-gray-600">{formatNumber(category.utilizationBenchmark)}</div>
              </div>
            </div>
            {category.utilizationVariancePercent !== null && category.utilizationVariancePercent !== undefined && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600 font-medium">Variance vs Benchmark</span>
                <div className={`text-lg font-semibold flex items-center gap-2 ${getVarianceColor(category.utilizationVariancePercent)}`}>
                  {category.utilizationVariancePercent > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{formatPercent(category.utilizationVariancePercent)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {category.acoRank && category.totalCategories && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-sm text-blue-800">
              <span className="font-semibold">ACO Ranking:</span> #{category.acoRank} out of {category.totalCategories} practices
            </div>
          </div>
        )}
      </div>

      {/* Related Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-light mb-4">Recommended Actions</h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigateToRecommendation && onNavigateToRecommendation(rec.id)}
              >
                <div className="font-medium mb-2">{rec.title}</div>
                <div className="text-sm text-gray-600 mb-3">{rec.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {rec.estimatedSavings && (
                    <span className="text-green-600 font-medium">{formatCurrency(rec.estimatedSavings)} potential savings</span>
                  )}
                  {rec.affectedLives && (
                    <span>{rec.affectedLives.toLocaleString()} patients</span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 rounded capitalize">{rec.priority} priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hospitals */}
      {hospitals && hospitals.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-light">Hospital Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Hospital</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Discharges</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Avg LOS</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Total Spend</th>
                  {hospitals.some(h => h.readmissionRate !== null && h.readmissionRate !== undefined) && (
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Readmit Rate</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {hospitals.map((hospital) => (
                  <tr key={hospital.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{hospital.hospitalName}</td>
                    <td className="py-3 px-2 text-right">{hospital.discharges}</td>
                    <td className="py-3 px-2 text-right">{formatNumber(hospital.avgLos)} days</td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(hospital.spend)}</td>
                    {hospitals.some(h => h.readmissionRate !== null && h.readmissionRate !== undefined) && (
                      <td className="py-3 px-2 text-right">
                        {hospital.readmissionRate !== null && hospital.readmissionRate !== undefined
                          ? `${formatNumber(hospital.readmissionRate)}%`
                          : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRGs */}
      {drgs && drgs.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-light">Top DRG Codes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">DRG</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Patients</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Avg Cost</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Benchmark</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Variance</th>
                </tr>
              </thead>
              <tbody>
                {drgs.map((drg) => (
                  <tr key={drg.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono font-semibold">{drg.drgCode}</td>
                    <td className="py-3 px-2">{drg.drgDescription}</td>
                    <td className="py-3 px-2 text-right">{drg.patientCount}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(drg.avgSpendPerPatient)}</td>
                    <td className="py-3 px-2 text-right text-gray-600">
                      {drg.benchmarkAvg ? formatCurrency(drg.benchmarkAvg) : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {drg.percentAboveBenchmark !== null && drg.percentAboveBenchmark !== undefined ? (
                        <span className={getVarianceColor(drg.percentAboveBenchmark)}>
                          {formatPercent(drg.percentAboveBenchmark)}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discharging Hospitals */}
      {dischargingHospitals && dischargingHospitals.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-light">Discharging Hospitals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Hospital</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Discharges</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">% to IRF</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Benchmark</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Variance</th>
                </tr>
              </thead>
              <tbody>
                {dischargingHospitals.map((hospital) => (
                  <tr key={hospital.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{hospital.hospitalName}</td>
                    <td className="py-3 px-2 text-right">{hospital.discharges}</td>
                    <td className="py-3 px-2 text-right">
                      {hospital.percentDischargedToIrf !== null && hospital.percentDischargedToIrf !== undefined
                        ? `${formatNumber(hospital.percentDischargedToIrf)}%`
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600">
                      {hospital.percentDischargedToIrfBenchmark !== null && hospital.percentDischargedToIrfBenchmark !== undefined
                        ? `${formatNumber(hospital.percentDischargedToIrfBenchmark)}%`
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {hospital.percentDischargedToIrf !== null &&
                        hospital.percentDischargedToIrf !== undefined &&
                        hospital.percentDischargedToIrfBenchmark !== null &&
                        hospital.percentDischargedToIrfBenchmark !== undefined ? (
                        <span className={getVarianceColor(hospital.percentDischargedToIrf - hospital.percentDischargedToIrfBenchmark)}>
                          {formatPercent(hospital.percentDischargedToIrf - hospital.percentDischargedToIrfBenchmark)}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
