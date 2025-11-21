interface Props {
  label: string;
  current: number;
  lastYear: number;
  benchmark: number;
  topPerformer: number;
  unit?: string;
  inverse?: boolean; // true if lower is better
}

export default function BenchmarkBar({ label, current, lastYear, benchmark, topPerformer, unit = '', inverse = false }: Props) {
  const max = Math.max(current, lastYear, benchmark, topPerformer) * 1.1;
  const getWidth = (val: number) => `${(val / max) * 100}%`;
  
  const currentVsBenchmark = inverse 
    ? current < benchmark 
    : current > benchmark;
  
  const currentVsLastYear = inverse
    ? current < lastYear
    : current > lastYear;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-700">{label}</span>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className={currentVsLastYear ? 'text-green-600' : 'text-red-600'}>
            {current}{unit} <span className="text-neutral-400">vs {lastYear}{unit} LY</span>
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 w-20">Current</span>
          <div className="flex-1 bg-neutral-100 rounded-sm h-5 relative">
            <div 
              className={`h-full rounded-sm ${currentVsBenchmark ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: getWidth(current) }}
            />
            <span className="absolute left-2 top-0.5 text-[10px] font-mono font-semibold text-white">
              {current}{unit}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 w-20">Last Year</span>
          <div className="flex-1 bg-neutral-100 rounded-sm h-4 relative">
            <div 
              className="h-full bg-neutral-300 rounded-sm"
              style={{ width: getWidth(lastYear) }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 w-20">Benchmark</span>
          <div className="flex-1 bg-neutral-100 rounded-sm h-4 relative">
            <div 
              className="h-full bg-blue-400 rounded-sm"
              style={{ width: getWidth(benchmark) }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 w-20">Top 10%</span>
          <div className="flex-1 bg-neutral-100 rounded-sm h-4 relative">
            <div 
              className="h-full bg-emerald-500 rounded-sm"
              style={{ width: getWidth(topPerformer) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
