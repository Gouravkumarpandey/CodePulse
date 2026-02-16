import { useNavigate } from 'react-router-dom';
import {
  GitCommit, AlertCircle, ShieldOff,
  ChevronRight, Github
} from 'lucide-react';

interface UsersTableProps {
  users: any[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const navigate = useNavigate();

  const getStatusBadge = (violations: number) => {
    if (violations >= 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
          <ShieldOff className="w-3.5 h-3.5" />
          Spectator
        </span>
      );
    }
    if (violations > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          Creative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
        <GitCommit className="w-3.5 h-3.5" />
        Survival
      </span>
    );
  };

  return (
    <div className="overflow-x-auto custom-scrollbar rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Player Identity</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">World Link</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Last Pulse</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">EXP</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Flags</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Game Mode</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <ShieldOff className="w-8 h-8 text-gray-500" />
                  </div>
                  <span className="text-xl font-bold text-white mb-2" style={{ fontFamily: '"Minecraftia", sans-serif' }}>No players found</span>
                  <span className="text-sm font-medium text-gray-500">There are no entities detected in this world currently.</span>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className="group hover:bg-white/5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/admin/users/${user._id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.username}</div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Github className="w-4 h-4" />
                    <span className="text-sm font-bold truncate max-w-[150px] group-hover:text-white transition-colors">
                      {user.activeRepoName || 'Offline'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">{user.lastPulse || 'Never'}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-black text-white">{user.totalCommits || 0}</span>
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-black ${user.violations > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {user.violations || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    {getStatusBadge(user.violations || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all group-hover:border-white/20 hover:scale-110 active:scale-95">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
