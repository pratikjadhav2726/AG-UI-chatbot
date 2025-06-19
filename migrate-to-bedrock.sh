#!/bin/bash

echo "🚀 Migrating from Anthropic to Amazon Bedrock..."

# Remove the old Anthropic dependency
echo "📦 Removing @ai-sdk/anthropic..."
npm uninstall @ai-sdk/anthropic

# Install the new Bedrock dependencies
echo "📦 Installing @ai-sdk/amazon-bedrock and AWS credential providers..."
npm install @ai-sdk/amazon-bedrock@^1.0.2 @aws-sdk/credential-providers@^3.0.0

echo "✅ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your AWS credentials:"
echo ""
echo "   Option A - For local development with access keys:"
echo "   AWS_ACCESS_KEY_ID=your_aws_access_key_id"
echo "   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key"
echo "   AWS_REGION=us-east-1"
echo ""
echo "   Option B - For EC2 with IAM role (recommended):"
echo "   AWS_REGION=us-east-1"
echo "   (No access keys needed - uses fromNodeProviderChain())"
echo ""
echo "2. Make sure you have access to Claude 4 Sonnet in AWS Bedrock"
echo "3. Test the connection: npm run test-bedrock"
echo "4. Restart your development server"
echo ""
echo "🔗 For more info on AWS Bedrock setup:"
echo "   https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html"
