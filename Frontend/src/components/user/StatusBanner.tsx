import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Badge from '@/components/common/Badge';

const StatusBanner = () => {
  const [status, setStatus] = useState<'OK' | 'WARNING' | 'VIOLATION'>('OK');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/user/dashboard');
      const { violations, warnings } = response.data.summary;

      if (violations > 0) {
        setStatus('VIOLATION');
        setMessage(`You have ${violations} violation${violations > 1 ? 's' : ''}. Please address them immediately.`);
      } else if (warnings > 0) {
        setStatus('WARNING');
        setMessage(`You have ${warnings} warning${warnings > 1 ? 's' : ''}. Your inactivity gap is approaching the limit.`);
      } else {
        setStatus('OK');
        setMessage('All systems operational. Keep up the good work!');
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const bgColor = {
    OK: 'bg-green-50 dark:bg-github-canvas-inset border-green-200 dark:border-github-border',
    WARNING: 'bg-yellow-50 dark:bg-github-canvas-inset border-yellow-200 dark:border-github-border',
    VIOLATION: 'bg-red-50 dark:bg-github-canvas-inset border-red-200 dark:border-github-border',
  }[status];

  const textColor = {
    OK: 'text-green-800 dark:text-github-text-secondary',
    WARNING: 'text-yellow-800 dark:text-github-text-secondary',
    VIOLATION: 'text-red-800 dark:text-github-text-secondary',
  }[status];

  return (
    <div className={`${bgColor} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {status === 'OK' && '✅'}
            {status === 'WARNING' && '⚠️'}
            {status === 'VIOLATION' && '🚨'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">Current Status:</span>
              <Badge variant={status === 'OK' ? 'success' : status === 'WARNING' ? 'warning' : 'danger'}>
                {status}
              </Badge>
            </div>
            <p className={`text-sm ${textColor}`}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
