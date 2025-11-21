import { ArrowLeft, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';
import type { ProblemArea } from '../../types';

type GapCategory = {
  category: string;
  amount: number;
  percent: number;
  description: string;
  current: string;
  lastYear: string;
  topPerformer: string;
  solutions: string[];
  color: 'red' | 'amber' | 'blue';
  gapRoute: ProblemArea;
};

interface Props {
  onBack: () => void;
  onNavigate: (view: ProblemArea) => void;
}

export default function SharedSavings({ onBack, onNavigate }: Props) {
  const gapBreakdown: GapCategory[] = [
    {
      category: 'DME and Supplies',
      amount: 84000,
      percent: 20,
      description: '68% above benchmark spend',
      current: '$310 per patient',
      lastYear: '$285 per patient',
      topPerformer: '$100 per patient',
      solutions: [
        'Implement preferred DME supplier network with negotiated rates',
        'Provider education on appropriate DME utilization',
        'Prior authorization for high-cost DME items over $500'
      ],
      color: 'red',
      gapRoute: 'gap-dme',
    },
    {
      category: 'Medical Drugs (Specialty)',
      amount: 74000,
      percent: 18,
      description: '36% above benchmark - high-cost biologics',
      current: '$26,750 per patient',
      lastYear: '$24,200 per patient',
      topPerformer: '$17,025 per patient',
      solutions: [
        'Implement step therapy protocols for biologics',
        'Negotiate bundled payment arrangements with specialists',
        'Deploy intensive care management for patients on specialty drugs'
      ],
      color: 'red',
      gapRoute: 'gap-specialty-drugs',
    },
    {
      category: 'Outpatient Surgery',
      amount: 65000,
      percent: 15,
      description: '31% above benchmark utilization',
      current: '$27,430 per patient',
      lastYear: '$25,100 per patient',
      topPerformer: '$18,840 per patient',
      solutions: [
        'Counsel patients on conservative treatment options first',
        'Steer patients towards higher-value surgical specialists',
        'Effective chronic disease management to delay procedures'
      ],
      color: 'amber',
      gapRoute: 'gap-outpatient-surgery',
    },
    {
      category: 'Inpatient Surgery',
      amount: 55000,
      percent: 13,
      description: '29% above benchmark costs',
      current: '$25,440 per patient',
      lastYear: '$23,800 per patient',
      topPerformer: '$18,180 per patient',
      solutions: [
        'Long-term PCP care to reduce need for procedures',
        'Pre-surgical optimization programs',
        'Negotiate bundled payment arrangements for common procedures'
      ],
      color: 'amber',
      gapRoute: 'gap-inpatient-surgery',
    },
    {
      category: 'Post-Acute Rehab',
      amount: 51000,
      percent: 12,
      description: '71% above benchmark - excessive utilization',
      current: '$9,455 per patient',
      lastYear: '$8,200 per patient',
      topPerformer: '$2,755 per patient',
      solutions: [
        'Implement discharge planning protocols with hospital teams',
        'Promote home-based rehab over facility-based when appropriate',
        'Care coordination for post-acute transitions'
      ],
      color: 'amber',
      gapRoute: 'gap-post-acute',
    },
    {
      category: 'Inpatient Medical',
      amount: 31000,
      percent: 7,
      description: '6% above benchmark admissions',
      current: '$24,780 per patient',
      lastYear: '$23,500 per patient',
      topPerformer: '$23,400 per patient',
      solutions: [
        'Better management of chronic conditions to prevent admissions',
        'Deploy care management for high-risk patients',
        'Implement transitional care programs'
      ],
      color: 'blue',
      gapRoute: 'gap-inpatient-medical',
    },
  ];

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
          <h1 className="text-4xl font-light">Shared Savings Target Shortfall</h1>
          <p className="text-gray-600 mt-2">$420K gap to close • Performance year ends Q1</p>
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
              <div className="text-2xl font-light text-red-900">22% Below Target</div>
              <div className="text-sm text-red-700 font-light mt-1">1,522 attributed lives • Target PMPM: $950 • Actual: $1,042</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-light text-red-600">$420K</div>
            <div className="text-sm text-red-700 font-light">Gap to Close</div>
          </div>
        </div>
        
        {/* Benchmark Comparison */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-red-200">
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Current PMPM</div>
            <div className="text-2xl font-light text-red-900">$1,042</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Last Year</div>
            <div className="text-2xl font-light text-red-900">$1,020</div>
            <div className="text-xs text-red-600">+2.2% increase</div>
          </div>
          <div>
            <div className="text-xs text-red-700 font-light mb-1">Well Performing</div>
            <div className="text-2xl font-light text-red-900">$950</div>
            <div className="text-xs text-red-600">-$92 gap</div>
          </div>
        </div>
      </div>

      {/* Action Plan - Moved Up */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">⭐ Stellar Suggests: Priority Actions</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-red-600 font-medium">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Implement preferred DME supplier network with negotiated rates</h3>
              <p className="text-sm text-gray-600 mb-2">Target $84K reduction in DME and supplies spending</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Owner: Network Contracting</span>
                <span>•</span>
                <span>Timeline: 30 days</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-red-600 font-medium">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Implement step therapy protocols for specialty biologics</h3>
              <p className="text-sm text-gray-600 mb-2">Target $74K reduction in specialty drug spending</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Owner: Pharmacy Management</span>
                <span>•</span>
                <span>Timeline: 45 days</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-amber-600 font-medium">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Steer patients towards higher-value surgical specialists</h3>
              <p className="text-sm text-gray-600 mb-2">Target $65K reduction in outpatient surgery costs</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Owner: Care Coordination</span>
                <span>•</span>
                <span>Timeline: 60 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Breakdown */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-light mb-6">Gap Breakdown by Category</h2>
        
        <div className="space-y-6">
          {gapBreakdown.map((item) => (
            <div 
              key={item.category}
              className="p-6 bg-white rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-6 mb-4">
                <div className={`w-12 h-12 ${
                  item.color === 'red' ? 'bg-red-100' :
                  item.color === 'amber' ? 'bg-amber-100' : 'bg-blue-100'
                } rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${
                    item.color === 'red' ? 'text-red-600' :
                    item.color === 'amber' ? 'text-amber-600' : 'text-blue-600'
                  }`} strokeWidth={2} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-normal">{item.category}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      item.color === 'red' ? 'bg-red-100 text-red-700' :
                      item.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.percent}% of gap
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-light text-red-600">${(item.amount / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">Opportunity</div>
                </div>
              </div>
              
              {/* Benchmark Comparison */}
              <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Current</div>
                  <div className="text-sm font-medium">{item.current}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Last Year</div>
                  <div className="text-sm font-medium">{item.lastYear}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Well Run</div>
                  <div className="text-sm font-medium">{item.topPerformer}</div>
                </div>
              </div>
              
              {/* Solutions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Solutions:</div>
                <div className="space-y-1">
                  {item.solutions.map((solution, idx) => (
                    <div key={idx} className="text-sm text-gray-600">• {solution}</div>
                  ))}
                </div>
              </div>

              {/* Link to category drill-down */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => onNavigate(item.gapRoute)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Top Doctors & Patients
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation links to drill-down pages */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={() => onNavigate('top-doctors')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            View All Top Doctors
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('top-patients')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            View All Top Patients
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
