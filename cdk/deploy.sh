#!/bin/bash

# Deployment script for Generative UI Chat on AWS ECS Fargate
set -e

echo "🚀 Deploying Generative UI Chat to AWS ECS Fargate..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Get current AWS account and region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📋 Deployment Configuration:"
echo "   Account: $ACCOUNT"
echo "   Region: $REGION"
echo "   Environment: ${ENVIRONMENT:-dev}"

# Set environment variables
export CDK_DEFAULT_ACCOUNT=$ACCOUNT
export CDK_DEFAULT_REGION=$REGION

# Install CDK dependencies
echo "📦 Installing CDK dependencies..."
npm install

# Bootstrap CDK (if not already done)
echo "🔧 Bootstrapping CDK..."
npx cdk bootstrap aws://$ACCOUNT/$REGION

# Build TypeScript
echo "🔨 Building CDK stack..."
npm run build

# Deploy the stack
echo "🚀 Deploying CDK stack..."
if [ -n "$DOMAIN_NAME" ] && [ -n "$CERTIFICATE_ARN" ]; then
    echo "   Using custom domain: $DOMAIN_NAME"
    npx cdk deploy --all \
        --context domainName="$DOMAIN_NAME" \
        --context certificateArn="$CERTIFICATE_ARN" \
        --context environment="${ENVIRONMENT:-dev}" \
        --require-approval never
else
    echo "   Using CloudFront default domain"
    npx cdk deploy --all \
        --context environment="${ENVIRONMENT:-dev}" \
        --require-approval never
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check the CloudFormation outputs for URLs"
echo "2. Wait for the ECS service to be healthy (may take 5-10 minutes)"
echo "3. Test the application using the CloudFront URL"
echo ""
echo "🔍 Useful commands:"
echo "   aws ecs describe-services --cluster generative-ui-chat-${ENVIRONMENT:-dev} --services generative-ui-chat-${ENVIRONMENT:-dev}"
echo "   aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev} --follow"
