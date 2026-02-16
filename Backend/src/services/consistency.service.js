/**
 * Consistency Analysis Service
 * Calculates consistency scores and analyzes commit patterns
 */

const timeUtil = require('../utils/time.util');
const logger = require('../utils/logger.util');

class ConsistencyService {
  /**
   * Run full repository analysis
   * @param {Array} commits - Array of commits
   * @param {Array} pullRequests - Array of pull requests
   * @param {Array} branches - Array of branches
   * @returns {Object} Comprehensive analysis
   */
  static runFullAnalysis(commits = [], pullRequests = [], branches = []) {
    if (!commits || commits.length === 0) {
      return {
        score: 0,
        grade: 'F',
        stats: { totalCommits: 0 },
        timeline: [],
        insights: ['No activity detected yet.'],
        badges: [],
        team: [],
        health: { quality: 0 }
      };
    }

    // Sort commits by date
    const sortedCommits = [...commits].sort((a, b) =>
      new Date(a.commitDate || a.commit.author.date) - new Date(b.commitDate || b.commit.author.date)
    );

    // Core Consistency
    const consistency = this.calculateConsistencyScore(sortedCommits);

    // Team / Contributors
    const team = this.analyzeContributors(sortedCommits);

    // Health Indicators
    const health = this.analyzeHealth(sortedCommits, pullRequests);

    // Badges / Achievements
    const badges = this.generateBadges(consistency, sortedCommits, team, health);

    // AI Insights
    const insights = this.generateInsights(consistency, health, team);

    return {
      consistencyScore: consistency.score,
      consistencyGrade: this.getGrade(consistency.score),
      totalCommits: sortedCommits.length,
      averageGap: consistency.gaps.average,
      longestGap: consistency.gaps.longest,
      burstCommits: consistency.bursts.count,
      lastMinuteCommits: consistency.lastMinutePattern.lastMinuteCommits,
      timelineSpan: consistency.timelineSpan,
      violations: 0, // Placeholder
      warnings: 0, // Placeholder

      // Detailed Objects
      timeDistribution: consistency.distribution,
      timeline: this.generateTimeline(sortedCommits),
      contributors: team,
      health: health,
      badges: badges,
      aiInsights: insights,
      suggestions: insights // Duplicate for frontend compat
    };
  }

  /**
   * Calculate overall consistency score
   */
  static calculateConsistencyScore(commits) {
    if (!commits || commits.length === 0) {
      return { score: 0, analysis: 'No commits' };
    }

    const analysis = {
      totalCommits: commits.length,
      timelineSpan: this.calculateTimelineSpan(commits),
      gaps: this.analyzeGaps(commits),
      bursts: this.detectBursts(commits),
      distribution: this.analyzeDistribution(commits),
      lastMinutePattern: this.detectLastMinutePattern(commits),
    };

    const score = this.computeScore(analysis);

    return {
      score: Math.round(score),
      ...analysis,
    };
  }

  /**
   * Analyze contributors (Team View)
   */
  static analyzeContributors(commits) {
    const contributors = {};

    commits.forEach(commit => {
      const authorName = commit.author || commit.commit?.author?.name || 'Unknown';
      const email = commit.authorEmail || commit.commit?.author?.email || 'unknown';

      if (!contributors[authorName]) {
        contributors[authorName] = {
          name: authorName,
          email: email,
          commits: 0,
          additions: 0,
          deletions: 0,
          activeHours: {},
          lastActive: null
        };
      }

      contributors[authorName].commits++;

      // Track active hours
      const date = new Date(commit.commitDate || commit.commit.author.date);
      const hour = date.getHours();
      contributors[authorName].activeHours[hour] = (contributors[authorName].activeHours[hour] || 0) + 1;

      // Last active
      if (!contributors[authorName].lastActive || date > new Date(contributors[authorName].lastActive)) {
        contributors[authorName].lastActive = date.toISOString();
      }
    });

    // Convert to array and rank
    return Object.values(contributors)
      .sort((a, b) => b.commits - a.commits)
      .map((c, idx) => ({
        rank: idx + 1,
        ...c,
        percentage: ((c.commits / commits.length) * 100).toFixed(1)
      }));
  }

  /**
   * Analyze Repository Health
   */
  static analyzeHealth(commits, pullRequests = []) {
    // 1. Commit Message Quality
    let goodMessages = 0;
    commits.forEach(c => {
      const msg = c.message || c.commit?.message || '';
      if (msg.length > 10 && msg.includes(' ')) goodMessages++;
    });
    const messageQuality = commits.length ? (goodMessages / commits.length) * 100 : 0;

    // 2. PR Ratio (Assumes PRs passed in)
    // Simplified: Just count PRs vs Commits? Or just return PR count.

    // 3. Bug Fix Ratio
    let bugFixes = 0;
    let features = 0;
    let refactors = 0;

    commits.forEach(c => {
      const msg = (c.message || c.commit?.message || '').toLowerCase();
      if (msg.includes('fix') || msg.includes('bug') || msg.includes('issue')) bugFixes++;
      else if (msg.includes('feat') || msg.includes('add') || msg.includes('new')) features++;
      else if (msg.includes('refactor') || msg.includes('clean') || msg.includes('optim')) refactors++;
    });

    return {
      commitMessageScore: Math.round(messageQuality),
      prCount: pullRequests.length,
      bugFixRatio: commits.length ? ((bugFixes / commits.length) * 100).toFixed(1) : 0,
      featureRatio: commits.length ? ((features / commits.length) * 100).toFixed(1) : 0,
      refactorRatio: commits.length ? ((refactors / commits.length) * 100).toFixed(1) : 0,
      typeDistribution: { bugFixes, features, refactors }
    };
  }

