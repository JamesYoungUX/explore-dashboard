import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Star, Users, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';
import type { Recommendation, ProgramResource } from '../../types';

interface Props {
  onBack: () => void;
  onNavigate?: (categorySlug: string) => void;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  totalCount: number;
  filters: {
    status: string | null;
    priority: string | null;
  };
}

interface DetailedRecommendation extends Recommendation {
  programResources?: {
    bestPractices: ProgramResource[];
    testimonials: ProgramResource[];
    implementationSteps: ProgramResource[];
  };
}

export default function Recommendations({ onBack, onNavigate: _onNavigate }: Props) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [selectedRec, setSelectedRec] = useState<DetailedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [_detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter, priorityFilter]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/recommendations?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendationDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/recommendations?id=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation details');
      }

      const result = await response.json();
      setSelectedRec(result);
    } catch (err) {
      console.error('Error fetching recommendation details:', err);
    } finally {
      setDetailLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'already_doing': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'already_doing': return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading recommendations...</div>
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

  // Detail View
  if (selectedRec) {
    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedRec(null)}
            className="p-2 hover:bg-white/60 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">{selectedRec.title}</h1>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(selectedRec.status)}`}>
            {getStatusIcon(selectedRec.status)}
            <span className="font-medium">{getStatusLabel(selectedRec.status)}</span>
          </div>
          <div className={`px-4 py-2 rounded-lg font-medium ${getPriorityColor(selectedRec.priority || 'medium')}`}>
            {(selectedRec.priority || 'medium').charAt(0).toUpperCase() + (selectedRec.priority || 'medium').slice(1)} Priority
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Estimated Savings</span>
            </div>
            <div className="text-3xl font-light">{selectedRec.estimatedSavings ? formatCurrency(selectedRec.estimatedSavings) : 'N/A'}</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Affected Patients</span>
            </div>
            <div className="text-3xl font-light">{selectedRec.affectedLives ? formatNumber(selectedRec.affectedLives) : 'N/A'}</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-2">Complexity</div>
            <div className="text-3xl font-light capitalize">{selectedRec.implementationComplexity || 'N/A'}</div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-light mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">{selectedRec.description}</p>
          {selectedRec.programOverview && (
            <p className="text-gray-700 leading-relaxed mt-4">{selectedRec.programOverview}</p>
          )}
        </div>

        {/* Affected Cost Categories */}
        {selectedRec.affectedCategories && selectedRec.affectedCategories.length > 0 && (
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-light mb-4">Affected Cost Categories</h2>
            <div className="space-y-3">
              {selectedRec.affectedCategories.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setShowLinkModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {cat.impactAmount && (
                      <span className="text-green-600 font-medium">{formatCurrency(cat.impactAmount)}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Program Resources */}
        {selectedRec.programResources && (
          <>
            {/* Implementation Steps */}
            {selectedRec.programResources.implementationSteps.length > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-light mb-4">Implementation Steps</h2>
                <div className="space-y-4">
                  {selectedRec.programResources.implementationSteps
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((step, index) => (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#FFD85F] rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{step.title}</h3>
                          <p className="text-gray-600 text-sm">{step.content}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Best Practices */}
            {selectedRec.programResources.bestPractices.length > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-light mb-4">Best Practices</h2>
                <div className="space-y-3">
                  {selectedRec.programResources.bestPractices
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((practice) => (
                      <div key={practice.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="font-medium mb-2 text-blue-900">{practice.title}</h3>
                        <p className="text-sm text-blue-800">{practice.content}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {selectedRec.programResources.testimonials.length > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-light mb-4">Success Stories</h2>
                <div className="space-y-4">
                  {selectedRec.programResources.testimonials
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((testimonial) => (
                      <div key={testimonial.id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-gray-700 italic mb-3">"{testimonial.content}"</p>
                        <div className="text-sm">
                          <div className="font-medium text-green-900">{testimonial.author}</div>
                          {testimonial.authorRole && (
                            <div className="text-green-700">{testimonial.authorRole}</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // List View
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">Recommendations</h1>
          <p className="text-sm text-gray-500 mt-2">{data.totalCount} total recommendations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-2 font-medium">Status</div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === null ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('not_started')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'not_started' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Not Started
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'accepted' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setStatusFilter('already_doing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'already_doing' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Already Doing
            </button>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2 font-medium">Priority</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPriorityFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${priorityFilter === null ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${priorityFilter === 'high' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              High
            </button>
            <button
              onClick={() => setPriorityFilter('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${priorityFilter === 'medium' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Medium
            </button>
            <button
              onClick={() => setPriorityFilter('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${priorityFilter === 'low' ? 'bg-[#FFD85F] text-black' : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {data.recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => fetchRecommendationDetail(rec.id)}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-xl font-medium">{rec.title}</h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm ${getStatusColor(rec.status)}`}>
                    {getStatusIcon(rec.status)}
                    <span>{getStatusLabel(rec.status)}</span>
                  </div>
                  {rec.priority && (
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{rec.description}</p>

                {/* Cost Areas Summary */}
                {rec.affectedCategories && rec.affectedCategories.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Cost areas: </span>
                      {rec.affectedCategories.map((cat, idx) => (
                        <span key={cat.categoryId}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLinkModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {cat.categoryName}
                          </button>
                          {idx < rec.affectedCategories!.length - 1 && ', '}
                        </span>
                      ))}
                      {rec.estimatedSavings && (
                        <span className="font-medium text-green-700">
                          {' '}totaling {formatCurrency(rec.estimatedSavings)}
                        </span>
                      )}
                      {rec.affectedLives && (
                        <>
                          {' '}from{' '}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLinkModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {formatNumber(rec.affectedLives)} patients
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {rec.estimatedSavings && (
                    <div className="flex items-center gap-2 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatCurrency(rec.estimatedSavings)} potential savings</span>
                    </div>
                  )}
                  {rec.affectedLives && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span>{formatNumber(rec.affectedLives)} patients</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 self-center lg:self-start lg:mt-2" />
            </div>
          </div>
        ))}
      </div>

      {data.recommendations.length === 0 && (
        <div className="text-center py-12 bg-white/60 backdrop-blur rounded-2xl">
          <div className="text-gray-500">No recommendations found with the selected filters.</div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prototype Link</h3>
                <p className="text-sm text-gray-700">
                  This prototype would link into the Stellar application's patient view, where you could see detailed patient information and cost breakdowns.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-5 py-2.5 bg-[#FFD85F] hover:bg-[#FFD85F]/90 text-black rounded-lg font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
