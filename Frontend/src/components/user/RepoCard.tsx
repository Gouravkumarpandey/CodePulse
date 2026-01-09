import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { Repository } from '@/types/repository';

interface RepoCardProps {
  repo: Repository;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  return (
    <Card hover>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text">{repo.name}</h3>
          <Badge variant={repo.isConnected ? 'success' : 'default'}>
            {repo.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-github-text-secondary mb-4">
          {repo.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {repo.language && (
              <span className="text-gray-500 dark:text-github-text-secondary">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                {repo.language}
              </span>
            )}
          </div>

          {repo.lastSync && (
            <span className="text-gray-400 dark:text-github-text-secondary text-xs">
              Last sync: {new Date(repo.lastSync).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-4">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-github-accent hover:text-indigo-700 dark:hover:text-github-accent text-sm font-medium"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </Card>
  );
};

export default RepoCard;
