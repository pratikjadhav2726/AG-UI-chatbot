# Generative UI Chatbot with MCP Server

A comprehensive chatbot application that generates dynamic UI templates using Model Context Protocol (MCP) and Anthropic's Claude Sonnet model. The system features a sophisticated MCP server that can generate over 20 different types of UI templates with realistic data and configurations.

![image](https://github.com/user-attachments/assets/c17ec7aa-f345-442c-a4e1-2f9e8d439f8f)

![image](https://github.com/user-attachments/assets/48bd560a-efc1-4b3e-89c1-509ded0516b3)
![image](https://github.com/user-attachments/assets/3ed12e86-ebe1-4bd3-b0ec-f3cfcb2d6df2)
![image](https://github.com/user-attachments/assets/c6195744-3041-4e73-83d1-a9b8fbf1771c)

## 🚀 Features

### MCP Server Capabilities
- **20+ Template Types**: Dashboard, DataTable, ProductCatalog, Form, Analytics, Calendar, Kanban, Gallery, Pricing, Stats, Timeline, Feed, Map, Chart, Wizard, ProfileCard, Blog, Portfolio, Marketplace, and Ecommerce
- **Rich Data Generation**: Contextual, realistic data for each template type
- **Theme Support**: Light, dark, and system themes with custom color options
- **JSON-RPC Protocol**: Standard MCP implementation for tool calling
- **Type Safety**: Comprehensive Zod schemas for all template configurations

### Chatbot Interface
- **Natural Language Processing**: Powered by Anthropic's Claude Sonnet 3.5
- **Interactive UI**: Real-time template generation and preview
- **Template Suggestions**: Smart recommendations based on user context
- **Conversation History**: Persistent chat history with template results
- **Template Interactions**: Click interactions feed back into conversation
- **Rich UI**: Modern interface built with shadcn/ui components

### Template Components
- **Dynamic Rendering**: Automatic component selection based on template type
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Functional components with realistic interactions
- **Loading States**: Smooth loading animations and error handling
- **Accessibility**: WCAG compliant components throughout

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Anthropic API key to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. **Build and Start MCP Server**
   ```bash
   cd mcp-ui-server
   npm run build
   npm start
   ```

4. **Start Next.js Development Server**
   ```bash
   # In a new terminal
   npm run dev
   ```

5. **Open Application**
   - Navigate to http://localhost:3001 (or 3000 if available)
   - Start chatting with the AI to generate UI templates!

## 🎯 Usage Examples

### Basic Template Generation
```
"Create a dashboard for a fitness app"
"Generate a product catalog for an online bookstore"
"Build a form for user registration"
```

### Advanced Requests
```
"Create a dark-themed analytics dashboard for a SaaS company with revenue charts and user metrics"
"Generate a marketplace interface for handmade crafts with filtering and categories"
"Build a kanban board for project management with different priority levels"
```

### Template Customization
```
"Make the dashboard full-screen with a blue color scheme"
"Create a mobile-friendly pricing page for a subscription service"
"Generate a gallery with a grid layout for a photography portfolio"
```

## 📋 Available Template Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| **dashboard** | Analytics dashboard with widgets | Business metrics, KPI monitoring |
| **dataTable** | Sortable data table with filters | User management, inventory |
| **productCatalog** | Product grid with search/filter | E-commerce, marketplace |
| **form** | Dynamic form with validation | Registration, surveys, feedback |
| **analytics** | Charts and data visualization | Reports, analytics dashboards |
| **calendar** | Interactive calendar component | Events, scheduling, bookings |
| **kanban** | Task board with drag-and-drop | Project management, workflows |
| **gallery** | Image/media gallery with lightbox | Portfolio, media showcase |
| **pricing** | Pricing tables and plans | SaaS pricing, service packages |
| **stats** | Key metrics and statistics | Performance metrics, summaries |
| **timeline** | Chronological event timeline | Project history, news feed |
| **feed** | Social media style feed | Activity streams, updates |
| **map** | Interactive map with markers | Location services, directories |
| **chart** | Various chart types | Data visualization, reports |
| **wizard** | Multi-step form wizard | Onboarding, complex forms |
| **profileCard** | User profile display | Team pages, directories |
| **blog** | Blog layout with articles | Content management, news |
| **portfolio** | Portfolio showcase | Creative work, case studies |
| **marketplace** | Marketplace interface | Buying/selling platforms |
| **ecommerce** | E-commerce product pages | Online stores, catalogs |

## 🚦 Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Ensure you're in the `mcp-ui-server` directory
   - Run `npm run build` before `npm start`
   - Check for TypeScript compilation errors

2. **Anthropic API Errors**
   - Verify your API key in `.env.local`
   - Check API key permissions and credits
   - Ensure network connectivity

3. **Template Not Rendering**
   - Check if template component exists in `components/templates/`
   - Verify template type is registered in `dynamic-template.tsx`
   - Look for console errors in browser developer tools

## 🤝 How It Works

The system consists of two main components:

1. **MCP Server** (`mcp-ui-server/`): A TypeScript server that implements the Model Context Protocol to generate UI template configurations with realistic data
2. **Next.js Chatbot** (`/`): A React application with Anthropic Claude integration that provides a conversational interface for template generation

The chatbot uses Claude Sonnet to understand user requests and translate them into MCP tool calls, which generate rich UI templates that are then rendered as React components.

## 📝 License

This project is for educational and development purposes.

