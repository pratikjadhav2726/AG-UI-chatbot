#!/bin/bash

# Deployment script for Generative UI Chat on AWS ECS Fargate
set -e

echo "🚀 Deploying Generative UI Chat to AWS ECS Fargate..."

# Docker command wrapper (no sudo required)
DOCKER_CMD="../docker-wrapper.sh"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if Docker is running (using wrapper)
if ! $DOCKER_CMD info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get current AWS account and region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📋 Deployment Configuration:"
echo "   Account: $ACCOUNT"
echo "   Region: $REGION"
echo "   Environment: ${ENVIRONMENT:-dev}"
echo "   Docker: Using wrapper (no sudo required)"

# Set environment variables
export CDK_DEFAULT_ACCOUNT=$ACCOUNT
export CDK_DEFAULT_REGION=$REGION

# Clean install CDK dependencies
echo "📦 Installing CDK dependencies..."
rm -rf node_modules package-lock.json
npm install

# Check CDK version
echo "🔧 CDK Version:"
npx cdk --version

# Bootstrap CDK (if not already done)
echo "🔧 Bootstrapping CDK..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION > /dev/null 2>&1; then
    echo "   Bootstrapping CDK for the first time..."
    npx cdk bootstrap aws://$ACCOUNT/$REGION
else
    echo "   CDK already bootstrapped"
fi

# Build TypeScript
echo "🔨 Building CDK stack..."
npm run build

# Synthesize to check for errors
echo "🔍 Synthesizing CloudFormation template..."
npx cdk synth > /dev/null

# Deploy the stack
echo "🚀 Deploying CDK stack..."
if [ -n "$DOMAIN_NAME" ] && [ -n "$CERTIFICATE_ARN" ]; then
    echo "   Using custom domain: $DOMAIN_NAME"
    npx cdk deploy --all \
        --context domainName="$DOMAIN_NAME" \
        --context certificateArn="$CERTIFICATE_ARN" \
        --context environment="${ENVIRONMENT:-dev}" \
        --require-approval never \
        --verbose
else
    echo "   Using CloudFront default domain"
    npx cdk deploy --all \
        --context environment="${ENVIRONMENT:-dev}" \
        --require-approval never \
        --verbose
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Getting deployment outputs..."

# Get stack outputs
STACK_NAME="GenerativeUiChat-${ENVIRONMENT:-dev}"
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo "📊 Stack Outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
fi

echo ""
echo "📋 Next steps:"
echo "1. Wait for ECS service to be healthy (may take 5-10 minutes)"
echo "2. Check service status:"
echo "   aws ecs describe-services --cluster generative-ui-chat-${ENVIRONMENT:-dev} --services generative-ui-chat-${ENVIRONMENT:-dev}"
echo "3. Monitor application logs:"
echo "   aws logs tail /ecs/generative-ui-chat-${ENVIRONMENT:-dev} --follow"
echo "4. Test the application using the CloudFront URL from outputs above"
echo ""
echo "🔍 Troubleshooting:"
echo "   If deployment fails, check TROUBLESHOOTING.md for common issues and solutions"
