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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <ShieldOff className="w-3.5 h-3.5" />
          Spectator
        </span>
      );
    }
    if (violations > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Creative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <GitCommit className="w-3.5 h-3.5" />
        Survival
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Player Identity</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">World Link</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Last Pulse</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">EXP</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Flags</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Game Mode</th>
            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-medium text-gray-900 mb-1">No players found</span>
                  <span className="text-sm">There are no entities detected in this world currently.</span>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className="group hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/users/${user._id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Github className="w-4 h-4" />
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {user.selectedRepo || 'Offline'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600 font-medium">2h ago</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-gray-900">{user.totalCommits || 0}</span>
                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[70%] rounded-full" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${user.violations > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {user.violations || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    {getStatusBadge(user.violations || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors ml-auto" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
