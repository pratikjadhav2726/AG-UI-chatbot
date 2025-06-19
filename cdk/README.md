# 🏗️ CDK Infrastructure for Generative UI Chat

This CDK application deploys the Generative UI Chatbot to AWS using modern, scalable infrastructure.

## 📋 Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│  CloudFront │────│ Private ALB  │────│  ECS Fargate    │
│   (Global)  │    │ (us-east-1)  │    │ (Private Subnet)│
└─────────────┘    └──────────────┘    └─────────────────┘
                                                │
                                       ┌─────────────────┐
                                       │  Amazon Bedrock │
                                       │ (Claude 4 Sonnet)│
                                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
```bash
npm install -g aws-cdk
aws configure
docker --version
```

### Deploy
```bash
# Install dependencies
npm install

# Deploy to AWS
./deploy.sh
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
export AWS_DEFAULT_REGION=us-east-1

# Optional
export ENVIRONMENT=prod
export DOMAIN_NAME=your-domain.com
export CERTIFICATE_ARN=arn:aws:acm:us-east-1:...:certificate/...
```

### CDK Context
```bash
# Deploy with custom domain
npx cdk deploy --context domainName=example.com --context certificateArn=arn:aws:acm:...

# Deploy to specific environment
npx cdk deploy --context environment=staging
```

## 📦 Resources Created

### Networking
- **VPC**: Custom VPC with public/private subnets across 2 AZs
- **NAT Gateway**: Single NAT gateway for cost optimization
- **Security Groups**: Minimal required access

### Compute
- **ECS Cluster**: Fargate cluster with container insights
- **ECS Service**: Auto-scaling service (2-10 tasks)
- **Task Definition**: 1 vCPU, 2GB RAM per task

### Load Balancing
- **Application Load Balancer**: Private ALB in public subnets
- **Target Group**: Health checks on `/api/health`
- **Listener**: HTTP listener on port 80

### CDN & DNS
- **CloudFront Distribution**: Global CDN with custom behaviors
- **Route 53** (optional): Custom domain support
- **ACM Certificate** (optional): SSL/TLS termination

### Security
- **IAM Roles**: Task and execution roles with minimal permissions
- **Bedrock Access**: Specific model access only

### Monitoring
- **CloudWatch Logs**: Centralized logging
- **CloudWatch Metrics**: Auto-scaling metrics
- **Health Checks**: Application and infrastructure health

## 🎛️ CDK Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes
npm run watch

# Run tests
npm test

# Synthesize CloudFormation
npx cdk synth

# Compare deployed stack with current state
npx cdk diff

# Deploy all stacks
npx cdk deploy --all

# Destroy all stacks
npx cdk destroy --all
```

## 🔍 Useful AWS Commands

### ECS Management
```bash
# List clusters
aws ecs list-clusters

# Describe service
aws ecs describe-services \
  --cluster generative-ui-chat-dev \
  --services generative-ui-chat-dev

# List tasks
aws ecs list-tasks \
  --cluster generative-ui-chat-dev \
  --service-name generative-ui-chat-dev

# View logs
aws logs tail /ecs/generative-ui-chat-dev --follow
```

### CloudFront Management
```bash
# List distributions
aws cloudfront list-distributions

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"
```

### Load Balancer Management
```bash
# List load balancers
aws elbv2 describe-load-balancers

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...
```

## 🏷️ Resource Tagging

All resources are tagged with:
- `Project: GenerativeUiChat`
- `Environment: dev/staging/prod`
- `ManagedBy: CDK`

## 💰 Cost Estimation

### Monthly Costs (us-east-1):
- **ECS Fargate**: 2 tasks × 1 vCPU × 2GB RAM ≈ $35
- **Application Load Balancer**: ≈ $20
- **NAT Gateway**: ≈ $45
- **CloudFront**: Pay-per-use (minimal for low traffic)
- **CloudWatch Logs**: ≈ $5
- **Total**: ≈ $105/month

### Cost Optimization:
- Use single NAT Gateway (current)
- CloudFront Price Class 100 (current)
- 1-week log retention (current)
- Consider Spot instances for development

## 🔒 Security Best Practices

### Network Security
- Private subnets for ECS tasks
- Security groups with minimal required ports
- Private ALB (not internet-facing)

### IAM Security
- Least privilege access
- Service-specific roles
- No hardcoded credentials

### Application Security
- HTTPS enforcement via CloudFront
- Security headers in Next.js
- Health check endpoints

## 🚨 Troubleshooting

### Common Issues

#### ECS Tasks Not Starting
1. Check CloudWatch logs: `/ecs/generative-ui-chat-{env}`
2. Verify IAM permissions for Bedrock
3. Check Docker image build

#### Health Check Failures
1. Verify `/api/health` endpoint
2. Check security group rules
3. Ensure tasks can reach internet via NAT

#### CloudFront Issues
1. Check origin configuration
2. Verify ALB security group allows CloudFront
3. Clear cache with invalidation

### Debug Commands
```bash
# ECS task logs
aws logs tail /ecs/generative-ui-chat-dev --follow

# Task definition details
aws ecs describe-task-definition --task-definition generative-ui-chat-dev

# Service events
aws ecs describe-services \
  --cluster generative-ui-chat-dev \
  --services generative-ui-chat-dev \
  --query 'services[0].events'
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy CDK
        run: |
          cd cdk
          npm install
          npx cdk deploy --all --require-approval never
```

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [ECS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

---

Your infrastructure is now ready for production deployment! 🚀
