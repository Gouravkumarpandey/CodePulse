/**
 * Consistency Analysis Service
 * Calculates consistency scores and analyzes commit patterns
 */

const Commit = require('../models/Commit');
const timeUtil = require('../utils/time.util');
const logger = require('../utils/logger.util');

class ConsistencyService {
  /**
   * Calculate overall consistency score
   * @param {Array} commits - Array of commit objects
   * @returns {Object} - Detailed consistency analysis
   */
  static calculateConsistencyScore(commits) {
    if (!commits || commits.length === 0) {
      return {
        score: 0,
        analysis: 'No commits to analyze',
      };
    }

    // Sort commits by date (oldest first)
    const sortedCommits = [...commits].sort((a, b) => 
      new Date(a.commitDate) - new Date(b.commitDate)
    );

    const analysis = {
      totalCommits: commits.length,
      timelineSpan: this.calculateTimelineSpan(sortedCommits),
      gaps: this.analyzeGaps(sortedCommits),
      bursts: this.detectBursts(sortedCommits),
      distribution: this.analyzeDistribution(sortedCommits),
      lastMinutePattern: this.detectLastMinutePattern(sortedCommits),
    };

    // Calculate weighted consistency score (0-100)
    const score = this.computeScore(analysis);

    return {
      score: Math.round(score),
      ...analysis,
    };
  }

