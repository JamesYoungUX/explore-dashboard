import { useState, useEffect } from 'react';
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
import AttributionDecline from './components/workflows/AttributionDecline';
import ChosenInitiatives from './components/workflows/ChosenInitiatives';
import type { ProblemArea } from './types';

function App() {
  const [activeView, setActiveView] = useState<ProblemArea | 'overview'>('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

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
        return <AttributionDecline onBack={() => setActiveView('overview')} />;
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
      case 'chosen-initiatives':
        return <ChosenInitiatives onBack={() => setActiveView('overview')} />;
      default:
        return <DashboardOverview onSelectArea={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 2xl:p-12 bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/30">
      <div className="max-w-[1600px] 2xl:max-w-[2000px] mx-auto">
        <div className="bg-[#111111] text-white px-4 sm:px-6 lg:px-8 py-4 lg:py-6 rounded-2xl mb-6 lg:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-light"><span className="font-bold text-[#FFD85F]">Stellar</span>Metrics</div>
          <div className="flex gap-2 sm:gap-4 2xl:gap-6 text-sm sm:text-base lg:text-lg 2xl:text-xl flex-wrap">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium ${activeView === 'overview' ? 'bg-[#FFD85F] text-black' : 'hover:bg-white/10'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('chosen-initiatives')}
              className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium ${activeView === 'chosen-initiatives' ? 'bg-[#FFD85F] text-black' : 'hover:bg-white/10'
                }`}
            >
              Initiatives
            </button>
            <button className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 hover:bg-white/10 rounded-lg hidden sm:block">Reports</button>
            <button className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 hover:bg-white/10 rounded-lg hidden sm:block">Settings</button>
          </div>
        </div>
        {renderView()}
      </div>
    </div>
  );
}

export default App;
