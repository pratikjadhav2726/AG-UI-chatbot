import { NextRequest, NextResponse } from "next/server"
import { generateText, tool, CoreMessage } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { google } from '@ai-sdk/google' 
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { fromContainerMetadata } from '@aws-sdk/credential-providers'
import { z } from 'zod';
import { getMCPClient } from '@/lib/mcp-client';

// Enhanced MCP UI Tool for generating dynamic templates with custom content
const mcpUITool = tool({
  description: 'Generate dynamic UI templates using the MCP server. This tool can create dashboards, forms, tables, product catalogs, analytics dashboards, and many other UI components with rich, contextual data. You can customize images, text content, data, and branding.',
  parameters: z.object({
    templateType: z.enum([
      "dashboard",
      "dataTable", 
      "productCatalog",
      "profileCard",
      "timeline",
      "gallery",
      "pricing",
      "stats",
      "calendar",
      "wizard",
      "chart",
      "map",
      "kanban",
      "feed",
      "form",
      "marketplace",
      "analytics",
      "ecommerce",
      "blog",
      "portfolio"
    ]).describe("Type of UI template to generate"),
    title: z.string().describe("Title for the template"),
    description: z.string().optional().describe("Description of the template"),
    useCase: z.string().optional().describe("Specific use case or context for the template"),
    theme: z.enum(["light", "dark", "system"]).optional().default("system").describe("Color theme"),
    primaryColor: z.string().optional().describe("Primary color (hex code)"),
    fullScreen: z.boolean().optional().default(false).describe("Whether to display in full screen"),
    // Simplified dynamic content parameters for Google API compatibility
    customData: z.string().optional().describe("Custom data as JSON string with additional configuration like metrics, product info, etc."),
    images: z.string().optional().describe("Images configuration as JSON string with array of image objects"),
    textContent: z.string().optional().describe("Custom text content as JSON string for different sections"),
    brandingConfig: z.string().optional().describe("Branding configuration as JSON string with logo, colors, fonts, etc.")
  }),
  execute: async ({ templateType, title, description, useCase, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig }) => {
    try {
      const mcpClient = getMCPClient();
      
      // Parse JSON strings back to objects for MCP server
      const parsedCustomData = customData ? JSON.parse(customData) : undefined;
      const parsedImages = images ? JSON.parse(images) : undefined;
      const parsedTextContent = textContent ? JSON.parse(textContent) : undefined;
      const parsedBrandingConfig = brandingConfig ? JSON.parse(brandingConfig) : undefined;
      
      // Call the MCP server to generate the template with enhanced parameters
      const result = await mcpClient.callTool({
        name: 'generate_ui_template',
        arguments: {
          templateType,
          title,
          description,
          useCase,
          theme,
          primaryColor,
          fullScreen,
          customData: parsedCustomData,
          images: parsedImages,
          textContent: parsedTextContent,
          brandingConfig: parsedBrandingConfig
        }
      });

      if (result.isError) {
        throw new Error(result.content[0]?.text || 'Unknown MCP error');
      }

      // Parse the template configuration from MCP response
      const templateConfig = JSON.parse(result.content[0]?.text || '{}');
      
      return {
        success: true,
        template: templateConfig,
        message: `Generated ${templateType} template: ${title}`,
        templateType,
        title
      };
    } catch (error) {
      console.error('Error calling MCP server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to generate ${templateType} template`
      };
    }
  }
});

// MCP Tool for listing available templates
const listTemplatesTool = tool({
  description: 'List all available template types and their capabilities from the MCP server',
  parameters: z.object({}),
  execute: async () => {
    try {
      const mcpClient = getMCPClient();
      
      const result = await mcpClient.callTool({
        name: 'list_templates',
        arguments: {}
      });

      if (result.isError) {
        throw new Error(result.content[0]?.text || 'Failed to list templates');
      }

      const templates = JSON.parse(result.content[0]?.text || '[]');
      
      return {
        success: true,
        templates,
        message: 'Retrieved available templates from MCP server'
      };
    } catch (error) {
      console.error('Error listing templates:', error);
      
      // Fallback template information
      return {
        success: true,
        templates: [
          {
            type: "dashboard",
            name: "Dashboard Template",
            description: "Interactive dashboards with metrics, charts, and activity feeds",
            capabilities: ["Real-time metrics", "Multiple chart types", "Activity feeds"],
            useCases: ["Business analytics", "System monitoring", "Performance tracking"]
          },
          {
            type: "form",
            name: "Dynamic Form Template", 
            description: "Multi-section forms with validation and various input types",
            capabilities: ["Multi-section forms", "Field validation", "Various input types"],
            useCases: ["User registration", "Surveys", "Contact forms"]
          },
          {
            type: "analytics",
            name: "Analytics Dashboard Template",
            description: "Comprehensive analytics dashboards with KPIs and insights",
            capabilities: ["KPI tracking", "Multiple chart types", "Audience segmentation"],
            useCases: ["Website analytics", "Marketing analysis", "Performance tracking"]
          }
        ],
        message: 'Showing fallback template information'
      };
    }
  }
});

