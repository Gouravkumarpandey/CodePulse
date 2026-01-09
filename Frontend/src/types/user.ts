export interface User {
  _id: string;
  githubId: string;
  username: string;
  email?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  // Admin monitoring fields
  selectedRepo?: string;
  totalCommits?: number;
  consistencyScore?: number;
  warnings?: number;
  violations?: number;
}
