import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DistributionChartProps {
  distribution: {
    quarter1: number;
    quarter2: number;
    quarter3: number;
    quarter4: number;
  };
}

const DistributionChart: React.FC<DistributionChartProps> = ({ distribution }) => {
  const data = [
    { name: 'Phase 1', value: distribution.quarter1 },
    { name: 'Phase 2', value: distribution.quarter2 },
    { name: 'Phase 3', value: distribution.quarter3 },
    { name: 'Phase 4', value: distribution.quarter4 },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col">
      <h3 className="font-bold text-lg mb-6">Work Distribution</h3>
      <div className="flex-1 min-h-[250px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            Insufficient data for distribution analysis
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionChart;
