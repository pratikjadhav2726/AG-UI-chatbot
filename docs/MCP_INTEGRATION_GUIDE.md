# MCP-Powered Chatbot Integration Guide

## Overview

This project integrates a sophisticated chatbot with the Model Context Protocol (MCP) to generate dynamic UI templates using Large Language Models (LLMs). The integration follows best software engineering practices and uses the **official MCP TypeScript SDK** from https://github.com/modelcontextprotocol/typescript-sdk.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │    │  MCP Client     │    │  MCP Server     │
│                 │    │                 │    │                 │
│  - Chatbot UI   │◄──►│  - Connection   │◄──►│  - Template     │
│  - API Routes   │    │  - Tool Calls   │    │    Generation   │
│  - React Hooks  │    │  - Error        │    │  - Data         │
│                 │    │    Handling     │    │    Generation   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

1. **MCP Server (mcp-ui-server-v2)**: Generates dynamic UI templates with realistic data
2. **MCP Client Service**: Uses the official `@modelcontextprotocol/sdk` for connection and communication
3. **Chatbot API**: Integrates LLM with MCP tools for natural language interaction
4. **React Hooks**: Provides clean interface for UI components
5. **Management Scripts**: Handle MCP server lifecycle

### Official SDK Integration

This project leverages the **official MCP TypeScript SDK** for all MCP operations:

- **Client Creation**: `import { Client } from '@modelcontextprotocol/sdk/client/index.js'`
- **Transport Management**: Using `StdioClientTransport` and `StreamableHTTPClientTransport`
- **Type Safety**: Full TypeScript types from `@modelcontextprotocol/sdk/types.js`
- **Best Practices**: Following official SDK patterns and examples

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- One of the following AI provider API keys:
  - OpenAI API key
  - Google Generative AI API key
  - Anthropic API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:
   ```env
   # AI Provider Configuration
   MODEL_PROVIDER=openai  # or 'google', 'anthropic'
   MODEL_ID=gpt-4o       # or your preferred model

   # API Keys (set one based on your provider)
   OPENAI_API_KEY=your_openai_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
   ANTHROPIC_API_KEY=your_anthropic_key

   # MCP Configuration
   MCP_SERVER_NAME=dynamic-templates-mcp
   MCP_SERVER_VERSION=2.0.0
   LOG_LEVEL=info
   ```

3. **Build and start the application:**
   ```bash
   npm run build
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## MCP Server Management

The project includes comprehensive MCP server management scripts:

### Available Commands

```bash
# Start MCP server
npm run mcp:start

# Stop MCP server
npm run mcp:stop

# Restart MCP server
npm run mcp:restart

# Check server status
npm run mcp:status

# Build MCP server
npm run mcp:build

# Development mode (with hot reload)
npm run mcp:dev
```

### Manual Management

```bash
# Direct script usage
node scripts/start-mcp-server.js [command]

# Commands: start, stop, restart, status, help
node scripts/start-mcp-server.js status
```

## Usage Examples

### Basic Template Generation

**User Input:**
```
"Create a dashboard for sales metrics"
```

**System Response:**
The chatbot will:
1. Analyze the user input
2. Call the MCP `generateUITemplate` tool
3. Generate a complete dashboard with realistic sales data
4. Display the template in the chat interface

### Advanced Template Requests

**User Input:**
```
"Generate a complex analytics dashboard with revenue charts, user engagement metrics, and conversion funnels for an e-commerce platform"
```

**System Response:**
- Creates a sophisticated analytics dashboard
- Includes multiple chart types and KPIs
- Generates realistic e-commerce data
- Provides preview and export options

### Template Discovery

**User Input:**
```
"What types of templates can you create?"
```

**System Response:**
Lists all available template types with descriptions and use cases.

## API Reference

### MCP Client Service (Using Official SDK)

```typescript
import { getMCPClient, initializeMCPClient } from '@/lib/mcp-client';
// This uses the official @modelcontextprotocol/sdk under the hood

// Initialize client with official SDK
const client = await initializeMCPClient();

// Generate template using MCP tools
const result = await client.generateTemplate('dashboard', {
  title: 'Sales Dashboard',
  description: 'Monthly sales performance',
  requirements: {
    complexity: 'medium',
    features: ['charts', 'metrics', 'filters']
  }
});
```

### Direct SDK Usage

For advanced use cases, you can use the official SDK directly:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Create client with official SDK
const client = new Client(
  { name: 'my-client', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

// Create transport
const transport = new StdioClientTransport({
  command: 'node',
  args: ['mcp-ui-server-v2/dist/index.js']
});

// Connect and use
await client.connect(transport);
const tools = await client.listTools();
const result = await client.callTool({
  name: 'generate_ui_template',
  arguments: { templateType: 'dashboard' }
});
```

### React Hook Usage

```typescript
import { useMCP } from '@/hooks/use-mcp';

function MyComponent() {
  const { 
    isConnected, 
    isLoading, 
    error, 
    generateTemplate,
    getTemplateSuggestions 
  } = useMCP();

  const handleGenerate = async () => {
    const template = await generateTemplate('form', {
      title: 'Contact Form',
      description: 'Multi-step contact form'
    });
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {error && <div>Error: {error}</div>}
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate Template
      </button>
    </div>
  );
}
```

### API Endpoints

#### POST /api/mcp

Main MCP integration endpoint supporting multiple actions:

**Generate Template:**
```json
{
  "action": "generate",
  "templateType": "dashboard",
  "requirements": {
    "title": "Sales Dashboard",
    "description": "Monthly performance metrics"
  },
  "userInput": "Create a sales dashboard"
}
```