  /**
   * Generate Badges / Achievements
   */
  static generateBadges(consistency, commits, team, health) {
    const badges = [];

    // Streak Logic (Simplified: Active days in a row)
    // Needs more complex date checking, assuming consistency has gaps info
    if (consistency.gaps.shortest < 24 && consistency.totalCommits > 10) {
      badges.push({ id: 'streak_fire', name: 'On Fire 🔥', description: 'High activity streak detected' });
    }

    // Consistency
    if (consistency.score >= 90) {
      badges.push({ id: 'consistency_king', name: 'Consistency King 👑', description: 'Maintained A-grade consistency' });
    }

    // Time of day
    const nightCommits = commits.filter(c => {
      const h = new Date(c.commitDate || c.commit.author.date).getHours();
      return h >= 22 || h < 4;
    }).length;

    if (nightCommits > 5) {
      badges.push({ id: 'night_owl', name: 'Night Owl 🌙', description: 'Frequently codes late at night' });
    }

    const morningCommits = commits.filter(c => {
      const h = new Date(c.commitDate || c.commit.author.date).getHours();
      return h >= 5 && h < 9;
    }).length;

    if (morningCommits > 5) {
      badges.push({ id: 'early_bird', name: 'Early Bird ⏰', description: 'Starts coding early in the morning' });
    }

    // Weekend
    const weekendCommits = commits.filter(c => {
      const d = new Date(c.commitDate || c.commit.author.date).getDay();
      return d === 0 || d === 6;
    }).length;

    if (weekendCommits > 5) {
      badges.push({ id: 'weekend_warrior', name: 'Weekend Warrior ⚔️', description: 'Active on weekends' });
    }

    return badges;
  }

  /**
   * Generate AI Insights
   */
  static generateInsights(consistency, health, team) {
    const insights = [];

    // Consistency Feedback
    if (consistency.score < 50) {
      insights.push("Consistency is low. Try to commit smaller changes more frequently.");
    } else if (consistency.score > 90) {
      insights.push("Excellent steady contribution pattern. Keep it up!");
    }

    // Bursts
    if (consistency.bursts.percentage > 30) {
      insights.push("High burst activity detected. Consider spreading work to avoid burnout.");
    }

    // Gaps
    if (consistency.gaps.longest > 48) {
      insights.push(`Longest inactivity gap was ${Math.round(consistency.gaps.longest)} hours. Regular checking helps momentum.`);
    }

    // Health
    if (health.commitMessageScore < 50) {
      insights.push("Commit messages could be more descriptive. Good history helps the team.");
    }

    if (health.bugFixRatio > 40) {
      insights.push("High ratio of bug fixes. Consider reviewing testing strategies.");
    }

    // Fallback
    if (insights.length === 0) {
      insights.push("You are doing great! Maintain this pace.");
    }

    return insights;
  }

  // === Private Helpers ===

  static calculateTimelineSpan(commits) {
    if (commits.length < 2) return 0;
    const first = new Date(commits[0].commitDate || commits[0].commit.author.date);
    const last = new Date(commits[commits.length - 1].commitDate || commits[commits.length - 1].commit.author.date);
    const spanMs = last - first;
    return Math.ceil(spanMs / (1000 * 60 * 60 * 24));
  }

  static analyzeGaps(commits) {
    const gaps = [];
    for (let i = 1; i < commits.length; i++) {
      const d1 = new Date(commits[i - 1].commitDate || commits[i - 1].commit.author.date);
      const d2 = new Date(commits[i].commitDate || commits[i].commit.author.date);
      const gap = Math.abs(d2 - d1) / (1000 * 60 * 60);
      gaps.push(gap);
    }
    if (gaps.length === 0) return { average: 0, longest: 0, shortest: 0 };
    return {
      average: gaps.reduce((a, b) => a + b, 0) / gaps.length,
      longest: Math.max(...gaps),
      shortest: Math.min(...gaps),
      gaps
    };
  }

  static detectBursts(commits) {
    // Simplified trigger
    const BURST_THRESHOLD = 1; // hour
    let bursts = 0;
    let burstCommits = 0;
    for (let i = 1; i < commits.length; i++) {
      const d1 = new Date(commits[i - 1].commitDate || commits[i - 1].commit.author.date);
      const d2 = new Date(commits[i].commitDate || commits[i].commit.author.date);
      const gap = Math.abs(d2 - d1) / (1000 * 60 * 60);
      if (gap < BURST_THRESHOLD) {
        burstCommits++; // This commit is part of a burst
        // Rudimentary count
      }
    }
    return { count: burstCommits, percentage: (burstCommits / commits.length) * 100 };
  }

  static analyzeDistribution(commits) {
    // Simplified quarters
    return { evenness: 80 }; // Mock
  }

  static detectLastMinutePattern(commits) {
    // Mock
    return { lastMinuteCommits: 0, isLastMinuteRush: false, percentage: 0 };
  }

  static computeScore(analysis) {
    let score = 100;
    if (analysis.gaps.longest > 72) score -= 30;
    else if (analysis.gaps.longest > 48) score -= 20;
    if (analysis.bursts.percentage > 40) score -= 15;
    return Math.max(0, score);
  }

  static getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  static generateTimeline(commits) {
    const timeline = {};
    commits.forEach(commit => {
      const date = new Date(commit.commitDate || commit.commit.author.date).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return Object.entries(timeline).map(([date, count]) => ({ date, commits: count })).sort((a, b) => a.date.localeCompare(b.date));
  }
}

module.exports = ConsistencyService;
