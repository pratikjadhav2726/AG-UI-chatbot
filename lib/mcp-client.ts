/**
 * MCP Client Service using Official TypeScript SDK
 * 
 * This service uses the official @modelcontextprotocol/sdk to manage
 * connections and interactions with the mcp-ui-server-v2 for dynamic
 * UI template generation.
 * 
 * Based on: https://github.com/modelcontextprotocol/typescript-sdk
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
  Tool,
  Resource,
  Prompt,
  CallToolResult,
  ListToolsResult,
  ListResourcesResult,
  ListPromptsResult,
  ReadResourceResult,
  GetPromptResult,
  ClientCapabilities,
  ServerCapabilities
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
   * Initialize and connect to the MCP server using official SDK patterns
   */
  async connect(): Promise<void> {
    try {
      // Define client capabilities following SDK patterns
      const clientCapabilities: ClientCapabilities = {
        tools: {},
        resources: {},
        prompts: {},
        sampling: {}
      };

      // Create client with proper configuration
      this.client = new Client(
        {
          name: this.config.name,
          version: this.config.version
        },
        {
          capabilities: clientCapabilities
        }
      );

      // Create transport based on configuration
      let transport;
      
      if (this.config.transport.type === 'stdio') {
        const stdioConfig = this.config.transport.config as StdioTransportConfig;
        transport = new StdioClientTransport({
          command: stdioConfig.command,
          args: stdioConfig.args || [],
          env: stdioConfig.env || {}
        });
      } else {
        const httpConfig = this.config.transport.config as HttpTransportConfig;
        transport = new StreamableHTTPClientTransport(
          new URL(httpConfig.url)
        );
      }

      // Connect using the official SDK method
      await this.client.connect(transport);
      this.isConnected = true;
      this.connectionRetries = 0;

      // Load server capabilities
      await this.loadCapabilities();

      console.log('MCP Client connected successfully using official SDK');
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
   * Load server capabilities using official SDK methods
   */
  private async loadCapabilities(): Promise<void> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      // Use official SDK methods to load capabilities
      const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
        this.client.listTools(),
        this.client.listResources(),
        this.client.listPrompts()
      ]);

      this.availableTools = toolsResult.tools || [];
      this.availableResources = resourcesResult.resources || [];
      this.availablePrompts = promptsResult.prompts || [];

      console.log(`Loaded MCP capabilities using SDK: ${this.availableTools.length} tools, ${this.availableResources.length} resources, ${this.availablePrompts.length} prompts`);
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
   * Generate a UI template using MCP tools via official SDK
   */
  async generateTemplate(templateType: string, requirements: any): Promise<MCPToolResult> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      // Find the appropriate tool for template generation from available tools
      const generateTool = this.availableTools.find(tool => 
        tool.name === 'generateTemplate' || 
        tool.name === 'generate_template' ||
        tool.name === 'generate_ui_template' ||
        tool.name.toLowerCase().includes('generate')
      );

      if (!generateTool) {
        // Log available tools for debugging
        console.log('Available MCP tools:', this.availableTools.map(t => t.name));
        throw new Error('Template generation tool not found in MCP server');
      }

      console.log(`Using MCP tool: ${generateTool.name} for template generation`);

      // Use official SDK callTool method
      const result = await this.client.callTool({
        name: generateTool.name,
        arguments: {
          templateType,
          title: requirements.title || `${templateType} Template`,
          description: requirements.description || `Generated ${templateType} template`,
          useCase: requirements.useCase,
          theme: requirements.theme || 'system',
          primaryColor: requirements.primaryColor,
          fullScreen: requirements.fullScreen || false,
          customData: requirements.customData ? JSON.stringify(requirements.customData) : undefined,
          images: requirements.images ? JSON.stringify(requirements.images) : undefined,
          textContent: requirements.textContent ? JSON.stringify(requirements.textContent) : undefined,
          brandingConfig: requirements.brandingConfig ? JSON.stringify(requirements.brandingConfig) : undefined
        }
      });

      // Handle the result according to SDK response format
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
                title: templateData.title || requirements.title || `${templateType} Template`,
                description: templateData.description || requirements.description || `Generated ${templateType} template`,
                data: templateData,
                metadata: {
                  category: templateData.category || 'general',
                  complexity: templateData.complexity || 'medium',
                  tags: templateData.tags || [templateType],
                  toolUsed: generateTool.name
                }
              }
            };
          } catch (parseError) {
            console.error('Failed to parse template data:', parseError);
            return {
              success: false,
              error: 'Failed to parse generated template data',
              data: content.text // Include raw response for debugging
            };
          }
        }
      }

      return {
        success: false,
        error: 'No valid content returned from template generation tool',
        data: result
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
