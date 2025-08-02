#!/usr/bin/env node

/**
 * Simplified Dynamic Templates MCP Server v2.0
 * Compatible with MCP SDK v1.17.0
 */

import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Template types available
const TEMPLATE_TYPES = [
  'dashboard', 'form', 'table', 'analytics', 'ecommerce', 'blog', 'portfolio',
  'calendar', 'kanban', 'gallery', 'pricing', 'stats', 'timeline', 'wizard',
  'chart', 'map', 'feed', 'profile-card', 'data-table', 'marketplace'
];

// Create the MCP server
const server = new McpServer({
  name: process.env.MCP_SERVER_NAME || 'dynamic-templates-mcp',
  version: process.env.MCP_SERVER_VERSION || '2.0.0',
});

/**
 * Generate a basic template configuration
 */
function generateTemplateConfig(templateType: string, options: any = {}) {
  const baseConfig = {
    id: `template_${Date.now()}`,
    type: templateType,
    title: options.title || `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template`,
    description: options.description || `A dynamic ${templateType} template`,
    config: {
      theme: options.theme || 'modern',
      primaryColor: options.primaryColor || '#3b82f6',
      layout: options.layout || 'default',
      responsive: true,
      darkMode: options.darkMode !== false,
    },
    data: generateSampleData(templateType),
    metadata: {
      category: getCategoryForTemplate(templateType),
      complexity: options.complexity || 'medium',
      tags: [templateType, options.theme || 'modern'],
      createdAt: new Date().toISOString(),
    }
  };

  return baseConfig;
}

/**
 * Generate sample data for different template types
 */
function generateSampleData(templateType: string) {
  switch (templateType) {
    case 'dashboard':
      return {
        metrics: [
          { label: 'Total Users', value: '12,543', change: '+12%' },
          { label: 'Revenue', value: '$45,678', change: '+8%' },
          { label: 'Orders', value: '1,234', change: '+15%' },
          { label: 'Conversion', value: '3.2%', change: '+0.5%' }
        ],
        charts: [
          { type: 'line', title: 'Revenue Trend', data: [100, 120, 140, 130, 160, 180] },
          { type: 'bar', title: 'Sales by Category', data: [45, 67, 89, 56, 78] }
        ]
      };
    
    case 'form':
      return {
        fields: [
          { name: 'name', type: 'text', label: 'Full Name', required: true },
          { name: 'email', type: 'email', label: 'Email Address', required: true },
          { name: 'phone', type: 'tel', label: 'Phone Number', required: false },
          { name: 'message', type: 'textarea', label: 'Message', required: true }
        ],
        submitButton: { text: 'Submit', style: 'primary' },
        validation: { enabled: true, showErrors: true }
      };
    
    case 'table':
      return {
        columns: [
          { key: 'id', label: 'ID', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'status', label: 'Status', sortable: false },
          { key: 'actions', label: 'Actions', sortable: false }
        ],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' }
        ],
        pagination: { enabled: true, pageSize: 10 }
      };
    
    case 'ecommerce':
      return {
        products: [
          { id: 1, name: 'Wireless Headphones', price: 99.99, image: '/api/placeholder/200/200', rating: 4.5 },
          { id: 2, name: 'Smart Watch', price: 299.99, image: '/api/placeholder/200/200', rating: 4.8 },
          { id: 3, name: 'Laptop Stand', price: 49.99, image: '/api/placeholder/200/200', rating: 4.2 }
        ],
        categories: ['Electronics', 'Accessories', 'Gadgets'],
        filters: ['Price', 'Brand', 'Rating', 'Availability']
      };
    
    default:
      return {
        items: [
          { id: 1, title: 'Sample Item 1', description: 'This is a sample item for the template' },
          { id: 2, title: 'Sample Item 2', description: 'Another sample item for demonstration' },
          { id: 3, title: 'Sample Item 3', description: 'A third sample item to show variety' }
        ]
      };
  }
}

/**
 * Get category for template type
 */
function getCategoryForTemplate(templateType: string): string {
  const categories: Record<string, string> = {
    dashboard: 'analytics',
    form: 'input',
    table: 'data',
    analytics: 'analytics',
    ecommerce: 'commerce',
    blog: 'content',
    portfolio: 'showcase',
    calendar: 'scheduling',
    kanban: 'productivity',
    gallery: 'media',
    pricing: 'commerce',
    stats: 'analytics',
    timeline: 'display',
    wizard: 'input',
    chart: 'analytics',
    map: 'location',
    feed: 'content',
    'profile-card': 'social',
    'data-table': 'data',
    marketplace: 'commerce'
  };
  
  return categories[templateType] || 'general';
}

