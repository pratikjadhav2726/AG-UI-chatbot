# CloudFront VPC Origin L2 CDK Upgrade

## Overview
This document outlines the upgrade from L1 CloudFormation constructs to L2 CDK constructs for CloudFront VPC Origins in the Generative UI Chat application.

## Changes Made

### 1. VPC Origin Configuration
**Before (L1 Construct):**
```typescript
const vpcOrigin = new cloudfront.CfnVpcOrigin(this, 'GenerativeUiChatVpcOrigin', {
  vpcOriginEndpointConfig: {
    name: `generative-ui-chat-vpc-origin-${props.environment}`,
    arn: fargateService.loadBalancer.loadBalancerArn,
    httpPort: 80,
    httpsPort: 443,
    originProtocolPolicy: 'http-only',
  },
});
```

**After (L2 Construct):**
```typescript
const vpcOrigin = origins.VpcOrigin.withApplicationLoadBalancer(fargateService.loadBalancer, {
  vpcOriginName: `generative-ui-chat-vpc-origin-${props.environment}`,
  httpPort: 80,
  httpsPort: 443,
  protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
  connectionAttempts: 3,
  connectionTimeout: cdk.Duration.seconds(10),
  readTimeout: cdk.Duration.seconds(30),
  keepaliveTimeout: cdk.Duration.seconds(5),
  originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
  customHeaders: {
    'X-Forwarded-Proto': 'https',
    'X-CloudFront-Origin': 'vpc-origin'
  }
});
```

### 2. CloudFront Distribution Configuration
**Before (L1 Construct):**
```typescript
const distribution = new cloudfront.CfnDistribution(this, 'GenerativeUiChatDistribution', {
  distributionConfig: {
    // Complex nested configuration object
  }
});
```

**After (L2 Construct):**
```typescript
const distribution = new cloudfront.Distribution(this, 'GenerativeUiChatDistribution', {
  comment: `Generative UI Chat CloudFront Distribution - ${props.environment}`,
  priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
  defaultBehavior: {
    origin: vpcOrigin,
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    // ... simplified configuration
  },
  additionalBehaviors: {
    '/api/*': { /* API-specific behavior */ },
    '/_next/static/*': { /* Static assets behavior */ },
    // ... more behaviors
  }
});
```

### 3. Custom Cache Policies
Added custom cache policies for better performance control:

```typescript
// API Cache Policy - No caching but with compression
const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
  cachePolicyName: `generative-ui-chat-api-${props.environment}`,
  defaultTtl: cdk.Duration.seconds(0),
  maxTtl: cdk.Duration.seconds(1),
  minTtl: cdk.Duration.seconds(0),
  enableAcceptEncodingBrotli: true,
  enableAcceptEncodingGzip: true,
  headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
    'Authorization', 'Content-Type', 'Accept', // ... more headers
  ),
  queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
  cookieBehavior: cloudfront.CacheCookieBehavior.all(),
});

// Static Assets Cache Policy - Long TTL for static content
const staticCachePolicy = new cloudfront.CachePolicy(this, 'StaticCachePolicy', {
  cachePolicyName: `generative-ui-chat-static-${props.environment}`,
  defaultTtl: cdk.Duration.days(30),
  maxTtl: cdk.Duration.days(365),
  // ... optimized for static content
});
```

### 4. Enhanced Security Configuration
- **Private ALB**: Changed from public to private load balancer
- **Security Headers**: Added comprehensive security headers
- **CORS Support**: Enhanced CORS configuration for API routes
- **SSL/TLS**: Upgraded to TLS 1.2 minimum with SNI support

### 5. Route 53 Integration
Added automatic Route 53 record creation for custom domains:

```typescript
if (props.domainName) {
  const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    domainName: props.domainName,
  });

  new route53.ARecord(this, 'CloudFrontAliasRecord', {
    zone: hostedZone,
    recordName: props.domainName,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
  });
}
```

## Benefits of L2 Constructs

### 1. **Developer Experience**
- Type safety with TypeScript
- IntelliSense support
- Simplified configuration syntax
- Built-in validation

### 2. **Best Practices**
- Automatic security configurations
- Optimized default settings
- Consistent resource naming
- Proper dependency management

### 3. **Maintainability**
- Cleaner, more readable code
- Easier to modify and extend
- Better error messages
- Reduced boilerplate

### 4. **Performance Optimizations**
- Custom cache policies for different content types
- Optimized compression settings
- Better header handling
- Improved caching strategies

## Cache Behavior Strategy

| Path Pattern | Cache Policy | TTL | Purpose |
|-------------|-------------|-----|---------|
| Default (`/*`) | CachingDisabled | 0s | Dynamic content |
| `/api/*` | Custom API Policy | 0-1s | API responses with compression |
| `/_next/static/*` | Custom Static Policy | 30d-365d | Static assets |
| `/_next/image*` | Custom Static Policy | 30d-365d | Next.js images |
| `/favicon.ico` | Custom Static Policy | 30d-365d | Favicon |

## Security Enhancements

### Headers Configuration
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS Headers**: Proper CORS configuration for API routes
- **Custom Headers**: CloudFront origin identification

### SSL/TLS Configuration
- **Minimum Protocol**: TLS 1.2
- **SSL Method**: SNI (Server Name Indication)
- **Certificate Support**: ACM certificate integration

## Deployment Commands

```bash
# Build the CDK project
npm run build

# Synthesize CloudFormation template
npx cdk synth

# Deploy with custom domain
npx cdk deploy --context domainName=example.com --context certificateArn=arn:aws:acm:...

# Deploy to specific environment
npx cdk deploy --context environment=staging
```

## Monitoring and Debugging

### New Outputs Added
- `VpcId`: VPC identifier for networking troubleshooting
- `LogGroupName`: CloudWatch log group for application logs
- `TaskRoleArn`: ECS task role for permission debugging

### Health Check
The application includes a comprehensive health check endpoint at `/api/health` that returns:
- Application status
- Uptime information
- Environment details
- AWS region information

## Cost Implications

### Potential Savings
- **Private ALB**: Reduced data transfer costs
- **Optimized Caching**: Better cache hit ratios
- **Compression**: Reduced bandwidth usage

### Additional Costs
- **Custom Cache Policies**: Minimal additional cost
- **CloudFront Logging**: Optional logging costs

## Migration Notes

### Breaking Changes
- ALB changed from public to private (requires VPC Origin)
- CloudFormation resource names may change
- Some outputs have different property names

### Compatibility
- Existing health checks continue to work
- API endpoints remain unchanged
- Static asset serving improved

## Next Steps

1. **Test Deployment**: Deploy to development environment first
2. **Performance Testing**: Validate cache behavior and performance
3. **Security Review**: Verify security headers and CORS configuration
4. **Monitoring Setup**: Configure CloudWatch alarms and dashboards
5. **Documentation**: Update operational runbooks

## Troubleshooting

### Common Issues
1. **VPC Origin Connection**: Ensure ALB security groups allow CloudFront access
2. **Cache Behavior**: Verify cache policies are applied correctly
3. **Custom Domain**: Confirm Route 53 and ACM certificate configuration

### Debug Commands
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id <distribution-id>

# View ECS service status
aws ecs describe-services --cluster <cluster-name> --services <service-name>

# Check application logs
aws logs tail /ecs/generative-ui-chat-dev --follow
```

---

This upgrade provides a more robust, secure, and maintainable CloudFront configuration using modern CDK L2 constructs while maintaining backward compatibility with the existing application architecture.
