import { useState, useEffect } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import type { CostCategory, Recommendation, PerformancePeriod } from '../../types';

interface Props {
  categorySlug: string;
  onBack: () => void;
  onNavigateToRecommendation?: (recId: number, categoryName: string) => void;
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
  period: PerformancePeriod;
  recommendations: Recommendation[];
  hospitals: Hospital[];
  drgs: DRG[];
  dischargingHospitals: DischargingHospital[];
}

export default function CategoryDrilldown({ categorySlug, onBack, onNavigateToRecommendation }: Props) {
  const [data, setData] = useState<CategoryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');

  useEffect(() => {
    fetchData();
  }, [categorySlug, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cost-categories?slug=${categorySlug}&periodKey=${selectedPeriod}`);

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
      maximumFractionDigits: hasDecimals ? 1 : 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-700 mb-2">Error Loading Data</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { category, recommendations, hospitals, drgs, dischargingHospitals } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-light mb-1">{category.categoryName}</h1>
          <p className="text-sm text-gray-500 italic">All data risk-adjusted</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ytd">YTD</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="last_quarter">Last Quarter</option>
            </select>
          </div>
          <span className="text-xs text-gray-700 font-normal">
            {data?.period.startDate && data?.period.endDate ? (
              (() => {
                // Parse YYYY-MM-DD as local date to avoid timezone issues
                const [startYear, startMonth, startDay] = data.period.startDate.split('-').map(Number);
                const [endYear, endMonth, endDay] = data.period.endDate.split('-').map(Number);
                const startDate = new Date(startYear, startMonth - 1, startDay);
                const endDate = new Date(endYear, endMonth - 1, endDay);
                return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
              })()
            ) : (data?.period.periodLabel || '')}
          </span>
        </div>
      </div>

      {/* Top Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Top recommendations</h2>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
              >
                {/* Left side: Content (90%) */}
                <div className="flex-1" style={{ flexBasis: '90%' }}>
                  {/* Title */}
                  <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                    {rec.title}
                    <Info className="w-4 h-4 text-gray-400" />
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                  {/* Cost areas */}
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                      <span className="font-medium">Cost area(s):</span>
                      {rec.affectedCategories && rec.affectedCategories.length > 0 ? (
                        <>
                          {rec.affectedCategories.slice(0, 3).map((cat) => (
                            <button
                              key={cat.categoryId}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                            >
                              {cat.categoryName}
                            </button>
                          ))}
                        </>
                      ) : (
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {category.categoryName}
                        </button>
                      )}
                      {rec.impactAmount && (
                        <>
                          <span>totaling</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(rec.impactAmount)}</span>
                          {category.spendingVarianceAmount && (
                            <span>
                              ({Math.round((parseFloat(rec.impactAmount.toString()) / parseFloat(category.spendingVarianceAmount.toString())) * 100)}%)
                            </span>
                          )}
                        </>
                      )}
                      {rec.affectedLives && (
                        <>
                          <span>from</span>
                          <a href="#" className="text-blue-600 hover:underline font-medium">
                            {formatNumber(rec.affectedLives)} {rec.patientCohort || 'high-need patients'}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="w-px bg-gray-200"></div>

                {/* Right side: Actions (10%) */}
                <div className="flex flex-col justify-between items-end" style={{ flexBasis: '10%' }}>
                  {/* Status dropdown */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm text-gray-600 font-medium">Status:</label>
                    <select
                      value={rec.status}
                      onChange={(e) => {
                        // TODO: Update status in database
                        console.log('Update status to:', e.target.value);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  {/* Explore link */}
                  <button
                    onClick={() => onNavigateToRecommendation && onNavigateToRecommendation(rec.id, category.categoryName)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    Explore
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Section */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">Details</h2>

        {/* IRF Hospitals */}
        {hospitals && hospitals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">IRF Hospitals</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Inpatient Rehabilitation</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700"># IRF Discharges</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg. LOS</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg. Paid per Stay</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">1-Day Readmission Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital, idx) => (
                    <tr key={hospital.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-900">{hospital.hospitalName}</td>
                      <td className="py-3 px-4 text-gray-900">{formatNumber(hospital.discharges)}</td>
                      <td className="py-3 px-4 text-gray-900">{formatNumber(hospital.avgLos)}</td>
                      <td className="py-3 px-4 text-gray-900">{formatCurrency(hospital.spend)}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {hospital.readmissionRate !== null && hospital.readmissionRate !== undefined
                          ? `${formatNumber(hospital.readmissionRate)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Discharging Hospital */}
        {dischargingHospitals && dischargingHospitals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Discharging Hospital</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Prior Hospital</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700"># IRF Discharges</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">% Discharges to IRF</th>
                  </tr>
                </thead>
                <tbody>
                  {dischargingHospitals.map((hospital, idx) => (
                    <tr key={hospital.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-900">{hospital.hospitalName}</td>
                      <td className="py-3 px-4 text-gray-900">{formatNumber(hospital.discharges)}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {hospital.percentDischargedToIrf !== null && hospital.percentDischargedToIrf !== undefined
                          ? `${formatNumber(hospital.percentDischargedToIrf)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRGs */}
        {drgs && drgs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">DRGs</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">DRG Family</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">DRGs</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700"># of Discharges to IRF</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">% Discharged to IRF - Actual</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">% Discharged to IRF - Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {drgs.map((drg, idx) => (
                    <tr key={drg.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-900">{drg.drgDescription}</td>
                      <td className="py-3 px-4 text-gray-900 font-mono">{drg.drgCode}</td>
                      <td className="py-3 px-4 text-gray-900">{formatNumber(drg.patientCount)}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {drg.percentAboveBenchmark !== null && drg.percentAboveBenchmark !== undefined
                          ? `${formatNumber(drg.percentAboveBenchmark)}%`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {drg.benchmarkAvg !== null && drg.benchmarkAvg !== undefined
                          ? `${formatNumber(drg.benchmarkAvg)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
