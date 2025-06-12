import { NextRequest, NextResponse } from "next/server"
import { generateText, tool, CoreMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic'
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
    // Enhanced dynamic content parameters
    customData: z.record(z.any()).optional().describe("Custom data object with any additional configuration like metrics, product info, etc."),
    images: z.array(z.object({
      id: z.string(),
      url: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      category: z.string().optional().describe("Category like 'product', 'hero', 'gallery', etc.")
    })).optional().describe("Array of images to use in the template"),
    textContent: z.record(z.string()).optional().describe("Custom text content for different sections"),
    brandingConfig: z.object({
      logoUrl: z.string().optional(),
      brandName: z.string().optional(),
      brandColors: z.array(z.string()).optional(),
      fontFamily: z.string().optional()
    }).optional().describe("Branding configuration for the template")
  }),
  execute: async ({ templateType, title, description, useCase, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig }) => {
    try {
      const mcpClient = getMCPClient();
      
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
          customData,
          images,
          textContent,
          brandingConfig
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

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    const completion = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages,
      tools: {
        generateUITemplate: mcpUITool,
        listTemplates: listTemplatesTool,
        getTemplateExamples: getTemplateExamplesTool,
      },
      toolChoice: 'auto',
      temperature: 0.7,
      system: `You are an expert UI/UX assistant that helps users create dynamic templates using a powerful MCP (Model Context Protocol) server. 

CAPABILITIES:
- Generate 20+ different types of UI templates (dashboards, forms, tables, analytics, etc.)
- Each template comes with rich, contextual sample data
- Templates adapt based on specific use cases and requirements
- Support for themes, colors, and customization options

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

CONVERSATION FLOW:
1. When users ask about capabilities, use the listTemplates tool to show what's available
2. When users want to see examples, use getTemplateExamples to demonstrate
3. When users want to create something, use generateUITemplate with appropriate parameters
4. Always be helpful in understanding user requirements and suggesting the best template type
5. Explain the features and capabilities of each template type clearly

RESPONSE STYLE:
- Be conversational and helpful
- Explain technical concepts in accessible terms
- Suggest specific use cases and applications
- Provide clear next steps for users
- When templates are generated, explain what was created and its key features

Remember: The MCP server generates rich, realistic sample data for each template type, making them immediately useful for demonstration and development purposes.`
    })

    return NextResponse.json({
      message: completion.text,
      toolCalls: completion.toolCalls || [],
      toolResults: completion.toolResults || [],
      usage: completion.usage
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
