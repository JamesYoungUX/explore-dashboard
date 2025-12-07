import { useState, useEffect } from 'react';
import DashboardOverview from './components/dashboard/DashboardOverview';
import CostPerformanceInsights from './components/dashboard/CostPerformanceInsights';
import CostSavingDeepDive from './components/dashboard/CostSavingDeepDive';
import CategoryDrilldown from './components/dashboard/CategoryDrilldown';
import RecommendationDetail from './components/dashboard/RecommendationDetail';
import Recommendations from './components/dashboard/Recommendations';
import ProgressTracking from './components/dashboard/ProgressTracking';
import Settings from './components/dashboard/Settings';
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
  const [activeView, setActiveView] = useState<ProblemArea | 'overview'>('cost-performance-insights');
  const [navigationHistory, setNavigationHistory] = useState<(ProblemArea | 'overview')[]>(['cost-performance-insights']);
  const [recommendationId, setRecommendationId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Page visibility settings (default off)
  const [pageVisibility, setPageVisibility] = useState(() => {
    const saved = localStorage.getItem('pageVisibility');
    return saved ? JSON.parse(saved) : {
      dashboard: false,
      initiatives: false,
    };
  });

  // Custom navigation function that tracks history
  const navigateTo = (view: ProblemArea | 'overview', recId?: number, catName?: string) => {
    setNavigationHistory(prev => [...prev, view]);
    setActiveView(view);
    setRecommendationId(recId ?? null);
    if (catName) setCategoryName(catName);
  };

  // Go back function
  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousView = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveView(previousView);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  // Save page visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pageVisibility', JSON.stringify(pageVisibility));
  }, [pageVisibility]);

  const renderView = () => {
    // Handle category drill-down (e.g., 'acute-rehab', 'specialty-drugs')
    // Check if we're viewing a cost category detail by checking against known category slugs
    const categorySlugs = [
      'acute-rehab', 'avoidable-ed-visits', 'generic-drugs', 'inpatient-medical',
      'ip-surgical', 'lab-services', 'op-radiology', 'op-surgical',
      'preventive-care', 'primary-care', 'radiology', 'skilled-nursing'
    ];
    if (categorySlugs.includes(activeView as string)) {
      return <CategoryDrilldown categorySlug={activeView as string} onBack={goBack} onNavigateToRecommendation={(recId, catName) => navigateTo('recommendation-detail', recId, catName)} />;
    }

    switch (activeView) {
      case 'recommendation-detail':
        return <RecommendationDetail recommendationId={recommendationId || 0} categoryName={categoryName || undefined} onBack={goBack} />;
      case 'cost-performance-insights':
        return <CostPerformanceInsights onNavigate={navigateTo} />;
      case 'cost-categories':
        return <CostSavingDeepDive onNavigate={(slug) => navigateTo(slug as ProblemArea)} />;
      case 'recommendations':
        return <Recommendations onBack={goBack} onNavigate={(slug) => navigateTo(slug as ProblemArea)} initialRecId={recommendationId} />;
      case 'progress-tracking':
        return <ProgressTracking onBack={goBack} />;
      case 'shared-savings':
        return <SharedSavings onBack={goBack} onNavigate={navigateTo} />;
      case 'high-cost-patients':
        return <HighCostPatients onBack={goBack} />;
      case 'readmissions':
        return <PreventableReadmissions onBack={goBack} />;
      case 'ed-overutilization':
      case 'ed-utilization':
        return <EDOverutilization onBack={goBack} />;
      case 'medication-adherence':
        return <MedicationAdherence onBack={goBack} />;
      case 'care-gaps':
      case 'quality-performance':
        return <CareGaps onBack={goBack} />;
      case 'referral-leakage':
      case 'network-leakage':
        return <ReferralLeakage onBack={goBack} />;
      case 'attribution':
        return <AttributionDecline onBack={goBack} />;
      case 'top-doctors':
        return <TopDoctors onBack={goBack} />;
      case 'top-patients':
        return <TopPatients onBack={goBack} />;
      case 'gap-dme':
      case 'gap-specialty-drugs':
      case 'gap-outpatient-surgery':
      case 'gap-inpatient-surgery':
      case 'gap-post-acute':
      case 'gap-inpatient-medical':
        return <GapDrilldown gapType={activeView} onBack={goBack} />;
      case 'chosen-initiatives':
        return <ChosenInitiatives onBack={goBack} />;
      case 'settings':
        return <Settings
          pageVisibility={pageVisibility}
          setPageVisibility={setPageVisibility}
        />;
      default:
        return <DashboardOverview onSelectArea={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 2xl:p-12 bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/30">
      <div className="max-w-[1600px] 2xl:max-w-[2000px] mx-auto">
        <div className="bg-gradient-to-r from-white/80 via-orange-50/60 to-yellow-50/60 backdrop-blur-md text-gray-900 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 rounded-2xl mb-6 lg:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/30 shadow-sm">
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-light"><span className="font-bold text-[#FFD85F]">Stellar</span>Metrics</div>
            <div className="text-sm sm:text-base text-gray-600 mt-1 tracking-widest font-semibold [font-variant:small-caps]">Prototype</div>
          </div>
          <div className="flex gap-2 sm:gap-4 2xl:gap-6 text-sm sm:text-base lg:text-lg 2xl:text-xl flex-wrap">
            {pageVisibility.dashboard && (
              <button
                onClick={() => navigateTo('overview')}
                className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors ${activeView === 'overview' ? 'bg-[#FFD85F] text-black' : 'hover:bg-gray-900/10'
                  }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => navigateTo('cost-performance-insights')}
              className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors ${activeView === 'cost-performance-insights' ? 'bg-[#FFD85F] text-black' : 'hover:bg-gray-900/10'
                }`}
            >
              Cost Insights
            </button>
            <button
              onClick={() => navigateTo('cost-categories')}
              className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors ${activeView === 'cost-categories' ? 'bg-[#FFD85F] text-black' : 'hover:bg-gray-900/10'
                }`}
            >
              Savings Breakout
            </button>
            <button
              disabled
              className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              title="Coming Soon"
            >
              Recommendations
            </button>
            <button
              disabled
              className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              title="Coming Soon"
            >
              Progress
            </button>
            {pageVisibility.initiatives && (
              <button
                onClick={() => navigateTo('chosen-initiatives')}
                className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors ${activeView === 'chosen-initiatives' ? 'bg-[#FFD85F] text-black' : 'hover:bg-gray-900/10'
                  }`}
              >
                Initiatives
              </button>
            )}
            <button className="px-3 sm:px-4 lg:px-6 py-2 lg:py-3 hover:bg-gray-900/10 rounded-lg hidden sm:block transition-colors">Reports</button>
            <button
              onClick={() => navigateTo('settings')}
              className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hidden sm:block transition-colors ${activeView === 'settings' ? 'bg-[#FFD85F] text-black' : 'hover:bg-gray-900/10'
                }`}
            >
              Settings
            </button>
          </div>
        </div>
        {renderView()}
      </div>
    </div>
  );
}

export default App;
