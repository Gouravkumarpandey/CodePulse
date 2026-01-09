import { ComplianceStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplianceStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    compliant: {
      text: 'Compliant',
      color: 'bg-github-success/10 text-github-success border-github-success/30',
    },
    observation: {
      text: 'Under Observation',
      color: 'bg-github-warning/10 text-github-warning border-github-warning/30',
    },
    warning: {
      text: 'Final Warning',
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    },
    disqualified: {
      text: 'Disqualified',
      color: 'bg-github-danger/10 text-github-danger border-github-danger/30',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      <span className="relative flex h-2 w-2 mr-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status === 'compliant' ? 'bg-github-success' : status === 'disqualified' ? 'bg-github-danger' : 'bg-github-warning'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'compliant' ? 'bg-github-success' : status === 'disqualified' ? 'bg-github-danger' : 'bg-github-warning'
          }`}
        ></span>
      </span>
      {config.text}
    </span>
  );
}
