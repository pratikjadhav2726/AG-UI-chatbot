# Generative UI Chatbot: Bedrock, Google, OpenAI, Groq Support

A comprehensive chatbot application that generates dynamic UI templates using Model Context Protocol (MCP). You can run this project locally with Google Gemini, OpenAI, or Groq models, or deploy it with Amazon Bedrock for enterprise-grade infrastructure.

---

## 🚀 Features

- **Multi-Provider Model Support:**
  - **Local:** Use Google Gemini, OpenAI (GPT-4o, GPT-4, GPT-3.5), or Groq (Llama 3, Mixtral, etc.) by setting the `MODEL_PROVIDER` environment variable.
  - **Production/Cloud:** Deploy with Amazon Bedrock (Claude 4 Sonnet, etc.) for secure, scalable, enterprise workloads.
- **20+ UI Template Types:** Dashboards, forms, tables, analytics, e-commerce, and more
- **Rich Data Generation:** Contextual, realistic data for each template type
- **Modern UI:** Built with Next.js, Tailwind CSS, and shadcn/ui
- **MCP Server:** Type-safe, extensible, and easy to customize

---

## 🏗️ Architecture

### Local Development

- **Run locally with Google, OpenAI, or Groq models**
- No AWS credentials required for local use (unless using Bedrock)
- Switch providers by setting `MODEL_PROVIDER=google`, `MODEL_PROVIDER=openai`, or `MODEL_PROVIDER=groq` in your `.env.local`

### Production (AWS Bedrock)

- **Enterprise deployment** with ECS Fargate, CloudFront, VPC, and Bedrock
- Secure, scalable, and cost-optimized

---

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd Generative-UI-chat
npm install
```

### 2. Configure Environment

#### Local (Google, OpenAI, Groq)
- Copy `.env.example` to `.env.local`
- Set `MODEL_PROVIDER` to `google`, `openai`, or `groq`
- Set the corresponding model ID and API key variables (see below)

#### Bedrock (AWS)
- Set `MODEL_PROVIDER=bedrock` and configure AWS credentials as before

### 3. Start Development
```bash
npm run dev
```

---

## 🌐 Deployment Options

- **Local:** Google Gemini, OpenAI, or Groq (no AWS required)
- **AWS:** Bedrock (Claude, Titan, etc.) with full enterprise stack

---

## 🔑 Environment Variables

| Provider | Required Variables |
|----------|-------------------|
| Google   | `GOOGLE_API_KEY`, `GOOGLE_MODEL_ID` |
| OpenAI   | `OPENAI_API_KEY`, `OPENAI_MODEL_ID` |
| Groq     | `GROQ_API_KEY`, `GROQ_MODEL_ID`     |
| Bedrock  | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_MODEL_ID` |

---

## 📖 For full usage, deployment, and troubleshooting, see the rest of this README below.

---

# Generative UI Chatbot with Amazon Bedrock

A comprehensive chatbot application that generates dynamic UI templates using Model Context Protocol (MCP) and Claude 4 Sonnet via Amazon Bedrock. The system features a sophisticated MCP server that can generate over 20 different types of UI templates with realistic data and configurations.

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
- **Natural Language Processing**: Powered by Claude 4 Sonnet via Amazon Bedrock
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

## 🏗️ Architecture

### Production (AWS):
```
Internet → CloudFront CDN → Private ALB → ECS Fargate → Amazon Bedrock
    ↓           ↓              ↓            ↓              ↓
  Global      HTTPS         Load         Docker      Claude 4 Sonnet
  Cache     Termination    Balancer     Container        API
```

### Local Development:
```
Next.js App (localhost:3000) ←→ MCP Server (stdio)
                ↓
        Amazon Bedrock (Claude 4 Sonnet)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm/pnpm
- **AWS Account** with Bedrock access
- **Claude 4 Sonnet** model enabled in AWS Bedrock
- **Docker** (for containerized deployment)
- **AWS CLI** configured with appropriate permissions

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Generative-UI-chat
   npm install
   ```

