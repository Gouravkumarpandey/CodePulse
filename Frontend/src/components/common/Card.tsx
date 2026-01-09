import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  
  return (
    <div className={`bg-white dark:bg-github-canvas-subtle rounded-lg shadow-md dark:shadow-none border border-gray-200 dark:border-github-border ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
