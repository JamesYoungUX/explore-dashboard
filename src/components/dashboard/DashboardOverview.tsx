import { useState } from 'react';
import { DollarSign, Users, Award, ArrowUpRight, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import type { ProblemArea } from '../../types';

interface Props {
  onSelectArea: (area: ProblemArea) => void;
}

export default function DashboardOverview({ onSelectArea }: Props) {
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);
  const costData = [
    { name: 'DME/Supplies', value: 84, color: '#DC2626' },
    { name: 'Specialty Drugs', value: 74, color: '#F59E0B' },
    { name: 'OP Surgery', value: 65, color: '#FFD85F' },
    { name: 'IP Surgery', value: 55, color: '#F97316' },
    { name: 'Rehab', value: 51, color: '#FB923C' },
    { name: 'Other', value: 91, color: '#CBCBCB' },
  ];

  const trendData = [
    { month: 'May', cost2024: 1020, cost2025: 985 },
    { month: 'Jun', cost2024: 1035, cost2025: 998 },
    { month: 'Jul', cost2024: 1048, cost2025: 1015 },
    { month: 'Aug', cost2024: 1062, cost2025: 1028 },
    { month: 'Sep', cost2024: 1055, cost2025: 1042 },
    { month: 'Oct', cost2024: 1042, cost2025: 1035 },
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: 45, color: '#72E040' },
    { name: 'Medium Risk', value: 35, color: '#FFD85F' },
    { name: 'High Risk', value: 15, color: '#F59E0B' },
    { name: 'Critical', value: 5, color: '#DC2626' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero + Big Numbers - Same Line */}
      <div className="flex items-center justify-between py-8">
        <div>
          <h1 className="text-6xl font-light">Performance Insights</h1>
        </div>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[#111111]" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <div className="text-6xl font-light leading-none">19.0M</div>
              <div className="text-sm text-gray-500 font-light">Total Cost</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#111111]" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <div className="text-6xl font-light leading-none">1,522</div>
              <div className="text-sm text-gray-500 font-light">Patients</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-[#111111]" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <div className="text-6xl font-light leading-none">87%</div>
              <div className="text-sm text-gray-500 font-light">Quality Measures</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[#111111]" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <div className="text-6xl font-light leading-none text-red-600">-$1.68M</div>
              <div className="text-sm text-gray-500 font-light">Annual Gap</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          {/* Shared Savings Status */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-2xl font-light text-red-900">Shared Savings At Risk</div>
                  <div className="text-sm text-red-700 font-light mt-1">$420K gap to close • Performance year ends Q1 • Quality: 87% (target: 85%)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-red-600">$420K</div>
                <div className="text-xs text-red-700 font-light">Gap to Close</div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light">Top Opportunities</h3>
              <span className="text-xs text-gray-500 font-light">Last 30 days</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => onSelectArea('shared-savings' as ProblemArea)}
                className="flex flex-col gap-2 p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">Shared Savings Target Shortfall</div>
                    <div className="text-xs text-red-700 mt-1">$420K below target • Performance year ends Q1</div>
                  </div>
                </div>
                <div className="pl-8 pt-2 border-t border-red-200 space-y-1.5">
                  <div className="text-sm font-medium text-red-800 mb-2">⭐ Stellar suggests:</div>
                  <div className="text-sm text-red-700">• Implement prior authorization for high-cost referrals</div>
                  <div className="text-sm text-red-700">• Deploy transitional care program for high-risk discharges</div>
                  <div className="text-sm text-red-700">• Negotiate enhanced payment terms with top 3 specialist groups</div>
                </div>
              </div>
              <div 
                onClick={() => onSelectArea('quality-performance' as ProblemArea)}
                className="flex flex-col gap-2 p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">Quality Score 8 Points Below</div>
                    <div className="text-xs text-red-700 mt-1">$350K bonus at risk • Quality gate requirement</div>
                  </div>
                </div>
                <div className="pl-8 pt-2 border-t border-red-200 space-y-1.5">
                  <div className="text-sm font-medium text-red-800 mb-2">⭐ Stellar suggests:</div>
                  <div className="text-sm text-red-700">• Launch intensive outreach for 2,400 patients overdue for colorectal screening</div>
                  <div className="text-sm text-red-700">• Deploy diabetes care managers to high-risk panel</div>
                  <div className="text-sm text-red-700">• Implement point-of-care quality measure alerts in EMR</div>
                </div>
              </div>
              <div 
                onClick={() => onSelectArea('attribution' as ProblemArea)}
                className="flex flex-col gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-amber-900">Attribution Decline: 91 Patients</div>
                    <div className="text-xs text-amber-700 mt-1">$127K revenue impact • Annual attribution update</div>
                  </div>
                </div>
                <div className="pl-8 pt-2 border-t border-amber-200 space-y-1.5">
                  <div className="text-sm font-medium text-amber-800 mb-2">⭐ Stellar suggests:</div>
                  <div className="text-sm text-amber-700">• Reduce same-day appointment wait times to under 48 hours</div>
                  <div className="text-sm text-amber-700">• Implement patient retention outreach for at-risk panel members</div>
                  <div className="text-sm text-amber-700">• Recruit 2 additional PCPs to address capacity constraints</div>
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light">Performance vs Efficiently Managed</h3>
              <span className="text-xs text-gray-500 font-light">National benchmarks</span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-500 font-light mb-2">Total Cost PMPM</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-light">$1,042</span>
                  <span className="text-sm text-red-600">+4.2%</span>
                </div>
                <div className="text-xs text-gray-500">Efficiently Managed: $950</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-light mb-2">Readmission Rate</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-light">8.2%</span>
                  <span className="text-sm text-red-600">+1.7%</span>
                </div>
                <div className="text-xs text-gray-500">Efficiently Managed: 6.5%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-light mb-2">ED Visits per 1000</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-light">520</span>
                  <span className="text-sm text-red-600">+18%</span>
                </div>
                <div className="text-xs text-gray-500">Efficiently Managed: 440</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-light mb-2">Quality Score</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-light">87%</span>
                  <span className="text-sm text-red-600">-3%</span>
                </div>
                <div className="text-xs text-gray-500">Efficiently Managed: 90%</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur rounded-2xl px-8 py-6 shadow-sm" style={{ aspectRatio: '1/1' }}>
              <div className="text-xl font-light mb-2">Cost Distribution</div>
              <div className="h-[calc(100%-6rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {costData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-[10px] text-gray-600 font-light">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-2xl px-6 py-6 shadow-sm flex flex-col" style={{ aspectRatio: '1/1' }}>
              <div className="text-xl font-light mb-2">Cost Trend (PMPM)</div>
              <div className="text-xs text-gray-500 font-light mb-2">Per Member Per Month</div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[950, 1070]} />
                    <Tooltip 
                      contentStyle={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}
                      formatter={(value: number, name: string) => [`$${value}`, name === 'cost2024' ? '2024' : '2025']}
                    />
                    <Line type="monotone" dataKey="cost2024" stroke="#9ca3af" strokeWidth={2} dot={{ fill: '#9ca3af', r: 3 }} name="2024" />
                    <Line type="monotone" dataKey="cost2025" stroke="#111111" strokeWidth={2} dot={{ fill: '#FFD85F', r: 4 }} name="2025" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#9ca3af]"></div>
                  <span className="text-[10px] text-gray-600 font-light">2024</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#111111]"></div>
                  <span className="text-[10px] text-gray-600 font-light">2025</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-2xl px-8 py-6 shadow-sm" style={{ aspectRatio: '1/1' }}>
              <div className="text-xl font-light mb-2">Risk Distribution</div>
              <div className="h-[calc(100%-6rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {riskDistributionData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-[10px] text-gray-600 font-light">{entry.name} {entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-2xl px-8 py-6 shadow-sm" style={{ aspectRatio: '1/1' }}>
              <div className="text-xl font-light mb-3">Performance vs Benchmark</div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-light">
                    <span className="text-gray-600">Quality Measures</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div className="h-full bg-[#72E040]" style={{ width: '87%' }}></div>
                    <div className="absolute top-0 h-full w-0.5 bg-gray-400" style={{ left: '90%' }} title="Benchmark: 90%"></div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-light">Benchmark: 90%</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-light">
                    <span className="text-gray-600">Cost Target</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div className="h-full bg-[#72E040]" style={{ width: '96%' }}></div>
                    <div className="absolute top-0 h-full w-0.5 bg-gray-400" style={{ left: '100%' }} title="Benchmark: 100%"></div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-light">Benchmark: 100% • 4% under target</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-light">
                    <span className="text-gray-600">Readmission Rate</span>
                    <span className="font-medium">8.2%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div className="h-full bg-[#FFD85F]" style={{ width: '82%' }}></div>
                    <div className="absolute top-0 h-full w-0.5 bg-gray-400" style={{ left: '65%' }} title="Benchmark: 6.5%"></div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-light">Benchmark: 6.5% • 1.7% above</div>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Areas */}
          <div className="bg-white/60 backdrop-blur rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-light">All Performance Initiatives</h2>
                <p className="text-sm text-gray-500 font-light mt-1">Click to view details and assign actions</p>
              </div>
              <button 
                onClick={() => setShowHighPriorityOnly(!showHighPriorityOnly)}
                className={`flex items-center gap-2 px-6 py-1.5 rounded-full transition-all ${
                  showHighPriorityOnly 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" strokeWidth={2} />
                <span className="text-base font-normal uppercase">2 high priority</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { 
                  id: 'shared-savings', 
                  label: 'Shared Savings Target Shortfall', 
                  desc: '22% below target • 14,287 attributed lives', 
                  impact: '$420K gap', 
                  action: 'Deploy transitional care program',
                  color: 'red' 
                },
                { 
                  id: 'quality-performance', 
                  label: 'Quality Performance Score Gap', 
                  desc: '8 points below 30th percentile • 4,892 patients with gaps', 
                  impact: '$350K bonus at risk', 
                  action: 'Launch intensive outreach campaign',
                  color: 'red' 
                },
                { 
                  id: 'readmissions', 
                  label: 'All-Cause Hospital Readmissions', 
                  desc: '12% above benchmark • 89 readmissions (30 days)', 
                  impact: '$185K excess costs', 
                  action: 'Implement post-discharge protocol',
                  color: 'amber' 
                },
                { 
                  id: 'ed-utilization', 
                  label: 'Preventable ED Utilization', 
                  desc: '18% above target • 2,847 high-risk patients', 
                  impact: '$250K avoidable', 
                  action: 'Launch extended-hours urgent care',
                  color: 'amber' 
                },
                { 
                  id: 'attribution', 
                  label: 'Primary Care Attribution Decline', 
                  desc: '91 patients left network • 6% decrease YoY', 
                  impact: '$127K revenue impact', 
                  action: 'Reduce wait times & recruit PCPs',
                  color: 'amber' 
                },
                { 
                  id: 'network-leakage', 
                  label: 'Network Leakage - Specialty Care', 
                  desc: '14% out-of-network • 1,245 OON visits', 
                  impact: '$95K higher costs', 
                  action: 'Contract additional specialists',
                  color: 'blue' 
                },
              ]
              .filter(problem => !showHighPriorityOnly || problem.color === 'red')
              .map((problem, index) => (
                <div 
                  key={problem.id}
                  onClick={() => onSelectArea(problem.id as ProblemArea)}
                  className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group ${
                    index % 2 === 0 ? 'bg-white/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 ${
                      problem.color === 'red' ? 'bg-red-100' :
                      problem.color === 'amber' ? 'bg-amber-100' :
                      problem.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                    } rounded-lg flex items-center justify-center`}>
                      <div className={`w-2 h-2 ${
                        problem.color === 'red' ? 'bg-red-500' :
                        problem.color === 'amber' ? 'bg-amber-500' :
                        problem.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                      } rounded-full`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-normal">{problem.label}</div>
                      <div className="text-sm text-gray-500 font-light">{problem.desc}</div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm font-medium text-[#16a34a] mb-1">{problem.impact}</div>
                      <div className="text-xs text-gray-600 font-light">→ {problem.action}</div>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ArrowUpRight className="w-6 h-6 text-gray-600 group-hover:text-[#111111] transition-colors" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


      </div>
    </div>
  );
}
