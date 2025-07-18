#!/usr/bin/env node

/**
 * Dynamic Templates MCP Server v2.0
 * Production-ready MCP server for dynamic UI template generation
 * 
 * Features:
 * - 20+ fully dynamic template types
 * - Comprehensive schema validation
 * - Intelligent caching system
 * - Performance monitoring
 * - Resource and prompt management
 * - Error handling and logging
 */

import 'dotenv/config';
import { MCPServer } from './core/server.js';
import { createDefaultLogger, setDefaultLogger } from './core/logger.js';
import { createDefaultCache, setDefaultCache } from './core/cache.js';
import type { ServerConfig } from './types/mcp.js';

/**
 * Create server configuration
 */
function createServerConfig(): ServerConfig {
  return {
    name: process.env.MCP_SERVER_NAME || 'dynamic-templates-mcp',
    version: process.env.MCP_SERVER_VERSION || '2.0.0',
    description: 'Production-ready MCP server for dynamic UI template generation',
    author: 'Dynamic Templates Team',
    license: 'MIT',
    
    capabilities: {
      tools: {
        listChanged: true
      },
      resources: {
        subscribe: true,
        listChanged: true
      },
      prompts: {
        listChanged: true
      },
      logging: {
        level: (process.env.LOG_LEVEL as any) || 'info'
      }
    },
    
    transport: {
      type: 'stdio',
      host: process.env.MCP_HOST,
      port: process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : undefined,
      path: process.env.MCP_PATH,
      cors: {
        origin: process.env.CORS_ORIGIN === 'true' ? true : process.env.CORS_ORIGIN?.split(',') || false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: process.env.CORS_CREDENTIALS === 'true'
      }
    } as any,
    
    logging: {
      level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      format: (process.env.LOG_FORMAT as 'json' | 'pretty') || (process.env.NODE_ENV === 'development' ? 'pretty' : 'json'),
      destination: process.env.LOG_FILE
    } as any,
    
    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300, // 5 minutes
      maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE) : 1000,
      strategy: 'lru'
    },
    
    security: {
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        maxRequests: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
        windowMs: process.env.RATE_LIMIT_WINDOW ? parseInt(process.env.RATE_LIMIT_WINDOW) : 60000, // 1 minute
        skipSuccessfulRequests: false
      },
      auth: {
        enabled: process.env.AUTH_ENABLED === 'true',
        type: (process.env.AUTH_TYPE as 'apiKey' | 'jwt' | 'oauth2') || 'apiKey',
        config: {
          apiKey: process.env.API_KEY,
          jwtSecret: process.env.JWT_SECRET,
          oauth2Config: process.env.OAUTH2_CONFIG ? JSON.parse(process.env.OAUTH2_CONFIG) : undefined
        }
      },
      validation: {
        enabled: process.env.VALIDATION_ENABLED !== 'false',
        sanitizeInputs: process.env.SANITIZE_INPUTS !== 'false',
        maxPayloadSize: process.env.MAX_PAYLOAD_SIZE ? parseInt(process.env.MAX_PAYLOAD_SIZE) : 1024 * 1024 // 1MB
      }
    }
  };
}

/**
 * Initialize the MCP server
 */
async function initialize(): Promise<MCPServer> {
  const config = createServerConfig();
  
  // Initialize logger
  const logger = createDefaultLogger(config.logging.level);
  setDefaultLogger(logger);
  
  logger.info('Initializing Dynamic Templates MCP Server', {
    name: config.name,
    version: config.version,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid
  });
  
  // Initialize cache
  const cache = createDefaultCache();
  setDefaultCache(cache);
  
  logger.info('Cache initialized', {
    enabled: config.cache.enabled,
    ttl: config.cache.ttl,
    maxSize: config.cache.maxSize
  });
  
  // Create and initialize server
  const server = new MCPServer(config);
  
  logger.info('MCP Server created', {
    capabilities: config.capabilities,
    transport: config.transport.type
  });
  
  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const server = await initialize();
    await server.start();
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.error('\nReceived SIGINT, shutting down gracefully...');
      server.shutdown();
    });
    
    process.on('SIGTERM', () => {
      console.error('\nReceived SIGTERM, shutting down gracefully...');
      server.shutdown();
    });
    
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

/**
 * Handle unhandled rejections and exceptions
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  });
}

export { MCPServer, createServerConfig };
export type { ServerConfig };