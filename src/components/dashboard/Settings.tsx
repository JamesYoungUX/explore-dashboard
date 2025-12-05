import { useState } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

interface PageVisibility {
  dashboard: boolean;
  initiatives: boolean;
}

interface SettingsProps {
  onBack: () => void;
  pageVisibility: PageVisibility;
  setPageVisibility: (visibility: PageVisibility) => void;
}

export default function Settings({ onBack, pageVisibility, setPageVisibility }: SettingsProps) {
  const togglePage = (page: keyof PageVisibility) => {
    setPageVisibility({
      ...pageVisibility,
      [page]: !pageVisibility[page]
    });
  };
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPrototype = async () => {
    setIsResetting(true);
    setResetMessage(null);

    try {
      const response = await fetch('/api/config?type=reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show verification data if available
        const verificationText = data.verification
          ? ` | File check: IP-Surgical=${data.verification.hasIPSurgical}, Avoidable-ED=${data.verification.hasAvoidableED}, Specialty-Drugs=${data.verification.hasSpecialtyDrugs}`
          : '';
        const errorText = data.errorCount > 0
          ? ` | ${data.successCount} succeeded, ${data.errorCount} failed. Errors: ${data.errors?.join('; ')}`
          : '';
        setResetMessage({ type: data.errorCount > 0 ? 'error' : 'success', text: `Database reset: ${data.statementsExecuted} total statements${verificationText}${errorText}. Please refresh manually to see changes.` });
      } else {
        setResetMessage({ type: 'error', text: data.message || 'Reset failed. Please try again.' });
      }
    } catch (error) {
      setResetMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage prototype configuration and data</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Navigation Visibility Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation Visibility</h2>
            <p className="text-sm text-gray-600 mt-1">Control which pages appear in the navigation bar</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Dashboard Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium text-gray-900">Dashboard</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Show the main dashboard overview page in navigation</p>
                </div>
              </div>
              <button
                onClick={() => togglePage('dashboard')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD85F] focus:ring-offset-2 ${pageVisibility.dashboard ? 'bg-[#FFD85F]' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pageVisibility.dashboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Initiatives Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium text-gray-900">Initiatives</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Show the chosen initiatives page in navigation</p>
                </div>
              </div>
              <button
                onClick={() => togglePage('initiatives')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD85F] focus:ring-offset-2 ${pageVisibility.initiatives ? 'bg-[#FFD85F]' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pageVisibility.initiatives ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Prototype Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prototype Management</h2>
            <p className="text-sm text-gray-600 mt-1">Tools for testing and resetting prototype data</p>
          </div>

          <div className="p-6">
            {/* Reset Prototype */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-semibold text-gray-900">Reset Prototype Data</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Reset all prototype data to initial state for testing with new users. This will:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc mb-4">
                  <li>Reset all recommendation statuses to "Not Started"</li>
                  <li>Restore cost categories to baseline values</li>
                  <li>Reset performance metrics to initial data</li>
                  <li>Clear all progress tracking</li>
                </ul>
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">This action is safe for testing but cannot be undone.</p>
                </div>
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Reset Prototype
              </button>
            </div>

            {/* Status Message */}
            {resetMessage && (
              <div className={`mt-4 p-4 rounded-lg ${resetMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                <p className="font-medium">{resetMessage.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Settings Sections (for future use) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Coming soon</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">Additional configuration options will be available here.</p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Reset Prototype?</h3>
                <p className="text-sm text-gray-600">This action will reset all prototype data</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">What will be reset:</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>All recommendation statuses → Not Started</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>All cost categories → Initial baseline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>All performance metrics → Initial values</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>All progress tracking → Cleared</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-6 italic">
              This prepares the prototype for testing with a new user.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPrototype}
                disabled={isResetting}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Prototype'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
