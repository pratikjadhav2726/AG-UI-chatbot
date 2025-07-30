/**
 * MCP Client Service for Dynamic UI Template Generation
 * 
 * This service manages the connection to the mcp-ui-server-v2 and provides
 * a clean interface for the chatbot to interact with MCP tools for generating
 * dynamic UI templates.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
  Tool,
  ToolCall,
  Resource,
  Prompt,
  CallToolResult,
  ListToolsResult,
  ListResourcesResult,
  ListPromptsResult,
  ReadResourceResult,
  GetPromptResult
} from '@modelcontextprotocol/sdk/types.js';

// Types for our MCP integration
export interface MCPClientConfig {
  name: string;
  version: string;
  transport: {
    type: 'stdio' | 'http';
    config: StdioTransportConfig | HttpTransportConfig;
  };
}

export interface StdioTransportConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface HttpTransportConfig {
  url: string;
  headers?: Record<string, string>;
}

export interface UITemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  metadata?: {
    category?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    tags?: string[];
  };
}

export interface MCPToolResult {
  success: boolean;
  template?: UITemplate;
  error?: string;
  data?: any;
}

export class MCPClientService {
  private client: Client | null = null;
  private config: MCPClientConfig;
  private isConnected = false;
  private availableTools: Tool[] = [];
  private availableResources: Resource[] = [];
  private availablePrompts: Prompt[] = [];
  private connectionRetries = 0;
  private maxRetries = 3;

  constructor(config: MCPClientConfig) {
    this.config = config;
  }

  /**
   * Initialize and connect to the MCP server
   */
  async connect(): Promise<void> {
    try {
      this.client = new Client({
        name: this.config.name,
        version: this.config.version
      }, {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          sampling: {}
        }
      });

      let transport;
      
      if (this.config.transport.type === 'stdio') {
        const stdioConfig = this.config.transport.config as StdioTransportConfig;
        transport = new StdioClientTransport({
          command: stdioConfig.command,
          args: stdioConfig.args || [],
          env: stdioConfig.env
        });
      } else {
        const httpConfig = this.config.transport.config as HttpTransportConfig;
        transport = new StreamableHTTPClientTransport(
          new URL(httpConfig.url)
        );
      }

      await this.client.connect(transport);
      this.isConnected = true;
      this.connectionRetries = 0;

      // Load available tools, resources, and prompts
      await this.loadCapabilities();

      console.log('MCP Client connected successfully');
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      this.isConnected = false;
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`Retrying connection (${this.connectionRetries}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionRetries));
        return this.connect();
      }
      
      throw new Error(`Failed to connect to MCP server after ${this.maxRetries} attempts: ${error}`);
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.isConnected = false;
      console.log('MCP Client disconnected');
    }
  }

  /**
   * Check if the client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Load available capabilities from the server
   */
  private async loadCapabilities(): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      // Load tools
      const toolsResult = await this.client.listTools();
      this.availableTools = toolsResult.tools || [];

      // Load resources
      const resourcesResult = await this.client.listResources();
      this.availableResources = resourcesResult.resources || [];

      // Load prompts
      const promptsResult = await this.client.listPrompts();
      this.availablePrompts = promptsResult.prompts || [];

      console.log(`Loaded MCP capabilities: ${this.availableTools.length} tools, ${this.availableResources.length} resources, ${this.availablePrompts.length} prompts`);
    } catch (error) {
      console.error('Failed to load MCP capabilities:', error);
      throw error;
    }
  }

  /**
   * Get all available tools
   */
  getAvailableTools(): Tool[] {
    return this.availableTools;
  }

  /**
   * Get all available resources
   */
  getAvailableResources(): Resource[] {
    return this.availableResources;
  }

  /**
   * Get all available prompts
   */
  getAvailablePrompts(): Prompt[] {
    return this.availablePrompts;
  }

  /**
   * Generate a UI template using MCP tools
   */
  async generateTemplate(templateType: string, requirements: any): Promise<MCPToolResult> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      // Find the appropriate tool for template generation
      const generateTool = this.availableTools.find(tool => 
        tool.name === 'generateTemplate' || 
        tool.name === 'generate_template' ||
        tool.name.includes('generate')
      );

      if (!generateTool) {
        throw new Error('Template generation tool not found in MCP server');
      }

      // Call the template generation tool
      const result = await this.client.callTool({
        name: generateTool.name,
        arguments: {
          templateType,
          requirements,
          format: 'json'
        }
      });

      // Parse the result
      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        
        if (content.type === 'text') {
          try {
            const templateData = JSON.parse(content.text);
            return {
              success: true,
              template: {
                id: `template_${Date.now()}`,
                type: templateType,
                title: templateData.title || `${templateType} Template`,
                description: templateData.description || `Generated ${templateType} template`,
                data: templateData,
                metadata: {
                  category: templateData.category || 'general',
                  complexity: templateData.complexity || 'medium',
                  tags: templateData.tags || [templateType]
                }
              }
            };
          } catch (parseError) {
            console.error('Failed to parse template data:', parseError);
            return {
              success: false,
              error: 'Failed to parse generated template data'
            };
          }
        }
      }

      return {
        success: false,
        error: 'No valid content returned from template generation tool'
      };
    } catch (error) {
      console.error('Template generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get template suggestions based on user input
   */
  async getTemplateSuggestions(userInput: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      // Find a suggestions tool
      const suggestionTool = this.availableTools.find(tool => 
        tool.name.includes('suggest') || 
        tool.name.includes('recommend')
      );

      if (!suggestionTool) {
        // Return default suggestions if no tool is available
        return this.getDefaultSuggestions(userInput);
      }

      const result = await this.client.callTool({
        name: suggestionTool.name,
        arguments: {
          input: userInput,
          type: 'template_suggestions'
        }
      });

      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text') {
          try {
            const suggestions = JSON.parse(content.text);
            return Array.isArray(suggestions) ? suggestions : [suggestions];
          } catch {
            return [content.text];
          }
        }
      }

      return this.getDefaultSuggestions(userInput);
    } catch (error) {
      console.error('Failed to get template suggestions:', error);
      return this.getDefaultSuggestions(userInput);
    }
  }

  /**
   * Get default template suggestions based on keywords
   */
  private getDefaultSuggestions(userInput: string): string[] {
    const input = userInput.toLowerCase();
    const suggestions: string[] = [];

    // Keyword-based suggestions
    if (input.includes('dashboard') || input.includes('analytics') || input.includes('metrics')) {
      suggestions.push('dashboard', 'analytics', 'kpi');
    }
    if (input.includes('form') || input.includes('signup') || input.includes('registration')) {
      suggestions.push('form', 'signup', 'registration');
    }
    if (input.includes('table') || input.includes('data') || input.includes('list')) {
      suggestions.push('table', 'datatable', 'list');
    }
    if (input.includes('product') || input.includes('shop') || input.includes('ecommerce')) {
      suggestions.push('product', 'catalog', 'ecommerce');
    }
    if (input.includes('profile') || input.includes('user') || input.includes('account')) {
      suggestions.push('profile', 'usercard', 'account');
    }
    if (input.includes('calendar') || input.includes('event') || input.includes('schedule')) {
      suggestions.push('calendar', 'event', 'timeline');
    }

    return suggestions.length > 0 ? suggestions : ['dashboard', 'form', 'table'];
  }

  /**
   * Call any MCP tool with arguments
   */
  async callTool(toolName: string, arguments_: any): Promise<CallToolResult> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      return await this.client.callTool({
        name: toolName,
        arguments: arguments_
      });
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Read a resource from the MCP server
   */
  async readResource(uri: string): Promise<ReadResourceResult> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      return await this.client.readResource({ uri });
    } catch (error) {
      console.error(`Failed to read resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Get a prompt from the MCP server
   */
  async getPrompt(name: string, arguments_?: any): Promise<GetPromptResult> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      return await this.client.getPrompt({
        name,
        arguments: arguments_
      });
    } catch (error) {
      console.error(`Failed to get prompt ${name}:`, error);
      throw error;
    }
  }

  /**
   * Health check for the MCP connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Try to list tools as a simple health check
      await this.client.listTools();
      return true;
    } catch (error) {
      console.error('MCP health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }
}

// Singleton instance for the MCP client
let mcpClientInstance: MCPClientService | null = null;

/**
 * Get or create the MCP client instance
 */
export function getMCPClient(): MCPClientService {
  if (!mcpClientInstance) {
    // Default configuration for the mcp-ui-server-v2
    const config: MCPClientConfig = {
      name: 'ui-chatbot-client',
      version: '1.0.0',
      transport: {
        type: 'stdio',
        config: {
          command: 'node',
          args: ['mcp-ui-server-v2/dist/index.js'],
          env: {
            NODE_ENV: 'production',
            LOG_LEVEL: 'info'
          }
        }
      }
    };

    mcpClientInstance = new MCPClientService(config);
  }

  return mcpClientInstance;
}

/**
 * Initialize the MCP client connection
 */
export async function initializeMCPClient(): Promise<MCPClientService> {
  const client = getMCPClient();
  
  if (!client.isClientConnected()) {
    await client.connect();
  }
  
  return client;
}

/**
 * Cleanup MCP client connection
 */
export async function cleanupMCPClient(): Promise<void> {
  if (mcpClientInstance) {
    await mcpClientInstance.disconnect();
    mcpClientInstance = null;
  }
}
