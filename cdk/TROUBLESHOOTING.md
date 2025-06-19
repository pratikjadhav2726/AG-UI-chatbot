# 🔧 CDK Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Feature Flag Errors

#### Error:
```
Error: Unsupported feature flag '@aws-cdk/aws-ecs-patterns:removeDefaultDesiredCount'
```

#### Solution:
This is a CDK v1 feature flag that's been removed in CDK v2. The issue has been fixed by:
- Removing deprecated feature flags from `cdk.json`
- Explicitly setting `desiredCount: 2` in the ECS service configuration
- Updating to CDK v2.150.0

### 2. Docker Build Issues

#### Error:
```
Error: Failed to build Docker image
```

#### Solutions:
1. **Check Docker is running:**
   ```bash
   docker --version
   docker info
   ```

2. **Build locally first:**
   ```bash
   cd /workshop/Generative-UI-chat
   docker build -t generative-ui-chat:test .
   ```

3. **Check Dockerfile path:**
   - Ensure Dockerfile is in the root directory
   - Verify the CDK asset path is correct: `fromAsset('..', { file: 'Dockerfile' })`

### 3. AWS Permissions Issues

#### Error:
```
AccessDenied: User is not authorized to perform: ecs:CreateService
```

#### Solution:
Ensure your AWS user/role has these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:*",
        "ec2:*",
        "elasticloadbalancing:*",
        "cloudformation:*",
        "iam:*",
        "logs:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "ecr:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. CDK Bootstrap Issues

#### Error:
```
Error: This stack uses assets, so the toolkit stack must be deployed to the environment
```

#### Solution:
Bootstrap CDK in your account:
```bash
npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 5. ECR Repository Issues

#### Error:
```
Error: Repository does not exist
```

#### Solution:
CDK will automatically create ECR repositories. If you see this error:
1. Check AWS region is correct
2. Ensure you have ECR permissions
3. Try manual ECR creation:
   ```bash
   aws ecr create-repository --repository-name generative-ui-chat-dev
   ```

### 6. VPC/Subnet Issues

#### Error:
```
Error: Cannot find VPC with ID 'vpc-xxxxx'
```

#### Solution:
The CDK creates its own VPC. If you see this error:
1. Don't specify existing VPC IDs
2. Let CDK create new VPC resources
3. Check region consistency

### 7. Domain/Certificate Issues

#### Error:
```
Error: Certificate not found
```

#### Solution:
For custom domains:
1. **Create ACM certificate in us-east-1** (required for CloudFront)
2. **Validate the certificate** (DNS or email validation)
3. **Use correct ARN format:**
   ```bash
   export CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
   ```

### 8. CloudFront Distribution Issues

#### Error:
```
Error: Origin domain name is not valid
```

#### Solution:
1. Ensure ALB is created before CloudFront
2. Check ALB DNS name format
3. Verify ALB is in correct region

### 9. Memory/CPU Issues

#### Error:
```
Error: Task stopped with exit code 137 (out of memory)
```

#### Solution:
Adjust ECS task resources:
```typescript
cpu: 2048, // 2 vCPU
memoryLimitMiB: 4096, // 4 GB RAM
```

### 10. Health Check Failures

#### Error:
```
Service tasks keep failing health checks
```

#### Solution:
1. **Check health endpoint:**
   ```bash
   curl http://ALB-DNS-NAME/api/health
   ```

2. **Verify container logs:**
   ```bash
   aws logs tail /ecs/generative-ui-chat-dev --follow
   ```

3. **Check security groups:**
   - ALB security group allows inbound HTTP (80)
   - ECS security group allows inbound from ALB

## Debugging Commands

### CDK Debugging
```bash
# Synthesize CloudFormation template
npx cdk synth

# Show differences
npx cdk diff

# List stacks
npx cdk list

# Show stack outputs
aws cloudformation describe-stacks --stack-name GenerativeUiChat-dev
```

### ECS Debugging
```bash
# List clusters
aws ecs list-clusters

# Describe service
aws ecs describe-services --cluster generative-ui-chat-dev --services generative-ui-chat-dev

# List tasks
aws ecs list-tasks --cluster generative-ui-chat-dev

# Describe task
aws ecs describe-tasks --cluster generative-ui-chat-dev --tasks TASK-ARN

# View logs
aws logs tail /ecs/generative-ui-chat-dev --follow
```

### Load Balancer Debugging
```bash
# List load balancers
aws elbv2 describe-load-balancers

# Check target health
aws elbv2 describe-target-health --target-group-arn TARGET-GROUP-ARN

# Test ALB directly
curl -v http://ALB-DNS-NAME/api/health
```

### CloudFront Debugging
```bash
# List distributions
aws cloudfront list-distributions

# Get distribution config
aws cloudfront get-distribution --id DISTRIBUTION-ID

# Create invalidation
aws cloudfront create-invalidation --distribution-id DISTRIBUTION-ID --paths "/*"
```

## Step-by-Step Deployment Verification

### 1. Pre-deployment Checks
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Docker
docker --version

# Check CDK
npx cdk --version

# Check Node.js
node --version
```

### 2. Build Verification
```bash
# Test local build
cd /workshop/Generative-UI-chat
npm run build

# Test Docker build
docker build -t test .
```

### 3. CDK Deployment Steps
```bash
cd cdk

# Install dependencies
npm install

# Build TypeScript
npm run build

# Synthesize (dry run)
npx cdk synth

# Deploy
npx cdk deploy --all --require-approval never
```

### 4. Post-deployment Verification
```bash
# Check stack status
aws cloudformation describe-stacks --stack-name GenerativeUiChat-dev

# Check ECS service
aws ecs describe-services --cluster generative-ui-chat-dev --services generative-ui-chat-dev

# Check logs
aws logs tail /ecs/generative-ui-chat-dev --follow

# Test health endpoint
curl https://CLOUDFRONT-DOMAIN/api/health
```

## Clean Deployment Script

If you encounter persistent issues, try this clean deployment:

```bash
#!/bin/bash
set -e

echo "🧹 Clean CDK deployment..."

# Clean up any existing resources (optional)
# npx cdk destroy --all --force

# Fresh install
cd cdk
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Bootstrap (if needed)
npx cdk bootstrap

# Deploy
npx cdk deploy --all --require-approval never

echo "✅ Clean deployment completed!"
```

## Getting Help

If you're still experiencing issues:

1. **Check AWS Service Health:** https://status.aws.amazon.com/
2. **CDK GitHub Issues:** https://github.com/aws/aws-cdk/issues
3. **AWS Forums:** https://forums.aws.amazon.com/
4. **Stack Overflow:** Tag with `aws-cdk` and `amazon-ecs`

## Common Environment Variables

Make sure these are set correctly:
```bash
export AWS_DEFAULT_REGION=us-east-1
export AWS_PROFILE=your-profile  # if using profiles
export ENVIRONMENT=dev
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=$AWS_DEFAULT_REGION
```

Your deployment should now work smoothly! 🚀
