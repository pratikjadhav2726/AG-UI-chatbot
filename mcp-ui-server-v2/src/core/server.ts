/**
 * Production-ready MCP Server implementation
 * Follows MCP specification v2024-11-05 with comprehensive features
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type {
  ServerConfig,
  MCPProtocolVersion,
  ServerCapabilities,
  Tool,
  Resource,
  Prompt,
  ToolCall,
  ToolResult,
  ResourceContents,
  GetPromptResult,
} from '../types/mcp.js';
import { getLogger } from './logger.js';
import { getCache } from './cache.js';
import { ToolManager } from '../tools/manager.js';
import { ResourceManager } from '../resources/manager.js';
import { PromptManager } from '../prompts/manager.js';
import { ValidationError, MCPError, ProtocolError } from '../utils/errors.js';

export class MCPServer {
  private server: Server;
  private config: ServerConfig;
  private logger = getLogger();
  private cache = getCache();
  private toolManager: ToolManager;
  private resourceManager: ResourceManager;
  private promptManager: PromptManager;
  private isInitialized = false;
  private clientConnections = new Map<string, { id: string; capabilities: any; connectedAt: Date }>();

  constructor(config: ServerConfig) {
    this.config = config;
    
    // Initialize server with capabilities
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: config.capabilities,
      }
    );

    // Initialize managers
    this.toolManager = new ToolManager();
    this.resourceManager = new ResourceManager();
    this.promptManager = new PromptManager();

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Set up all MCP protocol handlers
   */
  private setupHandlers(): void {
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupConnectionHandlers();
  }

  /**
   * Set up tool-related handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      try {
        const startTime = Date.now();
        const tools = await this.toolManager.listTools();
        const duration = Date.now() - startTime;
        
        this.logger.performance('tools/list', duration, { toolCount: tools.length });
        
        return { tools };
      } catch (error) {
        this.logger.error('Failed to list tools', error);
        throw new MCPError(-32603, 'Internal error listing tools');
      }
    });

    // Call a tool
    this.server.setRequestHandler('tools/call', async (request) => {
      const startTime = Date.now();
      let toolName = 'unknown';
      
      try {
        const { name, arguments: args } = request.params as ToolCall;
        toolName = name;
        
        this.logger.toolCall(name, args || {});
        
        // Check cache first
        const cacheKey = this.cache.generateKey(`tool:${name}`, args || {});
        const cached = this.cache.get<ToolResult>(cacheKey);
        
        if (cached) {
          const duration = Date.now() - startTime;
          this.logger.toolResult(name, true, duration);
          return cached;
        }

        // Execute tool
        const result = await this.toolManager.callTool(name, args || {});
        const duration = Date.now() - startTime;
        
        // Cache successful results
        if (!result.isError) {
          this.cache.set(cacheKey, result, 300); // 5 minute cache
        }
        
        this.logger.toolResult(name, !result.isError, duration, result.isError ? new Error('Tool execution failed') : undefined);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.logger.toolResult(toolName, false, duration, error as Error);
        
        if (error instanceof ValidationError) {
          throw new MCPError(-32602, `Invalid parameters: ${error.message}`);
        }
        
        this.logger.error(`Tool execution failed: ${toolName}`, error);
        throw new MCPError(-32603, 'Internal error executing tool');
      }
    });
  }

  /**
   * Set up resource-related handlers
   */
  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler('resources/list', async () => {
      try {
        const startTime = Date.now();
        const resources = await this.resourceManager.listResources();
        const duration = Date.now() - startTime;
        
        this.logger.performance('resources/list', duration, { resourceCount: resources.length });
        
        return { resources };
      } catch (error) {
        this.logger.error('Failed to list resources', error);
        throw new MCPError(-32603, 'Internal error listing resources');
      }
    });

    // Read a resource
    this.server.setRequestHandler('resources/read', async (request) => {
      try {
        const { uri } = request.params as { uri: string };
        
        // Check cache first
        const cached = this.cache.getCachedResource<ResourceContents>(uri);
        if (cached) {
          this.logger.resourceAccess(uri, true, true);
          return cached;
        }

        const content = await this.resourceManager.readResource(uri);
        
        // Cache the result
        this.cache.cacheResource(uri, content, 600); // 10 minute cache
        
        this.logger.resourceAccess(uri, true, false);
        return content;
      } catch (error) {
        this.logger.error(`Failed to read resource: ${request.params?.uri}`, error);
        throw new MCPError(-32603, 'Internal error reading resource');
      }
    });

    // Subscribe to resource changes (if supported)
    if (this.config.capabilities.resources?.subscribe) {
      this.server.setRequestHandler('resources/subscribe', async (request) => {
        try {
          const { uri } = request.params as { uri: string };
          await this.resourceManager.subscribe(uri);
          this.logger.info('Resource subscription created', { uri });
          return {};
        } catch (error) {
          this.logger.error(`Failed to subscribe to resource: ${request.params?.uri}`, error);
          throw new MCPError(-32603, 'Internal error subscribing to resource');
        }
      });

      this.server.setRequestHandler('resources/unsubscribe', async (request) => {
        try {
          const { uri } = request.params as { uri: string };
          await this.resourceManager.unsubscribe(uri);
          this.logger.info('Resource subscription removed', { uri });
          return {};
        } catch (error) {
          this.logger.error(`Failed to unsubscribe from resource: ${request.params?.uri}`, error);
          throw new MCPError(-32603, 'Internal error unsubscribing from resource');
        }
      });
    }
  }

  /**
   * Set up prompt-related handlers
   */
  private setupPromptHandlers(): void {
    // List available prompts
    this.server.setRequestHandler('prompts/list', async () => {
      try {
        const startTime = Date.now();
        const prompts = await this.promptManager.listPrompts();
        const duration = Date.now() - startTime;
        
        this.logger.performance('prompts/list', duration, { promptCount: prompts.length });
        
        return { prompts };
      } catch (error) {
        this.logger.error('Failed to list prompts', error);
        throw new MCPError(-32603, 'Internal error listing prompts');
      }
    });

    // Get a prompt
    this.server.setRequestHandler('prompts/get', async (request) => {
      try {
        const { name, arguments: args } = request.params as { name: string; arguments?: Record<string, unknown> };
        
        const result = await this.promptManager.getPrompt(name, args || {});
        
        this.logger.promptGeneration(name, args || {});
        
        return result;
      } catch (error) {
        this.logger.error(`Failed to get prompt: ${request.params?.name}`, error);
        throw new MCPError(-32603, 'Internal error getting prompt');
      }
    });
  }

  /**
   * Set up connection and lifecycle handlers
   */
  private setupConnectionHandlers(): void {
    // Handle ping requests
    this.server.setRequestHandler('ping', async () => {
      return { status: 'pong', timestamp: new Date().toISOString() };
    });

    // Handle initialization
    this.server.setRequestHandler('initialize', async (request) => {
      try {
        const { protocolVersion, clientInfo, capabilities } = request.params as {
          protocolVersion: string;
          clientInfo: { name: string; version: string };
          capabilities: any;
        };

        // Validate protocol version
        if (protocolVersion !== MCPProtocolVersion) {
          throw new ProtocolError(`Unsupported protocol version: ${protocolVersion}`);
        }

        // Store client connection info
        const clientId = `${clientInfo.name}-${Date.now()}`;
        this.clientConnections.set(clientId, {
          id: clientId,
          capabilities,
          connectedAt: new Date(),
        });

        this.logger.connectionEvent('connect', clientId);
        this.isInitialized = true;

        return {
          protocolVersion: MCPProtocolVersion,
          capabilities: this.config.capabilities,
          serverInfo: {
            name: this.config.name,
            version: this.config.version,
          },
        };
      } catch (error) {
        this.logger.error('Initialization failed', error);
        throw new MCPError(-32603, 'Initialization failed');
      }
    });
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', error);
      this.shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection', reason);
    });

    process.on('SIGINT', () => {
      this.logger.info('Received SIGINT, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      this.logger.info('Received SIGTERM, shutting down gracefully');
      this.shutdown();
    });
  }

  /**
   * Register tools, resources, and prompts
   */
  async registerComponents(): Promise<void> {
    try {
      // Register all tools
      await this.toolManager.initialize();
      
      // Register all resources
      await this.resourceManager.initialize();
      
      // Register all prompts
      await this.promptManager.initialize();
      
      this.logger.info('All components registered successfully');
    } catch (error) {
      this.logger.error('Failed to register components', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      await this.registerComponents();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.logger.info('MCP Server started successfully', {
        name: this.config.name,
        version: this.config.version,
        capabilities: this.config.capabilities,
      });
      
    } catch (error) {
      this.logger.error('Failed to start server', error);
      throw error;
    }
  }

  /**
   * Shutdown the server gracefully
   */
  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down MCP server');
      
      // Notify all connected clients about shutdown
      for (const [clientId] of this.clientConnections) {
        this.logger.connectionEvent('disconnect', clientId);
      }
      
      // Clear cache
      this.cache.clear();
      
      // Close any open connections
      await this.resourceManager.cleanup();
      
      this.logger.info('MCP server shutdown complete');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }

  /**
   * Get server status
   */
  getStatus(): {
    isInitialized: boolean;
    connections: number;
    uptime: number;
    cacheStats: any;
  } {
    return {
      isInitialized: this.isInitialized,
      connections: this.clientConnections.size,
      uptime: process.uptime(),
      cacheStats: this.cache.getStats(),
    };
  }

  /**
   * Send notification to all connected clients
   */
  async notifyClients(method: string, params?: Record<string, unknown>): Promise<void> {
    // Implementation would depend on transport type
    // For stdio, notifications are not typically sent back to client
    this.logger.debug('Client notification', { method, params });
  }
}