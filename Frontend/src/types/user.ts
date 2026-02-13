export interface User {
  _id: string;
  githubId: string;
  username: string;
  email?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  // Profile fields
  fullName?: string;
  teamName?: string;
  avatarId?: number;
  coins?: number;
  settings?: {
    inactivityAlert: boolean;
    burstCommitWarning: boolean;
    emailNotifications: boolean;
    dailySummary?: boolean;
  };
  notifications?: { // Keep for backward compatibility if needed, but prefer settings
    inactivityAlert: boolean;
    burstCommitWarning: boolean;
    emailNotifications: boolean;
    dailySummary: boolean;
  };
  // Admin monitoring fields
  selectedRepo?: string;
  totalCommits?: number;
  consistencyScore?: number;
  warnings?: number;
  violations?: number;
}
