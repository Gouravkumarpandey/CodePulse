/**
 * Activity Service
 * Handles commit processing and storage with consistency analysis
 */

const FirestoreService = require('./firestore.service');
const ruleEngine = require('./ruleEngine.service');
const ConsistencyService = require('./consistency.service');
const AIInsightsService = require('./ai.service');

class ActivityService {
  /**
   * Process a commit from GitHub webhook
   */
  static async processCommit(repoId, userId, commitData) {
    try {
      // Check if commit already exists
      const existingCommit = await FirestoreService.getCommitBySha(commitData.id);
      if (existingCommit) {
        return existingCommit;
      }

      // Get previous commit for gap calculation
      const commits = await FirestoreService.getCommitsByRepo(repoId, 1);
      const previousCommit = commits.length > 0 ? commits[0] : null;

      // Validate against rules
      const validation = await ruleEngine.validateCommit({
        commitDate: new Date(commitData.timestamp),
        previousCommitDate: previousCommit?.commitDate,
      });

      // Create commit record
      const commit = {
        repoId,
        userId,
        commitSha: commitData.id,
        message: commitData.message,
        author: commitData.author?.name,
        committer: commitData.committer?.name,
        commitDate: new Date(commitData.timestamp),
        filesChanged: commitData.added?.length + commitData.modified?.length + commitData.removed?.length,
        additions: commitData.added?.length || 0,
        deletions: commitData.removed?.length || 0,
        branch: commitData.branch || 'main',
        status: validation.status || 'OK',
        inactivityGap: validation.gap,
        isViolation: validation.isValid === false,
      };

      await FirestoreService.saveCommit(commit);

      return commit;
    } catch (error) {
      console.error('Error processing commit:', error);
      throw error;
    }
  }

  /**
   * Get activity summary for a repository with AI insights
   */
  static async getRepositoryActivitySummary(repoId) {
    try {
      const commits = await FirestoreService.getCommitsByRepo(repoId, 100);

      if (commits.length === 0) {
        return {
          totalCommits: 0,
          violations: 0,
          warnings: 0,
          consistencyScore: 0,
          aiInsights: 'No commits found. Start committing to see insights!',
        };
      }

      // Calculate consistency metrics
      const consistency = ConsistencyService.calculateConsistencyScore(commits);

      const summary = {
        totalCommits: commits.length,
        violations: commits.filter((c) => c.status === 'VIOLATION').length,
        warnings: commits.filter((c) => c.status === 'WARNING').length,
        lastCommit: commits[0],
        averageGap: this.calculateAverageGap(commits),
        consistencyScore: consistency.score,
        consistencyGrade: ConsistencyService.getGrade(consistency.score),
        longestGap: consistency.gaps.longest,
        burstCommits: consistency.bursts.totalCommits,
        lastMinuteCommits: consistency.lastMinutePattern.lastMinuteCommits,
        timelineSpan: consistency.timelineSpan,
        distribution: consistency.distribution,
      };

      // Generate AI insights
      try {
        summary.aiInsights = await AIInsightsService.generateInsights(summary);
        summary.suggestions = AIInsightsService.generateSuggestions(summary);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        summary.aiInsights = 'Insights temporarily unavailable.';
        summary.suggestions = [];
      }

      return summary;
    } catch (error) {
      throw new Error('Failed to get activity summary: ' + error.message);
    }
  }

  /**
   * Calculate average inactivity gap
   */
  static calculateAverageGap(commits) {
    if (commits.length < 2) return 0;

    const gaps = commits
      .slice(0, -1)
      .map((c, i) => c.inactivityGap || 0)
      .filter((g) => g > 0);

    return gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  }
}

module.exports = ActivityService;