  /**
   * Calculate timeline span in days
   * @private
   */
  static calculateTimelineSpan(commits) {
    if (commits.length < 2) return 0;

    const first = new Date(commits[0].commitDate);
    const last = new Date(commits[commits.length - 1].commitDate);
    const spanMs = last - first;
    
    return Math.ceil(spanMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Analyze gaps between commits
   * @private
   */
  static analyzeGaps(commits) {
    const gaps = [];
    
    for (let i = 1; i < commits.length; i++) {
      const gap = timeUtil.getGapInHours(
        commits[i - 1].commitDate,
        commits[i].commitDate
      );
      gaps.push(gap);
    }

    if (gaps.length === 0) {
      return { average: 0, longest: 0, shortest: 0, count: 0 };
    }

    return {
      average: gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length,
      longest: Math.max(...gaps),
      shortest: Math.min(...gaps),
      count: gaps.length,
      gaps: gaps,
    };
  }

  /**
   * Detect burst commits (multiple commits in short time)
   * @private
   */
  static detectBursts(commits) {
    const BURST_THRESHOLD_HOURS = 1; // Commits within 1 hour = burst
    const bursts = [];
    let currentBurst = [];

    for (let i = 1; i < commits.length; i++) {
      const gap = timeUtil.getGapInHours(
        commits[i - 1].commitDate,
        commits[i].commitDate
      );

      if (gap <= BURST_THRESHOLD_HOURS) {
        if (currentBurst.length === 0) {
          currentBurst.push(commits[i - 1]);
        }
        currentBurst.push(commits[i]);
      } else {
        if (currentBurst.length >= 3) {
          bursts.push([...currentBurst]);
        }
        currentBurst = [];
      }
    }

    // Check last burst
    if (currentBurst.length >= 3) {
      bursts.push(currentBurst);
    }

    const totalBurstCommits = bursts.reduce((sum, burst) => sum + burst.length, 0);

    return {
      count: bursts.length,
      totalCommits: totalBurstCommits,
      percentage: (totalBurstCommits / commits.length) * 100,
      bursts: bursts.map(burst => ({
        commitCount: burst.length,
        startTime: burst[0].commitDate,
        endTime: burst[burst.length - 1].commitDate,
      })),
    };
  }

  /**
   * Analyze commit distribution across timeline
   * @private
   */
  static analyzeDistribution(commits) {
    if (commits.length < 2) {
      return { segments: [], evenness: 100 };
    }

    const first = new Date(commits[0].commitDate);
    const last = new Date(commits[commits.length - 1].commitDate);
    const totalSpan = last - first;

    // Divide timeline into 4 quarters
    const segments = [
      { start: 0, end: 0.25, commits: 0 },
      { start: 0.25, end: 0.5, commits: 0 },
      { start: 0.5, end: 0.75, commits: 0 },
      { start: 0.75, end: 1, commits: 0 },
    ];

    commits.forEach(commit => {
      const commitTime = new Date(commit.commitDate);
      const position = (commitTime - first) / totalSpan;

      for (const segment of segments) {
        if (position >= segment.start && position <= segment.end) {
          segment.commits++;
          break;
        }
      }
    });

    // Calculate evenness (lower standard deviation = more even)
    const avgCommitsPerSegment = commits.length / 4;
    const variance = segments.reduce((sum, seg) => 
      sum + Math.pow(seg.commits - avgCommitsPerSegment, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);
    
    // Convert to percentage (lower deviation = higher evenness)
    const evenness = Math.max(0, 100 - (stdDev / avgCommitsPerSegment) * 100);

    return {
      segments: segments.map((seg, idx) => ({
        quarter: idx + 1,
        commits: seg.commits,
        percentage: (seg.commits / commits.length) * 100,
      })),
      evenness: evenness,
    };
  }

  /**
   * Detect last-minute commit pattern
   * @private
   */
  static detectLastMinutePattern(commits) {
    if (commits.length < 2) {
      return { lastMinuteCommits: 0, percentage: 0, isLastMinuteRush: false };
    }

    const first = new Date(commits[0].commitDate);
    const last = new Date(commits[commits.length - 1].commitDate);
    const totalSpan = last - first;
    const lastQuarterThreshold = first.getTime() + (totalSpan * 0.80); // Last 20%

    const lastMinuteCommits = commits.filter(commit => 
      new Date(commit.commitDate).getTime() >= lastQuarterThreshold
    ).length;

    const percentage = (lastMinuteCommits / commits.length) * 100;
    const isLastMinuteRush = percentage > 50; // More than half in last 20%

    return {
      lastMinuteCommits,
      percentage,
      isLastMinuteRush,
    };
  }

  /**
   * Compute final consistency score
   * @private
   */
  static computeScore(analysis) {
    let score = 100;

    // Penalty for long gaps (max -30 points)
    if (analysis.gaps.longest > 72) {
      score -= 30;
    } else if (analysis.gaps.longest > 48) {
      score -= 20;
    } else if (analysis.gaps.longest > 24) {
      score -= 10;
    }

    // Penalty for bursts (max -20 points)
    if (analysis.bursts.percentage > 50) {
      score -= 20;
    } else if (analysis.bursts.percentage > 30) {
      score -= 10;
    }

    // Penalty for uneven distribution (max -20 points)
    score -= (100 - analysis.distribution.evenness) * 0.2;

    // Penalty for last-minute pattern (max -30 points)
    if (analysis.lastMinutePattern.isLastMinuteRush) {
      score -= 30;
    } else if (analysis.lastMinutePattern.percentage > 40) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get consistency grade
   * @param {number} score - Consistency score (0-100)
   * @returns {string} - Grade (A, B, C, D, F)
   */
  static getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Analyze repository commits and return metrics
   * @param {string} repoId - Repository ID
   * @returns {Object} - Analysis results
   */
  static async analyzeRepository(repoId) {
    try {
      // Fetch commits for this repository
      const commits = await Commit.find({ repoId }).sort({ commitDate: 1 });
      
      if (!commits || commits.length === 0) {
        return {
          totalCommits: 0,
          consistencyScore: 0,
          consistencyGrade: 'F',
          longestGap: 0,
          averageGap: 0,
          timeline: [],
        };
      }

      // Calculate consistency
      const analysis = this.calculateConsistencyScore(commits);
      const grade = this.getGrade(analysis.score);

      // Generate timeline data (commits per day)
      const timeline = this.generateTimeline(commits);

      return {
        totalCommits: commits.length,
        consistencyScore: analysis.score,
        consistencyGrade: grade,
        longestGap: analysis.gaps.longest || 0,
        averageGap: analysis.gaps.average || 0,
        timeline: timeline,
      };
    } catch (error) {
      logger.error('Error analyzing repository:', error);
      throw error;
    }
  }

  /**
   * Generate timeline data for visualization
   * @param {Array} commits - Commit array
   * @returns {Array} - Timeline data points
   */
  static generateTimeline(commits) {
    const timeline = {};
    
    commits.forEach(commit => {
      const date = new Date(commit.commitDate).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline).map(([date, count]) => ({
      date,
      commits: count,
    }));
  }
}

module.exports = ConsistencyService;
