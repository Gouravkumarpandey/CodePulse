import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Settings as SettingsIcon,
  Users,
  AlertTriangle,
  Download,
  Eye,
  Ban,
  LogOut,
  Search,
  Filter,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'settings' | 'analytics'>('monitoring');
  const [settings, setSettings] = useState({
    maxIdleTime: 2,
    warningThreshold: 3,
    autoDisqualify: true,
    codeDumpDetection: true,
    shadowMode: false,
    realTimeUpdates: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock teams data - replace with API call to Firestore
  const mockTeams: any[] = [];

  // Mock heatmap data - replace with API call to Firestore
  const mockHeatmapData: any[] = [];

  const filteredTeams = mockTeams.filter(
    (team) =>
      team.repoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = () => {
    console.log('Exporting compliance report...');
  };

  const handleIssueWarning = (teamId: string) => {
    console.log('Issuing warning to team:', teamId);
  };

  const handleMarkObservation = (teamId: string) => {
    console.log('Marking team under observation:', teamId);
  };

  const handleDisqualify = (teamId: string) => {
    console.log('Disqualifying team:', teamId);
  };

  return (
    <div className="min-h-screen bg-github-bg">
      {/* Header */}
      <header className="border-b border-github-border bg-github-canvas-subtle sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-github-danger to-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-github-text">Admin Dashboard</h1>
                <p className="text-sm text-github-text-secondary">Hackathon Compliance Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleExportReport}>
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-github-canvas-inset rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-github-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-github-border bg-github-canvas-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'monitoring', label: 'Team Monitoring', icon: Users },
              { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
              { id: 'analytics', label: 'Analytics', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-github-accent text-github-text'
                    : 'border-transparent text-github-text-secondary hover:text-github-text'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-github-text-secondary mb-1">Total Teams</p>
                    <p className="text-3xl font-bold text-github-text">{mockTeams.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-github-accent" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-github-text-secondary mb-1">Compliant</p>
                    <p className="text-3xl font-bold text-github-success">
                      {mockTeams.filter((t) => t.status === 'compliant').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-github-success/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-github-success" />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-github-text-secondary mb-1">Under Watch</p>
                    <p className="text-3xl font-bold text-github-warning">
                      {mockTeams.filter((t) => t.status === 'observation' || t.status === 'warning').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-github-warning/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-github-warning" />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-github-text-secondary mb-1">Disqualified</p>
                    <p className="text-3xl font-bold text-github-danger">
                      {mockTeams.filter((t) => t.status === 'disqualified').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-github-danger/10 rounded-lg flex items-center justify-center">
                    <Ban className="w-5 h-5 text-github-danger" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-github-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search teams by repository or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-github-canvas-inset border border-github-border rounded-md text-github-text placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                  />
                </div>
                <Button variant="ghost">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </Card>

            {/* Teams Table */}
            <Card title="Team Monitoring">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-github-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Repository</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Owner</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Last Commit</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Violations</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-github-text">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-github-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="border-b border-github-border hover:bg-github-canvas-inset transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-github-text">{team.repoName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-github-text-secondary">{team.owner}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-github-text-secondary">{team.lastCommit}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              team.violations === 0
                                ? 'bg-github-success/10 text-github-success'
                                : team.violations < 3
                                ? 'bg-github-warning/10 text-github-warning'
                                : 'bg-github-danger/10 text-github-danger'
                            }`}
                          >
                            {team.violations}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-github-canvas-inset rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  team.complianceScore >= 70
                                    ? 'bg-github-success'
                                    : team.complianceScore >= 50
                                    ? 'bg-github-warning'
                                    : 'bg-github-danger'
                                }`}
                                style={{ width: `${team.complianceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-github-text-secondary">{team.complianceScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={team.status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleIssueWarning(team.id)}
                              className="p-1.5 hover:bg-github-warning/10 rounded text-github-warning transition-colors"
                              title="Issue Warning"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMarkObservation(team.id)}
                              className="p-1.5 hover:bg-github-accent/10 rounded text-github-accent transition-colors"
                              title="Mark Under Observation"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDisqualify(team.id)}
                              className="p-1.5 hover:bg-github-danger/10 rounded text-github-danger transition-colors"
                              title="Disqualify"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Global Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <Card title="Rule Configuration" subtitle="Configure hackathon compliance rules">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-github-text mb-2">
                    Maximum Idle Time (hours)
                  </label>
                  <select
                    value={settings.maxIdleTime}
                    onChange={(e) => setSettings({ ...settings, maxIdleTime: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-github-canvas-inset border border-github-border rounded-md text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                  <p className="text-xs text-github-text-secondary mt-1">
                    Maximum allowed time between commits before triggering a warning
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-github-text mb-2">
                    Warning Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.warningThreshold}
                    onChange={(e) => setSettings({ ...settings, warningThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-github-canvas-inset border border-github-border rounded-md text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                  />
                  <p className="text-xs text-github-text-secondary mt-1">
                    Number of violations before disqualification
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-github-border">
                  <div>
                    <p className="text-sm font-medium text-github-text">Auto-Disqualification</p>
                    <p className="text-xs text-github-text-secondary">
                      Automatically disqualify teams exceeding warning threshold
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoDisqualify}
                      onChange={(e) => setSettings({ ...settings, autoDisqualify: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-github-border rounded-full peer peer-checked:bg-github-success peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-github-border">
                  <div>
                    <p className="text-sm font-medium text-github-text">Code Dump Detection</p>
                    <p className="text-xs text-github-text-secondary">
                      Detect and flag suspicious large code commits
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.codeDumpDetection}
                      onChange={(e) => setSettings({ ...settings, codeDumpDetection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-github-border rounded-full peer peer-checked:bg-github-success peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-github-border">
                  <div>
                    <p className="text-sm font-medium text-github-text">Shadow Monitoring Mode</p>
                    <p className="text-xs text-github-text-secondary">
                      Monitor teams without revealing specific rules
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.shadowMode}
                      onChange={(e) => setSettings({ ...settings, shadowMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-github-border rounded-full peer peer-checked:bg-github-success peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-github-border">
                  <div>
                    <p className="text-sm font-medium text-github-text">Real-time Updates</p>
                    <p className="text-xs text-github-text-secondary">
                      Enable webhook-based real-time monitoring
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.realTimeUpdates}
                      onChange={(e) => setSettings({ ...settings, realTimeUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-github-border rounded-full peer peer-checked:bg-github-success peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-github-border">
                  <Button variant="primary">Save Settings</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card title="Commit Frequency Heatmap" subtitle="Hourly commit patterns across all teams">
              <div className="grid grid-cols-24 gap-1">
                {mockHeatmapData.map((cell, index) => {
                  const intensity = Math.min(cell.value / 20, 1);
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded"
                      style={{
                        backgroundColor: `rgba(46, 160, 67, ${intensity})`,
                      }}
                      title={`${cell.day} ${cell.hour}:00 - ${cell.value} commits`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-github-text-secondary">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                    <div
                      key={intensity}
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: `rgba(46, 160, 67, ${intensity})` }}
                    ></div>
                  ))}
                </div>
                <span>More</span>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Code Dump Indicators">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Flagged Commits</span>
                    <span className="text-sm font-semibold text-github-danger">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Under Review</span>
                    <span className="text-sm font-semibold text-github-warning">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">False Positives</span>
                    <span className="text-sm font-semibold text-github-text">3</span>
                  </div>
                </div>
              </Card>

              <Card title="Suspicious Activities">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Late Night Commits</span>
                    <span className="text-sm font-semibold text-github-warning">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Unusual Patterns</span>
                    <span className="text-sm font-semibold text-github-danger">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Verified</span>
                    <span className="text-sm font-semibold text-github-success">25</span>
                  </div>
                </div>
              </Card>

              <Card title="Contributor Authenticity">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Verified Contributors</span>
                    <span className="text-sm font-semibold text-github-success">89%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Pending Review</span>
                    <span className="text-sm font-semibold text-github-warning">7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-github-text-secondary">Suspicious</span>
                    <span className="text-sm font-semibold text-github-danger">4%</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
