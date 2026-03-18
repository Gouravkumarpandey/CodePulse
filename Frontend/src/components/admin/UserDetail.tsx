import { User } from '@/types/user';
import {
  Activity, Clock, AlertTriangle,
  TrendingUp, GitBranch, ShieldAlert,
  History, Calendar, Zap
} from 'lucide-react';
import { XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

interface UserDetailProps {
  user: User;
  analysis?: {
    totalCommits: number;
    consistencyScore: number;
    longestGapHours: number;
    averageGapHours: number;
    burstCommits: number;
    warnings: string[];
    violations: string[];
    aiInsight: string;
    timeline: Array<{ date: string; commits: number }>;
    hourlyDistribution: Array<{ hour: string; commits: number }>;
    recentCommits?: Array<{ hash: string; message: string; time: string; diffItems: number }>;
  };
}

const UserDetail: React.FC<UserDetailProps> = ({ user, analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#5da045]';
    if (score >= 60) return 'text-[#fbc02d]';
    return 'text-[#e53935]';
  };

  const mockTimeline = [
    { date: '12:00', commits: 5 },
    { date: '14:00', commits: 8 },
    { date: '16:00', commits: 3 },
    { date: '18:00', commits: 12 },
    { date: '20:00', commits: 7 },
  ];

  const pushFreqData = [
    { name: 'Morning', value: 40 },
    { name: 'Afternoon', value: 30 },
    { name: 'Evening', value: 20 },
    { name: 'Night', value: 10 },
  ];
  const COLORS = ['#5da045', '#58a6ff', '#fbc02d', '#e53935'];

  return (
    <div className="space-y-8 font-sans">
      {/* Entity Profile Panel */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center gap-10 border-b border-white/10 relative">

          <div className="relative z-10">
            <div className="p-2 bg-slate-800 rounded-full border border-white/10 shadow-xl">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=0ea5e9&color=fff`}
                alt=""
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-green-500 text-white text-[10px] font-bold uppercase rounded-full shadow-lg whitespace-nowrap">
              {user.totalCommits || 0} XP
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-[0.1em] uppercase drop-shadow-md" style={{ fontFamily: '"Minecraftia", sans-serif' }}>{user.username}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">@{user.githubId}</span>
                <div className="px-3 py-1 bg-slate-800 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10">
                  {user.role} RANK
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                <GitBranch className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Repo</p>
                  <p className="text-sm text-white font-bold leading-none mt-1 truncate max-w-[200px]">{user.selectedRepo || 'NONE'}</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joined</p>
                  <p className="text-sm text-white font-bold leading-none mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {analysis && (
            <div className="flex flex-col items-center md:items-end justify-center z-10">
              <div className={`text-6xl font-black ${getScoreColor(analysis.consistencyScore)} drop-shadow-lg tracking-tighter`} style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                {analysis.consistencyScore}%
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">Forensic Score</p>
              <div className={`mt-3 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase ${analysis.consistencyScore >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : analysis.consistencyScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {analysis.consistencyScore >= 80 ? 'Excellent' : analysis.consistencyScore >= 60 ? 'Caution' : 'Critical'}
              </div>
            </div>
          )}
        </div>

        {/* Grid: Quick Stats */}
        <div className="bg-slate-900/40 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-t border-white/10">
          {[
            { label: 'Total Commits', value: analysis?.totalCommits || user.totalCommits || 0, icon: Activity, color: 'text-green-500' },
            { label: 'Avg Gap', value: `${analysis?.averageGapHours.toFixed(1) || 0}h`, icon: Clock, color: 'text-blue-500' },
            { label: 'Max Gap', value: `${analysis?.longestGapHours.toFixed(1) || 0}h`, icon: AlertTriangle, color: 'text-yellow-500' },
            { label: 'Flags', value: analysis?.violations.length || 0, icon: ShieldAlert, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors group">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <span className={`text-2xl font-bold text-white`} style={{ fontFamily: '"Minecraftia", sans-serif' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Graph Panel */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Daily Activity</h3>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.timeline || mockTimeline}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: '600' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: '600' }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frequency Radial */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5 text-center">
              <h3 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Push Frequency</h3>
            </div>
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pushFreqData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pushFreqData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 w-full px-4">
                {pushFreqData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-medium text-gray-300">{d.name} <span className="text-gray-500">({d.value}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Data Panels */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commit Archive */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>Recent Commits</h3>
              <History className="w-5 h-5 text-gray-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5">
                  <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Commit Message</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-right">Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(analysis.recentCommits || []).map((c, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-200 truncate max-w-[250px]">{c.message}</div>
                        <div className="text-[10px] font-mono text-blue-400 mt-1">{c.hash}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500 font-medium">{c.time}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-bold text-green-400">+{c.diffItems} lines</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!analysis.recentCommits || analysis.recentCommits.length === 0) && (
                <div className="p-8 text-center text-gray-500 text-sm">No recent commits found.</div>
              )}
            </div>
          </div>

          {/* Security Sentinel Log */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-red-500/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-50 tracking-wide flex items-center gap-3" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Sentinel Log
              </h3>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
            </div>
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {analysis.violations.length === 0 && analysis.warnings.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-green-400 uppercase tracking-widest">System Secure</p>
                  <p className="text-xs text-gray-500 mt-1">No infractions detected so far.</p>
                </div>
              ) : (
                <>
                  {analysis.violations.map((v, i) => (
                    <div key={i} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-4">
                      <div className="w-1 bg-red-500 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-red-400 leading-none mb-1 uppercase tracking-wider">Critical Violation</p>
                        <p className="text-sm text-gray-300">"{v}"</p>
                      </div>
                    </div>
                  ))}
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex gap-4">
                      <div className="w-1 bg-yellow-500 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-yellow-500 leading-none mb-1 uppercase tracking-wider">Warning</p>
                        <p className="text-sm text-gray-300">"{w}"</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Insight */}
      {analysis?.aiInsight && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="p-8 flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: '"Minecraftia", sans-serif' }}>AI Forensic Analysis</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">Beta</span>
              </div>
              <p className="text-gray-300 leading-relaxed italic text-lg opacity-90 font-medium">
                "{analysis.aiInsight}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
