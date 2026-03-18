import { useState } from 'react';
import { ShieldCheck, Clock, Bell, Info, Save, Timer } from 'lucide-react';

interface AdminSettings {
  maxInactivityGapHours: number;
  gracePeriodHours: number;
  warningThresholdHours: number;
  enableNotifications: boolean;
  totalHackathonDurationHours?: number;
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
    <form onSubmit={handleSubmit} className="space-y-12 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Maximum Inactivity */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-none">
              Commit Gap Limit (HR)
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={settings.maxInactivityGapHours}
            onChange={(e) => handleChange('maxInactivityGapHours', parseInt(e.target.value))}
            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500 shadow-inner"
            required
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed ml-1">
            Max time allowed between saves before entity is flagged.
          </p>
        </div>

        {/* Grace Period */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shadow-lg shadow-green-500/10">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-none">
              Grace Buff (HR)
            </label>
          </div>
          <input
            type="number"
            min="0"
            value={settings.gracePeriodHours}
            onChange={(e) => handleChange('gracePeriodHours', parseInt(e.target.value))}
            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl text-2xl font-bold text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 outline-none transition-all placeholder-gray-500 shadow-inner"
            required
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed ml-1">
            Extra buffer time granted before infraction is logged.
          </p>
        </div>

        {/* Warning Threshold */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
              <Info className="w-6 h-6 text-yellow-500" />
            </div>
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-none">
              Warning Radar (HR)
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={settings.warningThresholdHours}
            onChange={(e) => handleChange('warningThresholdHours', parseInt(e.target.value))}
            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl text-2xl font-bold text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 outline-none transition-all placeholder-gray-500 shadow-inner"
            required
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed ml-1">
            Notify entity when they approach the gap limit.
          </p>
        </div>

        {/* Hackathon Duration */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <Timer className="w-6 h-6 text-purple-400" />
            </div>
            <label className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-none">
              Hackathon Duration (HR)
            </label>
          </div>
          <input
            type="number"
            min="1"
            value={settings.totalHackathonDurationHours || 48}
            onChange={(e) => handleChange('totalHackathonDurationHours', parseInt(e.target.value))}
            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl text-2xl font-bold text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder-gray-500 shadow-inner"
            required
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed ml-1">
            The total length of the hackathon event.
          </p>
        </div>

        {/* Notifications Toggle */}
        <div className="p-8 bg-slate-800/50 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg hover:bg-slate-800 transition-all">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-xl transition-all ${settings.enableNotifications ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-white uppercase tracking-wide">Alert System</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${settings.enableNotifications ? 'text-green-400' : 'text-red-400'}`}>
                {settings.enableNotifications ? 'Broadcast Active' : 'Broadcast Silenced'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleChange('enableNotifications', !settings.enableNotifications)}
            className={`w-16 h-8 rounded-full transition-all relative ${settings.enableNotifications ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-700 shadow-inner'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.enableNotifications ? 'left-[calc(100%-28px)]' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 uppercase tracking-[0.2em] transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating World...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Configuration
            </>
          )}
        </button>
      </div>

      {/* Logic Summary Display */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        {[
          { label: 'Base Gap', value: `${settings.maxInactivityGapHours}hr`, color: 'text-blue-400' },
          { label: 'Grace', value: `${settings.gracePeriodHours}hr`, color: 'text-green-400' },
          { label: 'Radar', value: `${settings.warningThresholdHours}hr`, color: 'text-yellow-400' },
          { label: 'Session', value: `${settings.totalHackathonDurationHours || 48}hr`, color: 'text-purple-400' },
          { label: 'Timeout', value: `${settings.maxInactivityGapHours + settings.gracePeriodHours}hr`, color: 'text-red-400' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2">{item.label}</p>
            <p className={`text-3xl font-black ${item.color} tracking-tight drop-shadow-lg`} style={{ fontFamily: '"Minecraftia", sans-serif' }}>{item.value}</p>
          </div>
        ))}
      </div>
    </form>
  );
};
export default RulesForm;
