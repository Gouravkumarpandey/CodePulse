import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../ui/Card';

interface CommitDistribution {
  quarter1: number;
  quarter2: number;
  quarter3: number;
  quarter4: number;
}

interface DistributionChartProps {
  distribution: CommitDistribution;
}

export default function DistributionChart({ distribution }: DistributionChartProps) {
  const data = [
    { name: 'Q1 (0-25%)', commits: distribution.quarter1, color: '#3fb950' },
    { name: 'Q2 (25-50%)', commits: distribution.quarter2, color: '#58a6ff' },
    { name: 'Q3 (50-75%)', commits: distribution.quarter3, color: '#f778ba' },
    { name: 'Q4 (75-100%)', commits: distribution.quarter4, color: '#ffa657' },
  ];

  const totalCommits = distribution.quarter1 + distribution.quarter2 + distribution.quarter3 + distribution.quarter4;
  
  // Calculate if distribution is even or skewed
  const isSkewed = distribution.quarter4 > (totalCommits * 0.5);

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-github-text mb-1">Commit Distribution</h3>
        <p className="text-sm text-github-text-secondary">
          Distribution of commits across the project timeline
        </p>
        {isSkewed && (
          <div className="mt-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Heavy last-minute activity detected. Try distributing commits more evenly.
            </p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis 
            dataKey="name" 
            stroke="#7d8590"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#7d8590"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#c9d1d9',
            }}
            formatter={(value: number | undefined) => [`${value || 0} commits`, 'Commits']}
          />
          <Bar dataKey="commits" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {data.map((quarter, index) => {
          const percentage = totalCommits > 0 ? ((quarter.commits / totalCommits) * 100).toFixed(1) : '0';
          return (
            <div key={index} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: quarter.color }}
              />
              <p className="text-xs text-github-text-secondary">{quarter.name}</p>
              <p className="text-sm font-semibold text-github-text">{percentage}%</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
