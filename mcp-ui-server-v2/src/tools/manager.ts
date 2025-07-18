/**
 * Tool Manager for MCP Server
 * Manages all available tools and their execution
 */

import { z } from 'zod';
import type { Tool, ToolResult, TemplateGenerationParams, JSONSchema } from '../types/mcp.js';
import { getLogger } from '../core/logger.js';
import { getCache } from '../core/cache.js';
import { TemplateEngine } from '../templates/engine.js';
import { ValidationError, ToolExecutionError, ErrorUtils } from '../utils/errors.js';

export class ToolManager {
  private tools = new Map<string, ToolDefinition>();
  private logger = getLogger();
  private cache = getCache();
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  async initialize(): Promise<void> {
    try {
      await this.registerCoreTools();
      await this.templateEngine.initialize();
      
      this.logger.info('Tool Manager initialized', {
        toolCount: this.tools.size,
        tools: Array.from(this.tools.keys()),
      });
    } catch (error) {
      this.logger.error('Failed to initialize Tool Manager', error);
      throw error;
    }
  }

  /**
   * Register all core tools
   */
  private async registerCoreTools(): Promise<void> {
    // Template generation tools
    this.registerTool({
      name: 'generate_template',
      description: 'Generate a dynamic UI template with comprehensive customization options',
      inputSchema: this.createTemplateGenerationSchema(),
      handler: this.handleGenerateTemplate.bind(this),
    });

    this.registerTool({
      name: 'list_template_types',
      description: 'List all available template types with their capabilities',
      inputSchema: { type: 'object', properties: {} },
      handler: this.handleListTemplateTypes.bind(this),
    });

    this.registerTool({
      name: 'get_template_schema',
      description: 'Get the JSON schema for a specific template type',
      inputSchema: {
        type: 'object',
        properties: {
          templateType: {
            type: 'string',
            enum: [
              'dashboard', 'dataTable', 'productCatalog', 'profileCard', 'timeline',
              'gallery', 'pricing', 'stats', 'calendar', 'wizard', 'chart', 'map',
              'kanban', 'feed', 'form', 'marketplace', 'analytics', 'ecommerce',
              'blog', 'portfolio'
            ],
            description: 'The template type to get schema for'
          }
        },
        required: ['templateType']
      },
      handler: this.handleGetTemplateSchema.bind(this),
    });

    this.registerTool({
      name: 'validate_template',
      description: 'Validate a template configuration against its schema',
      inputSchema: {
        type: 'object',
        properties: {
          templateType: {
            type: 'string',
            enum: [
              'dashboard', 'dataTable', 'productCatalog', 'profileCard', 'timeline',
              'gallery', 'pricing', 'stats', 'calendar', 'wizard', 'chart', 'map',
              'kanban', 'feed', 'form', 'marketplace', 'analytics', 'ecommerce',
              'blog', 'portfolio'
            ]
          },
          config: {
            type: 'object',
            description: 'Template configuration to validate'
          }
        },
        required: ['templateType', 'config']
      },
      handler: this.handleValidateTemplate.bind(this),
    });

    // Data and utility tools
    this.registerTool({
      name: 'generate_sample_data',
      description: 'Generate realistic sample data for templates',
      inputSchema: {
        type: 'object',
        properties: {
          dataType: {
            type: 'string',
            enum: ['users', 'products', 'metrics', 'events', 'posts', 'projects'],
            description: 'Type of sample data to generate'
          },
          count: {
            type: 'number',
            minimum: 1,
            maximum: 1000,
            default: 10,
            description: 'Number of items to generate'
          },
          seed: {
            type: 'string',
            description: 'Seed for reproducible data generation'
          }
        },
        required: ['dataType']
      },
      handler: this.handleGenerateSampleData.bind(this),
    });

    this.registerTool({
      name: 'cache_stats',
      description: 'Get cache statistics and performance metrics',
      inputSchema: { type: 'object', properties: {} },
      handler: this.handleCacheStats.bind(this),
    });

    this.registerTool({
      name: 'clear_cache',
      description: 'Clear template and data cache',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Cache key pattern to clear (optional)'
          }
        }
      },
      handler: this.handleClearCache.bind(this),
    });
  }

  /**
   * Register a new tool
   */
  registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
    this.logger.debug('Tool registered', { toolName: definition.name });
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<Tool[]> {
    return Array.from(this.tools.values()).map(def => ({
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema,
    }));
  }

  /**
   * Call a tool with the given arguments
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new ToolExecutionError(name, `Tool not found: ${name}`);
    }

    try {
      // Validate arguments against schema
      this.validateArgs(args, tool.inputSchema, name);

      // Execute the tool
      const result = await tool.handler(args);
      
      return {
        content: [{
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }],
        isError: false,
      };
    } catch (error) {
      this.logger.error(`Tool execution failed: ${name}`, error, { args });
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ToolExecutionError(name, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Validate tool arguments against schema
   */
  private validateArgs(args: Record<string, unknown>, schema: JSONSchema, toolName: string): void {
    try {
      // Convert JSON Schema to Zod schema for validation
      const zodSchema = this.jsonSchemaToZod(schema);
      zodSchema.parse(args);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ErrorUtils.fromZodError(error);
      }
      throw new ValidationError(`Invalid arguments for tool ${toolName}`);
    }
  }

  /**
   * Convert JSON Schema to Zod schema (simplified version)
   */
  private jsonSchemaToZod(schema: JSONSchema): z.ZodSchema {
    if (schema.type === 'object') {
      const shape: Record<string, z.ZodSchema> = {};
      
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          let zodProp = this.jsonSchemaToZod(propSchema);
          
          // Make optional if not in required array
          if (!schema.required?.includes(key)) {
            zodProp = zodProp.optional();
          }
          
          shape[key] = zodProp;
        }
      }
      
      return z.object(shape);
    }
    
    if (schema.type === 'string') {
      let zodString = z.string();
      
      if (schema.enum) {
        zodString = z.enum(schema.enum as [string, ...string[]]);
      }
      
      return zodString;
    }
    
    if (schema.type === 'number') {
      let zodNumber = z.number();
      
      if (schema.minimum !== undefined) {
        zodNumber = zodNumber.min(schema.minimum);
      }
      
      if (schema.maximum !== undefined) {
        zodNumber = zodNumber.max(schema.maximum);
      }
      
      return zodNumber;
    }
    
    if (schema.type === 'boolean') {
      return z.boolean();
    }
    
    if (schema.type === 'array') {
      const itemSchema = schema.items ? this.jsonSchemaToZod(schema.items) : z.unknown();
      return z.array(itemSchema);
    }
    
    return z.unknown();
  }

  // Tool Handlers
  
  private async handleGenerateTemplate(args: Record<string, unknown>): Promise<unknown> {
    const params = args as unknown as TemplateGenerationParams;
    
    // Check cache first
    const cached = this.cache.getCachedTemplate(params.templateType, params);
    if (cached) {
      this.logger.debug('Template served from cache', { templateType: params.templateType });
      return cached;
    }

    // Generate template using template engine
    const template = await this.templateEngine.generateTemplate(params);
    
    // Cache the result
    this.cache.cacheTemplate(params.templateType, params, template, 300);
    
    return template;
  }

  private async handleListTemplateTypes(): Promise<unknown> {
    return await this.templateEngine.getAvailableTemplates();
  }

  private async handleGetTemplateSchema(args: Record<string, unknown>): Promise<unknown> {
    const { templateType } = args as { templateType: string };
    return await this.templateEngine.getTemplateSchema(templateType);
  }

  private async handleValidateTemplate(args: Record<string, unknown>): Promise<unknown> {
    const { templateType, config } = args as { templateType: string; config: unknown };
    
    try {
      const isValid = await this.templateEngine.validateTemplate(templateType, config);
      return {
        valid: isValid,
        templateType,
        message: 'Template configuration is valid'
      };
    } catch (error) {
      return {
        valid: false,
        templateType,
        message: error instanceof Error ? error.message : 'Validation failed',
        error: error instanceof Error ? error.name : 'Unknown'
      };
    }
  }

  private async handleGenerateSampleData(args: Record<string, unknown>): Promise<unknown> {
    const { dataType, count = 10, seed } = args as {
      dataType: string;
      count?: number;
      seed?: string;
    };

    return await this.templateEngine.generateSampleData(dataType, count, seed);
  }

  private async handleCacheStats(): Promise<unknown> {
    const stats = this.cache.getStats();
    return {
      cache: stats,
      templates: {
        engineStats: await this.templateEngine.getStats(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async handleClearCache(args: Record<string, unknown>): Promise<unknown> {
    const { pattern } = args as { pattern?: string };
    
    if (pattern) {
      const deleted = this.cache.invalidatePattern(pattern);
      return {
        message: `Cleared ${deleted} cache entries matching pattern: ${pattern}`,
        deleted,
        pattern,
      };
    } else {
      this.cache.clear();
      return {
        message: 'All cache entries cleared',
        deleted: 'all',
      };
    }
  }

  /**
   * Create JSON schema for template generation
   */
  private createTemplateGenerationSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        templateType: {
          type: 'string',
          enum: [
            'dashboard', 'dataTable', 'productCatalog', 'profileCard', 'timeline',
            'gallery', 'pricing', 'stats', 'calendar', 'wizard', 'chart', 'map',
            'kanban', 'feed', 'form', 'marketplace', 'analytics', 'ecommerce',
            'blog', 'portfolio'
          ],
          description: 'Type of template to generate'
        },
        title: {
          type: 'string',
          description: 'Title for the template'
        },
        description: {
          type: 'string',
          description: 'Description of the template (optional)'
        },
        useCase: {
          type: 'string',
          description: 'Specific use case or context for the template'
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
          default: 'system',
          description: 'Color theme for the template'
        },
        primaryColor: {
          type: 'string',
          pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
          description: 'Primary color in hex format'
        },
        fullScreen: {
          type: 'boolean',
          default: false,
          description: 'Whether to display in full screen mode'
        },
        customData: {
          type: 'object',
          description: 'Custom data for template customization'
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              alt: { type: 'string' },
              caption: { type: 'string' },
              category: { type: 'string' }
            },
            required: ['id', 'url']
          },
          description: 'Array of images for template'
        },
        textContent: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Custom text content for different sections'
        },
        brandingConfig: {
          type: 'object',
          properties: {
            logoUrl: { type: 'string' },
            brandName: { type: 'string' },
            brandColors: {
              type: 'array',
              items: { type: 'string' }
            },
            fontFamily: { type: 'string' }
          },
          description: 'Branding configuration'
        }
      },
      required: ['templateType', 'title']
    };
  }
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}