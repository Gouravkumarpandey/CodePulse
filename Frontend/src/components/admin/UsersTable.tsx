import { User } from '@/types/user';
import Badge from '@/components/common/Badge';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface UsersTableProps {
  users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const getScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="default">N/A</Badge>;
    if (score >= 80) return <Badge variant="success">{score}</Badge>;
    if (score >= 60) return <Badge variant="warning">{score}</Badge>;
    return <Badge variant="danger">{score}</Badge>;
  };

  const getStatusBadge = (score?: number, violations?: number, warnings?: number) => {
    if (!score) return <Badge variant="default">No Data</Badge>;
    if (violations && violations > 0) return <Badge variant="danger">Violation</Badge>;
    if (warnings && warnings > 0) return <Badge variant="warning">Warning</Badge>;
    if (score >= 80) return <Badge variant="success">Good</Badge>;
    if (score >= 60) return <Badge variant="warning">Monitor</Badge>;
    return <Badge variant="danger">Poor</Badge>;
  };

  return (
    <div className="bg-white dark:bg-github-canvas-subtle rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-github-border">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-github-border">
        <thead className="bg-gray-50 dark:bg-github-bg">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              GitHub
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              Repository
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-github-text-secondary uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-github-canvas-subtle divide-y divide-gray-200 dark:divide-github-border">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-github-canvas-inset transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-github-border"
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'User');
                    }}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-github-text">
                      {user.username || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-github-text-secondary">
                      {user.email || 'No email'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-github-text">
                  @{user.githubId || user.username}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-github-text">
                  {user.selectedRepo || 'No repository'}
                </div>
                <div className="text-xs text-gray-500 dark:text-github-text-secondary">
                  {user.totalCommits ? `${user.totalCommits} commits` : 'No commits'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getScoreBadge(user.consistencyScore)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(user.consistencyScore, user.violations, user.warnings)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                  to={`/admin/users/${user._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-indigo-600 dark:text-github-accent hover:text-indigo-900 dark:hover:text-github-accent font-medium bg-indigo-50 dark:bg-github-canvas-inset hover:bg-indigo-100 dark:hover:bg-github-canvas-default rounded-md transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-github-text-secondary">
          No users found
        </div>
      )}
    </div>
  );
};

export default UsersTable;
