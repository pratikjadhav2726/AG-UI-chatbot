#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GenerativeUiChatStack } from '../lib/generative-ui-chat-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';

const app = new cdk.App();

// Get configuration from context or environment
const config = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  domainName: app.node.tryGetContext('domainName'), // Optional: your custom domain
  certificateArn: app.node.tryGetContext('certificateArn'), // Optional: ACM certificate ARN
  environment: app.node.tryGetContext('environment') || 'dev',
};

// Deploy the application stack first (ECS, ALB, VPC)
const appStack = new GenerativeUiChatStack(app, `GenerativeUiChat-${config.environment}`, {
  env: config.env,
  domainName: config.domainName,
  certificateArn: config.certificateArn,
  environment: config.environment,
  description: 'Generative UI Chatbot with Claude 4 Sonnet on ECS Fargate',
});

// Deploy the CloudFront stack (depends on the application stack)
const cloudFrontStack = new CloudFrontStack(app, `GenerativeUiChat-CloudFront-${config.environment}`, {
  env: config.env,
  domainName: config.domainName,
  certificateArn: config.certificateArn,
  environment: config.environment,
  description: 'CloudFront Distribution with VPC Origin for Generative UI Chat',
  // Cross-stack references
  loadBalancerArn: appStack.loadBalancer.loadBalancerArn,
  loadBalancerDnsName: appStack.loadBalancer.loadBalancerDnsName,
  loadBalancerSecurityGroupId: appStack.fargateService.loadBalancer.connections.securityGroups[0].securityGroupId,
  vpcOrigin: appStack.vpcOrigin,
});

// Ensure CloudFront stack depends on the application stack
cloudFrontStack.addDependency(appStack);

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'GenerativeUiChat');
cdk.Tags.of(app).add('Environment', config.environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');
