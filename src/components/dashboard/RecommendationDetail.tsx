import { ChevronLeft, ExternalLink, Play } from 'lucide-react';

interface Props {
  recommendationId: number;
  categoryName?: string;
  onBack: () => void;
}

export default function RecommendationDetail({ recommendationId: _recommendationId, categoryName, onBack }: Props) {
  // This would normally fetch the recommendation data based on ID
  // For now, using placeholder data
  const recommendation = {
    title: "Implement a care management program",
    costAreas: ["IP surgical", "IP medical", "ED"],
    totalSavings: "$350K",
    percentSavings: "47%",
    patientCohort: "high-need patients",
    patientCount: 148,
    overview: `A comprehensive care management program identifies and supports high-risk patients with multiple chronic conditions through personalized care plans, regular monitoring, and coordinated interventions across the care continuum.

This evidence-based approach focuses on preventing avoidable hospitalizations and emergency department visits by addressing social determinants of health, medication adherence, care transitions, and patient engagement. The program assigns dedicated care managers to work closely with patients and their care teams to ensure timely interventions and appropriate care settings.`,
    bestPractices: `Start with risk stratification to identify patients who will benefit most from intensive care management. Use predictive analytics to prioritize patients with the highest likelihood of future hospitalizations or ED visits.

Establish clear protocols for care manager outreach frequency and escalation pathways. Successful programs typically include weekly check-ins for high-risk patients and monthly touchpoints for moderate-risk populations.

Integrate care managers directly into primary care workflows and ensure real-time access to clinical data. Close collaboration between care managers, physicians, and specialists is essential for coordinated interventions.`,
    implementationSteps: `Begin by selecting and training qualified care management staff, typically registered nurses or social workers with experience in chronic disease management and motivational interviewing techniques.

Deploy technology infrastructure including care management software, predictive analytics tools, and secure communication platforms for team collaboration and patient engagement.

Establish measurement frameworks to track key metrics such as hospital readmission rates, ED utilization, medication adherence, and patient satisfaction. Regular reporting and program refinement based on these metrics drives continuous improvement and demonstrates ROI.`,
    testimonials: [
      `"Our care management program reduced 30-day readmissions by 35% in the first year. The key was having dedicated care managers who could follow patients from hospital to home and address barriers to recovery." - Chief Medical Officer, 450-bed community hospital`,
      `"We saw immediate impact on our highest utilizers. Within 6 months, our top 50 ED users had 40% fewer visits. The care managers built real relationships with these patients and connected them to appropriate resources." - VP of Population Health, multi-specialty medical group`,
      `"The program paid for itself within 8 months through reduced inpatient admissions alone. But the real value is in improved patient outcomes and quality of life for our most vulnerable populations." - CEO, ACO with 75,000 attributed lives`,
    ]
  };

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
              Reduce avoidable hospital utilization and costs through proactive care coordination for high-risk patients with complex medical needs.
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
            {recommendation.costAreas.map((area, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {area}
              </span>
            ))}
            <span>totaling</span>
            <span className="font-semibold text-gray-900">
              {recommendation.totalSavings} ({recommendation.percentSavings})
            </span>
            <span>from</span>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              {recommendation.patientCount} {recommendation.patientCohort}
            </a>
          </div>
        </div>
      </div>

      {/* Card 2: Main content */}
      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm border border-gray-200 space-y-8">
        {/* Overview */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recommendation.overview}
          </p>
        </div>

        {/* Video placeholder */}
        <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
          <button className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-8">
            {/* Best practices */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Best practices</h2>
              <p className="text-gray-700 leading-relaxed">
                {recommendation.bestPractices}
              </p>
            </div>

            {/* Implementation steps */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Implementation steps</h2>
              <p className="text-gray-700 leading-relaxed">
                {recommendation.implementationSteps}
              </p>
            </div>
          </div>

          {/* Right column - Testimonials */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Testimonials</h2>
            <div className="space-y-4">
              {recommendation.testimonials.map((testimonial, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed">
                  {testimonial}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
