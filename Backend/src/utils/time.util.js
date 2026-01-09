/**
 * Time Utility
 * Gap calculations and time-based helpers
 */

/**
 * Calculate gap between two dates in hours
 */
const getGapInHours = (date1, date2) => {
  const diffMs = Math.abs(new Date(date2) - new Date(date1));
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate gap in days
 */
const getGapInDays = (date1, date2) => {
  const hours = getGapInHours(date1, date2);
  return (hours / 24).toFixed(2);
};

/**
 * Check if time is within grace period
 */
const isWithinGracePeriod = (date, gracePeriodHours) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= gracePeriodHours;
};

/**
 * Format duration for display
 */
const formatDuration = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hours`;
  }
  const days = (hours / 24).toFixed(1);
  return `${days} days`;
};

module.exports = {
  getGapInHours,
  getGapInDays,
  isWithinGracePeriod,
  formatDuration,
};
