/**
 * AI Insights Service
 * Uses Google Gemini AI to generate human-readable insights from commit data
 */

const { model } = require('../config/gemini');
const logger = require('../utils/logger.util');

class AIInsightsService {
  /**
   * Generate insights from commit statistics
   * @param {Object} stats - Commit statistics and analysis
   * @returns {Promise<string>} - AI-generated insight
   */
  static async generateInsights(stats) {
    try {
      const prompt = this.buildPrompt(stats);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const insight = response.text();
      
      logger.info('AI Insights generated successfully');
      return insight.trim();
    } catch (error) {
      logger.error('Error generating AI insights:', error);
      return this.getFallbackInsight(stats);
    }
  }

  /**
   * Build prompt for AI based on statistics
   * @private
   */
  static buildPrompt(stats) {
    const {
      totalCommits,
      consistencyScore,
      longestGap,
      averageGap,
      burstCommits,
      warningCount,
      violationCount,
      timelineSpan,
      lastMinuteCommits,
    } = stats;

    return `You are a developer productivity analyst. Analyze the following GitHub commit behavior and provide a brief, constructive insight (2-3 sentences).

Commit Statistics:
- Total Commits: ${totalCommits}
- Consistency Score: ${consistencyScore}% (higher is better)
- Longest Inactivity Gap: ${longestGap} hours
- Average Gap Between Commits: ${averageGap} hours
- Burst Commits (multiple commits in short time): ${burstCommits}
- Warnings: ${warningCount}
- Violations: ${violationCount}
- Timeline Span: ${timelineSpan} days
- Last-Minute Commits (final 20% of timeline): ${lastMinuteCommits}

Provide:
1. A brief assessment of the commit behavior
2. One specific improvement suggestion

Keep it friendly, constructive, and under 100 words. Focus on encouraging consistent development habits.`;
  }

  /**
   * Generate fallback insight when AI fails
   * @private
   */
  static getFallbackInsight(stats) {
    const { consistencyScore, longestGap, lastMinuteCommits, totalCommits } = stats;

    if (consistencyScore >= 80) {
      return "Great work! Your commits show consistent development patterns. Keep maintaining this steady pace for optimal productivity.";
    } else if (longestGap > 48) {
      return `You had long inactive periods (${longestGap} hours). Try committing smaller changes more frequently, ideally every 2-4 hours when actively coding.`;
    } else if (lastMinuteCommits > totalCommits * 0.5) {
      return "Many commits were pushed near the end. Distribute your work more evenly across the timeline to reduce stress and improve code quality.";
    } else {
      return "Your commit pattern shows room for improvement. Try making smaller, frequent commits throughout your development process.";
    }
  }

  /**
   * Generate improvement suggestions based on patterns
   * @param {Object} stats - Commit statistics
   * @returns {Array<string>} - List of suggestions
   */
  static generateSuggestions(stats) {
    const suggestions = [];

    if (stats.longestGap > 24) {
      suggestions.push("Break down tasks into smaller chunks and commit every 2-4 hours");
    }

    if (stats.burstCommits > stats.totalCommits * 0.3) {
      suggestions.push("Avoid bunching multiple commits together - spread them out");
    }

    if (stats.lastMinuteCommits > stats.totalCommits * 0.4) {
      suggestions.push("Start earlier to avoid last-minute rushes");
    }

    if (stats.consistencyScore < 60) {
      suggestions.push("Maintain a regular coding schedule for better consistency");
    }

    if (suggestions.length === 0) {
      suggestions.push("Keep up the good work with consistent commits!");
    }

    return suggestions;
  }

  /**
   * Generate timeline explanation
   * @param {Array} commits - Array of commit objects
   * @returns {Promise<string>} - Timeline explanation
   */
  static async generateTimelineExplanation(commits) {
    if (commits.length === 0) {
      return "No commits found in the repository yet.";
    }

    try {
      const firstCommit = commits[commits.length - 1];
      const lastCommit = commits[0];
      const timeSpan = Math.ceil((new Date(lastCommit.commitDate) - new Date(firstCommit.commitDate)) / (1000 * 60 * 60 * 24));

      const prompt = `Briefly explain this commit timeline in 1-2 sentences:
- ${commits.length} commits over ${timeSpan} days
- First commit: ${new Date(firstCommit.commitDate).toLocaleDateString()}
- Last commit: ${new Date(lastCommit.commitDate).toLocaleDateString()}

Keep it simple and factual.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('Error generating timeline explanation:', error);
      return `${commits.length} commits made over the project timeline.`;
    }
  }
}

module.exports = AIInsightsService;
