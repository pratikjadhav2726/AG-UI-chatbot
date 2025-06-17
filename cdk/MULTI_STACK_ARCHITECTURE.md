# Multi-Stack Architecture: Application + CloudFront

## Overview
The Generative UI Chat infrastructure has been refactored into two separate CDK stacks for better separation of concerns, easier management, and independent deployment capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront Stack                             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │  CloudFront │────│  VPC Origin  │────│  Cache Policies │    │
│  │ Distribution│    │   (L2 CDK)   │    │   (Custom)      │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│           │                                                     │
│           │ (Cross-stack reference)                             │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────┼─────────────────────────────────────────────────────┐
│           ▼          Application Stack                          │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ Private ALB │────│ ECS Fargate  │────│  Amazon Bedrock │    │
│  │ (us-east-1) │    │(Private Subnet)│   │ (Claude 4 Sonnet)│   │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│           │                                                     │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │     VPC     │    │ CloudWatch   │    │   IAM Roles     │    │
│  │  (Custom)   │    │    Logs      │    │  (Bedrock)      │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Stack Breakdown

### 1. Application Stack (`GenerativeUiChat-dev`)
**Purpose**: Core application infrastructure
**Resources**:
- **VPC**: Custom VPC with public/private subnets
- **ECS Cluster**: Fargate cluster with container insights
- **ECS Service**: Auto-scaling service (2-10 tasks)
- **Private ALB**: Application Load Balancer in private subnets
- **IAM Roles**: Task and execution roles with Bedrock permissions
- **CloudWatch Logs**: Centralized logging
- **Security Groups**: Minimal required access

**Exports**:
- `LoadBalancerArn`: For CloudFront VPC Origin
- `LoadBalancerDNS`: For cross-stack reference
- `VpcId`, `ECSClusterName`, `ECSServiceName`: For monitoring
- `LogGroupName`, `TaskRoleArn`: For debugging

### 2. CloudFront Stack (`GenerativeUiChat-CloudFront-dev`)
**Purpose**: Global CDN and edge optimization
**Resources**:
- **CloudFront Distribution**: Global CDN with custom behaviors
- **VPC Origin**: L2 construct connecting to private ALB
- **Custom Cache Policies**: Optimized for different content types
- **Route 53 Records**: Custom domain support (optional)
- **SSL/TLS Configuration**: Security and performance

**Dependencies**:
- Imports ALB from Application Stack
- Requires Application Stack to be deployed first

## Benefits of Multi-Stack Architecture

### 1. **Separation of Concerns**
- **Application Stack**: Focus on compute, storage, and business logic
- **CloudFront Stack**: Focus on CDN, caching, and global distribution
- Clear boundaries between infrastructure components

### 2. **Independent Deployment**
- Deploy application changes without affecting CloudFront
- Update CloudFront configuration without touching ECS
- Faster iteration cycles for specific components

### 3. **Better Resource Management**
- Easier to manage permissions per stack
- Cleaner resource organization
- Simplified troubleshooting and monitoring

### 4. **Cost Optimization**
- Deploy only what you need for testing
- Different update frequencies for different components
- Better cost tracking per component

### 5. **Risk Mitigation**
- Smaller blast radius for changes
- Easier rollback of specific components
- Reduced chance of accidental resource deletion

## Deployment Strategy

### Sequential Deployment
```bash
# 1. Deploy Application Stack first
npx cdk deploy GenerativeUiChat-dev

# 2. Deploy CloudFront Stack (depends on Application Stack)
npx cdk deploy GenerativeUiChat-CloudFront-dev

# Or deploy both at once (CDK handles dependencies)
npx cdk deploy --all
```

### Development Workflow
```bash
# For application changes (code, ECS configuration)
npx cdk deploy GenerativeUiChat-dev

# For CDN changes (caching, behaviors, domains)
npx cdk deploy GenerativeUiChat-CloudFront-dev

# For full deployment
./deploy.sh
```

## Cross-Stack Communication

### Exports and Imports
The Application Stack exports values that the CloudFront Stack imports:

