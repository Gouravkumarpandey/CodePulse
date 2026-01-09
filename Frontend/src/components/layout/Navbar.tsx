import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import ThemeToggle from '@/components/common/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-github-canvas-subtle shadow-md dark:shadow-none border-b border-gray-200 dark:border-github-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-github-accent">CodePulse</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-github-text">{user.username}</div>
                    <div className="text-gray-500 dark:text-github-text-secondary">{user.role}</div>
                  </div>
                </div>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
