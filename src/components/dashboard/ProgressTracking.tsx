import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, PlayCircle, AlertCircle, Monitor, ExternalLink } from 'lucide-react';
import type { Recommendation, RecommendationStatus } from '../../types';

interface Props {
  onBack: () => void;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  totalCount: number;
}

export default function ProgressTracking({ onBack }: Props) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/recommendations');

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

  const updateStatus = async (id: number, newStatus: RecommendationStatus) => {
    try {
      setUpdatingId(id);
      const response = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data after successful update
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update recommendation status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: RecommendationStatus) => {
    switch (status) {
      case 'not_started': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'acknowledged': return <Eye className="w-5 h-5 text-blue-500" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'already_doing': return <PlayCircle className="w-5 h-5 text-purple-500" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-amber-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: RecommendationStatus) => {
    const labels: Record<RecommendationStatus, string> = {
      not_started: 'Not Started',
      acknowledged: 'Acknowledged',
      accepted: 'Accepted',
      rejected: 'Rejected',
      already_doing: 'Already Doing',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    return labels[status];
  };

  const getStatusColor = (status: RecommendationStatus) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 border-gray-300';
      case 'acknowledged': return 'bg-blue-50 border-blue-300';
      case 'accepted': return 'bg-green-50 border-green-300';
      case 'rejected': return 'bg-red-50 border-red-300';
      case 'already_doing': return 'bg-purple-50 border-purple-300';
      case 'in_progress': return 'bg-amber-50 border-amber-300';
      case 'completed': return 'bg-green-100 border-green-400';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading progress tracking...</div>
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

  // Group recommendations by status
  const groupedByStatus: Record<RecommendationStatus, Recommendation[]> = {
    not_started: [],
    acknowledged: [],
    accepted: [],
    rejected: [],
    already_doing: [],
    in_progress: [],
    completed: []
  };

  data.recommendations.forEach(rec => {
    groupedByStatus[rec.status].push(rec);
  });

  // Count measurable vs external
  const measurableCount = data.recommendations.filter(r => r.isMeasurable !== false).length;
  const externalCount = data.recommendations.filter(r => r.isMeasurable === false).length;

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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light">Implementation Progress</h1>
          <p className="text-sm text-gray-500 mt-2">
            Track and manage recommendation implementation status
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Monitor className="w-5 h-5" />
            <span className="text-sm font-medium">Measurable in ACO Software</span>
          </div>
          <div className="text-3xl font-light">{measurableCount}</div>
          <div className="text-xs text-gray-500 mt-1">Can be tracked internally</div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm font-medium">External Tracking</span>
          </div>
          <div className="text-3xl font-light">{externalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Requires external monitoring</div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <div className="text-3xl font-light">
            {groupedByStatus.accepted.length + groupedByStatus.already_doing.length + groupedByStatus.in_progress.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Accepted or in progress</div>
        </div>

        <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-medium">Needs Review</span>
          </div>
          <div className="text-3xl font-light">
            {groupedByStatus.not_started.length + groupedByStatus.acknowledged.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Not yet started</div>
        </div>
      </div>

      {/* Recommendations by Status */}
      {(['not_started', 'acknowledged', 'accepted', 'in_progress', 'already_doing', 'completed', 'rejected'] as RecommendationStatus[]).map(status => {
        const recs = groupedByStatus[status];
        if (recs.length === 0) return null;

        return (
          <div key={status} className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(status)}
              <h2 className="text-2xl font-light">{getStatusLabel(status)}</h2>
              <span className="text-sm text-gray-500">({recs.length})</span>
            </div>

            <div className="space-y-3">
              {recs.map(rec => (
                <div
                  key={rec.id}
                  className={`border-2 rounded-xl p-4 ${getStatusColor(rec.status)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{rec.title}</h3>
                        {rec.isMeasurable !== false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            <Monitor className="w-3 h-3" />
                            ACO Measurable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            <ExternalLink className="w-3 h-3" />
                            External Tracking
                          </span>
                        )}
                        {rec.priority && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                          </span>
                        )}
                      </div>

                      {rec.description && (
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        {rec.estimatedSavings && (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(rec.estimatedSavings)} potential savings
                          </span>
                        )}
                        {rec.affectedLives && (
                          <span>{rec.affectedLives.toLocaleString()} patients</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {rec.status === 'not_started' && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => updateStatus(rec.id, 'acknowledged')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingId === rec.id ? 'Updating...' : 'Acknowledge'}
                          </button>
                          <button
                            onClick={() => updateStatus(rec.id, 'accepted')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(rec.id, 'rejected')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {rec.status === 'acknowledged' && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => updateStatus(rec.id, 'accepted')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(rec.id, 'rejected')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => updateStatus(rec.id, 'not_started')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reset
                          </button>
                        </div>
                      )}

                      {rec.status === 'accepted' && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => updateStatus(rec.id, 'in_progress')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Start Implementation
                          </button>
                        </div>
                      )}

                      {rec.status === 'in_progress' && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => updateStatus(rec.id, 'completed')}
                            disabled={updatingId === rec.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
