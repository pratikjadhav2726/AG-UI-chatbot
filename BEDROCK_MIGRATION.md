# Migration Guide: Anthropic to Amazon Bedrock

This guide will help you migrate the Generative UI Chatbot from using the direct Anthropic API to Amazon Bedrock.

## Why Migrate to Bedrock?

- **Enterprise Integration**: Better integration with AWS services
- **Cost Management**: Centralized billing and cost controls
- **Security**: Enhanced security with AWS IAM and VPC
- **Compliance**: AWS compliance certifications
- **Scalability**: Built-in scaling and availability

## Prerequisites

Before starting the migration, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS Bedrock Access** in your region
3. **Claude 3.5 Sonnet Model Access** enabled in Bedrock
4. **AWS Credentials** configured

## Step 1: Enable Bedrock and Model Access

1. **Log into AWS Console** and navigate to Amazon Bedrock
2. **Select your region** (us-east-1, us-west-2, or eu-west-3 recommended)
3. **Request Model Access**:
   - Go to "Model access" in the Bedrock console
   - Find "Anthropic" and request access to "Claude 4 Sonnet"
   - Wait for approval (usually instant for most accounts)

## Step 2: Configure AWS Credentials

The application supports multiple credential methods with automatic fallback:

### Option A: Environment Variables (Explicit Credentials)

When both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are provided, they will be used directly:

```bash
# AWS Configuration for Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
```

### Option B: AWS Profile

If you have AWS CLI configured with profiles:

```bash
# AWS Configuration using Profile
AWS_PROFILE=your_aws_profile_name
AWS_REGION=us-east-1
```

### Option C: AWS Node Provider Chain (Automatic Discovery)

When `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are **not** provided, the application automatically uses AWS's credential provider chain:

```bash
# Only region is required - credential provider chain handles authentication
AWS_REGION=us-east-1

# No access keys needed - fromNodeProviderChain() will automatically discover:
# 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# 2. AWS credentials file (~/.aws/credentials)
# 3. IAM roles for EC2 instances
# 4. IAM roles for Lambda functions
# 5. ECS task roles
# 6. And more...
```

**Credential Priority:**
1. ✅ **Explicit env vars** (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`) - Used directly
2. ✅ **Provider chain** - Used when explicit credentials are not available

See [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md) for detailed EC2 setup instructions.

## Step 3: Run the Migration Script

Execute the migration script to update dependencies:

```bash
./migrate-to-bedrock.sh
```

Or manually run:

```bash
# Remove old dependency
npm uninstall @ai-sdk/anthropic

# Install new dependency
npm install @ai-sdk/amazon-bedrock@^1.0.2
```

## Step 4: Verify the Migration

The following files have been updated:

- ✅ `package.json` - Updated dependencies
- ✅ `app/api/mcp-chat/route.ts` - Changed from `anthropic` to `bedrock`
- ✅ `components/mcp-chatbot.tsx` - Updated UI labels
- ✅ `README.md` - Updated documentation
- ✅ `.env.example` - New environment variables

## Step 5: Test the Application

1. **Start the MCP Server**:
   ```bash
   cd mcp-ui-server
   npm run build
   npm start
   ```

2. **Start the Next.js Application** (in a new terminal):
   ```bash
   npm run dev
   ```

3. **Test the Chat Interface**:
   - Navigate to `http://localhost:3000`
   - Try generating a template: "Create a dashboard for sales metrics"
   - Verify the response comes from Bedrock

## Troubleshooting

### Common Issues

1. **"Model not found" Error**
   - Ensure you've requested access to Claude 4 Sonnet in Bedrock
   - Check that your region supports the model
   - Verify the model ID: `anthropic.claude-4-sonnet-20250514-v1:0`

2. **AWS Credentials Error**
   - Verify your AWS credentials are correct
   - Check IAM permissions for Bedrock access
   - Ensure your region is set correctly

3. **Region Not Supported**
   - Claude 3.5 Sonnet is available in limited regions
   - Try: `us-east-1`, `us-west-2`, or `eu-west-3`

4. **Rate Limiting**
   - Bedrock has different rate limits than direct Anthropic API
   - Check your service quotas in AWS console

5. **EC2 IAM Role Issues** (when using EC2)
   - Ensure IAM role is attached to your EC2 instance
   - Verify the role has `bedrock:InvokeModel` permissions
   - Check that only `AWS_REGION` is set (no access keys needed)

### Required IAM Permissions

Your AWS user/role needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-4-sonnet-20250514-v1:0"
            ]
        }
    ]
}
```

## Cost Considerations

- **Bedrock Pricing**: Pay per token, similar to Anthropic direct
- **AWS Data Transfer**: Minimal for API calls
- **Monitoring**: Use AWS CloudWatch for usage tracking

## Benefits After Migration

1. **Unified AWS Billing**: All costs in one place
2. **Enhanced Security**: AWS IAM integration
3. **Better Monitoring**: CloudWatch metrics and logs
4. **Compliance**: AWS compliance certifications
5. **Enterprise Features**: VPC endpoints, private networking

## Rollback Plan

If you need to rollback to Anthropic:

1. Reinstall the Anthropic package:
   ```bash
   npm install @ai-sdk/anthropic
   ```

2. Revert the import in `app/api/mcp-chat/route.ts`:
   ```typescript
   import { anthropic } from '@ai-sdk/anthropic'
   ```

3. Update the model call:
   ```typescript
   model: anthropic('claude-3-5-sonnet-20241022')
   ```

4. Add your Anthropic API key to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## Support

For additional help:

- **AWS Bedrock Documentation**: https://docs.aws.amazon.com/bedrock/
- **AI SDK Bedrock Provider**: https://ai-sdk.dev/providers/ai-sdk-providers/amazon-bedrock
- **AWS Support**: Create a support case in AWS Console

---

**Migration Complete!** 🎉

Your Generative UI Chatbot now uses Amazon Bedrock for enhanced enterprise capabilities while maintaining the same powerful Claude 3.5 Sonnet model.
