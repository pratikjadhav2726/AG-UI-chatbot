# EC2 Deployment Guide

This guide covers deploying the Generative UI Chatbot on an EC2 instance using IAM roles for secure AWS Bedrock access.

## 🏗️ EC2 Setup with IAM Role

### Step 1: Create IAM Role for Bedrock Access

1. **Go to IAM Console** → Roles → Create Role
2. **Select "AWS Service"** → Choose "EC2"
3. **Create Custom Policy** with the following permissions:

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

4. **Name the role** (e.g., `EC2-Bedrock-Access-Role`)
5. **Note the role ARN** for later use

### Step 2: Launch EC2 Instance

1. **Launch EC2 Instance** (Ubuntu 22.04 LTS recommended)
2. **Instance Type**: t3.medium or larger (for Node.js performance)
3. **Security Group**: Allow HTTP (80), HTTPS (443), and SSH (22)
4. **IAM Role**: Attach the role created in Step 1
5. **User Data Script** (optional, for automated setup):

```bash
#!/bin/bash
# Update system
apt-get update -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Git
apt-get install -y git

# Create app directory
mkdir -p /opt/generative-ui-chat
chown ubuntu:ubuntu /opt/generative-ui-chat
```

### Step 3: Deploy Application

SSH into your EC2 instance and run:

```bash
# Clone the repository
cd /opt/generative-ui-chat
git clone <your-repo-url> .

# Install dependencies
npm install

# Build MCP server
cd mcp-ui-server
npm install
npm run build
cd ..

# Set up environment (only AWS_REGION needed)
echo "AWS_REGION=us-east-1" > .env.local

# Test Bedrock connection
npm run test-bedrock
```

### Step 4: Production Deployment

```bash
# Build the Next.js application
npm run build

# Start MCP server with PM2
pm2 start mcp-ui-server/dist/index.js --name "mcp-server"

# Start Next.js application with PM2
pm2 start npm --name "nextjs-app" -- start

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
```

## 🔧 Environment Configuration for EC2

### Minimal .env.local for EC2 with IAM Role

```bash
# Only region is required when using IAM roles
AWS_REGION=us-east-1

# Optional: Set NODE_ENV for production
NODE_ENV=production

# Optional: Custom port (default is 3000)
PORT=3000
```

### No Credentials Needed!

When using IAM roles on EC2:
- ❌ No `AWS_ACCESS_KEY_ID` needed
- ❌ No `AWS_SECRET_ACCESS_KEY` needed  
- ❌ No `AWS_PROFILE` needed
- ✅ Only `AWS_REGION` required

The AWS SDK automatically discovers and uses the IAM role attached to the EC2 instance.

## 🔍 Verification Steps

### 1. Test IAM Role Access

```bash
# Check if instance can assume the role
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Should return your role name
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/EC2-Bedrock-Access-Role
```

### 2. Test Bedrock Access

```bash
# Run the test script
npm run test-bedrock

# Should show: "Using IAM Role (EC2 Instance Profile or similar)"
```

### 3. Test Application

```bash
# Check if services are running
pm2 status

# Check logs
pm2 logs

# Test the application
curl http://localhost:3000
```

## 🌐 Load Balancer & Domain Setup

### Application Load Balancer

1. **Create ALB** in EC2 Console
2. **Target Group**: Point to your EC2 instance on port 3000
3. **Health Check**: Path `/` with 200 response code
4. **Security Groups**: Allow HTTP/HTTPS traffic

### Domain Configuration

```bash
# Install Nginx for reverse proxy (optional)
sudo apt-get install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/generative-ui-chat
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Best Practices

### IAM Role Permissions

- ✅ **Principle of Least Privilege**: Only grant Bedrock access
- ✅ **Resource-Specific**: Limit to specific Claude model ARN
- ✅ **No Wildcard Permissions**: Avoid `*` in resource ARNs

### EC2 Security

- ✅ **Security Groups**: Restrict inbound traffic
- ✅ **VPC**: Deploy in private subnet with NAT gateway
- ✅ **Updates**: Keep system and packages updated
- ✅ **Monitoring**: Enable CloudWatch monitoring

### Application Security

- ✅ **Environment Variables**: Never commit credentials
- ✅ **HTTPS**: Use SSL/TLS in production
- ✅ **Rate Limiting**: Implement API rate limiting
- ✅ **Input Validation**: Validate all user inputs

## 📊 Monitoring & Logging

### CloudWatch Integration

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Application Logs

```bash
# PM2 logs
pm2 logs --lines 100

# System logs
sudo journalctl -u nginx -f
```

### Bedrock Usage Monitoring

- Monitor costs in AWS Cost Explorer
- Set up billing alerts
- Track token usage in CloudWatch

## 🚀 Auto Scaling (Optional)

For high-traffic deployments:

1. **Create Launch Template** with your configured AMI
2. **Auto Scaling Group** with min/max instances
3. **Target Tracking Policy** based on CPU or request count
4. **Application Load Balancer** for traffic distribution

## 🔄 Updates & Maintenance

### Automated Deployments

```bash
# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
git pull origin main
npm install
npm run build
cd mcp-ui-server && npm install && npm run build && cd ..
pm2 restart all
EOF

chmod +x deploy.sh
```

### Health Checks

```bash
# Add to crontab for health monitoring
*/5 * * * * curl -f http://localhost:3000/api/health || pm2 restart all
```

---

## 🎉 Summary

With IAM roles on EC2:
- **Secure**: No hardcoded credentials
- **Simple**: Only region configuration needed
- **Scalable**: Works with auto-scaling groups
- **Cost-effective**: Same Bedrock pricing
- **Enterprise-ready**: Follows AWS best practices

Your application will automatically authenticate with Bedrock using the EC2 instance's IAM role! 🚀
