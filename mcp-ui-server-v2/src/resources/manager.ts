/**
 * Resource Manager for MCP Server
 * Handles template documentation, schemas, and other resources
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Resource, ResourceContents } from '../types/mcp.js';
import { getLogger } from '../core/logger.js';
import { ResourceError } from '../utils/errors.js';

export class ResourceManager {
  private resources = new Map<string, Resource>();
  private logger = getLogger();
  private subscriptions = new Map<string, Set<string>>();

  async initialize(): Promise<void> {
    try {
      await this.registerResources();
      
      this.logger.info('Resource Manager initialized', {
        resourceCount: this.resources.size,
        resources: Array.from(this.resources.keys())
      });
    } catch (error) {
      this.logger.error('Failed to initialize Resource Manager', error);
      throw error;
    }
  }

  /**
   * Register all available resources
   */
  private async registerResources(): Promise<void> {
    // Template documentation
    this.registerResource({
      uri: 'template://docs',
      name: 'Template Documentation',
      description: 'Complete documentation for all available template types',
      mimeType: 'text/markdown'
    });

    // Template schemas for each type
    const templateTypes = [
      'dashboard', 'dataTable', 'productCatalog', 'profileCard', 'timeline',
      'gallery', 'pricing', 'stats', 'calendar', 'wizard', 'chart', 'map',
      'kanban', 'feed', 'form', 'marketplace', 'analytics', 'ecommerce',
      'blog', 'portfolio'
    ];

    for (const type of templateTypes) {
      this.registerResource({
        uri: `template://schema/${type}`,
        name: `${type} Template Schema`,
        description: `JSON schema for ${type} template type`,
        mimeType: 'application/json'
      });

      this.registerResource({
        uri: `template://examples/${type}`,
        name: `${type} Template Examples`,
        description: `Example configurations for ${type} template`,
        mimeType: 'application/json'
      });
    }

    // Server information
    this.registerResource({
      uri: 'server://info',
      name: 'Server Information',
      description: 'MCP server capabilities and configuration',
      mimeType: 'application/json'
    });

    this.registerResource({
      uri: 'server://stats',
      name: 'Server Statistics',
      description: 'Performance and usage statistics',
      mimeType: 'application/json'
    });
  }

  /**
   * Register a new resource
   */
  registerResource(resource: Resource): void {
    this.resources.set(resource.uri, resource);
    this.logger.debug('Resource registered', { uri: resource.uri });
  }

  /**
   * List all available resources
   */
  async listResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  /**
   * Read a resource by URI
   */
  async readResource(uri: string): Promise<ResourceContents> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new ResourceError(uri, 'Resource not found');
    }

    try {
      const content = await this.getResourceContent(uri);
      
      return {
        uri,
        mimeType: resource.mimeType,
        content: [{
          type: 'text',
          text: content
        }]
      };
    } catch (error) {
      this.logger.error(`Failed to read resource: ${uri}`, error);
      throw new ResourceError(uri, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Subscribe to resource changes
   */
  async subscribe(uri: string): Promise<void> {
    if (!this.resources.has(uri)) {
      throw new ResourceError(uri, 'Resource not found');
    }

    const clientId = 'default'; // In a real implementation, this would be per-client
    
    if (!this.subscriptions.has(uri)) {
      this.subscriptions.set(uri, new Set());
    }
    
    this.subscriptions.get(uri)!.add(clientId);
    this.logger.debug('Resource subscription added', { uri, clientId });
  }

  /**
   * Unsubscribe from resource changes
   */
  async unsubscribe(uri: string): Promise<void> {
    const clientId = 'default';
    
    const subscribers = this.subscriptions.get(uri);
    if (subscribers) {
      subscribers.delete(clientId);
      
      if (subscribers.size === 0) {
        this.subscriptions.delete(uri);
      }
    }
    
    this.logger.debug('Resource subscription removed', { uri, clientId });
  }

  /**
   * Cleanup resources and subscriptions
   */
  async cleanup(): Promise<void> {
    this.subscriptions.clear();
    this.logger.info('Resource Manager cleaned up');
  }

  /**
   * Get the actual content for a resource
   */
  private async getResourceContent(uri: string): Promise<string> {
    if (uri === 'template://docs') {
      return this.getTemplateDocumentation();
    }

    if (uri.startsWith('template://schema/')) {
      const templateType = uri.replace('template://schema/', '');
      return this.getTemplateSchema(templateType);
    }

    if (uri.startsWith('template://examples/')) {
      const templateType = uri.replace('template://examples/', '');
      return this.getTemplateExamples(templateType);
    }

    if (uri === 'server://info') {
      return this.getServerInfo();
    }

    if (uri === 'server://stats') {
      return this.getServerStats();
    }

    throw new ResourceError(uri, 'Unknown resource type');
  }

  /**
   * Generate template documentation
   */
  private getTemplateDocumentation(): string {
    return `# Dynamic Template System Documentation

## Overview

The Dynamic Template System provides 20+ template types for generating rich, interactive UI components. Each template is fully customizable with dynamic data, custom styling, and interactive features.

## Available Template Types

### Core Templates
- **Dashboard**: Business analytics dashboards with metrics and charts
- **Form**: Multi-section forms with validation and various input types
- **DataTable**: Sortable, filterable tables with pagination
- **ProductCatalog**: E-commerce product listings with search and filters
- **Gallery**: Image galleries with lightbox and categorization
- **Analytics**: Comprehensive analytics dashboards with KPIs

### Specialized Templates
- **Calendar**: Event management and scheduling interfaces
- **Kanban**: Task management boards with drag-and-drop
- **Chart**: Data visualization with multiple chart types
- **Feed**: Activity feeds and social media layouts
- **Stats**: KPI displays with progress indicators
- **Timeline**: Event timelines with media support
- **ProfileCard**: User profile displays
- **Pricing**: Pricing plans and comparison tables
- **Wizard**: Multi-step forms and processes
- **Map**: Interactive maps with markers
- **Marketplace**: Multi-vendor marketplaces
- **Ecommerce**: Shopping interfaces
- **Blog**: Blog layouts with posts
- **Portfolio**: Project showcases

## Dynamic Features

### Customization Options
- **Theme Support**: Light, dark, and system themes
- **Color Schemes**: Custom primary colors and branding
- **Layout Options**: Multiple layout configurations per template
- **Data Binding**: Dynamic data from external sources
- **Interactive Elements**: Click handlers and form submissions

### Use Case Adaptation
Templates automatically adapt based on provided use cases:
- Sales dashboards include revenue metrics
- DevOps dashboards focus on system monitoring
- Marketing templates emphasize campaign performance

### Advanced Features
- **Caching**: Intelligent caching for performance
- **Validation**: Schema validation for all configurations
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed operation logging

## Usage Examples

### Basic Template Generation
\`\`\`json
{
  "templateType": "dashboard",
  "title": "Sales Dashboard",
  "useCase": "sales tracking",
  "theme": "light"
}
\`\`\`

### Advanced Customization
\`\`\`json
{
  "templateType": "dashboard",
  "title": "Custom Dashboard",
  "customData": {
    "metrics": [...],
    "charts": [...],
    "navigation": {...}
  },
  "brandingConfig": {
    "brandName": "Acme Corp",
    "brandColors": ["#007bff", "#28a745"]
  }
}
\`\`\`

## Best Practices

1. **Use Specific Use Cases**: Provide detailed use case descriptions for better template adaptation
2. **Leverage Custom Data**: Use customData for specific requirements
3. **Consider Performance**: Large datasets should use pagination
4. **Test Validation**: Always validate template configurations
5. **Monitor Caching**: Use cache statistics to optimize performance

## Support

For detailed schema information, see template://schema/{type} resources.
For examples, see template://examples/{type} resources.
`;
  }

  /**
   * Get schema for a specific template type
   */
  private getTemplateSchema(templateType: string): string {
    // This would typically load from the actual generator
    return JSON.stringify({
      templateType,
      schema: {
        type: 'object',
        properties: {
          templateType: { type: 'string', const: templateType },
          title: { type: 'string' },
          description: { type: 'string' },
          theme: { type: 'string', enum: ['light', 'dark', 'system'] },
          // ... other properties would be specific to each template type
        },
        required: ['templateType', 'title']
      },
      description: `Schema for ${templateType} template type`,
      lastUpdated: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get examples for a specific template type
   */
  private getTemplateExamples(templateType: string): string {
    // This would typically load examples from the generator
    const examples = [
      {
        name: `Basic ${templateType}`,
        config: {
          templateType,
          title: `Sample ${templateType}`,
          description: `A basic ${templateType} example`,
          theme: 'system'
        }
      },
      {
        name: `Advanced ${templateType}`,
        config: {
          templateType,
          title: `Advanced ${templateType}`,
          description: `An advanced ${templateType} with custom features`,
          theme: 'dark',
          customData: {}
        }
      }
    ];

    return JSON.stringify({
      templateType,
      examples,
      lastUpdated: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get server information
   */
  private getServerInfo(): string {
    return JSON.stringify({
      name: 'Dynamic Templates MCP Server',
      version: '2.0.0',
      description: 'Production-ready MCP server for dynamic UI template generation',
      capabilities: {
        tools: ['generate_template', 'list_template_types', 'validate_template'],
        resources: ['documentation', 'schemas', 'examples'],
        prompts: ['design_ui_template']
      },
      templateTypes: [
        'dashboard', 'dataTable', 'productCatalog', 'profileCard', 'timeline',
        'gallery', 'pricing', 'stats', 'calendar', 'wizard', 'chart', 'map',
        'kanban', 'feed', 'form', 'marketplace', 'analytics', 'ecommerce',
        'blog', 'portfolio'
      ],
      features: [
        'Dynamic template generation',
        'Use case adaptation',
        'Custom data binding',
        'Theme support',
        'Caching',
        'Validation',
        'Error handling'
      ],
      uptime: process.uptime(),
      lastStarted: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get server statistics
   */
  private getServerStats(): string {
    return JSON.stringify({
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      },
      templates: {
        availableTypes: 20,
        // These would come from the template engine
        generatedCount: 0,
        cacheHitRate: 0,
        averageGenerationTime: 0
      },
      resources: {
        registered: this.resources.size,
        subscriptions: this.subscriptions.size
      },
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}