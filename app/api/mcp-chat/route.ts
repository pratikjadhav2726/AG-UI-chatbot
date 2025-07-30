/**
 * MCP-Powered Chatbot API Route using Official TypeScript SDK
 * 
 * This API route integrates LLMs with MCP tools using the official
 * @modelcontextprotocol/sdk for dynamic UI template generation.
 * 
 * Based on: https://github.com/modelcontextprotocol/typescript-sdk
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { getMCPClient, initializeMCPClient } from '@/lib/mcp-client';

// Import AI providers based on environment
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

// Types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface ChatResponse {
  message: string;
  toolCalls?: any[];
  toolResults?: any[];
  error?: string;
}

/**
 * Get the appropriate AI model based on environment configuration
 */
function getAIModel() {
  const provider = process.env.MODEL_PROVIDER || 'openai';
  const modelId = process.env.MODEL_ID;

  switch (provider.toLowerCase()) {
    case 'google':
    case 'gemini':
      return google(modelId || 'gemini-1.5-pro');
    
    case 'anthropic':
    case 'claude':
      return anthropic(modelId || 'claude-3-5-sonnet-20241022');
    
    case 'openai':
    default:
      return openai(modelId || 'gpt-4o');
  }
}

/**
 * Create MCP-powered tools for the AI model
 */
async function createMCPTools() {
  try {
    const mcpClient = await initializeMCPClient();
    const availableTools = mcpClient.getAvailableTools();

    // Create AI SDK tools based on available MCP tools
    const tools: Record<string, any> = {};

    // Template generation tool
    tools.generateUITemplate = tool({
      description: 'Generate dynamic UI templates based on user requirements. Use this when users ask for dashboards, forms, tables, or any UI components.',
      parameters: z.object({
        templateType: z.string().describe('Type of template to generate (dashboard, form, table, analytics, etc.)'),
        title: z.string().describe('Title for the template'),
        description: z.string().describe('Description of what the template should contain'),
        requirements: z.object({
          category: z.string().optional().describe('Category of the template'),
          complexity: z.enum(['simple', 'medium', 'complex']).optional().describe('Complexity level'),
          features: z.array(z.string()).optional().describe('Specific features to include'),
          data: z.any().optional().describe('Sample data requirements')
        }).optional()
      }),
      execute: async ({ templateType, title, description, requirements = {} }) => {
        try {
          const result = await mcpClient.generateTemplate(templateType, {
            title,
            description,
            ...requirements
          });

          if (result.success && result.template) {
            return {
              success: true,
              template: result.template,
              message: `Successfully generated ${templateType} template: ${title}`
            };
          } else {
            return {
              success: false,
              error: result.error || 'Template generation failed',
              message: `Failed to generate ${templateType} template`
            };
          }
        } catch (error) {
          console.error('Template generation error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Error occurred during template generation'
          };
        }
      }
    });

    // Template suggestions tool
    tools.getTemplateSuggestions = tool({
      description: 'Get template suggestions based on user input. Use this to help users discover what types of templates are available.',
      parameters: z.object({
        userInput: z.string().describe('User input to analyze for template suggestions')
      }),
      execute: async ({ userInput }) => {
        try {
          const suggestions = await mcpClient.getTemplateSuggestions(userInput);
          return {
            success: true,
            suggestions,
            message: `Found ${suggestions.length} template suggestions`
          };
        } catch (error) {
          console.error('Get suggestions error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            suggestions: []
          };
        }
      }
    });

    // List available templates tool
    tools.listAvailableTemplates = tool({
      description: 'List all available template types and their descriptions. Use this when users ask what templates are available.',
      parameters: z.object({}),
      execute: async () => {
        try {
          const capabilities = mcpClient.getAvailableTools();
          const templateTypes = [
            { type: 'dashboard', description: 'Business metrics and analytics dashboards' },
            { type: 'form', description: 'Multi-step forms with validation' },
            { type: 'table', description: 'Sortable, filterable data tables' },
            { type: 'analytics', description: 'KPI dashboards with insights' },
            { type: 'productCatalog', description: 'E-commerce product listings' },
            { type: 'calendar', description: 'Event scheduling interfaces' },
            { type: 'map', description: 'Interactive location displays' },
            { type: 'profileCard', description: 'User profile displays' },
            { type: 'chart', description: 'Data visualization charts' },
            { type: 'timeline', description: 'Event timeline displays' },
            { type: 'kanban', description: 'Task management boards' },
            { type: 'gallery', description: 'Image and media galleries' }
          ];

          return {
            success: true,
            templateTypes,
            capabilities: capabilities.map(tool => ({
              name: tool.name,
              description: tool.description
            })),
            message: `Available template types: ${templateTypes.map(t => t.type).join(', ')}`
          };
        } catch (error) {
          console.error('List templates error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            templateTypes: []
          };
        }
      }
    });

    return tools;
  } catch (error) {
    console.error('Failed to create MCP tools:', error);
    
    // Return fallback tools if MCP is not available
    return {
      generateUITemplate: tool({
        description: 'Generate UI templates (MCP server unavailable)',
        parameters: z.object({
          templateType: z.string(),
          title: z.string(),
          description: z.string(),
          requirements: z.any().optional()
        }),
        execute: async () => ({
          success: false,
          error: 'MCP server is not available',
          message: 'Template generation is currently unavailable'
        })
      })
    };
  }
}