```typescript
// Application Stack exports
new cdk.CfnOutput(this, 'LoadBalancerArn', {
  value: this.loadBalancer.loadBalancerArn,
  exportName: `GenerativeUiChat-${props.environment}-LoadBalancerArn`,
});

// CloudFront Stack imports
const loadBalancer = elbv2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(
  this,
  'ImportedLoadBalancer',
  {
    loadBalancerArn: props.loadBalancerArn, // Passed from app.ts
    loadBalancerDnsName: props.loadBalancerDnsName,
  }
);
```

### Direct References
Since both stacks are in the same CDK app, we can pass direct references:

```typescript
// In app.ts
const appStack = new GenerativeUiChatStack(/* ... */);
const cloudFrontStack = new CloudFrontStack(/* ... */, {
  loadBalancerArn: appStack.loadBalancer.loadBalancerArn,
  loadBalancerDnsName: appStack.loadBalancer.loadBalancerDnsName,
});
```

## Configuration Management

### Environment-Specific Deployment
```bash
# Development
ENVIRONMENT=dev ./deploy.sh

# Staging
ENVIRONMENT=staging ./deploy.sh

# Production
ENVIRONMENT=prod DOMAIN_NAME=example.com CERTIFICATE_ARN=arn:aws:acm:... ./deploy.sh
```

### Stack Naming Convention
- Application: `GenerativeUiChat-{environment}`
- CloudFront: `GenerativeUiChat-CloudFront-{environment}`

## Monitoring and Debugging

### Stack-Specific Monitoring
```bash
# Application Stack resources
aws cloudformation describe-stacks --stack-name GenerativeUiChat-dev
aws ecs describe-services --cluster generative-ui-chat-dev --services generative-ui-chat-dev

# CloudFront Stack resources
aws cloudformation describe-stacks --stack-name GenerativeUiChat-CloudFront-dev
aws cloudfront list-distributions
```

### Logs and Metrics
- **Application Logs**: CloudWatch Logs in Application Stack
- **CloudFront Logs**: S3 bucket created by CloudFront Stack
- **Metrics**: CloudWatch metrics for both stacks

## Troubleshooting

### Common Issues

#### 1. Cross-Stack Reference Errors
**Problem**: CloudFront stack can't find Application Stack exports
**Solution**: Ensure Application Stack is deployed first and exports are correct

#### 2. VPC Origin Connection Issues
**Problem**: CloudFront can't reach private ALB
**Solution**: Check security groups and VPC Origin configuration

#### 3. Cache Policy Conflicts
**Problem**: Accept-Encoding header conflicts with compression
**Solution**: Fixed in current implementation - don't whitelist Accept-Encoding when enabling compression

### Debug Commands
```bash
# Check stack dependencies
npx cdk ls

# View stack outputs
aws cloudformation describe-stacks --stack-name GenerativeUiChat-dev --query 'Stacks[0].Outputs'

# Check cross-stack references
aws cloudformation list-exports

# Validate CloudFront distribution
aws cloudfront get-distribution --id <distribution-id>
```

## Migration from Single Stack

### What Changed
1. **CloudFront resources** moved to separate stack
2. **Cross-stack references** added for ALB
3. **Deploy script** updated for sequential deployment
4. **Outputs** reorganized with export names

### Migration Steps
1. Delete existing single stack (if needed)
2. Deploy new multi-stack architecture
3. Update any external references to stack outputs
4. Update monitoring and alerting configurations

## Best Practices

### 1. **Stack Dependencies**
- Always deploy Application Stack before CloudFront Stack
- Use explicit dependencies in CDK app
- Handle circular dependencies carefully

### 2. **Resource Naming**
- Use consistent naming conventions
- Include environment in all resource names
- Use export names for cross-stack references

### 3. **Security**
- Keep ALB private in Application Stack
- Use VPC Origins for secure communication
- Apply least privilege IAM policies per stack

### 4. **Monitoring**
- Set up stack-specific alarms
- Monitor cross-stack dependencies
- Use CloudWatch dashboards per stack

## Cost Implications

### Potential Savings
- Deploy only needed components for testing
- Independent scaling of CloudFront vs application
- Better resource utilization tracking

### Additional Considerations
- No additional AWS costs for multiple stacks
- Same resources, better organization
- Improved cost allocation and tracking

---

This multi-stack architecture provides better maintainability, clearer separation of concerns, and more flexible deployment options while maintaining all the functionality of the original single-stack design.
