import React from 'react';
import { GitCommit, Clock, Zap } from 'lucide-react';

interface ConsistencyMetricsProps {
  score: number;
  grade: string;
  totalCommits: number;
  averageGap: number;
  burstCommits: number;
}

const ConsistencyMetrics: React.FC<ConsistencyMetricsProps> = ({
  score,
  grade,
  totalCommits,
  averageGap,
  burstCommits
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Consistency Score */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl relative group hover:border-purple-500/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Consistency</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-4xl font-black">{score}</h3>
              <span className={`text-xl font-black ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>/100</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-xl border border-purple-500/30">
            {grade}
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-50 to-blue-500 transition-all duration-1000" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Streak / Stats */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-blue-500/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Commits</p>
          <GitCommit className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-4xl font-black">{totalCommits}</h3>
        <div className="flex gap-4 mt-4 text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Avg Gap: {Math.round(averageGap)}h</span>
          <span className="flex items-center gap-1 text-orange-400"><Zap className="w-3 h-3" /> Bursts: {burstCommits}</span>
        </div>
      </div>

      {/* Additional Quick Metric */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-green-500/50 transition-colors hidden lg:block">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Efficiency Rate</p>
        <div className="flex items-center gap-3">
          <div className="text-4xl font-black text-white">{Math.min(100, Math.round((totalCommits / (averageGap || 1)) * 10))}%</div>
          <div className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">Optimal</div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Based on current timeline distribution</p>
      </div>
    </div>
  );
};

export default ConsistencyMetrics;