// Register the main template generation tool
server.registerTool(
  'generate_template',
  {
    description: 'Generate a dynamic UI template with customization options',
    inputSchema: {
      templateType: z.enum(TEMPLATE_TYPES as [string, ...string[]]).describe('Type of template to generate'),
      title: z.string().optional().describe('Title for the template'),
      description: z.string().optional().describe('Description of the template'),
      theme: z.enum(['modern', 'classic', 'minimal', 'dark']).optional().describe('Visual theme'),
      primaryColor: z.string().optional().describe('Primary color (hex code)'),
      complexity: z.enum(['simple', 'medium', 'complex']).optional().describe('Template complexity level'),
      layout: z.string().optional().describe('Layout style'),
      darkMode: z.boolean().optional().describe('Enable dark mode support'),
    },
  },
  async ({ templateType, title, description, theme, primaryColor, complexity, layout, darkMode }) => {
    try {
      const templateConfig = generateTemplateConfig(templateType, {
        title,
        description,
        theme,
        primaryColor,
        complexity,
        layout,
        darkMode
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(templateConfig, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Failed to generate template',
            message: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register template types listing tool
server.registerTool(
  'list_template_types',
  {
    description: 'List all available template types and their descriptions',
    inputSchema: {},
  },
  async () => {
    const templateInfo = TEMPLATE_TYPES.map(type => ({
      type,
      category: getCategoryForTemplate(type),
      description: `Generate a ${type} template with dynamic content and styling`
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          templateTypes: templateInfo,
          total: TEMPLATE_TYPES.length
        }, null, 2)
      }]
    };
  }
);

// Register template suggestions tool
server.registerTool(
  'get_template_suggestions',
  {
    description: 'Get template suggestions based on user requirements',
    inputSchema: {
      useCase: z.string().describe('Description of the use case or requirements'),
      category: z.enum(['analytics', 'input', 'data', 'commerce', 'content', 'showcase', 'scheduling', 'productivity', 'media', 'location', 'social', 'general']).optional().describe('Preferred category'),
    },
  },
  async ({ useCase, category }) => {
    // Simple keyword-based suggestions
    const suggestions = [];
    const lowerUseCase = useCase.toLowerCase();

    if (lowerUseCase.includes('dashboard') || lowerUseCase.includes('metric') || lowerUseCase.includes('kpi')) {
      suggestions.push('dashboard', 'analytics', 'stats');
    }
    if (lowerUseCase.includes('form') || lowerUseCase.includes('input') || lowerUseCase.includes('contact')) {
      suggestions.push('form', 'wizard');
    }
    if (lowerUseCase.includes('table') || lowerUseCase.includes('data') || lowerUseCase.includes('list')) {
      suggestions.push('table', 'data-table');
    }
    if (lowerUseCase.includes('shop') || lowerUseCase.includes('product') || lowerUseCase.includes('ecommerce')) {
      suggestions.push('ecommerce', 'marketplace', 'pricing');
    }
    if (lowerUseCase.includes('blog') || lowerUseCase.includes('article') || lowerUseCase.includes('content')) {
      suggestions.push('blog', 'feed');
    }
    if (lowerUseCase.includes('portfolio') || lowerUseCase.includes('showcase') || lowerUseCase.includes('gallery')) {
      suggestions.push('portfolio', 'gallery');
    }

    // Filter by category if specified
    if (category && suggestions.length === 0) {
      const categoryTemplates = TEMPLATE_TYPES.filter(type => getCategoryForTemplate(type) === category);
      suggestions.push(...categoryTemplates.slice(0, 3));
    }

    // Default suggestions if none found
    if (suggestions.length === 0) {
      suggestions.push('dashboard', 'form', 'table');
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          useCase,
          category,
          suggestions: [...new Set(suggestions)].slice(0, 5),
          allTypes: TEMPLATE_TYPES
        }, null, 2)
      }]
    };
  }
);

// Register a simple resource for server info
server.registerResource(
  'server-info',
  'mcp://dynamic-templates/server-info',
  {
    description: 'Information about the MCP server capabilities',
    mimeType: 'application/json',
  },
  async () => {
    return {
      contents: [{
        uri: 'mcp://dynamic-templates/server-info',
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'Dynamic Templates MCP Server',
          version: '2.0.0',
          capabilities: {
            templateGeneration: true,
            templateTypes: TEMPLATE_TYPES.length,
            supportedThemes: ['modern', 'classic', 'minimal', 'dark'],
            supportedComplexity: ['simple', 'medium', 'complex']
          },
          availableTemplates: TEMPLATE_TYPES,
          tools: ['generate_template', 'list_template_types', 'get_template_suggestions']
        }, null, 2)
      }]
    };
  }
);

// Main function to start the server
async function main() {
  try {
    console.error('🚀 Starting Dynamic Templates MCP Server v2.0...');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('✅ MCP Server connected and ready!');
    console.error(`📋 Available tools: generate_template, list_template_types, get_template_suggestions`);
    console.error(`🎨 Template types: ${TEMPLATE_TYPES.length} available`);
    
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Server startup failed:', error);
    process.exit(1);
  });
}