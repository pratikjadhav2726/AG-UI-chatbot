/**
 * Centralized logging system for MCP server
 * Provides structured logging with multiple levels and formats
 */

import pino from 'pino';
import type { LoggingConfig } from '../types/mcp.js';

export class Logger {
  private logger: pino.Logger;
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
    
    const pinoConfig: pino.LoggerOptions = {
      level: config.level,
      ...(config.format === 'pretty' 
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    };

    if (config.destination) {
      pinoConfig.transport = {
        target: 'pino/file',
        options: {
          destination: config.destination,
        },
      };
    }

    this.logger = pino(pinoConfig);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta, message);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta, message);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error 
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : error ? { error } : {}),
    };
    this.logger.error(errorMeta, message);
  }

  // MCP-specific logging methods
  toolCall(toolName: string, params: Record<string, unknown>, duration?: number): void {
    this.info('Tool called', {
      toolName,
      params,
      duration,
      type: 'tool_call',
    });
  }

  toolResult(toolName: string, success: boolean, duration: number, error?: Error): void {
    const level = success ? 'info' : 'error';
    this.logger[level]({
      toolName,
      success,
      duration,
      error: error ? {
        name: error.name,
        message: error.message,
      } : undefined,
      type: 'tool_result',
    }, `Tool ${success ? 'completed' : 'failed'}: ${toolName}`);
  }

  resourceAccess(uri: string, success: boolean, cached: boolean = false): void {
    this.info('Resource accessed', {
      uri,
      success,
      cached,
      type: 'resource_access',
    });
  }

  promptGeneration(promptName: string, params: Record<string, unknown>): void {
    this.info('Prompt generated', {
      promptName,
      params,
      type: 'prompt_generation',
    });
  }

  connectionEvent(event: 'connect' | 'disconnect' | 'error', clientId?: string, error?: Error): void {
    const level = event === 'error' ? 'error' : 'info';
    this.logger[level]({
      event,
      clientId,
      error: error ? {
        name: error.name,
        message: error.message,
      } : undefined,
      type: 'connection_event',
    }, `Client ${event}${clientId ? ` (${clientId})` : ''}`);
  }

  protocolEvent(method: string, direction: 'inbound' | 'outbound', success: boolean, duration?: number): void {
    this.debug('Protocol message', {
      method,
      direction,
      success,
      duration,
      type: 'protocol_event',
    });
  }

  performance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    this.info('Performance metric', {
      operation,
      duration,
      ...metadata,
      type: 'performance',
    });
  }

  security(event: string, severity: 'low' | 'medium' | 'high', details?: Record<string, unknown>): void {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    this.logger[level]({
      event,
      severity,
      ...details,
      type: 'security',
    }, `Security event: ${event}`);
  }

  child(bindings: Record<string, unknown>): Logger {
    const childLogger = this.logger.child(bindings);
    const newLogger = Object.create(this);
    newLogger.logger = childLogger;
    return newLogger;
  }
}

// Default logger instance
let defaultLogger: Logger | null = null;

export function createLogger(config: LoggingConfig): Logger {
  return new Logger(config);
}

export function setDefaultLogger(logger: Logger): void {
  defaultLogger = logger;
}

export function getLogger(): Logger {
  if (!defaultLogger) {
    throw new Error('Logger not initialized. Call setDefaultLogger() first.');
  }
  return defaultLogger;
}

// Convenience function for creating a logger with sensible defaults
export function createDefaultLogger(level: LoggingConfig['level'] = 'info'): Logger {
  return createLogger({
    level,
    format: process.env.NODE_ENV === 'development' ? 'pretty' : 'json',
  });
}