import { Commit } from '@/types/commit';
import Badge from '@/components/common/Badge';
import { formatDuration } from '@/utils/formatTime';

interface CommitTimelineProps {
  commits: Commit[];
}

const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits }) => {
  if (commits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-github-text-secondary">
        No commits found
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge variant="success">OK</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Warning</Badge>;
      case 'VIOLATION':
        return <Badge variant="danger">Violation</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {commits.map((commit, index) => (
        <div
          key={commit._id}
          className="bg-white dark:bg-github-canvas-subtle p-6 rounded-lg shadow-md border-l-4"
          style={{
            borderLeftColor:
              commit.status === 'VIOLATION'
                ? '#DC2626'
                : commit.status === 'WARNING'
                ? '#F59E0B'
                : '#10B981',
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text">
                {commit.message}
              </h3>
              <p className="text-sm text-gray-600 dark:text-github-text-secondary mt-1">
                by {commit.author} • {new Date(commit.commitDate).toLocaleString()}
              </p>
            </div>
            {getStatusBadge(commit.status)}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-github-text-secondary">
            <span className="flex items-center gap-1">
              <span className="text-green-600">+{commit.additions || 0}</span>
              <span className="text-red-600">-{commit.deletions || 0}</span>
            </span>

            {commit.filesChanged && (
              <span>{commit.filesChanged} files changed</span>
            )}

            {commit.inactivityGap && commit.inactivityGap > 0 && (
              <span className="font-medium">
                Gap: {formatDuration(commit.inactivityGap)}
              </span>
            )}
          </div>

          <div className="mt-3">
            <code className="text-xs text-gray-500 dark:text-github-text-secondary bg-gray-50 dark:bg-github-canvas-inset px-2 py-1 rounded">
              {commit.commitSha.substring(0, 7)}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitTimeline;
