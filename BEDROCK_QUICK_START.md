# Amazon Bedrock Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. AWS Setup
```bash
# Option A: Set environment variables (will be used directly)
export AWS_ACCESS_KEY_ID="your_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_REGION="us-east-1"

# Option B: Use AWS CLI profile (uses credential provider chain)
aws configure --profile bedrock-dev
export AWS_PROFILE="bedrock-dev"
export AWS_REGION="us-east-1"

# Option C: Use IAM role (EC2/Lambda/ECS - uses credential provider chain)
export AWS_REGION="us-east-1"
# No credentials needed - automatic discovery
```

### 2. Enable Claude in Bedrock
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access"
3. Request access to "Anthropic Claude 4 Sonnet"
4. Wait for approval (usually instant)

### 3. Install Dependencies
```bash
./migrate-to-bedrock.sh
# OR manually:
npm uninstall @ai-sdk/anthropic
npm install @ai-sdk/amazon-bedrock@^1.0.2
```

### 4. Configure Environment
```bash
# Copy example and edit
cp .env.example .env.local

# Option A: For explicit credentials (used directly)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Option B: For credential provider chain (EC2, profiles, etc.)
AWS_REGION=us-east-1
# No access keys needed - automatic credential discovery
```

### 5. Test Connection
```bash
npm run test-bedrock
```

### 6. Start Application
```bash
# Terminal 1: Start MCP Server
cd mcp-ui-server && npm run build && npm start

# Terminal 2: Start Next.js App
npm run dev
```

## 🔧 Key Changes Made

| File | Change |
|------|--------|
| `package.json` | `@ai-sdk/anthropic` → `@ai-sdk/amazon-bedrock` |
| `app/api/mcp-chat/route.ts` | `anthropic()` → `bedrock()` |
| Model ID | `claude-3-5-sonnet-20241022` → `anthropic.claude-4-sonnet-20250514-v1:0` |

## 🌍 Supported Regions

- `us-east-1` (N. Virginia) ✅ Recommended
- `us-west-2` (Oregon) ✅ 
- `eu-west-3` (Paris) ✅

## 🔑 Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-4-sonnet-20250514-v1:0"
    }
  ]
}
```

## 🆘 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "Model not found" | Request Claude 4 Sonnet access in Bedrock console |
| "UnauthorizedOperation" | Check IAM permissions |
| "Region not supported" | Use us-east-1, us-west-2, or eu-west-3 |
| "Credentials not found" | Set AWS_ACCESS_KEY_ID/SECRET or use IAM role |
| "EC2 IAM role issues" | Ensure role attached and has Bedrock permissions |

## 💰 Cost Comparison

| Provider | Input (per 1K tokens) | Output (per 1K tokens) |
|----------|----------------------|------------------------|
| Anthropic Direct | $3.00 | $15.00 |
| Bedrock | $3.00 | $15.00 |

*Same pricing, but with AWS billing integration*

---

**Ready to go!** 🎉 Your app now uses Amazon Bedrock with enterprise-grade security and AWS integration.
