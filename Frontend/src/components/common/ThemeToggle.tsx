import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-github-canvas-subtle hover:bg-gray-300 dark:hover:bg-github-border-muted transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-700 dark:text-github-text" />
      ) : (
        <Sun className="h-5 w-5 text-github-text" />
      )}
    </button>
  );
};

export default ThemeToggle;
