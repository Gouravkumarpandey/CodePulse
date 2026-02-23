/**
 * Rule Engine Service
 * Handles inactivity gap logic and violation detection
 */

const DatabaseService = require('./mongo.service');
const timeUtil = require('../utils/time.util');

class RuleEngine {
  /**
   * Check if commit creates an inactivity violation
   * @param {Date} lastCommitDate
   * @param {Date} currentCommitDate
   * @returns {Object} { gap, status, isViolation }
   */
  static async checkInactivityViolation(lastCommitDate, currentCommitDate) {
    const settings = await DatabaseService.getAdminSettings();

    const gap = timeUtil.getGapInHours(lastCommitDate, currentCommitDate);
    const maxGap = settings?.maxInactivityGapHours || 24;
    const gracePeriod = settings?.gracePeriodHours || 12;
    const warningThreshold = settings?.warningThresholdHours || 20;

    let status = 'OK';
    let isViolation = false;

    if (gap > maxGap + gracePeriod) {
      status = 'VIOLATION';
      isViolation = true;
    } else if (gap > warningThreshold) {
      status = 'WARNING';
    }

    return { gap, status, isViolation };
  }

  /**
   * Validate multiple rules for a commit
   * @param {Object} commitData
   * @returns {Object} validation result
   */
  static async validateCommit(commitData) {
    const result = {
      isValid: true,
      violations: [],
      warnings: [],
    };

    // Check inactivity gap if previous commit exists
    if (commitData.previousCommitDate) {
      const gapCheck = await this.checkInactivityViolation(
        commitData.previousCommitDate,
        commitData.commitDate
      );

      if (gapCheck.isViolation) {
        result.isValid = false;
        result.violations.push(`Inactivity gap of ${gapCheck.gap} hours exceeds limit`);
      } else if (gapCheck.status === 'WARNING') {
        result.warnings.push(`Inactivity gap of ${gapCheck.gap} hours approaching limit`);
      }

      result.gap = gapCheck.gap;
      result.status = gapCheck.status;
    }

    return result;
  }

  /**
   * Evaluate all rules for a repository
   * @param {string} repoId - Repository ID
   * @returns {Object} - All violations and warnings
   */
  static async evaluateRules(repoId) {
    try {
      const commits = await DatabaseService.getCommitsByRepo(repoId);
      const settings = await DatabaseService.getAdminSettings();

      const maxGap = settings?.maxInactivityGapHours || 24;
      const warningThreshold = settings?.warningThresholdHours || 20;

      const violations = [];
      const warnings = [];

      for (let i = 1; i < commits.length; i++) {
        const gap = timeUtil.getGapInHours(commits[i - 1].commitDate, commits[i].commitDate);

        if (gap > maxGap) {
          violations.push({
            type: 'INACTIVITY_GAP',
            message: `Inactivity gap of ${gap.toFixed(1)} hours between commits`,
            severity: 'HIGH',
            date: commits[i].commitDate,
          });
        } else if (gap > warningThreshold) {
          warnings.push({
            type: 'LONG_GAP',
            message: `Long inactivity gap of ${gap.toFixed(1)} hours`,
            severity: 'MEDIUM',
            date: commits[i].commitDate,
          });
        }
      }

      // Check for burst commits (many commits in short time)
      const burstThreshold = 10; // 10+ commits in 1 hour
      const oneHour = 1;

      for (let i = 0; i < commits.length; i++) {
        const commitsInHour = commits.filter(c => {
          const gap = timeUtil.getGapInHours(commits[i].commitDate, c.commitDate);
          return Math.abs(gap) <= oneHour;
        });

        if (commitsInHour.length > burstThreshold) {
          violations.push({
            type: 'BURST_COMMITS',
            message: `${commitsInHour.length} commits in 1 hour - possible bulk commit`,
            severity: 'MEDIUM',
            date: commits[i].commitDate,
          });
          break; // Only report once
        }
      }

      return {
        violations,
        warnings,
        totalViolations: violations.length,
        totalWarnings: warnings.length,
      };
    } catch (error) {
      console.error('Error evaluating rules:', error);
      return {
        violations: [],
        warnings: [],
        totalViolations: 0,
        totalWarnings: 0,
      };
    }
  }
}

module.exports = RuleEngine;