2. **Configure AWS Credentials**
   
   **Option 1: Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your AWS credentials
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```
   
   **Option 2: AWS Credential Provider Chain (Recommended)**
   ```bash
   # Configure AWS CLI
   aws configure
   
   # Or use IAM roles (EC2, ECS, Lambda)
   # Or use AWS profiles
   export AWS_PROFILE=your-profile
   ```

3. **Start Development**
   ```bash
   # Terminal 1: Start MCP server
   cd mcp-ui-server
   npm run build
   npm start
   
   # Terminal 2: Start Next.js app
   npm run dev
   ```

4. **Open Application**
   - Navigate to http://localhost:3000
   - Start chatting to generate UI templates!

### Docker Development

```bash
# Test Docker build (no sudo required)
./test-docker.sh

# Run with Docker Compose
docker-compose up

# Verify deployment readiness
./verify-deployment-ready.sh
```

## 🌐 Production Deployment

### AWS ECS Fargate (Recommended)

Deploy to AWS with enterprise-grade infrastructure:

```bash
# Deploy to AWS
cd cdk
./deploy.sh

# Monitor deployment
aws logs tail /ecs/generative-ui-chat-dev --follow
```

**Infrastructure Includes:**
- **ECS Fargate** with auto-scaling (2-10 tasks)
- **Private Application Load Balancer**
- **CloudFront CDN** with global distribution
- **VPC** with public/private subnets
- **IAM roles** with least-privilege access
- **CloudWatch** logging and monitoring

**Estimated Cost:** ~$110/month for production workload

### Custom Domain Deployment

```bash
# Set custom domain variables
export DOMAIN_NAME=your-domain.com
export CERTIFICATE_ARN=arn:aws:acm:us-east-1:...:certificate/...
export ENVIRONMENT=prod

# Deploy with custom domain
cd cdk && ./deploy.sh
```

### Environment-Specific Deployment

```bash
# Deploy to staging
export ENVIRONMENT=staging
cd cdk && ./deploy.sh

# Deploy to production
export ENVIRONMENT=prod
cd cdk && ./deploy.sh
```

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

## 🔧 Development Tools

### Useful Scripts

```bash
# Test Bedrock connection
npm run test-bedrock

# Test Docker build (no sudo required)
./test-docker.sh

# Verify deployment readiness
./verify-deployment-ready.sh

# Deploy to AWS
cd cdk && ./deploy.sh

# Monitor AWS logs
aws logs tail /ecs/generative-ui-chat-dev --follow
```

### Docker Commands (No Sudo Required)

```bash
# Build image
./docker-wrapper.sh build -t generative-ui-chat .

# Run container
./docker-wrapper.sh run -d -p 3000:3000 generative-ui-chat

# Check containers
./docker-wrapper.sh ps

# View logs
./docker-wrapper.sh logs container-name
```

## 🔒 Security Features

### Network Security
- **Private subnets** for ECS tasks
- **Security groups** with minimal required ports
- **Private ALB** (not internet-facing)
- **VPC isolation** with controlled egress

### Application Security
- **HTTPS enforcement** via CloudFront
- **Security headers** in Next.js configuration
- **Non-root container** execution
- **Health check endpoints** for monitoring

### AWS Security
- **IAM least privilege** access to Bedrock
- **Service-specific roles** for ECS tasks
- **No hardcoded credentials** in containers
- **Resource-specific permissions** (Claude 4 Sonnet only)

## 📈 Scalability & Performance

### Auto-scaling Configuration
- **Min Capacity**: 2 tasks (high availability)
- **Max Capacity**: 10 tasks (handle traffic spikes)
- **CPU Scaling**: Target 70% utilization
- **Memory Scaling**: Target 80% utilization

### Performance Optimizations
- **Multi-stage Docker build** for optimized images
- **CloudFront caching** for static assets
- **Container efficiency** with Node.js 18 Alpine
- **Health check tuning** for fast recovery

## 🚦 Troubleshooting

### Common Issues

1. **Bedrock API Errors**
   - Verify AWS credentials: `aws sts get-caller-identity`
   - Check Claude 4 Sonnet access in AWS Bedrock console
   - Ensure correct AWS region (us-east-1, us-west-2, etc.)
   - Verify IAM permissions for Bedrock

2. **Docker Issues**
   - Use `./docker-wrapper.sh` instead of `sudo docker`
   - Check Docker daemon: `./docker-wrapper.sh info`
   - Test build: `./test-docker.sh`

3. **CDK Deployment Issues**
   - Check AWS credentials and permissions
   - Verify CDK bootstrap: `npx cdk bootstrap`
   - Review troubleshooting: `cdk/TROUBLESHOOTING.md`

4. **MCP Server Not Starting**
   - Build first: `cd mcp-ui-server && npm run build`
   - Check TypeScript compilation errors
   - Verify Node.js version (18+)

5. **Template Not Rendering**
   - Check template component exists in `components/templates/`
   - Verify template type registration in `dynamic-template.tsx`
   - Look for console errors in browser developer tools

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check AWS deployment health
curl https://your-cloudfront-domain/api/health

# Monitor ECS service
aws ecs describe-services --cluster generative-ui-chat-dev --services generative-ui-chat-dev
```

