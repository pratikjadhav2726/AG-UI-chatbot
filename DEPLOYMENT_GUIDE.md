# 🚀 AWS ECS Fargate Deployment Guide

This guide will help you deploy the Generative UI Chatbot to AWS using ECS Fargate, Application Load Balancer, and CloudFront.

## 🏗️ Architecture Overview

```
Internet → CloudFront → Private ALB → ECS Fargate (Private Subnets)
                                    ↓
                                 Bedrock API
```

### Components:
- **ECS Fargate**: Containerized Next.js app + MCP server
- **Application Load Balancer**: Private ALB for internal routing
- **CloudFront**: Global CDN with caching and SSL termination
- **VPC**: Custom VPC with public/private subnets
- **IAM Roles**: Secure access to Bedrock API
- **Auto Scaling**: CPU/Memory based scaling (2-10 tasks)

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS CLI configured with appropriate permissions
- AWS CDK v2 installed globally: `npm install -g aws-cdk`
- Docker installed and running

### 2. Required AWS Permissions
Your AWS user/role needs permissions for:
- ECS (Fargate, Services, Task Definitions)
- EC2 (VPC, Subnets, Security Groups, Load Balancers)
- CloudFront (Distributions)
- IAM (Roles, Policies)
- CloudFormation (Stacks)
- ECR (Container Registry)
- CloudWatch (Logs, Metrics)
- Bedrock (Model access)

### 3. Bedrock Model Access
Ensure you have access to Claude 4 Sonnet in your AWS region:
```bash
aws bedrock list-foundation-models --region us-east-1 \
  --query 'modelSummaries[?contains(modelId, `claude-4-sonnet`)]'
```

## 🚀 Deployment Steps

### Step 1: Clone and Prepare
```bash
git clone <your-repo-url>
cd Generative-UI-chat
```

### Step 2: Install Dependencies
```bash
# Install main app dependencies
npm install

# Install CDK dependencies
cd cdk
npm install
cd ..
```

### Step 3: Configure Environment
```bash
# Set your AWS region (optional, defaults to us-east-1)
export AWS_DEFAULT_REGION=us-east-1

# Set environment name (optional, defaults to dev)
export ENVIRONMENT=prod

# Optional: Custom domain configuration
export DOMAIN_NAME=your-domain.com
export CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

### Step 4: Deploy Infrastructure
```bash
cd cdk
./deploy.sh
```

The deployment will:
1. Bootstrap CDK in your account
2. Build the Docker image
3. Create ECR repository and push image
4. Deploy all AWS resources
5. Output the CloudFront URL

### Step 5: Verify Deployment
```bash
# Check ECS service status
aws ecs describe-services \
  --cluster generative-ui-chat-${ENVIRONMENT:-dev} \
  --services generative-ui-chat-${ENVIRONMENT:-dev}

# Check application logs
aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev} --follow
```

## 🔧 Configuration Options

### Environment Variables
The application uses these environment variables in ECS:
- `NODE_ENV=production`
- `AWS_REGION=<your-region>`
- `PORT=3000`

### Custom Domain (Optional)
To use a custom domain:
1. Create ACM certificate in `us-east-1` (for CloudFront)
2. Set environment variables:
   ```bash
   export DOMAIN_NAME=your-domain.com
   export CERTIFICATE_ARN=arn:aws:acm:us-east-1:...:certificate/...
   ```
3. Deploy with custom domain support

### Scaling Configuration
- **Min Capacity**: 2 tasks (high availability)
- **Max Capacity**: 10 tasks
- **CPU Scaling**: Target 70% utilization
- **Memory Scaling**: Target 80% utilization

## 📊 Monitoring & Observability

### CloudWatch Logs
```bash
# View application logs
aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev} --follow

# View specific log streams
aws logs describe-log-streams \
  --log-group-name /ecs/generative-ui-chat-${ENVIRONMENT:-dev}
```

### CloudWatch Metrics
Monitor these key metrics:
- ECS Service CPU/Memory utilization
- ALB target health and response times
- CloudFront cache hit ratio and error rates

### Health Checks
- **ECS Health Check**: `/api/health` endpoint
- **ALB Health Check**: HTTP 200 response required
- **Interval**: 30 seconds
- **Timeout**: 5 seconds

## 💰 Cost Optimization

### Current Configuration:
- **ECS Fargate**: 2x 1vCPU, 2GB RAM tasks (~$35/month)
- **NAT Gateway**: 1 gateway (~$45/month)
- **Application Load Balancer**: ~$20/month
- **CloudFront**: Pay-per-use (minimal for low traffic)
- **Total Estimated**: ~$100/month for production workload

### Cost Reduction Options:
1. **Development**: Use 1 task, smaller instance sizes
2. **NAT Gateway**: Use NAT instances for lower cost
3. **CloudFront**: Use Price Class 100 (current setting)

## 🔒 Security Features

### Network Security:
- Private subnets for ECS tasks
- Security groups with minimal required ports
- Private ALB (not internet-facing)

### Application Security:
- IAM roles with least privilege access
- Only Bedrock model-specific permissions
- Security headers in Next.js configuration

### Data Security:
- No credentials stored in container
- IAM roles for AWS service access
- CloudFront HTTPS enforcement

## 🛠️ Maintenance & Updates

### Application Updates:
```bash
# Update application code
git pull origin main

# Redeploy (will build new image and update ECS)
cd cdk && ./deploy.sh
```

### Infrastructure Updates:
```bash
# View changes before applying
cd cdk && npx cdk diff

# Apply infrastructure changes
cd cdk && npx cdk deploy --all
```

### Rollback:
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster generative-ui-chat-${ENVIRONMENT:-dev} \
  --service generative-ui-chat-${ENVIRONMENT:-dev} \
  --task-definition <previous-task-definition-arn>
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. ECS Tasks Failing to Start
```bash
# Check task definition and logs
aws ecs describe-tasks --cluster <cluster> --tasks <task-arn>
aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev}
```

#### 2. Health Check Failures
- Verify `/api/health` endpoint responds with 200
- Check security group allows ALB to reach tasks on port 3000
- Ensure tasks are running in private subnets with NAT gateway access

#### 3. Bedrock Access Issues
- Verify IAM role has `bedrock:InvokeModel` permission
- Check Claude 4 Sonnet model access in Bedrock console
- Ensure correct region configuration

#### 4. CloudFront Issues
- Check origin configuration points to ALB
- Verify ALB security group allows CloudFront access
- Clear CloudFront cache if needed: `aws cloudfront create-invalidation`

### Useful Commands:
```bash
# ECS service status
aws ecs describe-services --cluster <cluster> --services <service>

# Task details
aws ecs list-tasks --cluster <cluster> --service-name <service>
aws ecs describe-tasks --cluster <cluster> --tasks <task-arn>

# Application logs
aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev} --follow

# CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

## 🧹 Cleanup

To remove all resources:
```bash
cd cdk
npx cdk destroy --all
```

**Warning**: This will delete all resources including logs and data.

---

## 📞 Support

For issues with:
- **AWS Infrastructure**: Check CloudFormation events and stack outputs
- **Application**: Check ECS task logs and health check endpoint
- **Bedrock**: Verify model access and IAM permissions

Your Generative UI Chatbot is now running on enterprise-grade AWS infrastructure! 🎉
