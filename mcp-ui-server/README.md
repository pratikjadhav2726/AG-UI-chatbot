# Shadcn/UI MCP Server

A comprehensive Model Context Protocol (MCP) server that provides dynamic UI templates using shadcn/ui components. This server enables AI agents to generate rich, interactive user interfaces for various use cases including dashboards, forms, data tables, and more.

## Features

### 🎨 **20+ Template Types**
- **Dashboard**: Interactive dashboards with metrics, charts, and activity feeds
- **Data Table**: Sortable, filterable tables with pagination
- **Product Catalog**: E-commerce style product listings
- **Profile Card**: User profile displays with contact information
- **Timeline**: Event timelines with media support
- **Gallery**: Image galleries with lightbox functionality
- **Pricing**: Pricing plans and comparison tables
- **Stats**: KPI and statistics displays
- **Calendar**: Event calendars with scheduling
- **Wizard**: Multi-step forms and processes
- **Chart**: Data visualization charts and graphs
- **Map**: Interactive maps with markers
- **Kanban**: Task management boards
- **Feed**: Social media style activity feeds
- **Form**: Dynamic forms with validation
- **Marketplace**: Multi-vendor marketplace listings
- **Analytics**: Comprehensive analytics dashboards
- **E-commerce**: Full-featured product displays
- **Blog**: Blog layouts with posts and categories
- **Portfolio**: Professional portfolios with projects

### 🛠 **Key Capabilities**
- **AI-Powered Generation**: Generate templates based on natural language descriptions
- **Context-Aware**: Templates adapt based on use case and requirements
- **Validation**: Built-in schema validation for all templates
- **Extensible**: Easy to add new template types and customizations
- **shadcn/ui Compatible**: All templates work seamlessly with shadcn/ui components

## Installation

```bash
cd mcp-ui-server
npm install
npm run build
```

## Usage

### As a Standalone MCP Server

```bash
# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### Integration with Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "shadcn-ui-templates": {
      "command": "node",
      "args": ["/path/to/mcp-ui-server/dist/index.js"]
    }
  }
}
```

### Integration with Other MCP Clients

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["/path/to/mcp-ui-server/dist/index.js"]
});

const client = new Client({
  name: "ui-template-client",
  version: "1.0.0"
});

await client.connect(transport);

// Generate a dashboard template
const result = await client.callTool({
  name: "generate_ui_template",
  arguments: {
    templateType: "dashboard",
    title: "Sales Dashboard",
    description: "Real-time sales metrics and analytics",
    useCase: "sales tracking for e-commerce business"
  }
});
```

## Available Tools

### `generate_ui_template`
Generate a complete UI template configuration.

**Parameters:**
- `templateType`: Type of template to generate
- `title`: Title for the template
- `description`: Optional description
- `config`: Optional custom configuration
- `useCase`: Specific use case or context
- `theme`: Color theme (light/dark/system)
- `primaryColor`: Primary color (hex code)
- `fullScreen`: Whether to display in full screen

### `get_template_schema`
Get the JSON schema for a specific template type.

**Parameters:**
- `templateType`: Type of template to get schema for

### `get_template_example`
Generate an example configuration for a template type.

**Parameters:**
- `templateType`: Type of template to get example for
- `useCase`: Optional specific use case

### `list_templates`
List all available template types with their capabilities and use cases.

## Available Resources

### `template://docs`
Complete documentation for all available templates.

### `template://schema/{type}`
JSON schema for a specific template type.

## Available Prompts

### `design-ui-template`
AI-assisted template design with requirements analysis.

**Parameters:**
- `requirements`: User requirements for the UI template
- `context`: Additional context about the use case
- `templateType`: Optional preferred template type

## Template Examples

### Dashboard Template
```json
{
  "templateType": "dashboard",
  "title": "Sales Dashboard",
  "description": "Real-time sales metrics and performance tracking",
  "layout": "grid",
  "metrics": [
    {
      "id": "total-sales",
      "label": "Total Sales",
      "value": "$124,530",
      "change": 12.5,
      "changeType": "increase",
      "icon": "DollarSign"
    }
  ],
  "charts": [
    {
      "id": "revenue-chart",
      "type": "line",
      "title": "Revenue Trend",
      "data": {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
        "datasets": [{
          "label": "Revenue",
          "data": [30000, 35000, 42000, 38000, 45000]
        }]
      }
    }
  ]
}
```

### Form Template
```json
{
  "templateType": "form",
  "title": "Contact Form",
  "description": "Get in touch with us",
  "sections": [
    {
      "id": "contact",
      "title": "Contact Information",
      "fields": [
        {
          "id": "name",
          "type": "text",
          "label": "Full Name",
          "required": true
        },
        {
          "id": "email",
          "type": "email",
          "label": "Email Address",
          "required": true
        },
        {
          "id": "message",
          "type": "textarea",
          "label": "Message",
          "required": true
        }
      ]
    }
  ]
}
```

## Integration with React/Next.js

The generated template configurations work seamlessly with your existing shadcn/ui components:

```tsx
import { DynamicTemplate } from "@/components/dynamic-template";

function MyPage() {
  const [templateConfig, setTemplateConfig] = useState(null);

  const generateTemplate = async () => {
    // Call MCP server to generate template
    const config = await mcpClient.callTool({
      name: "generate_ui_template",
      arguments: {
        templateType: "dashboard",
        title: "My Dashboard",
        useCase: "project management"
      }
    });
    
    setTemplateConfig(JSON.parse(config.content[0].text));
  };

  return (
    <div>
      {templateConfig && (
        <DynamicTemplate
          config={templateConfig}
          onInteraction={(data) => console.log("User interaction:", data)}
          onClose={() => setTemplateConfig(null)}
        />
      )}
    </div>
  );
}
```

## Customization

### Adding New Template Types

1. Define the schema in `src/schemas.ts`
2. Create a generator class in `src/templates/generators.ts`
3. Register the template in `src/templates/index.ts`
4. Update the main server in `src/index.ts`

### Extending Existing Templates

Templates can be customized by:
- Providing custom configuration in the `config` parameter
- Specifying use cases to get context-appropriate defaults
- Using the AI-assisted design prompt for complex requirements

## Development

```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Build for production
npm run build

# Clean build directory
npm run clean
```

## Architecture

The MCP server is built with:
- **TypeScript** for type safety
- **Zod** for schema validation
- **Model Context Protocol SDK** for MCP compliance
- **Modular Design** for easy extensibility

## Use Cases

### For AI Agents
- Generate appropriate UI templates based on user requests
- Provide structured data for frontend applications
- Create consistent user experiences across applications

### For Developers
- Rapid UI prototyping
- Template-based development
- Standardized component configurations

### For Businesses
- Quick dashboard creation
- Form generation for data collection
- Customer-facing interfaces

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your template or improvement
4. Write tests for new functionality
5. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation at `template://docs`
- Use the `design-ui-template` prompt for AI assistance
