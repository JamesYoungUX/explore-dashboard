import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ProblemArea } from '../../types';

type TopDoctor = {
  name: string;
  spend: number;
  patient_count: number;
  avg_per_patient: number;
  benchmark_avg: number;
  top_performer_avg: number;
  percent_above_benchmark: number;
  cost_drivers: string;
  opportunities: string;
};

type TopPatient = {
  name: string;
  age: number;
  spend: number;
  spend_category: string;
  cost_drivers: string;
};

type GapData = {
  category: string;
  amount: number;
  percent: number;
  description: string;
  color: string;
  topDoctors: TopDoctor[];
  topPatients: TopPatient[];
};

interface Props {
  gapType: ProblemArea;
  onBack: () => void;
}

export default function GapDrilldown({ gapType, onBack }: Props) {
  const [data, setData] = useState<GapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gap-categories?slug=${gapType}`);
        if (!response.ok) {
          throw new Error('Failed to fetch gap data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gapType]);

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

  if (error || !data) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <p className="text-red-500">{error || 'Gap data not found'}</p>
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
          <h1 className="text-4xl font-light">{data.category}</h1>
          <p className="text-gray-600 mt-2">{data.description}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-light text-red-600">${(Number(data.amount) / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-500">{data.percent}% of total gap</div>
        </div>
      </div>

      {/* Top Doctors */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-light mb-4">Top Doctors by Spend</h2>
        <div className="space-y-3">
          {data.topDoctors.map((doctor, idx) => (
            <div key={doctor.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    badgeClasses[idx % badgeClasses.length]
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-sm text-gray-500">{doctor.patient_count} patients • {formatCurrency(Number(doctor.avg_per_patient))} avg/patient</div>
                  </div>
                </div>
                <div className="text-lg font-medium text-red-600">{formatCurrency(Number(doctor.spend))}</div>
              </div>

              {/* Benchmark comparison */}
              {doctor.benchmark_avg && (
                <div className="mt-3 ml-12 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/80 rounded p-3">
                    <div className="text-gray-500">Benchmark Avg</div>
                    <div className="font-medium">{formatCurrency(Number(doctor.benchmark_avg))}</div>
                  </div>
                  <div className="bg-white/80 rounded p-3">
                    <div className="text-gray-500">Efficiently Managed</div>
                    <div className="font-medium text-green-600">{formatCurrency(Number(doctor.top_performer_avg))}</div>
                  </div>
                  <div className="bg-white/80 rounded p-3">
                    <div className="text-gray-500">Above Benchmark</div>
                    <div className="font-medium text-red-600">+{doctor.percent_above_benchmark}%</div>
                  </div>
                </div>
              )}

              {doctor.cost_drivers && (
                <div className="mt-3 ml-12 text-sm text-gray-600 bg-white/80 rounded p-3">
                  <span className="font-medium text-gray-700">Cost drivers: </span>
                  {doctor.cost_drivers}
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

      {/* Top Patients */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-light mb-4">Top Patients by Spend</h2>
        <div className="space-y-3">
          {data.topPatients.map((patient, idx) => (
            <div key={patient.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    badgeClasses[idx % badgeClasses.length]
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">Age {patient.age} • {patient.spend_category}</div>
                  </div>
                </div>
                <div className="text-lg font-medium text-red-600">{formatCurrency(Number(patient.spend))}</div>
              </div>
              {patient.cost_drivers && (
                <div className="mt-3 ml-12 text-sm text-gray-600 bg-white/80 rounded p-3">
                  <span className="font-medium text-gray-700">Cost drivers: </span>
                  {patient.cost_drivers}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
