import { useState } from 'react';
import { ShieldCheck, Clock, Bell, Info, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <form onSubmit={handleSubmit} className="space-y-12 font-['Minecraftia']">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Maximum Inactivity */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 border-4 border-black bg-[#404040]">
              <Clock className="w-6 h-6 text-[#58a6ff]" />
            </div>
            <label className="text-sm font-black text-[#404040] uppercase tracking-widest leading-none">
              Commit Gap Limit (HR)
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={settings.maxInactivityGapHours}
            onChange={(e) => handleChange('maxInactivityGapHours', parseInt(e.target.value))}
            className="mc-input w-full p-6 text-2xl font-black border-4"
            required
          />
          <p className="text-[10px] text-[#8b8b8b] font-bold uppercase tracking-wider leading-relaxed">
            MAX TIME ALLOWED BETWEEN SAVES BEFORE ENTITY IS FLAGGED.
          </p>
        </div>

        {/* Grace Period */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 border-4 border-black bg-[#404040]">
              <ShieldCheck className="w-6 h-6 text-[#5da045]" />
            </div>
            <label className="text-sm font-black text-[#404040] uppercase tracking-widest leading-none">
              Grace Buff (HR)
            </label>
          </div>
          <input
            type="number"
            min="0"
            value={settings.gracePeriodHours}
            onChange={(e) => handleChange('gracePeriodHours', parseInt(e.target.value))}
            className="mc-input w-full p-6 text-2xl font-black border-4"
            required
          />
          <p className="text-[10px] text-[#8b8b8b] font-bold uppercase tracking-wider leading-relaxed">
            EXTRA BUFFER TIME GRANTED BEFORE INFRACTION IS LOGGED.
          </p>
        </div>

        {/* Warning Threshold */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 border-4 border-black bg-[#404040]">
              <Info className="w-6 h-6 text-[#fbc02d]" />
            </div>
            <label className="text-sm font-black text-[#404040] uppercase tracking-widest leading-none">
              Warning Radar (HR)
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={settings.warningThresholdHours}
            onChange={(e) => handleChange('warningThresholdHours', parseInt(e.target.value))}
            className="mc-input w-full p-6 text-2xl font-black border-4"
            required
          />
          <p className="text-[10px] text-[#8b8b8b] font-bold uppercase tracking-wider leading-relaxed">
            NOTIFY ENTITY WHEN THEY APPROACH THE GAP LIMIT.
          </p>
        </div>

        {/* Notifications Toggle */}
        <div className="p-8 bg-[#b0b0b0] border-4 border-black flex items-center justify-between shadow-[inset_2px_2px_#dbdbdb,inset_-2px_-2px_#8b8b8b]">
          <div className="flex items-center gap-6">
            <div className={`p-4 border-4 border-black transition-colors ${settings.enableNotifications ? 'bg-[#5da045]' : 'bg-[#e53935]'}`}>
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-[#1a1a1a] uppercase mc-text-shadow-light">Alert System</p>
              <p className={`text-[10px] font-black uppercase ${settings.enableNotifications ? 'text-[#3d6b2d]' : 'text-[#8b1a1a]'}`}>
                {settings.enableNotifications ? 'BROADCAST ACTIVE' : 'BROADCAST SILENCED'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleChange('enableNotifications', !settings.enableNotifications)}
            className={`w-20 h-10 border-4 border-black transition-all relative ${settings.enableNotifications ? 'bg-[#5da045]' : 'bg-[#e53935]'}`}
            style={{ boxShadow: 'inset -4px -4px rgba(0,0,0,0.2), inset 4px 4px rgba(255,255,255,0.2)' }}
          >
            <div className={`absolute top-0 w-8 h-[calc(100%+0px)] bg-white border-x-4 border-black transition-all ${settings.enableNotifications ? 'right-0' : 'left-0'}`} />
          </button>
        </div>
      </div>

      <div className="pt-8 border-t-4 border-black/10">
        <button
          type="submit"
          disabled={saving}
          className="mc-button mc-button-primary w-full py-6 text-2xl font-black uppercase mc-text-shadow border-4"
        >
          {saving ? 'UPDATING WORLD...' : 'SAVE CONFIGURATION'}
        </button>
      </div>

      {/* Logic Summary Display */}
      <div className="bg-[#404040] p-8 border-4 border-black grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'BASE GAP', value: `${settings.maxInactivityGapHours}H`, color: 'text-[#58a6ff]' },
          { label: 'GRACE', value: `${settings.gracePeriodHours}H`, color: 'text-[#5da045]' },
          { label: 'RADAR', value: `${settings.warningThresholdHours}H`, color: 'text-[#fbc02d]' },
          { label: 'TIMEOUT', value: `${settings.maxInactivityGapHours + settings.gracePeriodHours}H`, color: 'text-[#e53935]' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-[#aaaaaa] font-black uppercase tracking-[0.2em] mb-2">{item.label}</p>
            <p className={`text-3xl font-black ${item.color} mc-text-shadow`}>{item.value}</p>
          </div>
        ))}
      </div>
    </form>
  );
};

export default RulesForm;
