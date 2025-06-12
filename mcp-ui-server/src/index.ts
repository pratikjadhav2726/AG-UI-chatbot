#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  templates,
  getTemplateSchema,
  generateTemplateExample,
  validateTemplateConfig,
  TemplateType
} from "./templates/index.js";

/**
 * Shadcn/UI MCP Server
 * 
 * This server provides dynamic UI templates using shadcn/ui components.
 * It offers a comprehensive set of template types for different use cases.
 */

const server = new McpServer({
  name: "shadcn-ui-templates",
  version: "1.0.0",
});

const templateTypes = [
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
] as const;

// Template generation tool
server.tool(
  "generate_ui_template",
  {
    templateType: z.enum(templateTypes).describe("Type of UI template to generate"),
    title: z.string().describe("Title for the template"),
    description: z.string().optional().describe("Description of the template"),
    config: z.record(z.any()).optional().describe("Template-specific configuration"),
    useCase: z.string().optional().describe("Specific use case or context for the template"),
    theme: z.enum(["light", "dark", "system"]).optional().default("system").describe("Color theme"),
    primaryColor: z.string().optional().describe("Primary color (hex code)"),
    fullScreen: z.boolean().optional().default(false).describe("Whether to display in full screen")
  },
  async (params) => {
    try {
      const { templateType, title, description, config, useCase, theme, primaryColor, fullScreen } = params;
      const template = templates[templateType as TemplateType];
      
      if (!template) {
        return {
          content: [{
            type: "text",
            text: `Unknown template type: ${templateType}`
          }],
          isError: true
        };
      }

      // Generate template configuration
      const templateConfig = await template.generate({
        title,
        description,
        useCase,
        customConfig: config,
        theme,
        primaryColor,
        fullScreen
      });

      // Validate the configuration
      const validation = validateTemplateConfig(templateType as TemplateType, templateConfig);
      if (!validation.success) {
        return {
          content: [{
            type: "text",
            text: `Template validation failed: ${validation.errors?.join(", ") || "Unknown validation error"}`
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(templateConfig, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error generating template: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// List available templates tool
server.tool(
  "list_templates",
  {},
  async () => {
    try {
      const templateList = Object.entries(templates).map(([type, generator]) => ({
        type,
        name: generator.name,
        description: generator.description,
        capabilities: generator.capabilities,
        useCases: generator.useCases
      }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify(templateList, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error listing templates: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Get template schema tool
server.tool(
  "get_template_schema",
  {
    templateType: z.enum(templateTypes).describe("Type of template to get schema for")
  },
  async (params) => {
    try {
      const { templateType } = params;
      const schema = getTemplateSchema(templateType as TemplateType);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(schema, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error getting schema: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Get template examples tool
server.tool(
  "get_template_examples",
  {
    templateType: z.enum(templateTypes).describe("Type of template to get examples for"),
    useCase: z.string().optional().describe("Specific use case to filter examples")
  },
  async (params) => {
    try {
      const { templateType, useCase } = params;
      const examples = generateTemplateExample(templateType as TemplateType, useCase);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(examples, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error getting examples: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shadcn/UI MCP Server running on stdio");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}