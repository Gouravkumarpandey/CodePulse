import { User } from '@/types/user';
import {
  Activity, GitCommit, Clock, AlertTriangle,
  TrendingUp, GitBranch, Database, ShieldAlert,
  History, Calendar, Info, ArrowUpRight,
  User as UserIcon, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

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
    <div className="space-y-8 font-['Minecraftia']">
      {/* Entity Profile Panel */}
      <div className="mc-panel p-1 shadow-2xl">
        <div className="bg-[#404040] p-10 flex flex-col md:flex-row items-center gap-10 border-b-4 border-black relative overflow-hidden">
          {/* Background Texture Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("/image/dirt.png")', backgroundSize: '64px' }} />

          <div className="relative z-10">
            <div className="p-2 border-8 border-black bg-[#c6c6c6]">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=58a6ff&color=fff`}
                alt=""
                className="w-40 h-40 image-rendering-pixelated border-4 border-black"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 border-4 border-black bg-[#5da045] text-white text-[10px] font-black uppercase shadow-[inset_-2px_-2px_#3d6b2d,inset_2px_2px_#8fcf76]">
              XP: {user.totalCommits || 0}
            </div>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
            <div>
              <h2 className="text-5xl font-black text-white mc-text-shadow tracking-[0.1em] uppercase">{user.username}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <span className="text-[#58a6ff] font-bold text-lg uppercase">@{user.githubId}</span>
                <div className="px-4 py-1 border-4 border-black bg-[#303030] text-[#aaaaaa] text-xs font-black uppercase tracking-widest">
                  {user.role} RANK
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 border-4 border-black flex items-center gap-4">
                <GitBranch className="w-6 h-6 text-[#58a6ff]" />
                <div>
                  <p className="text-[8px] text-[#aaaaaa] font-black uppercase tracking-widest">World Active</p>
                  <p className="text-xs text-white font-bold leading-none mt-1 uppercase truncate max-w-[200px]">{user.selectedRepo || 'NONE'}</p>
                </div>
              </div>
              <div className="p-4 bg-black/30 border-4 border-black flex items-center gap-4">
                <Calendar className="w-6 h-6 text-[#aaaaaa]" />
                <div>
                  <p className="text-[8px] text-[#aaaaaa] font-black uppercase tracking-widest">Spawn Date</p>
                  <p className="text-xs text-white font-bold leading-none mt-1 uppercase">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {analysis && (
            <div className="flex flex-col items-center md:items-end justify-center z-10">
              <div className={`text-7xl font-black ${getScoreColor(analysis.consistencyScore)} mc-text-shadow tracking-tighter`}>
                {analysis.consistencyScore}%
              </div>
              <p className="text-xs font-black text-[#aaaaaa] uppercase tracking-[0.3em] mt-2">Forensic Score</p>
              <div className={`mt-4 px-6 py-2 border-4 border-black text-xs font-black uppercase ${analysis.consistencyScore >= 80 ? 'bg-[#5da045] text-white' : analysis.consistencyScore >= 60 ? 'bg-[#fbc02d] text-black' : 'bg-[#e53935] text-white'}`}>
                {analysis.consistencyScore >= 80 ? 'EXCELLENT' : analysis.consistencyScore >= 60 ? 'CAUTION' : 'DANGER'}
              </div>
            </div>
          )}
        </div>

        {/* Grid: Quick Stats */}
        <div className="bg-[#c6c6c6] grid grid-cols-2 md:grid-cols-4 gap-0 border-b-4 border-black">
          {[
            { label: 'TOTAL EXP', value: analysis?.totalCommits || user.totalCommits || 0, icon: Activity, color: 'text-[#5da045]' },
            { label: 'AVG GAP', value: `${analysis?.averageGapHours.toFixed(1) || 0}H`, icon: Clock, color: 'text-[#58a6ff]' },
            { label: 'MAX GAP', value: `${analysis?.longestGapHours.toFixed(1) || 0}H`, icon: AlertTriangle, color: 'text-[#fbc02d]' },
            { label: 'FLAGS', value: analysis?.violations.length || 0, icon: ShieldAlert, color: 'text-[#e53935]' },
          ].map((stat, i) => (
            <div key={stat.label} className={`p-8 flex flex-col items-center text-center border-black ${i < 3 ? 'border-r-4' : ''}`}>
              <stat.icon className={`w-10 h-10 ${stat.color} mb-4`} />
              <p className="text-[10px] text-[#505050] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <span className={`text-4xl font-black ${stat.color} mc-text-shadow-light leading-none`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Graph Panel */}
          <div className="lg:col-span-2 mc-panel p-1 shadow-2xl">
            <div className="bg-[#404040] p-6 border-b-4 border-black flex items-center justify-between">
              <h3 className="text-xl font-bold text-white mc-text-shadow uppercase tracking-widest">Daily Intensity Distribution</h3>
              <TrendingUp className="w-8 h-8 text-[#5da045]" />
            </div>
            <div className="bg-[#c6c6c6] p-10 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.timeline || mockTimeline}>
                  <CartesianGrid strokeDasharray="0" stroke="#8b8b8b" />
                  <XAxis dataKey="date" stroke="#404040" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis stroke="#404040" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#c6c6c6', border: '4px solid #000', fontFamily: 'Minecraftia' }} />
                  <Area type="step" dataKey="commits" stroke="#5da045" strokeWidth={6} fill="#5da04533" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frequency Radial */}
          <div className="mc-panel p-1 shadow-2xl">
            <div className="bg-[#404040] p-6 border-b-4 border-black text-center">
              <h3 className="text-xl font-bold text-white mc-text-shadow uppercase tracking-widest">Push Frequency</h3>
            </div>
            <div className="bg-[#c6c6c6] p-10 flex flex-col items-center">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pushFreqData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={4}
                    >
                      {pushFreqData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {pushFreqData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 border-4 border-black" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black text-[#404040] uppercase">{d.name} ({d.value}%)</span>
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
          <div className="mc-panel p-1 shadow-2xl">
            <div className="bg-[#404040] p-6 border-b-4 border-black flex items-center justify-between">
              <h3 className="text-lg font-bold text-white mc-text-shadow uppercase tracking-widest">Commit Archive Logs</h3>
              <History className="w-6 h-6 text-[#aaaaaa]" />
            </div>
            <div className="bg-[#c6c6c6] overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-4 border-black">
                  <tr className="text-[#505050] text-[10px] font-black uppercase">
                    <th className="px-6 py-4">Context Block</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {(analysis.recentCommits || []).map((c, i) => (
                    <tr key={i} className="group hover:bg-black/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-xs font-black text-[#2a2a2a] uppercase leading-tight mb-1">{c.message}</div>
                        <div className="text-[9px] font-bold text-[#58a6ff] uppercase">{c.hash}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[10px] text-[#505050] font-black uppercase">{c.time}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-[10px] font-black text-[#5da045] uppercase">+{c.diffItems} UNITS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t-4 border-black bg-black/5 text-center">
                <button className="text-[10px] font-black text-[#505050] hover:text-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                  ACCESS FULL DATABASE
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Security Sentinel Log */}
          <div className="mc-panel p-1 shadow-2xl">
            <div className="bg-[#e53935] p-6 border-b-4 border-black flex items-center justify-between">
              <h3 className="text-lg font-bold text-white mc-text-shadow uppercase tracking-widest flex items-center gap-4">
                <ShieldAlert className="w-8 h-8" />
                Sentinel Infractions Log
              </h3>
              <div className="w-3 h-3 bg-black border-2 border-[#ff5252] animate-pulse" />
            </div>
            <div className="bg-[#c6c6c6] p-8 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {analysis.violations.length === 0 && analysis.warnings.length === 0 ? (
                <div className="py-20 text-center">
                  <Zap className="w-20 h-20 text-[#5da045] opacity-20 mx-auto mb-6" />
                  <p className="text-sm font-black text-[#5da045] uppercase tracking-widest">Protocol Compliant: No Incidents Logged</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis.violations.map((v, i) => (
                    <div key={i} className="p-6 border-4 border-black bg-[#ff5252]/10 relative group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#e53935]" />
                      <p className="text-xs font-black text-[#e53935] leading-none mb-2 uppercase">CRITICAL SYSTEM FLAG</p>
                      <p className="text-[10px] font-bold text-[#404040] uppercase italic leading-relaxed">"{v}"</p>
                    </div>
                  ))}
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="p-6 border-4 border-black bg-[#fbc02d]/10 relative group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#fbc02d]" />
                      <p className="text-xs font-black text-[#b88a00] leading-none mb-2 uppercase">BEHAVIORAL ANOMALY</p>
                      <p className="text-[10px] font-bold text-[#404040] uppercase italic leading-relaxed">"{w}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Insight */}
      {analysis?.aiInsight && (
        <div className="mc-panel p-1 shadow-2xl">
          <div className="bg-[#b0b0b0] p-10 border-4 border-black relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Zap className="w-64 h-64 text-black" />
            </div>
            <div className="flex items-start gap-8 relative z-10">
              <div className="p-6 border-4 border-black bg-black text-[#5da045] flex flex-col items-center">
                <Activity className="w-10 h-10 mb-2" />
                <span className="text-[8px] font-black">AI ANALYST</span>
              </div>
              <div className="flex-1 pt-2">
                <h4 className="text-2xl font-black text-[#404040] uppercase tracking-widest mb-4">Forensic Intelligence Insight</h4>
                <p className="text-sm font-bold text-[#2a2a2a] leading-relaxed italic border-l-8 border-black pl-8 max-w-4xl">
                  "{analysis.aiInsight}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
