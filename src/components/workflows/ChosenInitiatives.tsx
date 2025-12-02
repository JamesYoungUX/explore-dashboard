import { ArrowLeft, CheckCircle, Clock, Users, Target } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function ChosenInitiatives({ onBack }: Props) {
  const chosenInitiatives = [
    {
      id: 1,
      title: "Transitional Care Program",
      description: "Deploy care coordination for high-risk discharges",
      opportunities: ["Reduce inpatient medical spend", "Lower post-acute care utilization"],
      status: "in-progress",
      startDate: "2024-10-15",
      targetCompletion: "2025-01-30",
      assignedTo: "Care Management Team",
      expectedImpact: "$180K annual savings",
      progress: 45,
      stellarActionItems: 12,
      stellarPatients: 89
    },
    {
      id: 2,
      title: "Colorectal Screening Outreach",
      description: "Intensive patient outreach for overdue screenings",
      opportunities: ["Improve breast cancer screening rate", "Increase colorectal screening completion"],
      status: "completed",
      startDate: "2024-09-01",
      targetCompletion: "2024-11-30",
      assignedTo: "Quality Team",
      expectedImpact: "$120K quality bonus retention",
      progress: 100,
      stellarActionItems: 0,
      stellarPatients: 411
    },
    {
      id: 3,
      title: "After-Hours On-Call Service",
      description: "Implement extended availability for urgent patient needs",
      opportunities: ["Increase attribution retention", "Improve patient access"],
      status: "planning",
      startDate: "2025-02-01",
      targetCompletion: "2025-04-15",
      assignedTo: "Practice Operations",
      expectedImpact: "$95K revenue protection",
      progress: 15,
      stellarActionItems: 8,
      stellarPatients: 156
    },
    {
      id: 4,
      title: "Specialist Referral Prior Auth",
      description: "Implement prior authorization process for high-cost referrals",
      opportunities: ["Reduce inpatient medical spend", "Decrease specialist referral costs"],
      status: "in-progress",
      startDate: "2024-11-01",
      targetCompletion: "2025-02-28",
      assignedTo: "Utilization Management",
      expectedImpact: "$210K cost reduction",
      progress: 65,
      stellarActionItems: 15,
      stellarPatients: 234
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'planning': return <Target className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl font-light">Initiatives</h1>
          <p className="text-gray-600 mt-2">Track implementation of selected recommendations</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-light">1</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-light">2</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-light">1</div>
              <div className="text-sm text-gray-600">Planning</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-light">890</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives List */}
      <div className="space-y-4">
        {chosenInitiatives.map((initiative) => (
          <div key={initiative.id} className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-normal">{initiative.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 ${getStatusColor(initiative.status)}`}>
                    {getStatusIcon(initiative.status)}
                    {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{initiative.description}</p>
                
                {/* Opportunities Addressed */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-800 mb-2">Addresses Opportunities:</div>
                  <div className="flex flex-wrap gap-2">
                    {initiative.opportunities.map((opp, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {opp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-6">
                <div className="text-lg font-medium text-green-600 mb-1">{initiative.expectedImpact}</div>
                <div className="text-sm text-gray-500">Expected Impact</div>
              </div>
            </div>

            {/* Progress Bar */}
            {initiative.status !== 'planning' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{initiative.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      initiative.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${initiative.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-500 mb-1">Timeline</div>
                <div className="text-sm font-medium">
                  {new Date(initiative.startDate).toLocaleDateString()} → {new Date(initiative.targetCompletion).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Assigned To</div>
                <div className="text-sm font-medium">{initiative.assignedTo}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Stellar Action Items</div>
                <div className="text-sm font-medium">
                  {initiative.stellarActionItems > 0 ? (
                    <span className="text-blue-600">{initiative.stellarActionItems} active items</span>
                  ) : (
                    <span className="text-gray-400">No active items</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Target Patients</div>
                <div className="text-sm font-medium text-blue-600">{initiative.stellarPatients} patients</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}