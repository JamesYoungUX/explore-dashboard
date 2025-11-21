import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

type TopDoctor = {
  name: string;
  spend: number;
  patients: number;
  avgPerPatient: number;
  benchmarkAvg: number;
  topPerformerAvg: number;
  percentAboveBenchmark: number;
  costDrivers: string;
  opportunities: string;
};

type GapCategory = {
  category: string;
  amount: number;
  percent: number;
  color: string;
  topDoctors: TopDoctor[];
};

interface Props {
  onBack: () => void;
}

export default function TopDoctors({ onBack }: Props) {
  const [gapBreakdown, setGapBreakdown] = useState<GapCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/top-doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch top doctors');
        }
        const result = await response.json();
        setGapBreakdown(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const badgeClasses = ['bg-red-100 text-red-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
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
          <h1 className="text-4xl font-light">Top Doctors by Spend</h1>
          <p className="text-gray-600 mt-2">Physicians contributing most to cost gaps across all categories</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {gapBreakdown.map((item) => (
          <div
            key={item.category}
            className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-light">{item.category}</h2>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  item.color === 'red' ? 'bg-red-100 text-red-700' :
                  item.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.percent}% of gap
                </span>
              </div>
              <div className="text-xl font-light text-red-600">${(Number(item.amount) / 1000).toFixed(0)}K</div>
            </div>

            <div className="space-y-2">
              {item.topDoctors.map((doctor, idx) => (
                <div key={`${item.category}-${doctor.name}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        badgeClasses[idx % badgeClasses.length]
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.patients} patients • {formatCurrency(Number(doctor.avgPerPatient))} avg/patient</div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-red-600">{formatCurrency(Number(doctor.spend))}</div>
                  </div>

                  {/* Benchmark comparison */}
                  {doctor.benchmarkAvg && (
                    <div className="mt-3 ml-12 grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/80 rounded p-3">
                        <div className="text-gray-500">Benchmark Avg</div>
                        <div className="font-medium">{formatCurrency(Number(doctor.benchmarkAvg))}</div>
                      </div>
                      <div className="bg-white/80 rounded p-3">
                        <div className="text-gray-500">Efficiently Managed</div>
                        <div className="font-medium text-green-600">{formatCurrency(Number(doctor.topPerformerAvg))}</div>
                      </div>
                      <div className="bg-white/80 rounded p-3">
                        <div className="text-gray-500">Above Benchmark</div>
                        <div className="font-medium text-red-600">+{doctor.percentAboveBenchmark}%</div>
                      </div>
                    </div>
                  )}

                  {doctor.costDrivers && (
                    <div className="mt-3 ml-12 text-sm text-gray-600 bg-white/80 rounded p-3">
                      <span className="font-medium text-gray-700">Cost drivers: </span>
                      {doctor.costDrivers}
                    </div>
                  )}

                  {doctor.opportunities && (
                    <div className="mt-2 ml-12 text-sm text-green-700 bg-green-50 rounded p-3">
                      <span className="font-medium">Opportunities: </span>
                      {doctor.opportunities}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
