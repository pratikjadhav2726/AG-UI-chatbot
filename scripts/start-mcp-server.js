#!/usr/bin/env node

/**
 * MCP Server Startup Script
 * 
 * This script manages the lifecycle of the MCP UI server for the Next.js application.
 * It starts the server as a background process and handles graceful shutdown.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MCP_SERVER_PATH = path.join(__dirname, '..', 'mcp-ui-server-v2', 'dist', 'index.js');
const PID_FILE = path.join(__dirname, '..', '.mcp-server.pid');
const LOG_FILE = path.join(__dirname, '..', '.mcp-server.log');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${colors[color]}[MCP Server] ${message}${colors.reset}`;
  console.log(`${timestamp} - ${coloredMessage}`);
}

function checkServerExists() {
  if (!fs.existsSync(MCP_SERVER_PATH)) {
    log('MCP server not found. Please build the server first:', 'red');
    log('cd mcp-ui-server-v2 && npm run build', 'yellow');
    process.exit(1);
  }
}

function isServerRunning() {
  if (!fs.existsSync(PID_FILE)) {
    return false;
  }

  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
    
    // Check if process with this PID exists
    try {
      process.kill(pid, 0); // Signal 0 checks if process exists
      return pid;
    } catch (error) {
      // Process doesn't exist, clean up stale PID file
      fs.unlinkSync(PID_FILE);
      return false;
    }
  } catch (error) {
    // Invalid PID file, clean up
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }
    return false;
  }
}

function startServer() {
  checkServerExists();

  const existingPid = isServerRunning();
  if (existingPid) {
    log(`MCP server is already running (PID: ${existingPid})`, 'yellow');
    return existingPid;
  }

  log('Starting MCP server...', 'blue');

  // Prepare log file
  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

  // Start the MCP server process
  const mcpServer = spawn('node', [MCP_SERVER_PATH], {
    detached: true,
    stdio: ['ignore', logStream, logStream],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    }
  });

  // Handle server startup
  mcpServer.on('spawn', () => {
    log(`MCP server started successfully (PID: ${mcpServer.pid})`, 'green');
    
    // Save PID for later management
    fs.writeFileSync(PID_FILE, mcpServer.pid.toString());
    
    // Detach from parent process
    mcpServer.unref();
  });

  mcpServer.on('error', (error) => {
    log(`Failed to start MCP server: ${error.message}`, 'red');
    cleanupPidFile();
    process.exit(1);
  });

  mcpServer.on('exit', (code, signal) => {
    if (code !== null) {
      log(`MCP server exited with code ${code}`, code === 0 ? 'green' : 'red');
    } else {
      log(`MCP server terminated by signal ${signal}`, 'yellow');
    }
    cleanupPidFile();
  });

  return mcpServer.pid;
}

function stopServer() {
  const pid = isServerRunning();
  
  if (!pid) {
    log('MCP server is not running', 'yellow');
    return;
  }

  log(`Stopping MCP server (PID: ${pid})...`, 'blue');

  try {
    // Try graceful shutdown first
    process.kill(pid, 'SIGTERM');
    
    // Wait a bit for graceful shutdown
    setTimeout(() => {
      try {
        // Check if still running
        process.kill(pid, 0);
        
        // Still running, force kill
        log('Forcing MCP server shutdown...', 'yellow');
        process.kill(pid, 'SIGKILL');
      } catch (error) {
        // Process already stopped
        log('MCP server stopped successfully', 'green');
      }
      
      cleanupPidFile();
    }, 3000);
    
  } catch (error) {
    log('MCP server was not running', 'yellow');
    cleanupPidFile();
  }
}

function restartServer() {
  log('Restarting MCP server...', 'blue');
  stopServer();
  
  // Wait for shutdown, then start
  setTimeout(() => {
    startServer();
  }, 4000);
}

function getServerStatus() {
  const pid = isServerRunning();
  
  if (pid) {
    log(`MCP server is running (PID: ${pid})`, 'green');
    
    // Show log tail if available
    if (fs.existsSync(LOG_FILE)) {
      log('Recent log entries:', 'cyan');
      try {
        const logContent = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = logContent.split('\n').slice(-5).filter(line => line.trim());
        lines.forEach(line => console.log(`  ${line}`));
      } catch (error) {
        log('Could not read log file', 'yellow');
      }
    }
  } else {
    log('MCP server is not running', 'red');
  }
  
  return !!pid;
}

function cleanupPidFile() {
  if (fs.existsSync(PID_FILE)) {
    try {
      fs.unlinkSync(PID_FILE);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

function showHelp() {
  console.log(`
${colors.cyan}MCP Server Management Script${colors.reset}

Usage: node scripts/start-mcp-server.js [command]

Commands:
  start     Start the MCP server (default)
  stop      Stop the MCP server
  restart   Restart the MCP server
  status    Show server status
  help      Show this help message

Examples:
  node scripts/start-mcp-server.js start
  npm run mcp:start
  npm run mcp:stop
  npm run mcp:status
`);
}

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT, cleaning up...', 'yellow');
  cleanupPidFile();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, cleaning up...', 'yellow');
  cleanupPidFile();
  process.exit(0);
});

// Main execution
function main() {
  const command = process.argv[2] || 'start';

  switch (command.toLowerCase()) {
    case 'start':
      startServer();
      break;
    
    case 'stop':
      stopServer();
      break;
    
    case 'restart':
      restartServer();
      break;
    
    case 'status':
      getServerStatus();
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    default:
      log(`Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
}

// Export functions for programmatic use
module.exports = {
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  isServerRunning,
  cleanupPidFile
};

// Run main function if called directly
if (require.main === module) {
  main();
}