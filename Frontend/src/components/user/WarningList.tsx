import { Commit } from '@/types/commit';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { formatDuration } from '@/utils/formatTime';

interface WarningListProps {
  items: Commit[];
  type: 'warning' | 'violation';
}

const WarningList: React.FC<WarningListProps> = ({ items, type }) => {
  const badgeVariant = type === 'violation' ? 'danger' : 'warning';
  const borderColor = type === 'violation' ? 'border-red-500' : 'border-yellow-500';

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item._id}>
          <div className={`p-6 border-l-4 ${borderColor}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-github-text">{item.message}</h4>
                <p className="text-sm text-gray-600 dark:text-github-text-secondary mt-1">
                  {new Date(item.commitDate).toLocaleString()}
                </p>
              </div>
              <Badge variant={badgeVariant}>
                {type.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-github-text-secondary">
              <span>Repository: {item.repoId}</span>
              {item.inactivityGap && (
                <span className="font-medium text-gray-900 dark:text-github-text">
                  Inactivity Gap: {formatDuration(item.inactivityGap)}
                </span>
              )}
            </div>

            {type === 'violation' && (
              <div className="mt-4 bg-red-50 dark:bg-github-canvas-inset border border-red-200 dark:border-github-border rounded p-3">
                <p className="text-sm text-red-800 dark:text-github-text-secondary">
                  ⚠️ This commit exceeded the maximum allowed inactivity gap. Please ensure regular commits to maintain activity.
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WarningList;
