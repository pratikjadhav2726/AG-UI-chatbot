/**
 * Comprehensive error handling for MCP server
 * Provides typed errors with proper error codes and context
 */

import type { MCPError as MCPErrorType } from '../types/mcp.js';

/**
 * Base MCP Error class
 */
export class MCPError extends Error implements MCPErrorType {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
    
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, MCPError.prototype);
  }

  toJSON(): MCPErrorType {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

/**
 * Validation errors for invalid input parameters
 */
export class ValidationError extends MCPError {
  constructor(message: string, details?: unknown) {
    super(-32602, `Validation failed: ${message}`, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Protocol-level errors
 */
export class ProtocolError extends MCPError {
  constructor(message: string, details?: unknown) {
    super(-32601, `Protocol error: ${message}`, details);
    this.name = 'ProtocolError';
    Object.setPrototypeOf(this, ProtocolError.prototype);
  }
}

/**
 * Tool execution errors
 */
export class ToolExecutionError extends MCPError {
  public readonly toolName: string;

  constructor(toolName: string, message: string, details?: unknown) {
    super(-32603, `Tool execution failed [${toolName}]: ${message}`, details);
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

/**
 * Resource access errors
 */
export class ResourceError extends MCPError {
  public readonly uri: string;

  constructor(uri: string, message: string, details?: unknown) {
    super(-32604, `Resource error [${uri}]: ${message}`, details);
    this.name = 'ResourceError';
    this.uri = uri;
    Object.setPrototypeOf(this, ResourceError.prototype);
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends MCPError {
  constructor(message: string, details?: unknown) {
    super(-32605, `Authentication failed: ${message}`, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends MCPError {
  constructor(resource: string, action: string, details?: unknown) {
    super(-32606, `Access denied to ${resource} for action ${action}`, details);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends MCPError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(-32607, `Rate limit exceeded: ${message}`, { retryAfter });
    this.name = 'RateLimitError';
    if (retryAfter !== undefined) {
      this.retryAfter = retryAfter;
    }
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends MCPError {
  constructor(message: string, details?: unknown) {
    super(-32608, `Configuration error: ${message}`, details);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Data source errors
 */
export class DataSourceError extends MCPError {
  public readonly sourceType: string;

  constructor(sourceType: string, message: string, details?: unknown) {
    super(-32609, `Data source error [${sourceType}]: ${message}`, details);
    this.name = 'DataSourceError';
    this.sourceType = sourceType;
    Object.setPrototypeOf(this, DataSourceError.prototype);
  }
}

/**
 * Template generation errors
 */
export class TemplateError extends MCPError {
  public readonly templateType: string;

  constructor(templateType: string, message: string, details?: unknown) {
    super(-32610, `Template error [${templateType}]: ${message}`, details);
    this.name = 'TemplateError';
    this.templateType = templateType;
    Object.setPrototypeOf(this, TemplateError.prototype);
  }
}

/**
 * Cache errors
 */
export class CacheError extends MCPError {
  constructor(message: string, details?: unknown) {
    super(-32611, `Cache error: ${message}`, details);
    this.name = 'CacheError';
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

/**
 * Error utility functions
 */
export class ErrorUtils {
  /**
   * Check if an error is an MCP error
   */
  static isMCPError(error: unknown): error is MCPError {
    return error instanceof MCPError;
  }

  /**
   * Convert any error to an MCP error
   */
  static toMCPError(error: unknown): MCPError {
    if (ErrorUtils.isMCPError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new MCPError(-32603, error.message, {
        name: error.name,
        stack: error.stack,
      });
    }

    return new MCPError(-32603, 'Unknown error occurred', { error });
  }

  /**
   * Create a validation error from Zod error
   */
  static fromZodError(zodError: any): ValidationError {
    const issues = zodError.issues || [];
    const message = issues
      .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    
    return new ValidationError(message, { issues });
  }

  /**
   * Sanitize error for client response
   */
  static sanitizeError(error: MCPError, includeStack: boolean = false): MCPErrorType {
    const sanitized: MCPErrorType = {
      code: error.code,
      message: error.message,
    };

    if (error.data) {
      sanitized.data = includeStack ? error.data : this.sanitizeErrorData(error.data);
    }

    return sanitized;
  }

  private static sanitizeErrorData(data: unknown): unknown {
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Remove sensitive information
        if (key === 'stack' || key === 'password' || key === 'token' || key === 'secret') {
          continue;
        }
        
        sanitized[key] = typeof value === 'object' ? this.sanitizeErrorData(value) : value;
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Log error with appropriate level
   */
  static getLogLevel(error: MCPError): 'debug' | 'info' | 'warn' | 'error' {
    // Client errors (4xx equivalent)
    if (error.code >= -32602 && error.code <= -32600) {
      return 'warn';
    }
    
    // Server errors (5xx equivalent)
    if (error.code >= -32603) {
      return 'error';
    }
    
    // Authentication/Authorization errors
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return 'warn';
    }
    
    // Rate limiting
    if (error instanceof RateLimitError) {
      return 'info';
    }
    
    return 'error';
  }

  /**
   * Create error context for logging
   */
  static createErrorContext(error: MCPError, additionalContext?: Record<string, unknown>): Record<string, unknown> {
    const context: Record<string, unknown> = {
      errorType: error.name,
      errorCode: error.code,
      errorMessage: error.message,
      ...additionalContext,
    };

    // Add specific error properties
    if (error instanceof ToolExecutionError) {
      context.toolName = error.toolName;
    } else if (error instanceof ResourceError) {
      context.resourceUri = error.uri;
    } else if (error instanceof TemplateError) {
      context.templateType = error.templateType;
    } else if (error instanceof DataSourceError) {
      context.dataSourceType = error.sourceType;
    } else if (error instanceof RateLimitError && error.retryAfter) {
      context.retryAfter = error.retryAfter;
    }

    return context;
  }
}

/**
 * Error handler decorator for async functions
 */
export function handleErrors<T extends (...args: any[]) => Promise<any>>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value;

  if (!originalMethod) {
    return descriptor;
  }

  descriptor.value = (async function(this: any, ...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      throw ErrorUtils.toMCPError(error);
    }
  }) as T;

  return descriptor;
}

/**
 * Async error boundary for promise chains
 */
export class AsyncErrorBoundary {
  static async execute<T>(
    operation: () => Promise<T>,
    errorHandler?: (error: MCPError) => MCPError | void
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const mcpError = ErrorUtils.toMCPError(error);
      
      if (errorHandler) {
        const handledError = errorHandler(mcpError);
        if (handledError) {
          throw handledError;
        }
      }
      
      throw mcpError;
    }
  }
}