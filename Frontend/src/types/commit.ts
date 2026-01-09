export interface Commit {
  _id: string;
  repoId: string;
  userId: string;
  commitSha: string;
  message: string;
  author: string;
  committer: string;
  commitDate: Date;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  branch?: string;
  status: 'OK' | 'WARNING' | 'VIOLATION';
  inactivityGap?: number;
  isViolation: boolean;
  createdAt: Date;
}
