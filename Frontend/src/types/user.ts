export interface User {
  id: string; // Add id as alias for _id
  _id: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  username: string;
  email?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string | Date;
  updatedAt: string | Date;
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
