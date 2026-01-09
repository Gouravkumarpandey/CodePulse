import { useState } from 'react';
import Button from '@/components/common/Button';

interface AdminSettings {
  maxInactivityGapHours: number;
  gracePeriodHours: number;
  warningThresholdHours: number;
  enableNotifications: boolean;
}

interface RulesFormProps {
  initialSettings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
}

const RulesForm: React.FC<RulesFormProps> = ({ initialSettings, onSave }) => {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof AdminSettings, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
          Inactivity Rules
        </h3>
        <p className="text-sm text-gray-600 dark:text-github-text-secondary mb-6">
          Configure global rules for monitoring user commit activity
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-github-text-secondary mb-2">
            Maximum Inactivity Gap (hours)
          </label>
          <input
            type="number"
            min="1"
            value={settings.maxInactivityGapHours}
            onChange={(e) => handleChange('maxInactivityGapHours', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-github-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-github-canvas-subtle text-gray-900 dark:text-github-text"
            required
          />
          <p className="text-xs text-gray-500 dark:text-github-text-secondary mt-1">
            Maximum allowed time between commits before flagging as violation
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-github-text-secondary mb-2">
            Grace Period (hours)
          </label>
          <input
            type="number"
            min="0"
            value={settings.gracePeriodHours}
            onChange={(e) => handleChange('gracePeriodHours', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-github-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-github-canvas-subtle text-gray-900 dark:text-github-text"
            required
          />
          <p className="text-xs text-gray-500 dark:text-github-text-secondary mt-1">
            Additional time before marking as violation after max gap
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-github-text-secondary mb-2">
            Warning Threshold (hours)
          </label>
          <input
            type="number"
            min="1"
            value={settings.warningThresholdHours}
            onChange={(e) => handleChange('warningThresholdHours', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-github-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-github-canvas-subtle text-gray-900 dark:text-github-text"
            required
          />
          <p className="text-xs text-gray-500 dark:text-github-text-secondary mt-1">
            Show warning when inactivity approaches this threshold
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableNotifications"
            checked={settings.enableNotifications}
            onChange={(e) => handleChange('enableNotifications', e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-github-border rounded focus:ring-indigo-500"
          />
          <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700 dark:text-github-text-secondary">
            Enable email notifications for violations
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-github-border">
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
          className="w-full md:w-auto"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-github-canvas-inset border border-blue-200 dark:border-github-border rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-github-accent mb-2">Current Configuration:</h4>
        <ul className="text-sm text-blue-800 dark:text-github-text-secondary space-y-1">
          <li>• Max Gap: {settings.maxInactivityGapHours} hours</li>
          <li>• Grace Period: {settings.gracePeriodHours} hours</li>
          <li>• Warning Threshold: {settings.warningThresholdHours} hours</li>
          <li>• Total allowed gap: {settings.maxInactivityGapHours + settings.gracePeriodHours} hours</li>
        </ul>
      </div>
    </form>
  );
};

export default RulesForm;
