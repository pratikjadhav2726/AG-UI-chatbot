/**
 * Production-ready MCP Server implementation
 * Follows MCP specification v2024-11-05 with comprehensive features
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type {
  ServerConfig,
  ServerCapabilities,
  Tool,
  Resource,
  Prompt,
  ToolCall,
  ToolResult,
  ResourceContents,
  GetPromptResult,
} from '../types/mcp.js';
import type { MCPProtocolVersion } from '../types/mcp.js';
import { getLogger } from './logger.js';
import { getCache } from './cache.js';
import { ToolManager } from '../tools/manager.js';
import { ResourceManager } from '../resources/manager.js';
import { PromptManager } from '../prompts/manager.js';
import { ValidationError, MCPError, ProtocolError } from '../utils/errors.js';
import { z } from 'zod';

/**
 * Production-ready MCP Server with comprehensive features
 */
export class MCPServer {
  private server: McpServer;
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
    
    // Initialize server with new API
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });

    // Initialize managers
    this.toolManager = new ToolManager();
    this.resourceManager = new ResourceManager();
    this.promptManager = new PromptManager();

    this.setupErrorHandling();
  }

  /**
   * Set up all MCP protocol handlers using the new register* API
   */
  private async setupHandlers(): Promise<void> {
    await this.setupToolHandlers();
    await this.setupResourceHandlers();
    await this.setupPromptHandlers();
  }

  /**
   * Set up tool-related handlers
   */
  private async setupToolHandlers(): Promise<void> {
    // Initialize the tool manager first
    await this.toolManager.initialize();
    
    // Get all tools from the tool manager
    const tools = await this.toolManager.listTools();
    
    for (const tool of tools) {
      this.server.registerTool(
        tool.name,
        {
          description: tool.description || `Tool: ${tool.name}`,
          inputSchema: tool.inputSchema as any,
        },
        async (args: any) => {
          try {
            const startTime = Date.now();
            const result = await this.toolManager.callTool(tool.name, args);
            const duration = Date.now() - startTime;
            
            this.logger.performance(`tools/${tool.name}`, duration, { 
              toolName: tool.name,
              success: !result.isError 
            });
            
            return result;
          } catch (error) {
            this.logger.error(`Tool execution failed: ${tool.name}`, error);
            throw new MCPError(-32603, 'Internal error executing tool');
          }
        }
      );
    }
  }

  /**
   * Set up resource-related handlers
   */
  private async setupResourceHandlers(): Promise<void> {
    // Initialize the resource manager first
    await this.resourceManager.initialize();
    
    // Get all resources from the resource manager
    const resources = await this.resourceManager.listResources();
    
    for (const resource of resources) {
      this.server.registerResource(
        resource.name,
        resource.uri,
        {
          description: resource.description || `Resource: ${resource.name}`,
          mimeType: resource.mimeType,
        },
        async (resourceUri) => {
          try {
            const startTime = Date.now();
            const result = await this.resourceManager.readResource(resourceUri.href);
            const duration = Date.now() - startTime;
            
            this.logger.performance(`resources/${resource.name}`, duration, { 
              resourceName: resource.name,
              uri: resourceUri.href 
            });
            
            // Convert ResourceContents to the expected format
            return {
              contents: result.contents || []
            };
          } catch (error) {
            this.logger.error(`Resource read failed: ${resource.name}`, error);
            throw new MCPError(-32603, 'Internal error reading resource');
          }
        }
      );
    }
  }

  /**
   * Set up prompt-related handlers
   */
  private async setupPromptHandlers(): Promise<void> {
    // Initialize the prompt manager first
    await this.promptManager.initialize();
    
    // Get all prompts from the prompt manager
    const prompts = await this.promptManager.listPrompts();
    
    for (const prompt of prompts) {
      this.server.registerPrompt(
        prompt.name,
        {
          description: prompt.description || `Prompt: ${prompt.name}`,
          argsSchema: prompt.arguments as any,
        },
        async (args: any) => {
          try {
            const startTime = Date.now();
            const result = await this.promptManager.getPrompt(prompt.name, args);
            const duration = Date.now() - startTime;
            
            this.logger.performance(`prompts/${prompt.name}`, duration, { 
              promptName: prompt.name 
            });
            
            return result;
          } catch (error) {
            this.logger.error(`Prompt execution failed: ${prompt.name}`, error);
            throw new MCPError(-32603, 'Internal error executing prompt');
          }
        }
      );
    }
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection', { reason, promise });
    });
  }



  /**
   * Connect to a transport and start the server
   */
  async connect(transport: StdioServerTransport): Promise<void> {
    try {
      this.logger.info('Connecting MCP server to transport');
      
      // Set up handlers first
      await this.setupHandlers();
      
      await this.server.connect(transport);
      this.isInitialized = true;
      
      const tools = await this.toolManager.listTools();
      const resources = await this.resourceManager.listResources();
      const prompts = await this.promptManager.listPrompts();
      
      this.logger.info('MCP server connected successfully', {
        name: this.config.name,
        version: this.config.version,
        toolCount: tools.length,
        resourceCount: resources.length,
        promptCount: prompts.length,
      });
      
    } catch (error) {
      this.logger.error('Failed to connect MCP server', error);
      throw error;
    }
  }

  /**
   * Close the server and cleanup resources
   */
  async close(): Promise<void> {
    try {
      this.logger.info('Closing MCP server');
      
      // Clear caches
      this.cache.clear();
      
      // Clear connections
      this.clientConnections.clear();
      
      this.isInitialized = false;
      this.logger.info('MCP server closed successfully');
      
    } catch (error) {
      this.logger.error('Error closing MCP server', error);
      throw error;
    }
  }

  /**
   * Get server statistics
   */
  async getStats(): Promise<{
    name: string;
    version: string;
    isInitialized: boolean;
    toolCount: number;
    resourceCount: number;
    promptCount: number;
    connectionCount: number;
    uptime: number;
  }> {
    const tools = await this.toolManager.listTools();
    const resources = await this.resourceManager.listResources();
    const prompts = await this.promptManager.listPrompts();
    
    return {
      name: this.config.name,
      version: this.config.version,
      isInitialized: this.isInitialized,
      toolCount: tools.length,
      resourceCount: resources.length,
      promptCount: prompts.length,
      connectionCount: this.clientConnections.size,
      uptime: process.uptime(),
    };
  }
}