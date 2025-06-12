// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateText, tool, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai'
import { z } from 'zod';
import { getMCPClient } from '@/lib/mcp-client';

// MCP UI Tool for generating dynamic templates
const mcpUITool = tool({
  description: 'Generate dynamic UI templates using shadcn/ui components. Can create dashboards, forms, tables, product catalogs, and more.',
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
    config: z.record(z.any()).optional().describe("Template-specific configuration"),
    useCase: z.string().optional().describe("Specific use case or context for the template"),
    theme: z.enum(["light", "dark", "system"]).optional().default("system").describe("Color theme"),
    primaryColor: z.string().optional().describe("Primary color (hex code)"),
    fullScreen: z.boolean().optional().default(false).describe("Whether to display in full screen")
  }),
  execute: async ({ templateType, title, description, config, useCase, theme, primaryColor, fullScreen }) => {
    try {
      const mcpClient = getMCPClient();
      
      // Call the MCP server to generate the template
      const result = await mcpClient.callTool({
        name: 'generate_ui_template',
        arguments: {
          templateType,
          title,
          description,
          config,
          useCase,
          theme,
          primaryColor,
          fullScreen
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
        message: `Generated ${templateType} template: ${title} (via MCP)`
      };
    } catch (error) {
      console.error('Error calling MCP server, falling back to hardcoded templates:', error);
      
      // Fallback to basic template structure if MCP fails
      const fallbackConfig = {
        templateType,
        title,
        description: description || `${title} - Generated using AI`,
        theme: theme || "system",
        primaryColor: primaryColor || "#3b82f6",
        fullScreen: fullScreen || false,
        closeButtonText: "Close",
        actionButtonText: "Take Action",
        // Add template-specific configuration based on type
        ...(templateType === "dashboard" && {
          layout: "grid",
          metrics: [
            {
              id: "users",
              label: "Total Users", 
              value: "12,458",
              change: 12.5,
              changeType: "increase",
              icon: "Users",
              color: "#3b82f6"
            },
            {
              id: "revenue",
              label: "Revenue",
              value: "$45,210", 
              change: 8.2,
              changeType: "increase",
              icon: "DollarSign",
              color: "#10b981"
            }
          ],
          charts: [
            {
              id: "trend",
              type: "line",
              title: "Growth Trend",
              data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                  label: "Users",
                  data: [1000, 1200, 1400, 1300, 1600, 1800],
                  borderColor: "#3b82f6"
                }]
              },
              height: 300
            }
          ]
        }),
        ...(templateType === "form" && {
          sections: [
            {
              id: "main",
              title: "Information",
              description: "Please fill out the form",
              columns: 1,
              fields: [
                {
                  id: "name",
                  type: "text",
                  label: "Full Name",
                  placeholder: "Enter your name",
                  required: true
                },
                {
                  id: "email", 
                  type: "email",
                  label: "Email Address",
                  placeholder: "Enter your email",
                  required: true
                },
                {
                  id: "message",
                  type: "textarea",
                  label: "Message",
                  placeholder: "Enter your message"
                }
              ]
            }
          ],
          submitButtonText: "Submit",
          showProgress: false
        }),
        ...(templateType === "dataTable" && {
          columns: [
            { id: "id", header: "ID", accessorKey: "id", enableSorting: true },
            { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
            { id: "status", header: "Status", accessorKey: "status", cell: { type: "badge" } },
            { id: "date", header: "Date", accessorKey: "date", enableSorting: true }
          ],
          data: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
            status: ["Active", "Inactive", "Pending"][i % 3],
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })),
          pagination: {
            enabled: true,
            pageSize: 10
          }
        }),
        ...(templateType === "productCatalog" && {
          layout: "grid",
          products: [
            {
              id: "1",
              name: "Premium Product",
              description: "High-quality product with excellent features",
              price: 299.99,
              currency: "USD",
              imageUrl: "/placeholder.jpg",
              rating: 4.8,
              category: "Electronics",
              inStock: true
            },
            {
              id: "2", 
              name: "Standard Product",
              description: "Reliable product for everyday use",
              price: 199.99,
              currency: "USD",
              imageUrl: "/placeholder.jpg",
              rating: 4.5,
              category: "Electronics", 
              inStock: true
            }
          ],
          categories: [
            { id: "electronics", name: "Electronics" },
            { id: "accessories", name: "Accessories" }
          ]
        }),
        // Add other template configurations as needed
        ...config
      };

      return {
        success: true,
        template: fallbackConfig,
        message: `Generated ${templateType} template: ${title} (fallback mode)`
      };
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    const completion = await generateText({
      model: openai('gpt-4-turbo'),
      messages,
      tools: {
        generateUITemplate: mcpUITool,
      },
      toolChoice: "auto",
      maxTokens: 4000,
    })

    // Return the complete response including any tool calls and results
    return NextResponse.json({
      message: completion.text,
      toolCalls: completion.toolCalls,
      toolResults: completion.toolResults,
      usage: completion.usage
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}