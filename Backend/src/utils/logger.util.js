/**
 * Logger Utility
 * Centralized logging helper
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const log = (level, message, data = null) => {
  const logMessage = `[${getTimestamp()}] [${level}] ${message}`;

  let dataStr = '';
  if (data) {
    if (data instanceof Error) {
      dataStr = ` ${data.message} ${data.stack}`;
    } else {
      try {
        dataStr = ` ${JSON.stringify(data)}`;
      } catch (e) {
        dataStr = ' [Circular or non-serializable data]';
      }
    }
  }

  const logEntry = logMessage + dataStr;

  console.log(logEntry);

  // Write to file
  const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
  fs.appendFileSync(logFile, logEntry + '\n');
};

const info = (message, data) => log('INFO', message, data);
const warn = (message, data) => log('WARN', message, data);
const error = (message, data) => log('ERROR', message, data);
const debug = (message, data) => log('DEBUG', message, data);

module.exports = { info, warn, error, debug };
