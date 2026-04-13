import React from 'react';
import { Zap } from 'lucide-react';

interface AIInsightsProps {
  insights: string[] | string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  const insightList = Array.isArray(insights) ? insights : [insights];

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-24 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
      <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-400" />
        AI Coach Insights
      </h3>
      <div className="space-y-4 relative z-10">
        {insightList.length > 0 && insightList[0] ? (
          insightList.slice(0, 3).map((insight, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-2 h-full bg-indigo-500 rounded-full" />
              <p className="text-sm text-gray-200 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 italic">No insights available yet. Make more commits to get feedback!</div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
