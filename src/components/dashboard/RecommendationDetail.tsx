import { ChevronLeft, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  recommendationId: number;
  categoryName?: string;
  onBack: () => void;
}

export default function RecommendationDetail({ recommendationId, categoryName, onBack }: Props) {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendation();
  }, [recommendationId]);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API URL with optional categoryName parameter
      let apiUrl = `/api/recommendations?id=${recommendationId}`;
      if (categoryName) {
        apiUrl += `&categoryName=${encodeURIComponent(categoryName)}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation details');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendation:', err);
    } finally {
      setLoading(false);
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl text-gray-500">Loading recommendation...</div>
        </div>
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl text-gray-700 mb-2">Error Loading Recommendation</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Limit to top 3 categories (matching what's shown on the previous page)
  const topCategories = recommendation.affectedCategories?.slice(0, 3) || [];
  const categoryNames = topCategories.map((cat: any) => cat.categoryName);

  // Use impactAmount if available (when coming from a category drilldown page)
  // Otherwise, calculate from top 3 categories or fall back to estimatedSavings
  const totalSavings = recommendation.impactAmount
    ? parseFloat(recommendation.impactAmount.toString())
    : topCategories.reduce((sum: number, cat: any) => {
      return sum + (parseFloat(cat.impactAmount) || 0);
    }, 0) || recommendation.estimatedSavings || 0;





  return (
    <div className="space-y-6">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Savings Breakout</span>
          <span>/</span>
          <span>{categoryName || 'Category Detail'}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Recommendation</span>
        </div>
      </div>

      {/* Card 1: Header with cost areas and launch button */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h1 className="text-4xl font-light mb-2">{recommendation.title}</h1>
            <p className="text-gray-600 text-base">
              {recommendation.description}
            </p>
          </div>

          {/* Launch button */}
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap">
            <ExternalLink className="w-5 h-5" />
            Launch in-app
          </button>
        </div>

        {/* Cost areas section with blue background */}
        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Cost area(s):</span>
            {categoryNames.map((area: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {area}
              </span>
            ))}
            <span>totaling</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(totalSavings)}
            </span>
            <span>from</span>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              {formatNumber(recommendation.affectedLives || recommendation.cohortSize || 0)} {recommendation.patientCohort || 'patients'}
            </a>
          </div>
        </div>
      </div>

      {/* Card 2: Main content */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-200 space-y-8">
        {/* Overview */}
        {recommendation.programOverview && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {recommendation.programOverview}
            </p>
          </div>
        )}

        {/* Video placeholder */}
        {recommendation.videoUrl && (
          <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
            <button className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </button>
          </div>
        )}

        {/* Two-column content */}
        {recommendation.programResources && (
          <div className="grid grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-8">
              {/* Best practices */}
              {recommendation.programResources.bestPractices && recommendation.programResources.bestPractices.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Best practices</h2>
                  <div className="space-y-4">
                    {recommendation.programResources.bestPractices.map((practice: any, idx: number) => (
                      <div key={idx}>
                        {practice.title && <h3 className="font-medium text-gray-900 mb-2">{practice.title}</h3>}
                        <p className="text-gray-700 leading-relaxed">{practice.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation steps */}
              {recommendation.programResources.implementationSteps && recommendation.programResources.implementationSteps.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Implementation steps</h2>
                  <div className="space-y-4">
                    {recommendation.programResources.implementationSteps.map((step: any, idx: number) => (
                      <div key={idx}>
                        {step.title && <h3 className="font-medium text-gray-900 mb-2">{step.title}</h3>}
                        <p className="text-gray-700 leading-relaxed">{step.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Testimonials */}
            {recommendation.programResources.testimonials && recommendation.programResources.testimonials.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
                <div className="space-y-4">
                  {recommendation.programResources.testimonials.map((testimonial: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-200 pl-4">
                      <p className="text-gray-700 leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                      {testimonial.author && (
                        <p className="text-sm text-gray-600 mt-2">
                          — {testimonial.author}{testimonial.authorRole && `, ${testimonial.authorRole}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback message if no program resources */}
        {!recommendation.programResources && (
          <div className="text-center py-8 text-gray-500">
            <p>Detailed program information is not yet available for this recommendation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
