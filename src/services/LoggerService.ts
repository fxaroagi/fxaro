import * as winston from 'winston';
import { CONFIG } from '../config/constants';

export class LoggerService {
  private logger: winston.Logger;

  constructor(serviceName: string = 'OpenClaw') {
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(
        ({ level, message, timestamp, service }) =>
          `${timestamp} [${service}] ${level}: ${message}`
      )
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json()
    );

    this.logger = winston.createLogger({
      defaultMeta: { service: serviceName },
      level: CONFIG.LOG_LEVEL,
      format: fileFormat,
      transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  getLogger(): winston.Logger {
    return this.logger;
  }

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string, error?: Error) {
    this.logger.error(message, { error: error?.message });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
