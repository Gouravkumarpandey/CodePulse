export type ComplianceStatus = 'compliant' | 'observation' | 'warning' | 'disqualified';

export type ViolationLevel = 'soft' | 'observation' | 'final' | 'disqualified';

export interface Repository {
  id: string;
  name: string;
  owner: string;
  isPrivate: boolean;
  contributorsCount: number;
  description?: string;
}

export interface Contributor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  commits: number;
  percentage: number;
}

export interface Violation {
  id: string;
  type: ViolationLevel;
  message: string;
  timestamp: string;
  details?: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error';
}

export interface CommitActivity {
  hour: string;
  commits: number;
  gap?: number;
  isViolation?: boolean;
}

export interface ConsistencyAnalysis {
  score: number;
  grade: string;
  totalCommits: number;
  averageGap: number;
  longestGap: number;
  burstCommits: number;
  lastMinuteCommits: number;
  timelineSpan: number;
  violations: number;
  warnings: number;
  aiInsights: string;
  suggestions: string[];
  distribution: {
    quarter1: number;
    quarter2: number;
    quarter3: number;
    quarter4: number;
  };
}

export interface UserDashboard {
  repository: {
    name: string;
    owner: string;
  };
  status: ComplianceStatus;
  stats: {
    totalCommits: number;
    prsOpened: number;
    prsMerged: number;
    activeContributors: number;
    longestGap: string;
  };
  commitTimeline: CommitActivity[];
  contributors: Contributor[];
  violations: Violation[];
  notifications: Notification[];
  complianceScore: number;
}

export interface TeamMonitoring {
  id: string;
  repoName: string;
  owner: string;
  lastCommit: string;
  violations: number;
  status: ComplianceStatus;
  complianceScore: number;
}

export interface HackathonRules {
  maxIdleTime: number; // in hours
  warningThreshold: number;
  autoDisqualify: boolean;
  codeDumpDetection: boolean;
}

export interface AdminSettings extends HackathonRules {
  shadowMode: boolean;
  realTimeUpdates: boolean;
}

export interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}
