#!/usr/bin/env node

/**
 * Test script to verify Amazon Bedrock integration
 * Run with: node test-bedrock.js
 */

import { generateText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBedrock() {
  console.log('🧪 Testing Amazon Bedrock integration...\n');

  // Check environment variables and determine credential method
  const hasAccessKeys = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  const hasProfile = process.env.AWS_PROFILE;
  const hasRegion = process.env.AWS_REGION;

  if (!hasRegion) {
    console.error('❌ Missing AWS_REGION environment variable');
    console.error('Please set AWS_REGION in your .env.local file');
    process.exit(1);
  }

  console.log('✅ AWS Region configured:', process.env.AWS_REGION);

  // Configure Bedrock credentials
  const bedrockConfig = hasAccessKeys 
    ? {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : {
        region: process.env.AWS_REGION,
        credentialProvider: fromNodeProviderChain(),
      };

  if (hasAccessKeys) {
    console.log('🔑 Using AWS Access Keys from environment variables');
  } else if (hasProfile) {
    console.log('👤 Using AWS Profile:', process.env.AWS_PROFILE);
  } else {
    console.log('🏷️  Using AWS Node Provider Chain (IAM Role, Instance Profile, etc.)');
    console.log('   This will automatically discover credentials from:');
    console.log('   - Environment variables');
    console.log('   - AWS credentials file');
    console.log('   - IAM roles for EC2 instances');
    console.log('   - IAM roles for Lambda functions');
    console.log('   - ECS task roles');
  }

  console.log();

  try {
    console.log('🤖 Testing Claude 4 Sonnet via Bedrock...');
    
    const result = await generateText({
      model: bedrock('anthropic.claude-4-sonnet-20250514-v1:0', bedrockConfig),
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with a brief confirmation that you are Claude 4 Sonnet running on Amazon Bedrock.'
        }
      ],
      maxTokens: 100,
    });

    console.log('✅ Success! Response from Claude 4 Sonnet:');
    console.log(`📝 ${result.text}\n`);
    
    console.log('📊 Usage stats:');
    console.log(`   - Prompt tokens: ${result.usage?.promptTokens || 'N/A'}`);
    console.log(`   - Completion tokens: ${result.usage?.completionTokens || 'N/A'}`);
    console.log(`   - Total tokens: ${result.usage?.totalTokens || 'N/A'}\n`);
    
    console.log('🎉 Bedrock integration is working correctly!');
    console.log('You can now start your application with: npm run dev');

  } catch (error) {
    console.error('❌ Error testing Bedrock integration:');
    console.error(error.message);
    
    if (error.message.includes('UnauthorizedOperation') || error.message.includes('AccessDenied')) {
      console.error('\n💡 This is an IAM permissions issue.');
      if (hasAccessKeys || hasProfile) {
        console.error('   Make sure your AWS user/role has bedrock:InvokeModel permissions.');
      } else {
        console.error('   Make sure your EC2 instance has an IAM role with bedrock:InvokeModel permissions.');
        console.error('   Check that the IAM role is properly attached to your EC2 instance.');
      }
    } else if (error.message.includes('ValidationException') || error.message.includes('model')) {
      console.error('\n💡 This might be a model access issue.');
      console.error('   Make sure you have requested access to Claude 4 Sonnet in the Bedrock console.');
      console.error('   Model ID: anthropic.claude-4-sonnet-20250514-v1:0');
    } else if (error.message.includes('region')) {
      console.error('\n💡 This might be a region issue.');
      console.error('   Try using us-east-1, us-west-2, or eu-west-3.');
    } else if (error.message.includes('credentials')) {
      console.error('\n💡 This is a credentials issue.');
      console.error('   The AWS Node Provider Chain could not find valid credentials.');
      console.error('   Make sure you have one of the following:');
      console.error('   - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
      console.error('   - AWS credentials file (~/.aws/credentials)');
      console.error('   - IAM role attached to EC2 instance');
      console.error('   - AWS_PROFILE environment variable pointing to a valid profile');
    }
    
    console.error('\n📖 See BEDROCK_MIGRATION.md for troubleshooting help.');
    process.exit(1);
  }
}

// Run the test
testBedrock().catch(console.error);