/**
 * Handle POST requests for chat interactions
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const { messages }: ChatRequest = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        message: 'Invalid request: messages array is required',
        error: 'Invalid request format'
      }, { status: 400 });
    }

    // Get AI model and tools
    const model = getAIModel();
    const tools = await createMCPTools();

    // System prompt for the AI assistant
    const systemPrompt = `You are an AI UI Template Assistant powered by the Model Context Protocol (MCP) using the official TypeScript SDK. You help users create dynamic UI templates for web applications through natural language interaction.

Your capabilities include:
- Generating various types of UI templates using MCP tools from the server
- Providing template suggestions based on user needs
- Creating realistic sample data for templates
- Explaining template features and customization options

When users ask for UI templates or components:
1. Use the generateUITemplate tool to create the requested template via MCP
2. Provide clear explanations of what you've created
3. Suggest related templates or improvements
4. Always be helpful and creative in your responses

Available template types (via MCP server):
- dashboard: Business metrics and analytics dashboards
- form: Multi-step forms with validation  
- dataTable: Sortable, filterable data tables
- analytics: KPI dashboards with insights
- productCatalog: E-commerce product listings
- calendar: Event scheduling interfaces
- map: Interactive location displays
- profileCard: User profile displays
- chart: Data visualization charts
- timeline: Event timeline displays
- kanban: Task management boards
- gallery: Image and media galleries
- pricing: Pricing plans and comparison tables
- stats: KPI displays with progress indicators
- wizard: Multi-step forms and processes

The MCP server provides rich, contextual data for each template type. Be conversational, helpful, and always try to understand what the user really needs.`;

    // Prepare messages for the AI model
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ];

    // Generate response using AI SDK
    const result = await generateText({
      model,
      messages: aiMessages,
      tools,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Extract tool calls and results
    const toolCalls = result.toolCalls || [];
    const toolResults = result.toolResults || [];

    return NextResponse.json({
      message: result.text,
      toolCalls,
      toolResults
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json({
      message: 'I apologize, but I encountered an error while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * Handle GET requests for health checks
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Check if MCP client is available
    const mcpClient = getMCPClient();
    const isConnected = mcpClient.isClientConnected();
    
    return NextResponse.json({
      status: 'healthy',
      mcpConnected: isConnected,
      timestamp: new Date().toISOString(),
      availableProviders: {
        openai: !!process.env.OPENAI_API_KEY,
        google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
