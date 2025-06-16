#!/usr/bin/env node

/**
 * Test script to verify application structure and configuration
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Testing Application Structure...\n');

// Test 1: Check if key files exist
const keyFiles = [
  'app/api/mcp-chat/route.ts',
  'components/mcp-chatbot.tsx',
  'components/dynamic-template.tsx',
  'mcp-ui-server/dist/index.js',
  '.env.local',
  'package.json'
];

console.log('📁 Checking key files:');
keyFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@ai-sdk/amazon-bedrock',
  '@aws-sdk/credential-providers',
  'ai',
  'next',
  'react'
];

requiredDeps.forEach(dep => {
  const exists = packageJson.dependencies[dep];
  console.log(`   ${exists ? '✅' : '❌'} ${dep} ${exists ? `(${exists})` : ''}`);
});

// Test 3: Check environment configuration
console.log('\n🔧 Environment Configuration:');
const envExists = fs.existsSync('.env.local');
if (envExists) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasRegion = envContent.includes('AWS_REGION');
  const hasAccessKey = envContent.includes('AWS_ACCESS_KEY_ID=AKIA') || envContent.includes('AWS_ACCESS_KEY_ID=your_');
  
  console.log(`   ✅ .env.local exists`);
  console.log(`   ${hasRegion ? '✅' : '❌'} AWS_REGION configured`);
  console.log(`   ${hasAccessKey ? '🔑' : '🏷️'} ${hasAccessKey ? 'Explicit credentials' : 'Credential provider chain'}`);
} else {
  console.log('   ❌ .env.local missing');
}

// Test 4: Check MCP server build
console.log('\n🤖 MCP Server:');
const mcpBuilt = fs.existsSync('mcp-ui-server/dist/index.js');
const mcpPackage = fs.existsSync('mcp-ui-server/package.json');
console.log(`   ${mcpBuilt ? '✅' : '❌'} MCP server built`);
console.log(`   ${mcpPackage ? '✅' : '❌'} MCP server package.json`);

if (mcpPackage) {
  const mcpPkg = JSON.parse(fs.readFileSync('mcp-ui-server/package.json', 'utf8'));
  const hasZod = mcpPkg.dependencies?.zod;
  const hasMCP = mcpPkg.dependencies?.['@modelcontextprotocol/sdk'];
  console.log(`   ${hasZod ? '✅' : '❌'} Zod validation`);
  console.log(`   ${hasMCP ? '✅' : '❌'} MCP SDK`);
}

// Test 5: Check template components
console.log('\n🎨 Template Components:');
const templateDir = 'components/templates';
if (fs.existsSync(templateDir)) {
  const templates = fs.readdirSync(templateDir).filter(f => f.endsWith('.tsx'));
  console.log(`   ✅ ${templates.length} template components found`);
  templates.slice(0, 5).forEach(template => {
    console.log(`      - ${template}`);
  });
  if (templates.length > 5) {
    console.log(`      ... and ${templates.length - 5} more`);
  }
} else {
  console.log('   ❌ Template directory not found');
}

console.log('\n🎉 Application structure verification complete!');
console.log('\n📋 Next steps:');
console.log('   1. Configure AWS credentials (if not using IAM role)');
console.log('   2. Request Claude 4 Sonnet access in AWS Bedrock console');
console.log('   3. Start MCP server: cd mcp-ui-server && npm start');
console.log('   4. Start Next.js app: npm run dev');
console.log('   5. Test Bedrock connection: npm run test-bedrock');
