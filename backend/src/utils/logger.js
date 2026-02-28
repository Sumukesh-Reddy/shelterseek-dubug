const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

// Create logs directory
const logDirectory = path.join(__dirname, '../../logs');
mkdirp.sync(logDirectory);

// Create error log stream
const errorLogStream = rfs.createStream('error.log', {
  interval: '1d',
  path: logDirectory,
  size: '10M',
  compress: 'gzip'
});

// Create access log stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: logDirectory,
});

/**
 * Log error to file with comprehensive details
 */
const logError = (errorDetails) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    ...errorDetails
  };
  
  errorLogStream.write(JSON.stringify(errorLog) + '\n');
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('🚨 Error:', errorLog);
  }
};

/**
 * Log controller/service errors
 */
const logControllerError = (error, context = {}) => {
  logError({
    type: 'CONTROLLER_ERROR',
    file: context.file || 'unknown',
    function: context.function || 'unknown',
    userId: context.userId || 'anonymous',
    userEmail: context.userEmail || '',
    message: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Log route errors middleware
 */
const errorLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    if (res.statusCode >= 400) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        userId: req.user?._id || 'anonymous',
        userEmail: req.user?.email || '',
        userAccountType: req.user?.accountType || '',
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        body: req.body,
        query: req.query,
        params: req.params,
        error: body.error || body.message || 'Unknown error',
        stack: body.stack || null,
        attemptedRoute: req.originalUrl,
        isAuthenticated: !!req.user,
        role: req.user?.accountType || 'unauthenticated'
      };
      
      errorLogStream.write(JSON.stringify(errorLog) + '\n');
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', {
          endpoint: `${req.method} ${req.originalUrl}`,
          status: res.statusCode,
          role: req.user?.accountType || 'unauthenticated',
          error: body.error || body.message
        });
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Log database errors
 */
const logDatabaseError = (error, context = {}) => {
  logError({
    type: 'DATABASE_ERROR',
    operation: context.operation || 'unknown',
    collection: context.collection || 'unknown',
    message: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Log authentication errors
 */
const logAuthError = (message, context = {}) => {
  logError({
    type: 'AUTH_ERROR',
    message,
    ...context
  });
};

// Cleanup old logs
const cleanupOldLogs = () => {
  try {
    const files = fs.readdirSync(logDirectory);
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      if (file.endsWith('.log') || file.endsWith('.gz')) {
        const filePath = path.join(logDirectory, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      }
    });
  } catch (err) {
    console.error('Error cleaning up old logs:', err);
  }
};

// Run cleanup weekly
setInterval(cleanupOldLogs, 7 * 24 * 60 * 60 * 1000);

module.exports = {
  logError,
  logControllerError,
  logDatabaseError,
  logAuthError,
  errorLogger,
  errorLogStream,
  accessLogStream
};