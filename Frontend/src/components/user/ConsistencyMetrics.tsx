import { Clock, Zap, AlertTriangle, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

interface ConsistencyMetrics {
  totalCommits: number;
  averageGap: number;
  longestGap: number;
  burstCommits: number;
  lastMinuteCommits: number;
  timelineSpan: number;
  violations: number;
  warnings: number;
}

interface ConsistencyMetricsProps {
  metrics: ConsistencyMetrics;
}

export default function ConsistencyMetrics({ metrics }: ConsistencyMetricsProps) {
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)} hrs`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  const getGapStatus = (gap: number) => {
    if (gap > 72) return { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Critical' };
    if (gap > 48) return { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'High' };
    if (gap > 24) return { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Moderate' };
    return { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Good' };
  };

  const longestGapStatus = getGapStatus(metrics.longestGap);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Gap */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Average Gap</p>
            </div>
            <p className="text-2xl font-bold text-github-text">
              {formatHours(metrics.averageGap)}
            </p>
            <p className="text-xs text-github-text-secondary mt-1">Between commits</p>
          </div>
        </div>
      </Card>

      {/* Longest Gap */}
      <Card className={`border-l-4 ${longestGapStatus.color.replace('text-', 'border-l-')}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Longest Gap</p>
            </div>
            <p className={`text-2xl font-bold ${longestGapStatus.color}`}>
              {formatHours(metrics.longestGap)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${longestGapStatus.bg} ${longestGapStatus.color}`}>
                {longestGapStatus.label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Burst Commits */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Burst Commits</p>
            </div>
            <p className="text-2xl font-bold text-github-text">{metrics.burstCommits}</p>
            <p className="text-xs text-github-text-secondary mt-1">
              {((metrics.burstCommits / metrics.totalCommits) * 100).toFixed(0)}% of total
            </p>
          </div>
        </div>
      </Card>

      {/* Last-Minute Commits */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Last-Minute</p>
            </div>
            <p className="text-2xl font-bold text-github-text">{metrics.lastMinuteCommits}</p>
            <p className="text-xs text-github-text-secondary mt-1">
              {((metrics.lastMinuteCommits / metrics.totalCommits) * 100).toFixed(0)}% of timeline
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline Span */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Timeline Span</p>
            </div>
            <p className="text-2xl font-bold text-github-text">{metrics.timelineSpan}</p>
            <p className="text-xs text-github-text-secondary mt-1">Days</p>
          </div>
        </div>
      </Card>

      {/* Total Commits */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-github-text-secondary" />
              <p className="text-sm text-github-text-secondary">Total Commits</p>
            </div>
            <p className="text-2xl font-bold text-github-text">{metrics.totalCommits}</p>
            <p className="text-xs text-github-text-secondary mt-1">All time</p>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      <Card className={metrics.warnings > 0 ? 'border-l-4 border-l-yellow-500' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <p className="text-sm text-github-text-secondary">Warnings</p>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{metrics.warnings}</p>
            <p className="text-xs text-github-text-secondary mt-1">Attention needed</p>
          </div>
        </div>
      </Card>

      {/* Violations */}
      <Card className={metrics.violations > 0 ? 'border-l-4 border-l-red-500' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-github-text-secondary">Violations</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{metrics.violations}</p>
            <p className="text-xs text-github-text-secondary mt-1">Critical issues</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