// MCP Tool for getting template examples
const getTemplateExamplesTool = tool({
  description: 'Get example configurations for a specific template type',
  parameters: z.object({
    templateType: z.string().describe("The template type to get examples for"),
    useCase: z.string().optional().describe("Specific use case to filter examples")
  }),
  execute: async ({ templateType, useCase }) => {
    try {
      const mcpClient = getMCPClient();
      
      const result = await mcpClient.callTool({
        name: 'get_template_examples',
        arguments: { templateType, useCase }
      });

      if (result.isError) {
        throw new Error(result.content[0]?.text || 'Failed to get examples');
      }

      const examples = JSON.parse(result.content[0]?.text || '{}');
      
      return {
        success: true,
        examples,
        templateType,
        message: `Retrieved examples for ${templateType} template`
      };
    } catch (error) {
      console.error('Error getting template examples:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get examples for ${templateType} template`
      };
    }
  }
});

// Bedrock client cache with session management
let cachedBedrockClient: any = null;
let sessionExpiration: Date | null = null;
let lastCredentials: any = null;

async function initializeBedrock() {
  try {
    // Check if we have a valid cached client
    if (cachedBedrockClient && sessionExpiration) {
      const now = new Date();
      const timeUntilExpiry = sessionExpiration.getTime() - now.getTime();
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes buffer
      
      // If session expires in more than 5 minutes, reuse cached client
      if (timeUntilExpiry > fiveMinutesInMs) {
        console.log('Using cached Bedrock client, expires in:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');
        return cachedBedrockClient;
      } else {
        console.log('Bedrock session expiring soon, refreshing client');
      }
    }

    console.log('Initializing new Bedrock client with container metadata...');
    
    // Get fresh credentials from container metadata
    const credentialProvider = fromContainerMetadata();
    const credentials = await credentialProvider();
    
    console.log('Container metadata credentials resolved:', {
      accessKeyId: credentials.accessKeyId?.substring(0, 10) + '...',
      hasSecretKey: !!credentials.secretAccessKey,
      hasSessionToken: !!credentials.sessionToken,
      expiration: credentials.expiration
    });

    // Create new Bedrock provider
    const bedrock = createAmazonBedrock({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    });

    // Cache the client and session info
    cachedBedrockClient = bedrock;
    sessionExpiration = credentials.expiration || null;
    lastCredentials = {
      accessKeyId: credentials.accessKeyId?.substring(0, 10) + '...',
      expiration: credentials.expiration
    };

    console.log('Bedrock client cached, session expires at:', sessionExpiration);
    return bedrock;
  } catch (error) {
    console.error('Failed to initialize Bedrock with container metadata:', error);
    // Clear cache on error
    cachedBedrockClient = null;
    sessionExpiration = null;
    lastCredentials = null;
    throw error;
  }
}
// Helper function to get session status for debugging
function getSessionStatus() {
  if (!sessionExpiration) return 'No session';
  
  const now = new Date();
  const timeUntilExpiry = sessionExpiration.getTime() - now.getTime();
  const minutesUntilExpiry = Math.round(timeUntilExpiry / 1000 / 60);
  
  return {
    hasSession: !!cachedBedrockClient,
    expiresAt: sessionExpiration.toISOString(),
    minutesUntilExpiry,
    isValid: timeUntilExpiry > 5 * 60 * 1000, // 5 minute buffer
    lastCredentials: lastCredentials?.accessKeyId
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()
    
    // Determine model provider and model ID from environment variables
    const modelProvider = process.env.MODEL_PROVIDER || 'google';
    let model;

    switch (modelProvider.toLowerCase()) {
      case 'google':
        model = google(process.env.GOOGLE_MODEL_ID || 'gemini-1.5-flash-latest');
        break;
      case 'bedrock': {
        const bedrock = await initializeBedrock();
        const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-20250514-v1:0';
        model = bedrock(modelId);
        break;
      }
      case 'groq': {
        // and set GROQ_MODEL_ID in env
        model = groq(process.env.GROQ_MODEL_ID || 'llama3-70b-8192');
        break;
      }
      case 'openai': {
        model = openai(process.env.OPENAI_MODEL_ID || 'gpt-4o');
        break;
      }
      default:
        const bedrock = await initializeBedrock();
        const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-20250514-v1:0';
        model = bedrock(modelId);
        break;
    }
    
    const completion = await generateText({
      model,
      messages,
      tools: {
        generateUITemplate: mcpUITool,
        listTemplates: listTemplatesTool,
        getTemplateExamples: getTemplateExamplesTool,
      },
      toolChoice: 'auto',
      temperature: 0.7,
      system: `You are an expert UI/UX assistant that helps users create dynamic templates using a powerful MCP (Model Context Protocol) server. You have direct access to tools that can generate real, functional UI templates.

AVAILABLE TOOLS:
- generateUITemplate: Generate dynamic UI templates with rich, contextual data
- listTemplates: List all available template types and their capabilities  
- getTemplateExamples: Get example configurations for specific template types

CAPABILITIES:
- Generate 20+ different types of UI templates (dashboards, forms, tables, analytics, etc.)
- Each template comes with rich, contextual sample data
- Templates adapt based on specific use cases and requirements
- Support for themes, colors, and customization options
- Process form submissions and template interactions intelligently

AVAILABLE TEMPLATE TYPES:
1. **Dashboard**: Business metrics dashboards with charts and activity feeds
2. **DataTable**: Sortable, filterable data tables with pagination
3. **ProductCatalog**: E-commerce product listings with filtering
4. **Form**: Multi-section forms with validation and various input types
5. **Analytics**: Comprehensive analytics dashboards with KPIs and insights
6. **ProfileCard**: User profile displays with contact information
7. **Timeline**: Event timelines with media support
8. **Gallery**: Image galleries with lightbox functionality
9. **Pricing**: Pricing plans and comparison tables
10. **Stats**: KPI displays with progress indicators
11. **Calendar**: Event calendars with scheduling
12. **Wizard**: Multi-step forms and processes
13. **Chart**: Data visualization charts and graphs
14. **Map**: Interactive maps with markers
15. **Kanban**: Task management boards
16. **Feed**: Activity feeds and social media style layouts
17. **Marketplace**: Multi-vendor marketplaces
18. **Ecommerce**: Shopping interfaces with cart functionality
19. **Blog**: Blog layouts with posts and categories
20. **Portfolio**: Project showcases and professional profiles

IMPORTANT INSTRUCTIONS:
- When users ask for templates, ALWAYS use the generateUITemplate tool to create them
- Do NOT describe what you would do - actually generate the template using the tool
- The generateUITemplate tool will create real, functional templates with sample data
- You have full access to this tool and should use it whenever users request templates

CONVERSATION FLOW:
1. When users ask about capabilities, use the listTemplates tool to show what's available
2. When users want to see examples, use getTemplateExamples to demonstrate
3. When users want to create something, ALWAYS use generateUITemplate with appropriate parameters
4. Always be helpful in understanding user requirements and suggesting the best template type
5. Explain the features and capabilities of each template type clearly

FORM SUBMISSION & INTERACTION HANDLING:
When users submit forms or interact with templates:
1. **Acknowledge the submission** with a friendly, professional response
2. **Summarize the submitted data** in a clear, organized way
3. **Provide next steps** or suggestions based on the submission
4. **Offer to generate related templates** or additional functionality
5. **Ask follow-up questions** to better understand user needs

For form submissions, you might:
- Confirm receipt of registration data and suggest account setup steps
- Acknowledge survey responses and offer to generate analytics
- Process contact form submissions and suggest follow-up actions
- Handle order forms and provide order confirmation details

For template interactions, you might:
- Respond to data table filtering/sorting actions
- Process dashboard metric interactions
- Handle product catalog selections
- Respond to calendar event interactions

RESPONSE STYLE:
- Be conversational and helpful
- Explain technical concepts in accessible terms
- Suggest specific use cases and applications
- Provide clear next steps for users
- When templates are generated, explain what was created and its key features
- For form submissions, be warm and professional while providing actionable next steps

Remember: You have direct access to the generateUITemplate tool and should use it to create real templates whenever users request them. The MCP server generates rich, realistic sample data for each template type, making them immediately useful for demonstration and development purposes.`
    })

    return NextResponse.json({
      message: completion.text,
      toolCalls: completion.toolCalls || [],
      toolResults: completion.toolResults || [],
      usage: completion.usage
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    
    // Handle specific Bedrock errors
    if (error && typeof error === 'object' && 'name' in error) {
      const errorName = (error as any).name || (error as any).$fault;
      const errorMessage = (error as any).message || 'Unknown error';
      const metadata = (error as any).$metadata || {};
      
      // Log detailed error information
      console.error('Bedrock Error Details:', {
        name: errorName,
        message: errorMessage,
        fault: (error as any).$fault,
        metadata: metadata,
        requestId: (error as any).$metadata?.requestId,
        timestamp: new Date().toISOString()
      });

      // Handle specific error types
      switch (errorName) {
        case 'ThrottlingException':
          const retryAfter = metadata.totalRetryDelay || 30; // Use totalRetryDelay or default to 30 seconds
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait a moment before trying again.',
            details: 'The Bedrock service is currently throttling requests. This usually resolves within a few seconds.',
            retryAfter: retryAfter
          }, { status: 429 });

        case 'ValidationException':
          return NextResponse.json({
            error: 'Invalid request',
            message: 'The request contains invalid parameters.',
            details: errorMessage
          }, { status: 400 });

        case 'AccessDeniedException':
          return NextResponse.json({
            error: 'Access denied',
            message: 'Insufficient permissions to access the requested model.',
            details: 'Please check IAM permissions for Bedrock access.'
          }, { status: 403 });

        case 'ServiceQuotaExceededException':
          return NextResponse.json({
            error: 'Service quota exceeded',
            message: 'The service quota has been exceeded.',
            details: 'Please try again later or contact support to increase quotas.'
          }, { status: 429 });

        default:
          return NextResponse.json({
            error: 'Bedrock service error',
            message: `Service error: ${errorMessage}`,
            details: `Error type: ${errorName}`
          }, { status: 500 });
      }
    }

    // Generic error fallback
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
