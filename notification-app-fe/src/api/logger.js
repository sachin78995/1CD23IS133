// Logging Middleware for Frontend
// Captures and logs application events, API calls, user actions, and errors.

const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
  }

  log(level, context, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context,
      message,
      details,
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Format console output beautifully based on level
    const consoleMsg = `[${timestamp}] [${level}] [${context}] ${message}`;
    if (level === LOG_LEVELS.ERROR) {
      console.error(consoleMsg, details || "");
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(consoleMsg, details || "");
    } else {
      console.log(consoleMsg, details || "");
    }
  }

  info(context, message, details) {
    this.log(LOG_LEVELS.INFO, context, message, details);
  }

  warn(context, message, details) {
    this.log(LOG_LEVELS.WARN, context, message, details);
  }

  error(context, message, details) {
    this.log(LOG_LEVELS.ERROR, context, message, details);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
