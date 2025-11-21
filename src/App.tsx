import { useState } from 'react';
import DashboardOverview from './components/dashboard/DashboardOverview';
import HighCostPatients from './components/workflows/HighCostPatients';
import PreventableReadmissions from './components/workflows/PreventableReadmissions';
import EDOverutilization from './components/workflows/EDOverutilization';
import MedicationAdherence from './components/workflows/MedicationAdherence';
import CareGaps from './components/workflows/CareGaps';
import ReferralLeakage from './components/workflows/ReferralLeakage';
import SharedSavings from './components/workflows/SharedSavings';
import TopDoctors from './components/workflows/TopDoctors';
import TopPatients from './components/workflows/TopPatients';
import GapDrilldown from './components/workflows/GapDrilldown';
import type { ProblemArea } from './types';

function App() {
  const [activeView, setActiveView] = useState<ProblemArea | 'overview'>('overview');

  const renderView = () => {
    switch (activeView) {
      case 'shared-savings':
        return <SharedSavings onBack={() => setActiveView('overview')} onNavigate={setActiveView} />;
      case 'high-cost-patients':
        return <HighCostPatients onBack={() => setActiveView('overview')} />;
      case 'readmissions':
        return <PreventableReadmissions onBack={() => setActiveView('overview')} />;
      case 'ed-overutilization':
      case 'ed-utilization':
        return <EDOverutilization onBack={() => setActiveView('overview')} />;
      case 'medication-adherence':
        return <MedicationAdherence onBack={() => setActiveView('overview')} />;
      case 'care-gaps':
      case 'quality-performance':
        return <CareGaps onBack={() => setActiveView('overview')} />;
      case 'referral-leakage':
      case 'network-leakage':
        return <ReferralLeakage onBack={() => setActiveView('overview')} />;
      case 'attribution':
        return <HighCostPatients onBack={() => setActiveView('overview')} />;
      case 'top-doctors':
        return <TopDoctors onBack={() => setActiveView('shared-savings')} />;
      case 'top-patients':
        return <TopPatients onBack={() => setActiveView('shared-savings')} />;
      case 'gap-dme':
      case 'gap-specialty-drugs':
      case 'gap-outpatient-surgery':
      case 'gap-inpatient-surgery':
      case 'gap-post-acute':
      case 'gap-inpatient-medical':
        return <GapDrilldown gapType={activeView} onBack={() => setActiveView('shared-savings')} />;
      default:
        return <DashboardOverview onSelectArea={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/30">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-[#111111] text-white px-8 py-6 rounded-2xl mb-8 flex items-center justify-between">
          <div className="text-4xl font-light"><span className="font-bold text-[#FFD85F]">Stellar</span>Metrics</div>
          <div className="flex gap-4 text-lg">
            <button className="px-6 py-3 bg-[#FFD85F] text-black rounded-lg font-medium">Dashboard</button>
            <button className="px-6 py-3 hover:bg-white/10 rounded-lg">Reports</button>
            <button className="px-6 py-3 hover:bg-white/10 rounded-lg">Settings</button>
          </div>
        </div>
        {renderView()}
      </div>
    </div>
  );
}

export default App;
