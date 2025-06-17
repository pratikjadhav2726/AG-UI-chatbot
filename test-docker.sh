#!/bin/bash

# Test Docker build and run locally
set -e

echo "🐳 Testing Docker build for Generative UI Chat..."

# Use docker wrapper to avoid sudo
DOCKER_CMD="./docker-wrapper.sh"

# Build the Docker image
echo "📦 Building Docker image..."
$DOCKER_CMD build -t generative-ui-chat:test .

echo "✅ Docker image built successfully!"

# Test run the container
echo "🚀 Starting container for testing..."
$DOCKER_CMD run -d \
  --name generative-ui-chat-test \
  -p 3001:3000 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  generative-ui-chat:test

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    
    # Show health check response
    echo "📋 Health check response:"
    curl -s http://localhost:3001/api/health | jq '.' || curl -s http://localhost:3001/api/health
else
    echo "❌ Health check failed!"
    echo "📋 Container logs:"
    $DOCKER_CMD logs generative-ui-chat-test
fi

# Cleanup
echo "🧹 Cleaning up test container..."
$DOCKER_CMD stop generative-ui-chat-test > /dev/null 2>&1 || true
$DOCKER_CMD rm generative-ui-chat-test > /dev/null 2>&1 || true

echo "🎉 Docker test completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test locally: docker-compose up"
echo "2. Deploy to AWS: cd cdk && ./deploy.sh"
echo "3. Monitor: aws logs tail /ecs/generative-ui-chat-dev --follow"
