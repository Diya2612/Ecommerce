import fs from 'fs';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import path from 'path';

// logs dir (always at project root)
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// winston format
const { combine, timestamp, printf } = winston.format;

// Define log format
const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level}: ${message}${metaString}`;
});

// Winston logger instance with pre-configured levels and rolling file transports
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [
    // Info level daily rolling log file
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/info', // log file /logs/info/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    // Error level daily rolling log file (includes handled exceptions)
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: `%DATE%.error.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
  ],
});

// Console transport (enabled in development or when LOG_TO_CONSOLE is 'true')
const isDev = process.env.NODE_ENV !== 'production';
if (isDev || process.env.LOG_TO_CONSOLE === 'true') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

const stream = {
  write: (message: string) => {
    if (message) {
      const lastNewline = message.lastIndexOf('\n');
      const cleanMessage = lastNewline > 0 ? message.substring(0, lastNewline) : message;
      logger.info(cleanMessage);
    }
  },
};

export { logger, stream };