**Get Suggestions:**
```json
{
  "action": "getSuggestions",
  "userInput": "I need a form for user registration"
}
```

**Health Check:**
```json
{
  "action": "health"
}
```

#### POST /api/mcp-chat

Chatbot conversation endpoint:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a dashboard for analytics"
    }
  ]
}
```

## Available Template Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| `dashboard` | Business metrics and analytics | KPI tracking, performance monitoring |
| `form` | Multi-step forms with validation | Registration, surveys, contact forms |
| `table` | Sortable, filterable data tables | Data management, reporting |
| `analytics` | KPI dashboards with insights | Web analytics, marketing metrics |
| `productCatalog` | E-commerce product listings | Online stores, marketplaces |
| `calendar` | Event scheduling interfaces | Booking systems, event management |
| `map` | Interactive location displays | Store locators, delivery tracking |
| `profileCard` | User profile displays | Social platforms, team directories |
| `chart` | Data visualization charts | Reports, presentations |
| `timeline` | Event timeline displays | Project management, history |
| `kanban` | Task management boards | Agile workflows, project tracking |
| `gallery` | Image and media galleries | Portfolios, media libraries |

## Troubleshooting

### Common Issues

#### MCP Server Not Starting

**Symptoms:**
- "MCP server not found" error
- Connection failures in the UI

**Solutions:**
```bash
# Build the MCP server
npm run mcp:build

# Check server status
npm run mcp:status

# Restart server
npm run mcp:restart
```

#### Connection Issues

**Symptoms:**
- Red "Disconnected" status in UI
- API errors in console

**Solutions:**
1. Check if MCP server is running: `npm run mcp:status`
2. Review MCP server logs: `cat .mcp-server.log`
3. Restart the server: `npm run mcp:restart`

#### Template Generation Failures

**Symptoms:**
- "Template generation failed" errors
- Empty responses from chatbot

**Solutions:**
1. Verify AI provider API key is set correctly
2. Check API rate limits
3. Review console logs for detailed error messages
4. Test MCP server directly: `npm run mcp:status`

### Debug Mode

Enable debug logging:

```bash
# Set log level in .env.local
LOG_LEVEL=debug

# Restart services
npm run mcp:restart
npm run dev
```

### Log Files

- **MCP Server Logs:** `.mcp-server.log`
- **Next.js Logs:** Console output
- **Browser Logs:** Developer console

## Development

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── mcp/route.ts          # MCP API endpoint
│   │   └── mcp-chat/route.ts     # Chatbot API endpoint
│   └── page.tsx                  # Main application page
├── components/
│   ├── mcp-chatbot.tsx           # Main chatbot component
│   └── dynamic-template.tsx      # Template renderer
├── hooks/
│   └── use-mcp.ts                # React hook for MCP integration
├── lib/
│   └── mcp-client.ts             # MCP client service
├── scripts/
│   └── start-mcp-server.js       # Server management script
├── mcp-ui-server-v2/             # MCP server implementation
└── docs/
    └── MCP_INTEGRATION_GUIDE.md  # This file
```

### Adding New Template Types

1. **Update MCP Server:**
   ```typescript
   // In mcp-ui-server-v2/src/templates/generators/
   export class MyTemplateGenerator extends BaseGenerator {
     generate(requirements: any): TemplateConfig {
       // Implementation
     }
   }
   ```

2. **Register Template:**
   ```typescript
   // In mcp-ui-server-v2/src/tools/manager.ts
   this.generators.set('myTemplate', new MyTemplateGenerator());
   ```

3. **Update Type Definitions:**
   ```typescript
   // In hooks/use-mcp.ts
   type TemplateType = 'dashboard' | 'form' | 'myTemplate' | ...;
   ```

### Testing

```bash
# Test MCP server
cd mcp-ui-server-v2
npm test

# Test chatbot API
curl -X POST http://localhost:3000/api/mcp-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Create a dashboard"}]}'

# Test MCP API directly
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"action":"health"}'
```

## Performance Considerations

### Optimization Tips

1. **Template Caching:**
   ```typescript
   import { useTemplateGeneration } from '@/hooks/use-mcp';
   
   const { generateTemplate, clearTemplateCache } = useTemplateGeneration();
   ```

2. **Connection Pooling:**
   The MCP client maintains a persistent connection to reduce latency.

3. **Error Recovery:**
   Automatic retry logic handles temporary connection issues.

### Monitoring

- **MCP Connection Status:** Displayed in chatbot header
- **Health Checks:** Automatic every 30 seconds
- **Error Tracking:** Comprehensive error logging

## Security Considerations

### API Security

- All MCP communication uses local connections (stdio transport)
- API keys are stored in environment variables
- Input validation on all API endpoints

### Best Practices

1. **Environment Variables:** Never commit API keys to version control
2. **Input Sanitization:** All user inputs are validated before processing
3. **Error Handling:** Errors don't expose sensitive information
4. **Rate Limiting:** Consider implementing rate limiting for production

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes following the established patterns
4. Test thoroughly
5. Submit a pull request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Proper error handling
- Comprehensive logging
- Documentation for new features

## Support

### Getting Help

1. Check this documentation
2. Review the troubleshooting section
3. Check the GitHub issues
4. Create a new issue with detailed information

### Reporting Issues

Include the following information:
- Operating system and Node.js version
- Error messages and stack traces
- Steps to reproduce
- MCP server logs (`.mcp-server.log`)
- Environment configuration (without API keys)

## License

This project is licensed under the MIT License. See the LICENSE file for details.