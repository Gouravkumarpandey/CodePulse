export interface AdminRule {
  _id: string;
  maxInactivityGapHours: number;
  gracePeriodHours: number;
  warningThresholdHours: number;
  enableNotifications: boolean;
  notificationEmail?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleViolation {
  userId: string;
  repoId: string;
  commitId: string;
  gapHours: number;
  violationDate: Date;
  status: 'WARNING' | 'VIOLATION';
}