## 🔍 Monitoring & Observability

### CloudWatch Integration
- **Application Logs**: `/ecs/generative-ui-chat-{env}`
- **ECS Metrics**: CPU, Memory, Task count
- **ALB Metrics**: Request count, Response time, Error rate
- **CloudFront Metrics**: Cache hit ratio, Origin latency

### Monitoring Commands
```bash
# Monitor application logs
aws logs tail /ecs/generative-ui-chat-dev --follow

# Check ECS service status
aws ecs describe-services --cluster generative-ui-chat-dev --services generative-ui-chat-dev

# View CloudFormation stack
aws cloudformation describe-stacks --stack-name GenerativeUiChat-dev
```

## 🛠️ Maintenance & Updates

### Application Updates
```bash
# Update code and redeploy
git pull origin main
cd cdk && ./deploy.sh  # Rebuilds Docker image and updates ECS
```

### Infrastructure Updates
```bash
# Preview changes
cd cdk && npx cdk diff

# Apply infrastructure changes
cd cdk && npx cdk deploy --all
```

### Scaling Adjustments
Edit `cdk/lib/generative-ui-chat-stack.ts`:
```typescript
// Adjust auto-scaling parameters
scalableTarget.scaleOnCpuUtilization('CpuScaling', {
  targetUtilizationPercent: 60, // Lower for more responsive scaling
});
```

## 💰 Cost Optimization

### Monthly Cost Breakdown (Production)
| Component | Cost | Description |
|-----------|------|-------------|
| **ECS Fargate** | ~$35 | 2 tasks × 1vCPU × 2GB RAM |
| **Application Load Balancer** | ~$20 | Private ALB with health checks |
| **NAT Gateway** | ~$45 | Single NAT for cost optimization |
| **CloudFront** | ~$5 | Pay-per-use (low traffic estimate) |
| **CloudWatch Logs** | ~$5 | 1-week retention |
| **Amazon Bedrock** | Variable | Pay-per-token usage |
| **Total Infrastructure** | **~$110/month** | Base infrastructure cost |

### Cost Optimization Tips
- Use single NAT Gateway (already configured)
- Implement CloudFront caching
- Set appropriate log retention periods
- Monitor and adjust auto-scaling thresholds

## 🤝 How It Works

The system consists of two main components:

1. **MCP Server** (`mcp-ui-server/`): A TypeScript server implementing Model Context Protocol to generate UI template configurations with realistic data

2. **Next.js Chatbot** (`/`): A React application with Amazon Bedrock integration providing conversational interface for template generation

The chatbot uses Claude 4 Sonnet via Amazon Bedrock to understand user requests and translate them into MCP tool calls, generating rich UI templates rendered as React components.

## 🎯 Key Benefits

### 🔒 Enterprise Security
- Private network architecture
- IAM-based access control
- No credential exposure
- AWS security best practices

### 📈 Scalable Architecture
- Auto-scaling based on demand
- Multi-AZ high availability
- Global content delivery
- Container-based deployment

### 💰 Cost Optimized
- Single NAT Gateway
- Efficient container sizing
- CloudFront caching
- Pay-per-use Bedrock pricing

### 🚀 Developer Friendly
- One-command deployment
- Infrastructure as code
- No sudo required for Docker
- Comprehensive documentation

## 📝 License

This project is for educational and development purposes.

---

## 🎉 Ready for Production!

Your Generative UI Chatbot is now equipped with:

✅ **Enterprise-grade AWS infrastructure**  
✅ **Production-ready containerization**  
✅ **Automated deployment process**  
✅ **Comprehensive documentation**  
✅ **Security best practices**  
✅ **Cost-optimized architecture**  
✅ **Auto-scaling capabilities**  
✅ **Monitoring and observability**  

**Deploy now:** `cd cdk && ./deploy.sh` 🚀

