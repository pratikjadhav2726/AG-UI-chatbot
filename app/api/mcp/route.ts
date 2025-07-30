/**
 * MCP Integration API Route
 * 
 * This API route handles communication between the chatbot and the MCP server,
 * providing endpoints for template generation and tool interactions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient, initializeMCPClient } from '@/lib/mcp-client';

// Request types
interface GenerateTemplateRequest {
  action: 'generate';
  templateType: string;
  requirements: any;
  userInput?: string;
}

interface ListToolsRequest {
  action: 'listTools';
}

interface CallToolRequest {
  action: 'callTool';
  toolName: string;
  arguments: any;
}

interface GetSuggestionsRequest {
  action: 'getSuggestions';
  userInput: string;
}

interface HealthCheckRequest {
  action: 'health';
}

type MCPRequest = GenerateTemplateRequest | ListToolsRequest | CallToolRequest | GetSuggestionsRequest | HealthCheckRequest;

// Response types
interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Handle POST requests to the MCP API
 */
export async function POST(request: NextRequest): Promise<NextResponse<MCPResponse>> {
  try {
    const body: MCPRequest = await request.json();

    // Initialize MCP client if not already connected
    let mcpClient;
    try {
      mcpClient = await initializeMCPClient();
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to MCP server. Please ensure the MCP server is running.',
        message: 'MCP connection failed'
      }, { status: 500 });
    }

    // Handle different actions
    switch (body.action) {
      case 'generate':
        return await handleGenerateTemplate(mcpClient, body);
      
      case 'listTools':
        return await handleListTools(mcpClient);
      
      case 'callTool':
        return await handleCallTool(mcpClient, body);
      
      case 'getSuggestions':
        return await handleGetSuggestions(mcpClient, body);
      
      case 'health':
        return await handleHealthCheck(mcpClient);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified',
          message: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Handle template generation requests
 */
async function handleGenerateTemplate(mcpClient: any, request: GenerateTemplateRequest): Promise<NextResponse<MCPResponse>> {
  try {
    const { templateType, requirements, userInput } = request;

    // Generate template using MCP client
    const result = await mcpClient.generateTemplate(templateType, {
      ...requirements,
      userInput
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.template,
        message: `Successfully generated ${templateType} template`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Template generation failed',
        message: 'Failed to generate template'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Template generation failed',
      message: 'Template generation error'
    }, { status: 500 });
  }
}

/**
 * Handle list tools requests
 */
async function handleListTools(mcpClient: any): Promise<NextResponse<MCPResponse>> {
  try {
    const tools = mcpClient.getAvailableTools();
    const resources = mcpClient.getAvailableResources();
    const prompts = mcpClient.getAvailablePrompts();

    return NextResponse.json({
      success: true,
      data: {
        tools,
        resources,
        prompts,
        summary: {
          toolCount: tools.length,
          resourceCount: resources.length,
          promptCount: prompts.length
        }
      },
      message: 'Successfully retrieved MCP capabilities'
    });
  } catch (error) {
    console.error('List tools error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tools',
      message: 'Failed to retrieve MCP capabilities'
    }, { status: 500 });
  }
}

/**
 * Handle direct tool calls
 */
async function handleCallTool(mcpClient: any, request: CallToolRequest): Promise<NextResponse<MCPResponse>> {
  try {
    const { toolName, arguments: toolArgs } = request;

    const result = await mcpClient.callTool(toolName, toolArgs);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully called tool: ${toolName}`
    });
  } catch (error) {
    console.error('Tool call error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Tool call failed',
      message: `Failed to call tool: ${request.toolName}`
    }, { status: 500 });
  }
}

/**
 * Handle template suggestions requests
 */
async function handleGetSuggestions(mcpClient: any, request: GetSuggestionsRequest): Promise<NextResponse<MCPResponse>> {
  try {
    const { userInput } = request;

    const suggestions = await mcpClient.getTemplateSuggestions(userInput);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        userInput
      },
      message: 'Successfully generated template suggestions'
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestions',
      message: 'Failed to generate suggestions'
    }, { status: 500 });
  }
}

/**
 * Handle health check requests
 */
async function handleHealthCheck(mcpClient: any): Promise<NextResponse<MCPResponse>> {
  try {
    const isHealthy = await mcpClient.healthCheck();

    if (isHealthy) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'healthy',
          connected: mcpClient.isClientConnected(),
          capabilities: {
            tools: mcpClient.getAvailableTools().length,
            resources: mcpClient.getAvailableResources().length,
            prompts: mcpClient.getAvailablePrompts().length
          }
        },
        message: 'MCP client is healthy'
      });
    } else {
      return NextResponse.json({
        success: false,
        data: {
          status: 'unhealthy',
          connected: false
        },
        error: 'MCP client health check failed',
        message: 'MCP client is not responding'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      message: 'Health check error'
    }, { status: 500 });
  }
}

/**
 * Handle GET requests for health checks
 */
export async function GET(): Promise<NextResponse<MCPResponse>> {
  try {
    const mcpClient = getMCPClient();
    
    if (!mcpClient.isClientConnected()) {
      return NextResponse.json({
        success: false,
        data: { status: 'disconnected' },
        error: 'MCP client not connected',
        message: 'MCP client is not connected'
      }, { status: 503 });
    }

    const isHealthy = await mcpClient.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        connected: mcpClient.isClientConnected(),
        timestamp: new Date().toISOString()
      },
      message: 'MCP status check completed'
    });
  } catch (error) {
    console.error('MCP status check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed',
      message: 'Failed to check MCP status'
    }, { status: 500 });
  }
}